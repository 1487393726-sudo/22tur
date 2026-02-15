// 增强的备份服务
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '@/lib/prisma';
import { storageService } from '@/lib/cloud-storage/storage-service';

const execAsync = promisify(exec);

// 备份配置
export interface BackupConfig {
  localDir: string;
  cloudEnabled: boolean;
  retentionDays: number;
  maxBackups: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  encryptionKey?: string;
}

// 备份信息
export interface BackupInfo {
  id: string;
  filename: string;
  localPath?: string;
  cloudUrl?: string;
  size: number;
  checksum: string;
  type: 'FULL' | 'INCREMENTAL' | 'DATABASE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'UPLOADED';
  compressed: boolean;
  encrypted: boolean;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

// 备份结果
export interface BackupResult {
  success: boolean;
  backup?: BackupInfo;
  error?: string;
  duration?: number;
}

// 恢复结果
export interface RestoreResult {
  success: boolean;
  error?: string;
  duration?: number;
}

// 默认配置
const DEFAULT_CONFIG: BackupConfig = {
  localDir: path.join(process.cwd(), 'backups'),
  cloudEnabled: true,
  retentionDays: 30,
  maxBackups: 10,
  compressionEnabled: true,
  encryptionEnabled: false,
};

class BackupService {
  private config: BackupConfig;

  constructor(config?: Partial<BackupConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ensureBackupDir();
  }

  // 确保备份目录存在
  private async ensureBackupDir(): Promise<void> {
    try {
      await fs.access(this.config.localDir);
    } catch {
      await fs.mkdir(this.config.localDir, { recursive: true });
    }
  }

  // 创建备份
  async createBackup(type: 'FULL' | 'DATABASE' = 'DATABASE'): Promise<BackupResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${type.toLowerCase()}-${timestamp}${this.config.compressionEnabled ? '.gz' : '.sql'}`;
    const localPath = path.join(this.config.localDir, filename);

    try {
      // 创建备份记录
      const backupRecord = await prisma.backupRecord?.create({
        data: {
          filename,
          size: 0,
          checksum: '',
          storageUrl: '',
          status: 'IN_PROGRESS',
          type,
        },
      });

      // 执行数据库备份
      await this.dumpDatabase(localPath);

      // 压缩（如果启用）
      let finalPath = localPath;
      if (this.config.compressionEnabled && !localPath.endsWith('.gz')) {
        finalPath = await this.compressFile(localPath);
        await fs.unlink(localPath); // 删除未压缩文件
      }

      // 计算校验和
      const checksum = await this.calculateChecksum(finalPath);

      // 获取文件大小
      const stats = await fs.stat(finalPath);

      // 上传到云存储（如果启用）
      let cloudUrl: string | undefined;
      if (this.config.cloudEnabled) {
        try {
          const fileBuffer = await fs.readFile(finalPath);
          const uploadResult = await storageService.upload(fileBuffer, path.basename(finalPath), {
            category: 'backups',
            contentType: 'application/gzip',
          });
          cloudUrl = uploadResult.url;
        } catch (uploadError) {
          console.error('上传备份到云存储失败:', uploadError);
        }
      }

      // 计算过期时间
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.config.retentionDays);

      // 更新备份记录
      await prisma.backupRecord?.update({
        where: { id: backupRecord?.id },
        data: {
          size: stats.size,
          checksum,
          storageUrl: cloudUrl || finalPath,
          status: cloudUrl ? 'UPLOADED' : 'COMPLETED',
          expiresAt,
        },
      });

      const backup: BackupInfo = {
        id: backupRecord?.id || filename,
        filename,
        localPath: finalPath,
        cloudUrl,
        size: stats.size,
        checksum,
        type,
        status: cloudUrl ? 'UPLOADED' : 'COMPLETED',
        compressed: this.config.compressionEnabled,
        encrypted: this.config.encryptionEnabled,
        createdAt: new Date(),
        expiresAt,
      };

      // 清理旧备份
      await this.cleanupOldBackups();

      return {
        success: true,
        backup,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      console.error('创建备份失败:', error);
      return {
        success: false,
        error: (error as Error).message,
        duration: Date.now() - startTime,
      };
    }
  }

  // 导出数据库
  private async dumpDatabase(outputPath: string): Promise<void> {
    const databaseUrl = process.env.DATABASE_URL || '';
    
    // 根据数据库类型执行不同的导出命令
    if (databaseUrl.includes('postgresql')) {
      // PostgreSQL
      const { stdout, stderr } = await execAsync(
        `pg_dump "${databaseUrl}" > "${outputPath}"`
      );
      if (stderr && !stderr.includes('Warning')) {
        throw new Error(stderr);
      }
    } else if (databaseUrl.includes('mysql')) {
      // MySQL
      const url = new URL(databaseUrl);
      const { stdout, stderr } = await execAsync(
        `mysqldump -h ${url.hostname} -u ${url.username} -p${url.password} ${url.pathname.slice(1)} > "${outputPath}"`
      );
      if (stderr && !stderr.includes('Warning')) {
        throw new Error(stderr);
      }
    } else if (databaseUrl.startsWith('file:') || databaseUrl.includes('sqlite')) {
      // SQLite
      const dbPath = databaseUrl.replace('file:', '');
      await fs.copyFile(dbPath, outputPath);
    } else {
      // 使用 Prisma 导出（通用方案）
      // 这里简化处理，实际应该使用 prisma db pull 等命令
      throw new Error('不支持的数据库类型');
    }
  }

  // 压缩文件
  private async compressFile(filePath: string): Promise<string> {
    const outputPath = `${filePath}.gz`;
    await execAsync(`gzip -c "${filePath}" > "${outputPath}"`);
    return outputPath;
  }

  // 解压文件
  private async decompressFile(filePath: string): Promise<string> {
    const outputPath = filePath.replace('.gz', '');
    await execAsync(`gzip -d -c "${filePath}" > "${outputPath}"`);
    return outputPath;
  }

  // 计算校验和
  async calculateChecksum(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  // 验证校验和
  async verifyChecksum(filePath: string, expectedChecksum: string): Promise<boolean> {
    const actualChecksum = await this.calculateChecksum(filePath);
    return actualChecksum === expectedChecksum;
  }

  // 验证备份完整性
  async verifyBackup(backupId: string): Promise<{ valid: boolean; message: string }> {
    try {
      const backup = await prisma.backupRecord?.findUnique({
        where: { id: backupId },
      });

      if (!backup) {
        return { valid: false, message: '备份记录不存在' };
      }

      // 检查本地文件
      const localPath = path.join(this.config.localDir, backup.filename);
      try {
        await fs.access(localPath);
        
        // 验证校验和
        const isValid = await this.verifyChecksum(localPath, backup.checksum);
        if (!isValid) {
          return { valid: false, message: '校验和不匹配' };
        }

        return { valid: true, message: '备份完整性验证通过' };
      } catch {
        // 本地文件不存在，检查云存储
        if (backup.storageUrl && backup.storageUrl.startsWith('http')) {
          return { valid: true, message: '备份存储在云端' };
        }
        return { valid: false, message: '备份文件不存在' };
      }
    } catch (error) {
      return { valid: false, message: (error as Error).message };
    }
  }

  // 恢复备份
  async restoreBackup(backupId: string): Promise<RestoreResult> {
    const startTime = Date.now();

    try {
      const backup = await prisma.backupRecord?.findUnique({
        where: { id: backupId },
      });

      if (!backup) {
        return { success: false, error: '备份记录不存在' };
      }

      // 验证备份完整性
      const verification = await this.verifyBackup(backupId);
      if (!verification.valid) {
        return { success: false, error: `备份验证失败: ${verification.message}` };
      }

      // 获取备份文件
      let backupPath = path.join(this.config.localDir, backup.filename);
      
      // 如果本地不存在，从云存储下载
      try {
        await fs.access(backupPath);
      } catch {
        if (backup.storageUrl && backup.storageUrl.startsWith('http')) {
          const response = await fetch(backup.storageUrl);
          const buffer = Buffer.from(await response.arrayBuffer());
          await fs.writeFile(backupPath, buffer);
        } else {
          return { success: false, error: '无法获取备份文件' };
        }
      }

      // 解压（如果需要）
      let sqlPath = backupPath;
      if (backupPath.endsWith('.gz')) {
        sqlPath = await this.decompressFile(backupPath);
      }

      // 创建当前数据库的备份
      await this.createBackup('DATABASE');

      // 恢复数据库
      await this.restoreDatabase(sqlPath);

      // 清理临时文件
      if (sqlPath !== backupPath) {
        await fs.unlink(sqlPath);
      }

      return {
        success: true,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        duration: Date.now() - startTime,
      };
    }
  }

  // 恢复数据库
  private async restoreDatabase(sqlPath: string): Promise<void> {
    const databaseUrl = process.env.DATABASE_URL || '';

    if (databaseUrl.includes('postgresql')) {
      await execAsync(`psql "${databaseUrl}" < "${sqlPath}"`);
    } else if (databaseUrl.includes('mysql')) {
      const url = new URL(databaseUrl);
      await execAsync(
        `mysql -h ${url.hostname} -u ${url.username} -p${url.password} ${url.pathname.slice(1)} < "${sqlPath}"`
      );
    } else if (databaseUrl.startsWith('file:') || databaseUrl.includes('sqlite')) {
      const dbPath = databaseUrl.replace('file:', '');
      await fs.copyFile(sqlPath, dbPath);
    }
  }

  // 清理旧备份
  async cleanupOldBackups(): Promise<number> {
    let deletedCount = 0;

    try {
      // 获取所有备份记录
      const backups = await prisma.backupRecord?.findMany({
        orderBy: { createdAt: 'desc' },
      });

      if (!backups || backups.length === 0) return 0;

      const now = new Date();

      for (let i = 0; i < backups.length; i++) {
        const backup = backups[i];
        const shouldDelete = 
          // 超过最大数量
          i >= this.config.maxBackups ||
          // 超过保留期限
          (backup.expiresAt && backup.expiresAt < now);

        if (shouldDelete) {
          // 删除本地文件
          const localPath = path.join(this.config.localDir, backup.filename);
          try {
            await fs.unlink(localPath);
          } catch {
            // 文件可能不存在
          }

          // 删除云存储文件
          if (backup.storageUrl && backup.storageUrl.startsWith('http')) {
            try {
              // 从 URL 提取 object key
              const url = new URL(backup.storageUrl);
              const objectKey = url.pathname.slice(1);
              await storageService.delete(objectKey);
            } catch {
              // 忽略删除错误
            }
          }

          // 删除数据库记录
          await prisma.backupRecord?.delete({
            where: { id: backup.id },
          });

          deletedCount++;
        }
      }
    } catch (error) {
      console.error('清理旧备份失败:', error);
    }

    return deletedCount;
  }

  // 获取备份列表
  async listBackups(): Promise<BackupInfo[]> {
    const records = await prisma.backupRecord?.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return (records || []).map(r => ({
      id: r.id,
      filename: r.filename,
      localPath: path.join(this.config.localDir, r.filename),
      cloudUrl: r.storageUrl.startsWith('http') ? r.storageUrl : undefined,
      size: r.size,
      checksum: r.checksum,
      type: r.type as 'FULL' | 'INCREMENTAL' | 'DATABASE',
      status: r.status as any,
      compressed: r.filename.endsWith('.gz'),
      encrypted: false,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt || undefined,
    }));
  }

  // 获取备份统计
  async getStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    cloudBackups: number;
    localBackups: number;
    oldestBackup?: Date;
    newestBackup?: Date;
  }> {
    const backups = await this.listBackups();

    if (backups.length === 0) {
      return {
        totalBackups: 0,
        totalSize: 0,
        cloudBackups: 0,
        localBackups: 0,
      };
    }

    return {
      totalBackups: backups.length,
      totalSize: backups.reduce((sum, b) => sum + b.size, 0),
      cloudBackups: backups.filter(b => b.cloudUrl).length,
      localBackups: backups.filter(b => !b.cloudUrl).length,
      oldestBackup: backups[backups.length - 1].createdAt,
      newestBackup: backups[0].createdAt,
    };
  }

  // 下载备份
  async downloadBackup(backupId: string): Promise<Buffer | null> {
    const backup = await prisma.backupRecord?.findUnique({
      where: { id: backupId },
    });

    if (!backup) return null;

    // 尝试从本地读取
    const localPath = path.join(this.config.localDir, backup.filename);
    try {
      return await fs.readFile(localPath);
    } catch {
      // 从云存储下载
      if (backup.storageUrl && backup.storageUrl.startsWith('http')) {
        const response = await fetch(backup.storageUrl);
        return Buffer.from(await response.arrayBuffer());
      }
    }

    return null;
  }
}

// 单例
export const backupService = new BackupService();

export default backupService;

/**
 * Backup Manager
 * 
 * Utilities for managing database and file backups
 */

import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BackupInfo {
  id: string;
  fileName: string;
  filePath: string;
  size: number;
  sizeFormatted: string;
  type: 'database' | 'full' | 'files';
  compressed: boolean;
  includesFiles: boolean;
  createdAt: Date;
  status: 'success' | 'failed' | 'in_progress';
  metadata?: BackupMetadata;
}

export interface BackupMetadata {
  timestamp: string;
  database?: string;
  includesFiles: boolean;
  compressed: boolean;
  version: string;
  recordCount?: number;
  fileCount?: number;
}

export interface BackupOptions {
  compress?: boolean;
  includeFiles?: boolean;
  description?: string;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  totalSizeFormatted: string;
  oldestBackup?: Date;
  newestBackup?: Date;
  successCount: number;
  failedCount: number;
}

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const SCRIPT_PATH = path.join(process.cwd(), 'scripts', 'backup-db.js');

/**
 * Ensure backup directory exists
 */
export async function ensureBackupDirectory(): Promise<void> {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  }
}

/**
 * Create a new backup
 */
export async function createBackup(options: BackupOptions = {}): Promise<BackupInfo> {
  await ensureBackupDirectory();

  const args: string[] = [];
  if (options.compress) args.push('--compress');
  if (options.includeFiles) args.push('--include-files');

  const command = `node "${SCRIPT_PATH}" ${args.join(' ')}`;

  try {
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('Warning')) {
      throw new Error(stderr);
    }

    // Get the most recent backup file
    const backups = await listBackups();
    if (backups.length === 0) {
      throw new Error('Backup file not found after creation');
    }

    return backups[0]; // Most recent backup
  } catch (error) {
    throw new Error(`Backup creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List all backups
 */
export async function listBackups(): Promise<BackupInfo[]> {
  await ensureBackupDirectory();

  try {
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files.filter(
      f => f.startsWith('backup-') && (f.endsWith('.db') || f.endsWith('.zip'))
    );

    const backups = await Promise.all(
      backupFiles.map(async (fileName) => {
        const filePath = path.join(BACKUP_DIR, fileName);
        const stats = await fs.stat(filePath);
        const compressed = fileName.endsWith('.zip');

        let metadata: BackupMetadata | undefined;
        if (compressed) {
          // Try to read metadata from zip (simplified - in production use a zip library)
          metadata = {
            timestamp: stats.mtime.toISOString(),
            includesFiles: fileName.includes('files'),
            compressed: true,
            version: '1.0.0'
          };
        }

        return {
          id: fileName,
          fileName,
          filePath,
          size: stats.size,
          sizeFormatted: formatBytes(stats.size),
          type: (compressed ? 'full' : 'database') as 'database' | 'full' | 'files',
          compressed,
          includesFiles: compressed && fileName.includes('files'),
          createdAt: stats.mtime,
          status: 'success' as const,
          metadata
        };
      })
    );

    // Sort by creation date (newest first)
    backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return backups;
  } catch (error) {
    console.error('Failed to list backups:', error);
    return [];
  }
}

/**
 * Get backup by ID (filename)
 */
export async function getBackup(id: string): Promise<BackupInfo | null> {
  const backups = await listBackups();
  return backups.find(b => b.id === id) || null;
}

/**
 * Delete a backup
 */
export async function deleteBackup(id: string): Promise<boolean> {
  try {
    const backup = await getBackup(id);
    if (!backup) {
      throw new Error('Backup not found');
    }

    await fs.unlink(backup.filePath);
    return true;
  } catch (error) {
    console.error('Failed to delete backup:', error);
    return false;
  }
}

/**
 * Get backup statistics
 */
export async function getBackupStats(): Promise<BackupStats> {
  const backups = await listBackups();

  if (backups.length === 0) {
    return {
      totalBackups: 0,
      totalSize: 0,
      totalSizeFormatted: '0 Bytes',
      successCount: 0,
      failedCount: 0
    };
  }

  const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
  const dates = backups.map(b => b.createdAt);

  return {
    totalBackups: backups.length,
    totalSize,
    totalSizeFormatted: formatBytes(totalSize),
    oldestBackup: new Date(Math.min(...dates.map(d => d.getTime()))),
    newestBackup: new Date(Math.max(...dates.map(d => d.getTime()))),
    successCount: backups.filter(b => b.status === 'success').length,
    failedCount: backups.filter(b => b.status === 'failed').length
  };
}

/**
 * Restore database from backup
 */
export async function restoreBackup(id: string): Promise<boolean> {
  try {
    const backup = await getBackup(id);
    if (!backup) {
      throw new Error('Backup not found');
    }

    // Create a backup of current database before restoring
    await createBackup({ compress: false, includeFiles: false });

    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || 'dev.db';
    const dbFullPath = path.resolve(dbPath);

    if (backup.compressed) {
      // For compressed backups, we would need to extract first
      // This is simplified - in production use a proper zip library
      throw new Error('Restoring from compressed backups requires manual extraction');
    } else {
      // Simple database file restore
      await fs.copyFile(backup.filePath, dbFullPath);
    }

    return true;
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return false;
  }
}

/**
 * Verify backup integrity
 */
export async function verifyBackup(id: string): Promise<{ valid: boolean; message: string }> {
  try {
    const backup = await getBackup(id);
    if (!backup) {
      return { valid: false, message: 'Backup not found' };
    }

    // Check if file exists and is readable
    await fs.access(backup.filePath, fs.constants.R_OK);

    // Check file size
    if (backup.size === 0) {
      return { valid: false, message: 'Backup file is empty' };
    }

    // For database files, we could do additional checks
    // For now, basic checks are sufficient
    return { valid: true, message: 'Backup is valid' };
  } catch (error) {
    return { 
      valid: false, 
      message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Schedule automatic backup (for cron jobs)
 */
export function getBackupCronExpression(frequency: 'daily' | 'weekly' | 'monthly'): string {
  switch (frequency) {
    case 'daily':
      return '0 2 * * *'; // Every day at 2 AM
    case 'weekly':
      return '0 2 * * 0'; // Every Sunday at 2 AM
    case 'monthly':
      return '0 2 1 * *'; // First day of month at 2 AM
    default:
      return '0 2 * * *';
  }
}

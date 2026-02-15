/**
 * 文件分片上传工具
 * 支持大文件分片上传、断点续传、并发上传
 */

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

/**
 * 分片信息
 */
export interface ChunkInfo {
  index: number;
  start: number;
  end: number;
  size: number;
  hash: string;
}

/**
 * 上传会话
 */
export interface UploadSession {
  id: string;
  fileName: string;
  fileSize: number;
  fileHash: string;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  status: "pending" | "uploading" | "completed" | "failed" | "expired";
}

/**
 * 分片上传配置
 */
export interface ChunkUploadConfig {
  chunkSize?: number; // 分片大小（字节）
  maxConcurrent?: number; // 最大并发数
  tempDir?: string; // 临时目录
  sessionTTL?: number; // 会话过期时间（毫秒）
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<ChunkUploadConfig> = {
  chunkSize: 5 * 1024 * 1024, // 5MB
  maxConcurrent: 3,
  tempDir: "./uploads/temp",
  sessionTTL: 24 * 60 * 60 * 1000, // 24小时
};

/**
 * 文件分片管理器
 */
export class FileChunker {
  private config: Required<ChunkUploadConfig>;
  private sessions: Map<string, UploadSession> = new Map();

  constructor(config: ChunkUploadConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 创建上传会话
   */
  async createSession(
    fileName: string,
    fileSize: number,
    fileHash?: string
  ): Promise<UploadSession> {
    const sessionId = this.generateSessionId();
    const totalChunks = Math.ceil(fileSize / this.config.chunkSize);

    const session: UploadSession = {
      id: sessionId,
      fileName,
      fileSize,
      fileHash: fileHash || "",
      chunkSize: this.config.chunkSize,
      totalChunks,
      uploadedChunks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.sessionTTL),
      status: "pending",
    };

    // 创建临时目录
    const sessionDir = this.getSessionDir(sessionId);
    await fs.mkdir(sessionDir, { recursive: true });

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * 获取上传会话
   */
  getSession(sessionId: string): UploadSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // 检查是否过期
    if (new Date() > session.expiresAt) {
      session.status = "expired";
      return session;
    }

    return session;
  }

  /**
   * 上传分片
   */
  async uploadChunk(
    sessionId: string,
    chunkIndex: number,
    chunkData: Buffer
  ): Promise<{ success: boolean; message: string; progress: number }> {
    const session = this.getSession(sessionId);
    if (!session) {
      return { success: false, message: "会话不存在", progress: 0 };
    }

    if (session.status === "expired") {
      return { success: false, message: "会话已过期", progress: 0 };
    }

    if (session.status === "completed") {
      return { success: false, message: "上传已完成", progress: 100 };
    }

    // 验证分片索引
    if (chunkIndex < 0 || chunkIndex >= session.totalChunks) {
      return { success: false, message: "无效的分片索引", progress: this.getProgress(session) };
    }

    // 检查分片是否已上传
    if (session.uploadedChunks.includes(chunkIndex)) {
      return {
        success: true,
        message: "分片已存在",
        progress: this.getProgress(session),
      };
    }

    // 验证分片大小
    const expectedSize = this.getExpectedChunkSize(session, chunkIndex);
    if (chunkData.length !== expectedSize) {
      return {
        success: false,
        message: `分片大小不匹配，期望 ${expectedSize}，实际 ${chunkData.length}`,
        progress: this.getProgress(session),
      };
    }

    // 保存分片
    const chunkPath = this.getChunkPath(sessionId, chunkIndex);
    await fs.writeFile(chunkPath, chunkData);

    // 更新会话
    session.uploadedChunks.push(chunkIndex);
    session.updatedAt = new Date();
    session.status = "uploading";

    const progress = this.getProgress(session);

    return {
      success: true,
      message: `分片 ${chunkIndex + 1}/${session.totalChunks} 上传成功`,
      progress,
    };
  }

  /**
   * 合并分片
   */
  async mergeChunks(
    sessionId: string,
    outputPath: string
  ): Promise<{ success: boolean; message: string; filePath?: string }> {
    const session = this.getSession(sessionId);
    if (!session) {
      return { success: false, message: "会话不存在" };
    }

    // 检查所有分片是否已上传
    if (session.uploadedChunks.length !== session.totalChunks) {
      const missing = this.getMissingChunks(session);
      return {
        success: false,
        message: `缺少分片: ${missing.join(", ")}`,
      };
    }

    try {
      // 确保输出目录存在
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // 创建输出文件
      const writeStream = await fs.open(outputPath, "w");

      // 按顺序合并分片
      for (let i = 0; i < session.totalChunks; i++) {
        const chunkPath = this.getChunkPath(sessionId, i);
        const chunkData = await fs.readFile(chunkPath);
        await writeStream.write(chunkData);
      }

      await writeStream.close();

      // 验证文件大小
      const stats = await fs.stat(outputPath);
      if (stats.size !== session.fileSize) {
        await fs.unlink(outputPath);
        return {
          success: false,
          message: `文件大小不匹配，期望 ${session.fileSize}，实际 ${stats.size}`,
        };
      }

      // 验证文件哈希（如果提供）
      if (session.fileHash) {
        const actualHash = await this.calculateFileHash(outputPath);
        if (actualHash !== session.fileHash) {
          await fs.unlink(outputPath);
          return {
            success: false,
            message: "文件哈希不匹配",
          };
        }
      }

      // 清理临时文件
      await this.cleanupSession(sessionId);

      // 更新会话状态
      session.status = "completed";

      return {
        success: true,
        message: "文件合并成功",
        filePath: outputPath,
      };
    } catch (error) {
      session.status = "failed";
      return {
        success: false,
        message: `合并失败: ${error instanceof Error ? error.message : "未知错误"}`,
      };
    }
  }

  /**
   * 获取缺失的分片
   */
  getMissingChunks(session: UploadSession): number[] {
    const missing: number[] = [];
    for (let i = 0; i < session.totalChunks; i++) {
      if (!session.uploadedChunks.includes(i)) {
        missing.push(i);
      }
    }
    return missing;
  }

  /**
   * 获取上传进度
   */
  getProgress(session: UploadSession): number {
    return Math.round((session.uploadedChunks.length / session.totalChunks) * 100);
  }

  /**
   * 清理会话
   */
  async cleanupSession(sessionId: string): Promise<void> {
    const sessionDir = this.getSessionDir(sessionId);
    try {
      await fs.rm(sessionDir, { recursive: true, force: true });
    } catch {
      // 忽略清理错误
    }
    this.sessions.delete(sessionId);
  }

  /**
   * 清理过期会话
   */
  async cleanupExpiredSessions(): Promise<number> {
    let cleaned = 0;
    const now = new Date();

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        await this.cleanupSession(sessionId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * 计算文件分片信息
   */
  calculateChunks(fileSize: number): ChunkInfo[] {
    const chunks: ChunkInfo[] = [];
    const totalChunks = Math.ceil(fileSize / this.config.chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.config.chunkSize;
      const end = Math.min(start + this.config.chunkSize, fileSize);
      chunks.push({
        index: i,
        start,
        end,
        size: end - start,
        hash: "", // 可以在上传时计算
      });
    }

    return chunks;
  }

  /**
   * 计算文件哈希
   */
  async calculateFileHash(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash("md5").update(fileBuffer).digest("hex");
  }

  /**
   * 计算分片哈希
   */
  calculateChunkHash(chunkData: Buffer): string {
    return crypto.createHash("md5").update(chunkData).digest("hex");
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  /**
   * 获取会话目录
   */
  private getSessionDir(sessionId: string): string {
    return path.join(this.config.tempDir, sessionId);
  }

  /**
   * 获取分片文件路径
   */
  private getChunkPath(sessionId: string, chunkIndex: number): string {
    return path.join(this.getSessionDir(sessionId), `chunk_${chunkIndex}`);
  }

  /**
   * 获取期望的分片大小
   */
  private getExpectedChunkSize(session: UploadSession, chunkIndex: number): number {
    if (chunkIndex === session.totalChunks - 1) {
      // 最后一个分片
      return session.fileSize - chunkIndex * session.chunkSize;
    }
    return session.chunkSize;
  }
}

// 创建默认实例
export const fileChunker = new FileChunker();

/**
 * 客户端分片上传辅助函数
 */
export function createChunkUploader(
  file: File,
  config: ChunkUploadConfig = {}
) {
  const chunkSize = config.chunkSize || DEFAULT_CONFIG.chunkSize;
  const totalChunks = Math.ceil(file.size / chunkSize);

  return {
    totalChunks,
    chunkSize,
    fileSize: file.size,

    /**
     * 获取指定分片
     */
    getChunk(index: number): Blob {
      const start = index * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      return file.slice(start, end);
    },

    /**
     * 获取所有分片
     */
    *getChunks(): Generator<{ index: number; chunk: Blob }> {
      for (let i = 0; i < totalChunks; i++) {
        yield { index: i, chunk: this.getChunk(i) };
      }
    },
  };
}

export default FileChunker;

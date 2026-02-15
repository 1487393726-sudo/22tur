/**
 * Cloud Storage Service
 * 云存储服务统一接口
 */

import type {
  CloudStorageConfig,
  CloudStorageProvider,
  ICloudStorageAdapter,
  ICloudStorageService,
  UploadOptions,
  UploadResult,
  MultipartUploadOptions,
  SignedUrlOptions,
  FileMetadata,
  ListOptions,
  ListResult,
  ConfigValidationResult,
} from './types';
import {
  validateConfig,
  shouldUseMultipart,
  shouldUseCdn,
  loadConfigFromEnv,
  DEFAULT_CONFIG,
} from './config';
import { AliyunOSSAdapter } from './providers/aliyun-oss';
import { TencentCOSAdapter } from './providers/tencent-cos';

/**
 * 云存储服务类
 * 提供统一的云存储操作接口，支持多种云存储提供商
 */
export class CloudStorageService implements ICloudStorageService {
  private adapter: ICloudStorageAdapter;
  private config: CloudStorageConfig;

  constructor(config: CloudStorageConfig) {
    const validation = validateConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid config: ${validation.errors.join(', ')}`);
    }

    this.config = config;
    this.adapter = this.createAdapter(config);
  }

  /**
   * 创建适配器
   */
  private createAdapter(config: CloudStorageConfig): ICloudStorageAdapter {
    switch (config.provider) {
      case 'aliyun-oss':
        return new AliyunOSSAdapter(config);
      case 'tencent-cos':
        return new TencentCOSAdapter(config);
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  /**
   * 从环境变量创建服务实例
   */
  static fromEnv(): CloudStorageService | null {
    const config = loadConfigFromEnv();
    if (!config) {
      return null;
    }
    return new CloudStorageService(config);
  }

  /**
   * 验证配置
   */
  static validateConfig(config: Partial<CloudStorageConfig>): ConfigValidationResult {
    return validateConfig(config);
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    return this.adapter.testConnection();
  }

  /**
   * 获取当前配置
   */
  getConfig(): CloudStorageConfig {
    return this.config;
  }

  /**
   * 上传文件（自动选择普通上传或分片上传）
   */
  async upload(
    file: Buffer,
    filename: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    // 根据文件大小自动选择上传方式
    if (shouldUseMultipart(file.length)) {
      return this.uploadMultipart(file, filename, options);
    }
    return this.adapter.upload(file, filename, options);
  }

  /**
   * 分片上传
   */
  async uploadMultipart(
    file: Buffer,
    filename: string,
    options: MultipartUploadOptions
  ): Promise<UploadResult> {
    return this.adapter.uploadMultipart(file, filename, options);
  }

  /**
   * 删除文件
   */
  async delete(objectKey: string): Promise<void> {
    return this.adapter.delete(objectKey);
  }

  /**
   * 批量删除文件
   */
  async deleteMultiple(objectKeys: string[]): Promise<void> {
    return this.adapter.deleteMultiple(objectKeys);
  }

  /**
   * 获取签名 URL
   */
  async getSignedUrl(
    objectKey: string,
    options?: SignedUrlOptions
  ): Promise<string> {
    return this.adapter.getSignedUrl(objectKey, options);
  }

  /**
   * 获取公开 URL
   */
  getPublicUrl(objectKey: string): string {
    return this.adapter.getPublicUrl(objectKey);
  }

  /**
   * 获取 CDN URL（如果配置了 CDN）
   */
  getCdnUrl(objectKey: string): string | null {
    return this.adapter.getCdnUrl(objectKey);
  }

  /**
   * 获取最佳 URL（根据文件大小自动选择 CDN 或普通 URL）
   */
  async getBestUrl(objectKey: string, fileSize?: number): Promise<string> {
    // 如果提供了文件大小，根据阈值判断
    if (fileSize !== undefined) {
      if (shouldUseCdn(fileSize, !!this.config.cdnDomain)) {
        const cdnUrl = this.getCdnUrl(objectKey);
        if (cdnUrl) return cdnUrl;
      }
      return this.getPublicUrl(objectKey);
    }

    // 如果没有提供文件大小，获取元数据
    try {
      const metadata = await this.getMetadata(objectKey);
      if (shouldUseCdn(metadata.size, !!this.config.cdnDomain)) {
        const cdnUrl = this.getCdnUrl(objectKey);
        if (cdnUrl) return cdnUrl;
      }
    } catch {
      // 获取元数据失败，返回普通 URL
    }

    return this.getPublicUrl(objectKey);
  }

  /**
   * 检查文件是否存在
   */
  async exists(objectKey: string): Promise<boolean> {
    return this.adapter.exists(objectKey);
  }

  /**
   * 获取文件元数据
   */
  async getMetadata(objectKey: string): Promise<FileMetadata> {
    return this.adapter.getMetadata(objectKey);
  }

  /**
   * 列出文件
   */
  async list(options?: ListOptions): Promise<ListResult> {
    return this.adapter.list(options);
  }

  /**
   * 复制文件
   */
  async copy(sourceKey: string, targetKey: string): Promise<void> {
    return this.adapter.copy(sourceKey, targetKey);
  }

  /**
   * 移动文件
   */
  async move(sourceKey: string, targetKey: string): Promise<void> {
    return this.adapter.move(sourceKey, targetKey);
  }

  /**
   * 获取存储统计信息
   */
  async getStats(prefix?: string): Promise<{ totalSize: number; objectCount: number }> {
    let totalSize = 0;
    let objectCount = 0;
    let marker: string | undefined;

    do {
      const result = await this.list({
        prefix,
        maxKeys: 1000,
        marker,
      });

      for (const obj of result.objects) {
        totalSize += obj.size;
        objectCount++;
      }

      marker = result.nextMarker;
    } while (marker);

    return { totalSize, objectCount };
  }
}

// 单例实例（可选）
let defaultInstance: CloudStorageService | null = null;

/**
 * 获取默认云存储服务实例
 */
export function getCloudStorageService(): CloudStorageService | null {
  if (!defaultInstance) {
    defaultInstance = CloudStorageService.fromEnv();
  }
  return defaultInstance;
}

/**
 * 设置默认云存储服务实例
 */
export function setCloudStorageService(service: CloudStorageService): void {
  defaultInstance = service;
}

/**
 * 重置默认实例
 */
export function resetCloudStorageService(): void {
  defaultInstance = null;
}

export default CloudStorageService;

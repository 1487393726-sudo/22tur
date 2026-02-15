/**
 * Cloud Storage Types
 * 云存储服务类型定义
 */

// 云存储提供商类型
export type CloudStorageProvider = 'aliyun-oss' | 'tencent-cos';

// 云存储配置接口
export interface CloudStorageConfig {
  provider: CloudStorageProvider;
  region: string;
  bucket: string;
  accessKeyId: string;
  accessKeySecret: string;
  cdnDomain?: string;
  endpoint?: string;
  internal?: boolean; // 是否使用内网访问
}

// 上传选项
export interface UploadOptions {
  category: string;
  contentType: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
  onProgress?: (progress: number) => void;
}

// 上传结果
export interface UploadResult {
  objectKey: string;
  url: string;
  cdnUrl?: string;
  size: number;
  etag: string;
  contentType: string;
}

// 分片上传选项
export interface MultipartUploadOptions extends UploadOptions {
  partSize?: number; // 分片大小，默认 5MB
  parallel?: number; // 并行上传数，默认 4
}

// 分片上传进度
export interface MultipartUploadProgress {
  uploadId: string;
  totalParts: number;
  completedParts: number;
  progress: number;
}

// 签名 URL 选项
export interface SignedUrlOptions {
  expiresIn?: number; // 过期时间（秒），默认 3600
  responseContentType?: string;
  responseContentDisposition?: string;
}

// 文件元数据
export interface FileMetadata {
  objectKey: string;
  size: number;
  contentType: string;
  etag: string;
  lastModified: Date;
  metadata?: Record<string, string>;
}

// 列表选项
export interface ListOptions {
  prefix?: string;
  delimiter?: string;
  maxKeys?: number;
  marker?: string;
}

// 列表结果
export interface ListResult {
  objects: FileMetadata[];
  prefixes: string[];
  isTruncated: boolean;
  nextMarker?: string;
}

// 云存储服务接口
export interface ICloudStorageService {
  // 基础操作
  upload(file: Buffer, filename: string, options: UploadOptions): Promise<UploadResult>;
  uploadMultipart(file: Buffer, filename: string, options: MultipartUploadOptions): Promise<UploadResult>;
  delete(objectKey: string): Promise<void>;
  deleteMultiple(objectKeys: string[]): Promise<void>;
  
  // URL 生成
  getSignedUrl(objectKey: string, options?: SignedUrlOptions): Promise<string>;
  getPublicUrl(objectKey: string): string;
  getCdnUrl(objectKey: string): string | null;
  
  // 文件信息
  exists(objectKey: string): Promise<boolean>;
  getMetadata(objectKey: string): Promise<FileMetadata>;
  list(options?: ListOptions): Promise<ListResult>;
  
  // 复制和移动
  copy(sourceKey: string, targetKey: string): Promise<void>;
  move(sourceKey: string, targetKey: string): Promise<void>;
}

// 云存储适配器接口（供具体实现使用）
export interface ICloudStorageAdapter extends ICloudStorageService {
  testConnection(): Promise<boolean>;
  getConfig(): CloudStorageConfig;
}

// 存储配置验证结果
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

// 存储使用统计
export interface StorageStats {
  totalSize: number;
  objectCount: number;
  lastUpdated: Date;
}

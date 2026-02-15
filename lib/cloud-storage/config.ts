/**
 * Cloud Storage Configuration
 * 云存储配置管理
 */

import type { 
  CloudStorageConfig, 
  CloudStorageProvider,
  ConfigValidationResult 
} from './types';

// 默认配置
export const DEFAULT_CONFIG = {
  signedUrlExpiration: 3600, // 1 小时
  cdnThreshold: 100 * 1024, // 100KB - 超过此大小使用 CDN
  multipartThreshold: 100 * 1024 * 1024, // 100MB - 超过此大小使用分片上传
  multipartPartSize: 5 * 1024 * 1024, // 5MB - 分片大小
  multipartParallel: 4, // 并行上传数
  maxRetries: 3, // 最大重试次数
  retryDelay: 1000, // 重试延迟（毫秒）
};

// 提供商配置
export const PROVIDER_CONFIG: Record<CloudStorageProvider, {
  name: string;
  regions: string[];
  defaultEndpoint: (region: string, bucket: string) => string;
  internalEndpoint?: (region: string, bucket: string) => string;
}> = {
  'aliyun-oss': {
    name: '阿里云 OSS',
    regions: [
      'oss-cn-hangzhou',
      'oss-cn-shanghai',
      'oss-cn-beijing',
      'oss-cn-shenzhen',
      'oss-cn-guangzhou',
      'oss-cn-chengdu',
      'oss-cn-hongkong',
    ],
    defaultEndpoint: (region, bucket) => 
      `https://${bucket}.${region}.aliyuncs.com`,
    internalEndpoint: (region, bucket) => 
      `https://${bucket}.${region}-internal.aliyuncs.com`,
  },
  'tencent-cos': {
    name: '腾讯云 COS',
    regions: [
      'ap-beijing',
      'ap-shanghai',
      'ap-guangzhou',
      'ap-chengdu',
      'ap-chongqing',
      'ap-hongkong',
      'ap-singapore',
    ],
    defaultEndpoint: (region, bucket) => 
      `https://${bucket}.cos.${region}.myqcloud.com`,
    internalEndpoint: (region, bucket) => 
      `https://${bucket}.cos-internal.${region}.myqcloud.com`,
  },
};

/**
 * 生成 Object Key
 * 格式: {category}/{year}/{month}/{uuid}.{extension}
 */
export function generateObjectKey(
  category: string,
  filename: string
): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const uuid = generateUUID();
  const extension = getFileExtension(filename);
  
  return `${category}/${year}/${month}/${uuid}${extension ? `.${extension}` : ''}`;
}

/**
 * 生成 UUID
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 获取文件扩展名
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) {
    return '';
  }
  return filename.substring(lastDot + 1).toLowerCase();
}

/**
 * 判断是否应该使用 CDN URL
 */
export function shouldUseCdn(
  fileSize: number,
  hasCdnDomain: boolean
): boolean {
  return hasCdnDomain && fileSize > DEFAULT_CONFIG.cdnThreshold;
}

/**
 * 判断是否应该使用分片上传
 */
export function shouldUseMultipart(fileSize: number): boolean {
  return fileSize > DEFAULT_CONFIG.multipartThreshold;
}

/**
 * 验证云存储配置
 */
export function validateConfig(
  config: Partial<CloudStorageConfig>
): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 必填字段验证
  if (!config.provider) {
    errors.push('Provider is required');
  } else if (!['aliyun-oss', 'tencent-cos'].includes(config.provider)) {
    errors.push('Invalid provider. Must be "aliyun-oss" or "tencent-cos"');
  }

  if (!config.region) {
    errors.push('Region is required');
  } else if (config.provider && ['aliyun-oss', 'tencent-cos'].includes(config.provider)) {
    const providerConfig = PROVIDER_CONFIG[config.provider as CloudStorageProvider];
    if (providerConfig && !providerConfig.regions.includes(config.region)) {
      warnings.push(`Region "${config.region}" is not in the standard list`);
    }
  }

  if (!config.bucket) {
    errors.push('Bucket is required');
  } else if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(config.bucket)) {
    errors.push('Invalid bucket name format');
  }

  if (!config.accessKeyId) {
    errors.push('Access Key ID is required');
  }

  if (!config.accessKeySecret) {
    errors.push('Access Key Secret is required');
  }

  // CDN 域名验证
  if (config.cdnDomain) {
    try {
      new URL(`https://${config.cdnDomain}`);
    } catch {
      errors.push('Invalid CDN domain format');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * 获取端点 URL
 */
export function getEndpoint(config: CloudStorageConfig): string {
  if (config.endpoint) {
    return config.endpoint;
  }

  const providerConfig = PROVIDER_CONFIG[config.provider];
  if (config.internal && providerConfig.internalEndpoint) {
    return providerConfig.internalEndpoint(config.region, config.bucket);
  }
  return providerConfig.defaultEndpoint(config.region, config.bucket);
}

/**
 * 从环境变量加载配置
 */
export function loadConfigFromEnv(): CloudStorageConfig | null {
  const provider = process.env.CLOUD_STORAGE_PROVIDER as CloudStorageProvider;
  
  if (!provider) {
    return null;
  }

  return {
    provider,
    region: process.env.CLOUD_STORAGE_REGION || '',
    bucket: process.env.CLOUD_STORAGE_BUCKET || '',
    accessKeyId: process.env.CLOUD_STORAGE_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.CLOUD_STORAGE_ACCESS_KEY_SECRET || '',
    cdnDomain: process.env.CLOUD_STORAGE_CDN_DOMAIN,
    endpoint: process.env.CLOUD_STORAGE_ENDPOINT,
    internal: process.env.CLOUD_STORAGE_INTERNAL === 'true',
  };
}

/**
 * 导出配置常量
 */
export const CONFIG = {
  ...DEFAULT_CONFIG,
  PROVIDERS: PROVIDER_CONFIG,
};

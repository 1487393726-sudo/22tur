/**
 * HexHub 配置文件
 */

export const HEXHUB_CONFIG = {
  // 数据库配置
  database: {
    url: process.env.HEXHUB_DATABASE_URL || 'file:./hexhub.db',
    log: process.env.HEXHUB_DATABASE_LOG || 'error',
  },

  // API 配置
  api: {
    baseUrl: process.env.HEXHUB_API_BASE_URL || '/api/hexhub',
    timeout: parseInt(process.env.HEXHUB_API_TIMEOUT || '30000'),
    rateLimit: {
      enabled: process.env.HEXHUB_RATE_LIMIT_ENABLED !== 'false',
      maxRequests: parseInt(process.env.HEXHUB_RATE_LIMIT_MAX_REQUESTS || '100'),
      windowMs: parseInt(process.env.HEXHUB_RATE_LIMIT_WINDOW_MS || '900000'),
    },
  },

  // 认证配置
  auth: {
    jwtSecret: process.env.HEXHUB_JWT_SECRET || 'hexhub-secret-key',
    jwtExpiration: process.env.HEXHUB_JWT_EXPIRATION || '7d',
    passwordHashRounds: parseInt(process.env.HEXHUB_PASSWORD_HASH_ROUNDS || '10'),
  },

  // 文件上传配置
  upload: {
    maxFileSize: parseInt(process.env.HEXHUB_MAX_FILE_SIZE || '10485760'), // 10MB
    allowedMimeTypes: [
      'application/json',
      'text/csv',
      'application/xml',
      'application/parquet',
    ],
    uploadDir: process.env.HEXHUB_UPLOAD_DIR || './uploads/hexhub',
  },

  // 分页配置
  pagination: {
    defaultSkip: 0,
    defaultTake: 10,
    maxTake: 100,
  },

  // 日志配置
  logging: {
    enabled: process.env.HEXHUB_LOGGING_ENABLED !== 'false',
    level: process.env.HEXHUB_LOG_LEVEL || 'info',
    format: process.env.HEXHUB_LOG_FORMAT || 'json',
  },

  // 缓存配置
  cache: {
    enabled: process.env.HEXHUB_CACHE_ENABLED !== 'false',
    ttl: parseInt(process.env.HEXHUB_CACHE_TTL || '3600'),
    maxSize: parseInt(process.env.HEXHUB_CACHE_MAX_SIZE || '1000'),
  },

  // 安全配置
  security: {
    enableAuditLog: process.env.HEXHUB_ENABLE_AUDIT_LOG !== 'false',
    enableSecurityEvents: process.env.HEXHUB_ENABLE_SECURITY_EVENTS !== 'false',
    enableApiKeyRotation: process.env.HEXHUB_ENABLE_API_KEY_ROTATION !== 'false',
    apiKeyRotationDays: parseInt(process.env.HEXHUB_API_KEY_ROTATION_DAYS || '90'),
  },

  // 功能开关
  features: {
    enableUserManagement: process.env.HEXHUB_ENABLE_USER_MANAGEMENT !== 'false',
    enableProjectManagement: process.env.HEXHUB_ENABLE_PROJECT_MANAGEMENT !== 'false',
    enableDatasetManagement: process.env.HEXHUB_ENABLE_DATASET_MANAGEMENT !== 'false',
    enableAnalytics: process.env.HEXHUB_ENABLE_ANALYTICS !== 'false',
    enableReporting: process.env.HEXHUB_ENABLE_REPORTING !== 'false',
    enableApiManagement: process.env.HEXHUB_ENABLE_API_MANAGEMENT !== 'false',
  },

  // 通知配置
  notifications: {
    enabled: process.env.HEXHUB_NOTIFICATIONS_ENABLED !== 'false',
    emailEnabled: process.env.HEXHUB_EMAIL_NOTIFICATIONS_ENABLED !== 'false',
    pushEnabled: process.env.HEXHUB_PUSH_NOTIFICATIONS_ENABLED !== 'false',
  },

  // 环境
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

/**
 * 获取配置值
 */
export function getConfig(key: string, defaultValue?: any): any {
  const keys = key.split('.')
  let value: any = HEXHUB_CONFIG

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return defaultValue
    }
  }

  return value
}

/**
 * 验证配置
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 检查必需的配置
  if (!HEXHUB_CONFIG.database.url) {
    errors.push('HEXHUB_DATABASE_URL 未设置')
  }

  if (!HEXHUB_CONFIG.auth.jwtSecret) {
    errors.push('HEXHUB_JWT_SECRET 未设置')
  }

  // 检查数值配置
  if (HEXHUB_CONFIG.api.timeout < 1000) {
    errors.push('HEXHUB_API_TIMEOUT 必须大于 1000ms')
  }

  if (HEXHUB_CONFIG.upload.maxFileSize < 1024) {
    errors.push('HEXHUB_MAX_FILE_SIZE 必须大于 1024 字节')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 打印配置信息
 */
export function printConfig(): void {
  console.log('HexHub 配置信息:')
  console.log('================')
  console.log(`环境: ${HEXHUB_CONFIG.environment}`)
  console.log(`数据库: ${HEXHUB_CONFIG.database.url}`)
  console.log(`API 基础 URL: ${HEXHUB_CONFIG.api.baseUrl}`)
  console.log(`日志级别: ${HEXHUB_CONFIG.logging.level}`)
  console.log(`缓存启用: ${HEXHUB_CONFIG.cache.enabled}`)
  console.log(`审计日志启用: ${HEXHUB_CONFIG.security.enableAuditLog}`)
  console.log('================')
}

// 错误处理配置文件

/**
 * 错误处理配置
 */
export interface ErrorHandlerConfig {
  // 是否启用全局错误处理
  enableGlobalErrorHandling: boolean
  
  // 是否在开发环境下显示详细错误信息
  showDetailedErrorsInDev: boolean
  
  // 是否自动发送错误报告到服务器
  autoReportErrors: boolean
  
  // 错误报告URL
  errorReportUrl: string
  
  // 是否启用错误重试机制
  enableErrorRetry: boolean
  
  // 最大重试次数
  maxRetryAttempts: number
  
  // 重试延迟时间 (毫秒)
  retryDelayMs: number
  
  // 是否启用错误边界
  enableErrorBoundary: boolean
  
  // 是否记录错误日志到本地存储
  enableLocalStorageLogging: boolean
  
  // 本地存储最大日志条目数
  maxLocalStorageLogs: number
  
  // 是否启用性能监控
  enablePerformanceMonitoring: boolean
}

/**
 * 默认错误处理配置
 */
export const defaultErrorHandlerConfig: ErrorHandlerConfig = {
  enableGlobalErrorHandling: true,
  showDetailedErrorsInDev: true,
  autoReportErrors: true,
  errorReportUrl: '/api/error-report',
  enableErrorRetry: true,
  maxRetryAttempts: 3,
  retryDelayMs: 1000,
  enableErrorBoundary: true,
  enableLocalStorageLogging: false, // 生产环境建议关闭
  maxLocalStorageLogs: 100,
  enablePerformanceMonitoring: process.env.NODE_ENV === 'development'
}

/**
 * 生产环境错误处理配置
 */
export const productionErrorHandlerConfig: ErrorHandlerConfig = {
  ...defaultErrorHandlerConfig,
  showDetailedErrorsInDev: false,
  enableLocalStorageLogging: false,
  enablePerformanceMonitoring: false
}

/**
 * 开发环境错误处理配置
 */
export const developmentErrorHandlerConfig: ErrorHandlerConfig = {
  ...defaultErrorHandlerConfig,
  showDetailedErrorsInDev: true,
  enableLocalStorageLogging: true,
  enablePerformanceMonitoring: true
}

/**
 * 获取当前环境的错误处理配置
 */
export function getErrorHandlerConfig(): ErrorHandlerConfig {
  const env = process.env.NODE_ENV
  
  switch (env) {
    case 'production':
      return productionErrorHandlerConfig
    case 'development':
      return developmentErrorHandlerConfig
    default:
      return defaultErrorHandlerConfig
  }
}

/**
 * 错误处理配置管理器
 */
export class ErrorConfigManager {
  private static instance: ErrorConfigManager
  private config: ErrorHandlerConfig

  private constructor(config?: ErrorHandlerConfig) {
    this.config = config || getErrorHandlerConfig()
  }

  static getInstance(config?: ErrorHandlerConfig): ErrorConfigManager {
    if (!ErrorConfigManager.instance) {
      ErrorConfigManager.instance = new ErrorConfigManager(config)
    }
    return ErrorConfigManager.instance
  }

  /**
   * 获取配置
   */
  getConfig(): ErrorHandlerConfig {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    }
  }

  /**
   * 重置为默认配置
   */
  resetToDefault(): void {
    this.config = getErrorHandlerConfig()
  }

  /**
   * 检查是否启用特定功能
   */
  isEnabled(feature: keyof ErrorHandlerConfig): boolean {
    return this.config[feature] as boolean
  }
}

/**
 * 全局错误配置管理器实例
 */
export const errorConfigManager = ErrorConfigManager.getInstance()
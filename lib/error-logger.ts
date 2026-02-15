// 错误日志记录器
import { AppError, ErrorCode } from './errors'

interface LogEntry {
  timestamp: string
  level: 'error' | 'warn' | 'info'
  message: string
  errorCode?: string
  stack?: string
  url?: string
  userAgent?: string
  userId?: string
  metadata?: Record<string, any>
}

interface ErrorLoggerConfig {
  enableConsole: boolean
  enableServerLogging: boolean
  enableLocalStorage: boolean
  maxLocalStorageEntries: number
}

/**
 * 错误日志记录器
 */
export class ErrorLogger {
  private static instance: ErrorLogger
  private config: ErrorLoggerConfig
  private logs: LogEntry[] = []

  private constructor(config: Partial<ErrorLoggerConfig> = {}) {
    this.config = {
      enableConsole: config.enableConsole ?? true,
      enableServerLogging: config.enableServerLogging ?? true,
      enableLocalStorage: config.enableLocalStorage ?? false,
      maxLocalStorageEntries: config.maxLocalStorageEntries ?? 100
    }

    this.loadFromLocalStorage()
  }

  static getInstance(config?: Partial<ErrorLoggerConfig>): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger(config)
    }
    return ErrorLogger.instance
  }

  /**
   * 记录错误
   */
  async error(error: Error | AppError | string, metadata?: Record<string, any>): Promise<void> {
    const logEntry = this.createLogEntry('error', error, metadata)
    await this.processLogEntry(logEntry)
  }

  /**
   * 记录警告
   */
  async warn(message: string, metadata?: Record<string, any>): Promise<void> {
    const logEntry = this.createLogEntry('warn', message, metadata)
    await this.processLogEntry(logEntry)
  }

  /**
   * 记录信息
   */
  async info(message: string, metadata?: Record<string, any>): Promise<void> {
    const logEntry = this.createLogEntry('info', message, metadata)
    await this.processLogEntry(logEntry)
  }

  /**
   * 获取日志
   */
  getLogs(level?: LogEntry['level']): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level)
    }
    return [...this.logs]
  }

  /**
   * 清除日志
   */
  clearLogs(): void {
    this.logs = []
    this.saveToLocalStorage()
  }

  /**
   * 导出日志
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  private createLogEntry(
    level: LogEntry['level'],
    error: Error | AppError | string,
    metadata?: Record<string, any>
  ): LogEntry {
    const isErrorObject = error instanceof Error
    const isAppError = error instanceof AppError

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: isErrorObject ? error.message : error,
      stack: isErrorObject ? error.stack : undefined,
      errorCode: isAppError ? error.code : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      metadata
    }

    // 尝试获取用户ID
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          entry.userId = user.id
        }
      } catch {
        // 忽略解析错误
      }
    }

    return entry
  }

  private async processLogEntry(entry: LogEntry): Promise<void> {
    // 添加到内存日志
    this.logs.unshift(entry)
    
    // 限制日志数量
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000)
    }

    // 控制台输出
    if (this.config.enableConsole) {
      this.consoleLog(entry)
    }

    // 本地存储
    if (this.config.enableLocalStorage) {
      this.saveToLocalStorage()
    }

    // 服务器日志
    if (this.config.enableServerLogging && entry.level === 'error') {
      await this.sendToServer(entry)
    }
  }

  private consoleLog(entry: LogEntry): void {
    const { timestamp, level, message, errorCode, stack } = entry
    const timestampStr = new Date(timestamp).toLocaleString()
    
    const logMessage = `[${timestampStr}] ${level.toUpperCase()}: ${message}`
    
    if (errorCode) {
      console[level](`${logMessage} (Code: ${errorCode})`)
    } else {
      console[level](logMessage)
    }
    
    if (stack && level === 'error') {
      console.error('Stack:', stack)
    }
  }

  private async sendToServer(entry: LogEntry): Promise<void> {
    try {
      await fetch('/api/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'error_log',
          ...entry
        })
      })
    } catch (error) {
      console.warn('发送错误日志到服务器失败:', error)
    }
  }

  private saveToLocalStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const logsToSave = this.logs.slice(0, this.config.maxLocalStorageEntries)
      localStorage.setItem('error_logs', JSON.stringify(logsToSave))
    } catch (error) {
      console.warn('保存日志到本地存储失败:', error)
    }
  }

  private loadFromLocalStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const savedLogs = localStorage.getItem('error_logs')
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs)
      }
    } catch (error) {
      console.warn('从本地存储加载日志失败:', error)
    }
  }
}

/**
 * 全局错误日志记录器实例
 */
export const logger = ErrorLogger.getInstance()

/**
 * 错误日志记录装饰器
 */
export function logErrors(
  target: any,
  propertyName: string,
  descriptor: PropertyDescriptor
) {
  const method = descriptor.value
  
  descriptor.value = async function (...args: any[]) {
    try {
      return await method.apply(this, args)
    } catch (error) {
      const errorToLog = error instanceof Error ? error : String(error)
      await logger.error(errorToLog, {
        method: propertyName,
        className: target.constructor.name,
        args: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        )
      })
      throw error
    }
  }
  
  return descriptor
}

/**
 * 性能监控装饰器
 */
export function measurePerformance(
  target: any,
  propertyName: string,
  descriptor: PropertyDescriptor
) {
  const method = descriptor.value
  
  descriptor.value = async function (...args: any[]) {
    const startTime = performance.now()
    
    try {
      const result = await method.apply(this, args)
      const endTime = performance.now()
      
      await logger.info(`方法 ${propertyName} 执行时间: ${(endTime - startTime).toFixed(2)}ms`, {
        method: propertyName,
        className: target.constructor.name,
        executionTime: endTime - startTime
      })
      
      return result
    } catch (error) {
      const endTime = performance.now()
      const errorToLog = error instanceof Error ? error : String(error)
      
      await logger.error(errorToLog, {
        method: propertyName,
        className: target.constructor.name,
        executionTime: endTime - startTime
      })
      
      throw error
    }
  }
  
  return descriptor
}
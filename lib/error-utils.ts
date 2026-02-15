// 错误处理工具函数
import { createError, ErrorCode, ErrorStatusCodes, AppError } from './errors'

/**
 * 异步操作错误处理装饰器
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorMessage: string = '操作失败'
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      
      console.error(`${errorMessage}:`, error)
      throw createError(
        errorMessage,
        ErrorCode.INTERNAL_SERVER_ERROR,
        ErrorStatusCodes[ErrorCode.INTERNAL_SERVER_ERROR],
        { originalError: error }
      )
    }
  }) as T
}

/**
 * 数据库操作错误处理
 */
export function handleDatabaseError(error: any, operation: string = '数据库操作'): never {
  console.error(`${operation}失败:`, error)
  
  if (error.code === 'P2002') {
    throw createError(
      '数据已存在',
      ErrorCode.RESOURCE_ALREADY_EXISTS,
      ErrorStatusCodes[ErrorCode.RESOURCE_ALREADY_EXISTS]
    )
  }
  
  if (error.code === 'P2025') {
    throw createError(
      '数据不存在',
      ErrorCode.RESOURCE_NOT_FOUND,
      ErrorStatusCodes[ErrorCode.RESOURCE_NOT_FOUND]
    )
  }
  
  if (error.code?.startsWith('P')) {
    throw createError(
      '数据库操作失败',
      ErrorCode.DATABASE_ERROR,
      ErrorStatusCodes[ErrorCode.DATABASE_ERROR]
    )
  }
  
  throw createError(
    `${operation}失败`,
    ErrorCode.INTERNAL_SERVER_ERROR,
    ErrorStatusCodes[ErrorCode.INTERNAL_SERVER_ERROR]
  )
}

/**
 * 验证数据是否存在
 */
export async function validateResourceExists<T>(
  findFn: () => Promise<T | null>,
  resourceName: string = '资源'
): Promise<T> {
  const resource = await findFn()
  if (!resource) {
    throw createError(
      `${resourceName}不存在`,
      ErrorCode.RESOURCE_NOT_FOUND,
      ErrorStatusCodes[ErrorCode.RESOURCE_NOT_FOUND]
    )
  }
  return resource
}

/**
 * 验证权限
 */
export function validatePermission(
  hasPermission: boolean,
  message: string = '权限不足'
): void {
  if (!hasPermission) {
    throw createError(
      message,
      ErrorCode.FORBIDDEN,
      ErrorStatusCodes[ErrorCode.FORBIDDEN]
    )
  }
}

/**
 * 验证数据完整性
 */
export function validateDataIntegrity<T>(
  data: T,
  requiredFields: (keyof T)[],
  resourceName: string = '数据'
): void {
  const missingFields = requiredFields.filter(field => !data[field])
  
  if (missingFields.length > 0) {
    throw createError(
      `${resourceName}缺少必填字段: ${missingFields.join(', ')}`,
      ErrorCode.VALIDATION_ERROR,
      ErrorStatusCodes[ErrorCode.VALIDATION_ERROR]
    )
  }
}

/**
 * 错误重试机制
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt < maxRetries) {
        console.warn(`操作失败，第${attempt + 1}次重试...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
        delayMs *= 2 // 指数退避
      }
    }
  }
  
  throw createError(
    `操作失败，重试${maxRetries}次后仍失败`,
    ErrorCode.INTERNAL_SERVER_ERROR,
    ErrorStatusCodes[ErrorCode.INTERNAL_SERVER_ERROR],
    { originalError: lastError }
  )
}

/**
 * 批量操作错误处理
 */
export function handleBatchErrors<T>(
  results: Array<{ success: boolean; data?: T; error?: string }>,
  operation: string = '批量操作'
): { success: boolean; data: T[]; errors: string[] } {
  const successfulResults = results.filter(r => r.success).map(r => r.data!)
  const errors = results.filter(r => !r.success).map(r => r.error!)
  
  if (errors.length > 0) {
    console.warn(`${operation}部分失败:`, errors)
  }
  
  return {
    success: errors.length === 0,
    data: successfulResults,
    errors
  }
}
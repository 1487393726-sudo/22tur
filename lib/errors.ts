// 统一错误处理模块

export interface ApiError {
  code: string
  message: string
  details?: any
  status: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
  details?: any
}

// 错误类型定义
export enum ErrorCode {
  // 认证错误 (400-499)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // 验证错误 (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // 业务逻辑错误 (400-409)
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  INVALID_OPERATION = 'INVALID_OPERATION',
  
  // 系统错误 (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // 文件操作错误 (400-500)
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  
  // 请求限制错误 (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

// 错误消息映射
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: '未授权访问',
  [ErrorCode.FORBIDDEN]: '权限不足',
  [ErrorCode.INVALID_CREDENTIALS]: '无效的登录凭据',
  [ErrorCode.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  
  [ErrorCode.VALIDATION_ERROR]: '数据验证失败',
  [ErrorCode.REQUIRED_FIELD]: '缺少必要字段',
  [ErrorCode.INVALID_FORMAT]: '数据格式不正确',
  
  [ErrorCode.RESOURCE_NOT_FOUND]: '资源不存在',
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: '资源已存在',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: '权限不足',
  [ErrorCode.INVALID_OPERATION]: '无效的操作',
  
  [ErrorCode.INTERNAL_SERVER_ERROR]: '服务器内部错误',
  [ErrorCode.DATABASE_ERROR]: '数据库操作失败',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: '外部服务异常',
  
  [ErrorCode.FILE_TOO_LARGE]: '文件大小超过限制',
  [ErrorCode.INVALID_FILE_TYPE]: '不支持的文件类型',
  [ErrorCode.FILE_UPLOAD_FAILED]: '文件上传失败',
  
  [ErrorCode.RATE_LIMIT_EXCEEDED]: '请求过于频繁，请稍后重试'
}

// 错误状态码映射
export const ErrorStatusCodes: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.REQUIRED_FIELD]: 400,
  [ErrorCode.INVALID_FORMAT]: 400,
  
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: 409,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.INVALID_OPERATION]: 400,
  
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  
  [ErrorCode.FILE_TOO_LARGE]: 413,
  [ErrorCode.INVALID_FILE_TYPE]: 415,
  [ErrorCode.FILE_UPLOAD_FAILED]: 500,
  
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429
}

// 自定义错误类
export class AppError extends Error {
  public code: string
  public statusCode: number
  public details?: any

  constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500, details?: any) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.name = 'AppError'
  }

  toJSON(): ApiError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      status: this.statusCode
    }
  }
}

// 验证错误类
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

// 认证错误类
export class AuthenticationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'AUTHENTICATION_ERROR', 401, details)
    this.name = 'AuthenticationError'
  }
}

// 资源不存在错误类
export class NotFoundError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'NOT_FOUND', 404, details)
    this.name = 'NotFoundError'
  }
}

// 权限错误类
export class PermissionError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'PERMISSION_ERROR', 403, details)
    this.name = 'PermissionError'
  }
}

// 快速创建错误的辅助函数
export function createError(message: string, code: string, statusCode: number, details?: any): AppError {
  return new AppError(message, code, statusCode, details)
}

// 检查是否为 AppError 实例
export function isAppError(error: any): error is AppError {
  return error instanceof AppError
}

// 验证错误
export function validationError(field?: string, message?: string): AppError {
  return new ValidationError(
    message || `字段"${field}"验证失败`,
    field ? { field } : undefined
  )
}

// 资源不存在错误
export function notFoundError(resource: string, id?: string): AppError {
  return new NotFoundError(
    `${resource}${id ? `(${id})` : ''}不存在`,
    { resource, id }
  )
}

// 权限不足错误
export function forbiddenError(resource?: string): AppError {
  return new PermissionError(
    resource ? `没有${resource}的访问权限` : '权限不足'
  )
}

// 未授权错误
export function unauthorizedError(): AppError {
  return new AuthenticationError('未授权访问')
}

// 统一的错误响应格式
export function createErrorResponse(error: AppError): ApiResponse {
  return {
    success: false,
    error: error.message,
    code: error.code,
    details: error.details
  }
}

// 成功的响应格式
export function createSuccessResponse<T>(data?: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  }
}

// 错误处理中间件
export function handleError(error: any): ApiResponse {
  // 如果是自定义错误
  if (error instanceof AppError) {
    return createErrorResponse(error)
  }

  // 如果是Prisma错误
  if (error?.code) {
    switch (error.code) {
      case 'P2002': // 唯一约束违反
        return createErrorResponse(
          createError('资源已存在', 'RESOURCE_ALREADY_EXISTS', 409)
        )
      case 'P2025': // 记录不存在
        return createErrorResponse(
          new NotFoundError('资源不存在')
        )
      default:
        return createErrorResponse(
          createError('数据库操作失败', 'DATABASE_ERROR', 500)
        )
    }
  }

  // 默认错误
  return createErrorResponse(
    createError('服务器内部错误', 'INTERNAL_SERVER_ERROR', 500)
  )
}

// 错误日志记录
export function logError(error: any, context?: string): void {
  const timestamp = new Date().toISOString()
  const errorInfo = error instanceof AppError ? error.toJSON() : {
    code: 'UNKNOWN',
    message: error.message,
    status: 500
  }

  console.error(`[${timestamp}]${context ? ` [${context}]` : ''} Error:`, {
    code: errorInfo.code,
    message: errorInfo.message,
    status: errorInfo.status,
    stack: error.stack,
    details: error.details
  })
}
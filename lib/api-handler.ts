// API请求处理中间件
import { NextRequest, NextResponse } from 'next/server'
import { 
  AppError, 
  createErrorResponse, 
  createSuccessResponse, 
  handleError,
  logError,
  ErrorCode,
  unauthorizedError,
  forbiddenError
} from './errors'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { createAuditLog } from './middleware/audit'

export interface ApiHandlerOptions {
  requireAuth?: boolean
  requireRole?: string | string[]
  methods?: string[]
  validation?: (data: any) => Promise<{ valid: boolean; errors?: string[] }>
  enableAudit?: boolean // 是否启用审计日志
  auditAction?: string // 自定义审计操作类型
  auditResource?: string // 自定义审计资源类型
}

// API处理函数类型
export type ApiHandler<T = any> = (
  request: NextRequest,
  params: { [key: string]: string }
) => Promise<T>

// 统一API处理函数
export async function apiHandler<T>(
  request: NextRequest,
  params: { [key: string]: string },
  handler: ApiHandler<T>,
  options: ApiHandlerOptions = {}
): Promise<NextResponse> {
  const startTime = Date.now()
  let session: any = null
  let auditStatus: 'SUCCESS' | 'FAILED' | 'WARNING' = 'SUCCESS'
  let statusCode = 200

  try {
    const { 
      requireAuth = false, 
      requireRole, 
      methods, 
      validation,
      enableAudit = true, // 默认启用审计日志
      auditAction,
      auditResource
    } = options

    // 检查HTTP方法
    if (methods && !methods.includes(request.method)) {
      statusCode = 405
      auditStatus = 'WARNING'
      return NextResponse.json(
        createErrorResponse(new AppError('不支持的HTTP方法', ErrorCode.INVALID_OPERATION, 405)),
        { status: 405 }
      )
    }

    // 认证检查
    if (requireAuth) {
      session = await getServerSession(authOptions)
      if (!session) {
        statusCode = 401
        auditStatus = 'FAILED'
        return NextResponse.json(
          createErrorResponse(unauthorizedError()),
          { status: 401 }
        )
      }

      // 角色检查
      if (requireRole) {
        const requiredRoles = Array.isArray(requireRole) ? requireRole : [requireRole]
        if (!requiredRoles.includes(session.user.role)) {
          statusCode = 403
          auditStatus = 'FAILED'
          return NextResponse.json(
            createErrorResponse(forbiddenError()),
            { status: 403 }
          )
        }
      }
    }

    // 数据验证（针对POST/PUT/PATCH请求）
    if (['POST', 'PUT', 'PATCH'].includes(request.method) && validation) {
      const body = await request.json()
      const validationResult = await validation(body)
      
      if (!validationResult.valid) {
        statusCode = 400
        auditStatus = 'WARNING'
        return NextResponse.json(
          createErrorResponse(
            new AppError(
              '数据验证失败',
              ErrorCode.VALIDATION_ERROR,
              400,
              { errors: validationResult.errors }
            )
          ),
          { status: 400 }
        )
      }
    }

    // 执行处理函数
    const result = await handler(request, params)

    // 返回成功响应
    return NextResponse.json(
      createSuccessResponse(result),
      { status: 200 }
    )

  } catch (error) {
    // 记录错误
    logError(error, 'apiHandler')

    // 设置失败状态
    auditStatus = 'FAILED'
    statusCode = error instanceof AppError ? error.statusCode : 500

    // 处理错误并返回统一格式
    const errorResponse = handleError(error)
    
    return NextResponse.json(
      errorResponse,
      { 
        status: statusCode
      }
    )
  } finally {
    // 记录审计日志（异步，不阻塞响应）
    if (options.enableAudit !== false) {
      const duration = Date.now() - startTime
      
      // 提取资源信息
      const pathname = request.nextUrl.pathname
      const resourceId = params?.id || extractResourceId(pathname)
      
      createAuditLog({
        userId: session?.user?.id,
        action: options.auditAction || deriveAction(request.method, pathname),
        resource: options.auditResource || deriveResource(pathname),
        resourceId,
        status: auditStatus,
        details: {
          method: request.method,
          path: pathname,
          statusCode,
          duration,
          userAgent: request.headers.get('user-agent') || undefined,
        },
        ipAddress: extractIpAddress(request),
        userAgent: request.headers.get('user-agent') || undefined,
      }).catch((error) => {
        console.error('Failed to create audit log:', error)
      })
    }
  }
}

// 辅助函数：从路径中提取资源 ID
function extractResourceId(pathname: string): string | undefined {
  const segments = pathname.split('/').filter(Boolean)
  // 查找看起来像 ID 的段（通常是最后一个段）
  const lastSegment = segments[segments.length - 1]
  if (lastSegment && /^[a-zA-Z0-9_-]+$/.test(lastSegment) && lastSegment.length > 10) {
    return lastSegment
  }
  return undefined
}

// 辅助函数：推导操作类型
function deriveAction(method: string, pathname: string): string {
  // 特殊路径的操作映射
  if (pathname.includes('/login')) return 'LOGIN'
  if (pathname.includes('/logout')) return 'LOGOUT'
  if (pathname.includes('/register')) return 'REGISTER'
  if (pathname.includes('/export')) return 'EXPORT'
  if (pathname.includes('/download')) return 'DOWNLOAD'
  if (pathname.includes('/upload')) return 'UPLOAD'

  // 根据 HTTP 方法映射
  switch (method) {
    case 'GET':
      return 'READ'
    case 'POST':
      return 'CREATE'
    case 'PUT':
    case 'PATCH':
      return 'UPDATE'
    case 'DELETE':
      return 'DELETE'
    default:
      return method
  }
}

// 辅助函数：推导资源类型
function deriveResource(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  
  // 跳过 'api' 段
  const apiIndex = segments.indexOf('api')
  if (apiIndex !== -1 && segments.length > apiIndex + 1) {
    return segments[apiIndex + 1]
  }
  
  // 如果没有找到，返回完整路径
  return pathname
}

// 辅助函数：提取 IP 地址
function extractIpAddress(request: NextRequest): string | undefined {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  return undefined
}

// 创建特定HTTP方法的处理函数
export function createApiHandler<T>(
  handler: ApiHandler<T>,
  options: ApiHandlerOptions = {}
) {
  return async (request: NextRequest, { params }: { params: { [key: string]: string } }) => {
    return apiHandler(request, params, handler, options)
  }
}

// GET请求处理函数
export function createGetHandler<T>(
  handler: ApiHandler<T>,
  options: Omit<ApiHandlerOptions, 'methods'> = {}
) {
  return createApiHandler(handler, { ...options, methods: ['GET'] })
}

// POST请求处理函数
export function createPostHandler<T>(
  handler: ApiHandler<T>,
  options: Omit<ApiHandlerOptions, 'methods'> = {}
) {
  return createApiHandler(handler, { ...options, methods: ['POST'] })
}

// PUT请求处理函数
export function createPutHandler<T>(
  handler: ApiHandler<T>,
  options: Omit<ApiHandlerOptions, 'methods'> = {}
) {
  return createApiHandler(handler, { ...options, methods: ['PUT'] })
}

// DELETE请求处理函数
export function createDeleteHandler<T>(
  handler: ApiHandler<T>,
  options: Omit<ApiHandlerOptions, 'methods'> = {}
) {
  return createApiHandler(handler, { ...options, methods: ['DELETE'] })
}

// PATCH请求处理函数
export function createPatchHandler<T>(
  handler: ApiHandler<T>,
  options: Omit<ApiHandlerOptions, 'methods'> = {}
) {
  return createApiHandler(handler, { ...options, methods: ['PATCH'] })
}

// 分页参数处理
export interface PaginationParams {
  page: number
  limit: number
  skip: number
}

export function getPaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
  
  return {
    page,
    limit,
    skip: (page - 1) * limit
  }
}

// 搜索参数处理
export function getSearchParams(request: NextRequest): Record<string, string> {
  const { searchParams } = new URL(request.url)
  const params: Record<string, string> = {}
  
  for (const [key, value] of searchParams.entries()) {
    if (key !== 'page' && key !== 'limit') {
      params[key] = value
    }
  }
  
  return params
}

// 分页响应格式
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pagination.limit)
  
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1
    }
  }
}
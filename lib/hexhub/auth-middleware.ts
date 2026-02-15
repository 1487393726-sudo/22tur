import { NextRequest, NextResponse } from 'next/server'
import { HEXHUB_CONFIG } from './config'

/**
 * HexHub 认证中间件
 */

export interface AuthContext {
  userId?: string
  userRole?: string
  apiKeyId?: string
  isAuthenticated: boolean
}

/**
 * 验证 JWT Token
 */
export function verifyJWT(token: string): any {
  try {
    // 简单的 JWT 验证（生产环境应使用 jsonwebtoken 库）
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    )

    // 检查过期时间
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null
    }

    return payload
  } catch (error) {
    return null
  }
}

/**
 * 验证 API 密钥
 */
export async function verifyApiKey(
  key: string,
  secret: string
): Promise<{ userId: string; keyId: string } | null> {
  try {
    // 这里应该从数据库查询 API 密钥
    // 示例实现
    if (!key.startsWith('hk_') || !secret.startsWith('sk_')) {
      return null
    }

    // 返回用户 ID 和密钥 ID
    return {
      userId: 'user-id',
      keyId: 'key-id',
    }
  } catch (error) {
    return null
  }
}

/**
 * 从请求中提取认证信息
 */
export function extractAuthFromRequest(
  request: NextRequest
): { token?: string; apiKey?: string; apiSecret?: string } {
  const authHeader = request.headers.get('authorization')
  const apiKey = request.headers.get('x-api-key')
  const apiSecret = request.headers.get('x-api-secret')

  let token: string | undefined

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  }

  return {
    token,
    apiKey: apiKey || undefined,
    apiSecret: apiSecret || undefined,
  }
}

/**
 * 认证中间件
 */
export async function authenticate(
  request: NextRequest
): Promise<{ context: AuthContext; error?: string }> {
  const { token, apiKey, apiSecret } = extractAuthFromRequest(request)

  // 尝试 JWT 认证
  if (token) {
    const payload = verifyJWT(token)
    if (payload) {
      return {
        context: {
          userId: payload.userId,
          userRole: payload.role,
          isAuthenticated: true,
        },
      }
    }
  }

  // 尝试 API 密钥认证
  if (apiKey && apiSecret) {
    const result = await verifyApiKey(apiKey, apiSecret)
    if (result) {
      return {
        context: {
          userId: result.userId,
          apiKeyId: result.keyId,
          isAuthenticated: true,
        },
      }
    }
  }

  return {
    context: {
      isAuthenticated: false,
    },
    error: '未授权',
  }
}

/**
 * 检查权限
 */
export function checkPermission(
  context: AuthContext,
  requiredRole?: string
): boolean {
  if (!context.isAuthenticated) {
    return false
  }

  if (!requiredRole) {
    return true
  }

  const roleHierarchy: { [key: string]: number } = {
    ADMIN: 4,
    EDITOR: 3,
    VIEWER: 2,
    USER: 1,
  }

  const userRoleLevel = roleHierarchy[context.userRole || 'USER'] || 0
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0

  return userRoleLevel >= requiredRoleLevel
}

/**
 * 创建认证错误响应
 */
export function createAuthErrorResponse(message: string = '未授权') {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: 'UNAUTHORIZED',
      },
    },
    { status: 401 }
  )
}

/**
 * 创建权限错误响应
 */
export function createForbiddenResponse(message: string = '禁止访问') {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: 'FORBIDDEN',
      },
    },
    { status: 403 }
  )
}

/**
 * 认证装饰器
 */
export function withAuth(
  handler: (
    request: NextRequest,
    context: AuthContext,
    params?: any
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    params?: any
  ): Promise<NextResponse> => {
    const { context, error } = await authenticate(request)

    if (error) {
      return createAuthErrorResponse(error)
    }

    return handler(request, context, params)
  }
}

/**
 * 权限检查装饰器
 */
export function withPermission(
  requiredRole: string,
  handler: (
    request: NextRequest,
    context: AuthContext,
    params?: any
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    params?: any
  ): Promise<NextResponse> => {
    const { context, error } = await authenticate(request)

    if (error) {
      return createAuthErrorResponse(error)
    }

    if (!checkPermission(context, requiredRole)) {
      return createForbiddenResponse('权限不足')
    }

    return handler(request, context, params)
  }
}

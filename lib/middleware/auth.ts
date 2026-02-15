import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    role: string
  }
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get('authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: '缺少认证令牌' },
          { status: 401 }
        )
      }

      const token = authHeader.substring(7)
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        
        // 将用户信息添加到请求对象
        const authenticatedRequest = request as AuthenticatedRequest
        authenticatedRequest.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        }

        return await handler(authenticatedRequest)
      } catch (jwtError) {
        return NextResponse.json(
          { error: '无效的认证令牌' },
          { status: 401 }
        )
      }
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: '认证失败' },
        { status: 401 }
      )
    }
  }
}

export function requireRole(allowedRoles: string[]) {
  return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return withAuth(async (request: AuthenticatedRequest) => {
      const userRole = request.user?.role

      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { error: '权限不足' },
          { status: 403 }
        )
      }

      return await handler(request)
    })
  }
}
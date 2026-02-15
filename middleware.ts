import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token
    
    // 登录与未授权页不做权限检查
    if (pathname === '/admin-login' || pathname === '/unauthorized') {
      return NextResponse.next()
    }
    
    // 管理端：权限校验，仅作用于 /admin 与 /api/admin（排除 /admin-login）
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/admin-login', req.url))
      }

      // 只允许管理员和经理访问管理页面
      const role = token.role as string
      if (role !== 'ADMIN' && role !== 'MANAGER') {
        console.log(`[Middleware] 用户角色 ${role} 无权访问 ${pathname}`)
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => true
    },
    secret: process.env.NEXTAUTH_SECRET
  }
)

export const config = {
  matcher: [
    // 管理端与其 API
    '/admin/:path*',
    '/api/admin/:path*',
  ]
}

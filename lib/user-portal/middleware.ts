/**
 * User Portal Middleware
 * Handles authentication, authorization, and request processing
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * User Portal Middleware
 * Protects user portal routes and ensures authentication
 */
export async function userPortalMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const path = request.nextUrl.pathname

  // Skip middleware for public routes
  const publicRoutes = ['/login', '/register', '/forgot-password', '/api/auth']
  if (publicRoutes.some(route => path.startsWith(route))) {
    return null
  }

  // Check authentication for protected routes
  if (path.startsWith('/user') || path.startsWith('/api/user')) {
    const token = await getToken({ req: request as any })

    if (!token) {
      // Redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Add user info to request headers for downstream handlers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', (token as any).userId || (token as any).sub)
    requestHeaders.set('x-user-email', (token as any).email)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return null
}

/**
 * Extract user ID from request
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  return request.headers.get('x-user-id')
}

/**
 * Extract user email from request
 */
export function getUserEmailFromRequest(request: NextRequest): string | null {
  return request.headers.get('x-user-email')
}

/**
 * Create authenticated response
 */
export function createAuthenticatedResponse<T>(
  data: T,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date(),
    },
    { status: statusCode }
  )
}

/**
 * Create error response
 */
export function createErrorResponse(
  error: string,
  statusCode: number = 400,
  code?: string
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      timestamp: new Date(),
    },
    { status: statusCode }
  )
}

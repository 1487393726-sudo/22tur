/**
 * Protected API Route Example
 * Demonstrates how to use authorization middleware
 * Validates: Requirements 1.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationMiddleware, AuthorizationContext, UserRole } from '@/lib/user-portal/authorization-middleware';

/**
 * GET /api/user-portal/protected-example
 * Protected endpoint - requires authentication
 */
export const GET = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: AuthorizationContext) => {
    try {
      return NextResponse.json(
        {
          success: true,
          message: 'Access granted to protected resource',
          data: {
            userId: context.userId,
            email: context.email,
            role: context.role,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error in protected endpoint:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          error: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/user-portal/protected-example
 * Admin-only endpoint - requires ADMIN role
 */
export const POST = AuthorizationMiddleware.authorize([UserRole.ADMIN])(
  async (request: NextRequest, context: AuthorizationContext) => {
    try {
      const body = await request.json();

      return NextResponse.json(
        {
          success: true,
          message: 'Admin action completed',
          data: {
            userId: context.userId,
            action: body.action,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error in admin endpoint:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          error: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  }
);

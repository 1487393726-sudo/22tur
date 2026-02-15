/**
 * User Portal Logout Endpoint
 * POST /api/user-portal/auth/logout
 * Validates: Requirements 1.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationService } from '@/lib/user-portal/auth-service';
import { SessionManagementService } from '@/lib/user-portal/session-service';

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing or invalid authorization header',
          error: 'MISSING_AUTH_HEADER',
        },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.substring(7);

    // Verify token
    const payload = AuthenticationService.verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid token',
          error: 'INVALID_TOKEN',
        },
        { status: 401 }
      );
    }

    // Perform logout
    const logoutResult = await AuthenticationService.logout(payload.userId);

    if (!logoutResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: logoutResult.message,
        },
        { status: 500 }
      );
    }

    // Invalidate all sessions for the user
    await SessionManagementService.invalidateAllSessions(payload.userId);

    // Return response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    );

    // Clear refresh token cookie
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout endpoint error:', error);
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

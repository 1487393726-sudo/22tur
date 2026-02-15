/**
 * User Portal Login Endpoint
 * POST /api/user-portal/auth/login
 * Validates: Requirements 1.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationService, LoginRequest } from '@/lib/user-portal/auth-service';
import { SessionManagementService } from '@/lib/user-portal/session-service';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as LoginRequest;

    // Validate input
    if (!body.identifier || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing identifier or password',
          error: 'MISSING_CREDENTIALS',
        },
        { status: 400 }
      );
    }

    // Perform login
    const loginResult = await AuthenticationService.login(body);

    if (!loginResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: loginResult.message,
          error: loginResult.error,
        },
        { status: 401 }
      );
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create session
    if (loginResult.token && loginResult.refreshToken && loginResult.session) {
      const session = await SessionManagementService.createSession(
        loginResult.session.userId,
        loginResult.token,
        loginResult.refreshToken,
        ipAddress,
        userAgent
      );

      // Return response with tokens and session
      const response = NextResponse.json(
        {
          success: true,
          message: 'Login successful',
          token: loginResult.token,
          refreshToken: loginResult.refreshToken,
          session: loginResult.session,
        },
        { status: 200 }
      );

      // Set secure HTTP-only cookie for refresh token
      response.cookies.set('refreshToken', loginResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Login failed',
        error: 'LOGIN_ERROR',
      },
      { status: 500 }
    );
  } catch (error) {
    console.error('Login endpoint error:', error);
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

/**
 * User Portal Refresh Token Endpoint
 * POST /api/user-portal/auth/refresh
 * Validates: Requirements 1.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationService } from '@/lib/user-portal/auth-service';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or body
    let refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      const body = await request.json() as { refreshToken?: string };
      refreshToken = body.refreshToken;
    }

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing refresh token',
          error: 'MISSING_REFRESH_TOKEN',
        },
        { status: 401 }
      );
    }

    // Refresh access token
    const result = await AuthenticationService.refreshAccessToken(refreshToken);

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to refresh token',
          error: result.error,
        },
        { status: 401 }
      );
    }

    if (!result.token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to generate new token',
          error: 'TOKEN_GENERATION_ERROR',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Token refreshed successfully',
        token: result.token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Refresh token endpoint error:', error);
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

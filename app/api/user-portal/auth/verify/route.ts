/**
 * User Portal Verify Session Endpoint
 * GET /api/user-portal/auth/verify
 * Validates: Requirements 1.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationService } from '@/lib/user-portal/auth-service';

export async function GET(request: NextRequest) {
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

    // Validate session
    const session = await AuthenticationService.validateSession(token);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired session',
          error: 'INVALID_SESSION',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Session is valid',
        session,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify session endpoint error:', error);
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

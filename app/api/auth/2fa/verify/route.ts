// app/api/auth/2fa/verify/route.ts
// 2FA Verify API - Verify TOTP code or backup code

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { TOTPService } from '@/lib/auth/totp-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, useBackupCode = false } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    const isValid = await TOTPService.verify(
      session.user.id,
      code,
      useBackupCode
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify code' },
      { status: 500 }
    );
  }
}

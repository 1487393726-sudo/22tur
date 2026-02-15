// app/api/auth/2fa/enable/route.ts
// 2FA Enable API - Verify code and enable 2FA

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
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    const result = await TOTPService.enable(session.user.id, code);

    return NextResponse.json({
      success: true,
      data: {
        enabled: result.enabled,
        backupCodes: result.backupCodes,
        message: '2FA has been enabled. Please save your backup codes securely.',
      },
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to enable 2FA' },
      { status: 400 }
    );
  }
}

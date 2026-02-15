// app/api/auth/2fa/setup/route.ts
// 2FA Setup API - Generate TOTP secret and QR code

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

    const result = await TOTPService.generateSecret(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        qrCode: result.qrCode,
        // Don't expose the raw secret in production
        // secret: result.secret, // Only for manual entry
        otpauthUrl: result.otpauthUrl,
      },
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}

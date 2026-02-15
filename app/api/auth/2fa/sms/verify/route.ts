// app/api/auth/2fa/sms/verify/route.ts
// SMS Verify API - Verify SMS code

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SMSService } from '@/lib/auth/sms-service';
import type { SMSPurpose } from '@/types/auth';

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
    const { code, purpose } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Validate purpose
    const validPurposes: SMSPurpose[] = ['LOGIN', 'ENABLE_2FA', 'VERIFY_PHONE'];
    if (!purpose || !validPurposes.includes(purpose)) {
      return NextResponse.json(
        { error: 'Invalid purpose' },
        { status: 400 }
      );
    }

    const isValid = await SMSService.verifyCode(session.user.id, code, purpose);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
    });
  } catch (error) {
    console.error('SMS verify error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify code' },
      { status: 500 }
    );
  }
}

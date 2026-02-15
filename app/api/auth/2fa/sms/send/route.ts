// app/api/auth/2fa/sms/send/route.ts
// SMS Send API - Send verification code via SMS

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SMSService } from '@/lib/auth/sms-service';
import { prisma } from '@/lib/prisma';
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
    const { purpose, phone } = body;

    // Validate purpose
    const validPurposes: SMSPurpose[] = ['LOGIN', 'ENABLE_2FA', 'VERIFY_PHONE'];
    if (!purpose || !validPurposes.includes(purpose)) {
      return NextResponse.json(
        { error: 'Invalid purpose' },
        { status: 400 }
      );
    }

    // Get phone number - either from request or user profile
    let phoneNumber = phone;
    if (!phoneNumber) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { phone: true },
      });
      phoneNumber = user?.phone;
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Check rate limit
    const canSend = await SMSService.checkRateLimit(session.user.id, phoneNumber);
    if (!canSend) {
      const resetTime = await SMSService.getRateLimitResetTime(session.user.id, phoneNumber);
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          resetTime,
        },
        { status: 429 }
      );
    }

    const result = await SMSService.sendCode(session.user.id, phoneNumber, purpose);

    return NextResponse.json({
      success: true,
      data: {
        expiresAt: result.expiresAt,
        expiresInMinutes: SMSService.getCodeExpiryMinutes(),
      },
    });
  } catch (error) {
    console.error('SMS send error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send SMS' },
      { status: 500 }
    );
  }
}

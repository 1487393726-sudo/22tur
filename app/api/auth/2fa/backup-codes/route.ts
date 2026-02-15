// app/api/auth/2fa/backup-codes/route.ts
// 2FA Backup Codes API - Get remaining count or regenerate codes

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { TOTPService } from '@/lib/auth/totp-service';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Get remaining backup codes count
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const remainingCount = await TOTPService.getRemainingBackupCodesCount(
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: {
        remainingCount,
      },
    });
  } catch (error) {
    console.error('Get backup codes error:', error);
    return NextResponse.json(
      { error: 'Failed to get backup codes count' },
      { status: 500 }
    );
  }
}

// POST - Regenerate backup codes (requires password)
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
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required to regenerate backup codes' },
        { status: 400 }
      );
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Cannot verify password for OAuth-only accounts' },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 400 }
      );
    }

    const backupCodes = await TOTPService.regenerateBackupCodes(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        backupCodes,
        message: 'New backup codes generated. Please save them securely.',
      },
    });
  } catch (error) {
    console.error('Regenerate backup codes error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to regenerate backup codes' },
      { status: 500 }
    );
  }
}

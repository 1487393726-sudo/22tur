// app/api/auth/devices/revoke-all/route.ts
// Device Management API - Revoke all devices except current

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { DeviceService } from '@/lib/auth/device-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { currentFingerprint } = body;

    const revokedCount = await DeviceService.revokeAllDevices(
      session.user.id,
      currentFingerprint
    );

    return NextResponse.json({
      success: true,
      data: {
        revokedCount,
        message: `${revokedCount} device(s) revoked`,
      },
    });
  } catch (error) {
    console.error('Revoke all devices error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke devices' },
      { status: 500 }
    );
  }
}

// app/api/auth/devices/route.ts
// Device Management API - Get all devices

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { DeviceService } from '@/lib/auth/device-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const devices = await DeviceService.getDevices(session.user.id);

    return NextResponse.json({
      success: true,
      data: devices,
    });
  } catch (error) {
    console.error('Get devices error:', error);
    return NextResponse.json(
      { error: 'Failed to get devices' },
      { status: 500 }
    );
  }
}

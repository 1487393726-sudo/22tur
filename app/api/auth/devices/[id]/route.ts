// app/api/auth/devices/[id]/route.ts
// Device Management API - Revoke specific device

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { DeviceService } from '@/lib/auth/device-service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const deviceId = params.id;

    // Check if device exists and belongs to user
    const device = await DeviceService.getDeviceById(session.user.id, deviceId);
    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    await DeviceService.revokeDevice(session.user.id, deviceId);

    return NextResponse.json({
      success: true,
      message: 'Device session revoked',
    });
  } catch (error) {
    console.error('Revoke device error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke device' },
      { status: 500 }
    );
  }
}

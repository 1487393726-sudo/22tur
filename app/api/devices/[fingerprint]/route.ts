/**
 * Device Management API
 * GET /api/devices/:fingerprint - Get device
 * PUT /api/devices/:fingerprint - Update device
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { deviceManager } from '@/lib/device';
import { auditLogSystem } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { fingerprint: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const device = await deviceManager.getDevice(params.fingerprint);

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Verify ownership
    if (device.owner !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { fingerprint: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Get original device
    const originalDevice = await deviceManager.getDevice(params.fingerprint);

    if (!originalDevice) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Verify ownership
    if (originalDevice.owner !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update device
    const updatedDevice = await deviceManager.updateDevice(params.fingerprint, {
      name: data.name,
      status: data.status,
    });

    // Log the action
    await auditLogSystem.logSuccess('DEVICE_UPDATED', 'DEVICE', updatedDevice.id, {
      userId: session.user.id,
      originalState: originalDevice,
      newState: updatedDevice,
    });

    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error('Error updating device:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

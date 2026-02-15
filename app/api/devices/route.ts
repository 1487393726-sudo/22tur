/**
 * Device Management API
 * POST /api/devices - Register device
 * GET /api/devices - List devices
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { deviceManager } from '@/lib/device';
import { auditLogSystem } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Generate fingerprint if not provided
    let fingerprint = data.fingerprint;

    if (!fingerprint) {
      fingerprint = deviceManager.generateFingerprint({
        userAgent: request.headers.get('user-agent') || 'unknown',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        screenResolution: data.screenResolution,
        timezone: data.timezone,
        language: data.language,
        platform: data.platform,
      });
    }

    // Register device
    const device = await deviceManager.registerDevice({
      fingerprint,
      name: data.name || 'Unknown Device',
      owner: session.user.id,
    });

    // Log the action
    await auditLogSystem.logSuccess('DEVICE_REGISTERED', 'DEVICE', device.id, {
      userId: session.user.id,
      newState: device,
    });

    return NextResponse.json(device, { status: 201 });
  } catch (error) {
    console.error('Error registering device:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const devices = await deviceManager.getUserDevices(session.user.id);

    return NextResponse.json({
      devices,
      total: devices.length,
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

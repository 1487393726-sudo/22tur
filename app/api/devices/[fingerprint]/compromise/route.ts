/**
 * Device Compromise API
 * POST /api/devices/:fingerprint/compromise - Mark as compromised
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { deviceManager } from '@/lib/device';
import { auditLogSystem } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: { fingerprint: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get device
    const device = await deviceManager.getDevice(params.fingerprint);

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Mark as compromised
    const compromisedDevice = await deviceManager.markAsCompromised(params.fingerprint);

    // Log the action
    await auditLogSystem.logSuccess('DEVICE_MARKED_COMPROMISED', 'DEVICE', device.id, {
      userId: session.user.id,
      details: {
        fingerprint: params.fingerprint,
        sessionsRevoked: true,
      },
    });

    return NextResponse.json(compromisedDevice);
  } catch (error) {
    console.error('Error marking device as compromised:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

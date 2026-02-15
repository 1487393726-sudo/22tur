/**
 * Device Trust Score API
 * PUT /api/devices/:fingerprint/trust-score - Update trust score
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { deviceManager } from '@/lib/device';
import { auditLogSystem } from '@/lib/audit';

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

    // Validate score
    if (typeof data.score !== 'number' || data.score < 0 || data.score > 100) {
      return NextResponse.json(
        { error: 'Invalid score. Must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Get original device
    const originalDevice = await deviceManager.getDevice(params.fingerprint);

    if (!originalDevice) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Update trust score
    const updatedDevice = await deviceManager.updateTrustScore(params.fingerprint, data.score);

    // Log the action
    await auditLogSystem.logSuccess('DEVICE_TRUST_SCORE_UPDATED', 'DEVICE', updatedDevice.id, {
      userId: session.user.id,
      details: {
        oldScore: originalDevice.trustScore,
        newScore: updatedDevice.trustScore,
      },
    });

    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error('Error updating device trust score:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

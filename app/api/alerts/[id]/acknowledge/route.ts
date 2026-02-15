/**
 * Alerts API
 * POST /api/alerts/:id/acknowledge - Acknowledge alert
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { anomalyDetector } from '@/lib/anomaly';
import { auditLogSystem } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Acknowledge alert
    const acknowledgedAlert = await anomalyDetector.acknowledgeAlert(params.id);

    // Log the action
    await auditLogSystem.logSuccess('ALERT_ACKNOWLEDGED', 'ALERT', params.id, {
      userId: session.user.id,
    });

    return NextResponse.json(acknowledgedAlert);
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

/**
 * Anomaly Detection API
 * GET /api/anomalies/:id - Get anomaly
 * PUT /api/anomalies/:id - Update anomaly status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { anomalyDetector } from '@/lib/anomaly';
import { auditLogSystem } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const anomaly = await anomalyDetector.getAnomaly(params.id);

    if (!anomaly) {
      return NextResponse.json({ error: 'Anomaly not found' }, { status: 404 });
    }

    return NextResponse.json(anomaly);
  } catch (error) {
    console.error('Error fetching anomaly:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate status
    if (!['NEW', 'ACKNOWLEDGED', 'RESOLVED'].includes(data.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be NEW, ACKNOWLEDGED, or RESOLVED' },
        { status: 400 }
      );
    }

    // Update anomaly status
    const updatedAnomaly = await anomalyDetector.updateAnomalyStatus(params.id, data.status);

    // Log the action
    await auditLogSystem.logSuccess('ANOMALY_STATUS_UPDATED', 'ANOMALY', params.id, {
      userId: session.user.id,
      details: {
        status: data.status,
      },
    });

    return NextResponse.json(updatedAnomaly);
  } catch (error) {
    console.error('Error updating anomaly:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

/**
 * Anomaly Detection API
 * GET /api/anomalies - List anomalies
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { anomalyDetector } from '@/lib/anomaly';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || session.user.id;
    const limit = parseInt(searchParams.get('limit') || '100');

    const anomalies = await anomalyDetector.getUserAnomalies(userId, limit);

    return NextResponse.json({
      anomalies,
      total: anomalies.length,
    });
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

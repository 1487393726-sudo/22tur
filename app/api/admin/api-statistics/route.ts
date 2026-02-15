import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  getStatistics,
  getStatisticsByDateRange,
  getDailyStatistics,
  getTopEndpoints,
  getUsageLogs,
} from '@/lib/api-management/statistics-service';

// GET /api/admin/api-statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const daily = searchParams.get('daily') === 'true';
    const topEndpoints = searchParams.get('topEndpoints') === 'true';
    const logs = searchParams.get('logs') === 'true';
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId is required' }, { status: 400 });
    }

    const response: Record<string, unknown> = {};

    // Get statistics
    if (startDate && endDate) {
      response.statistics = await getStatisticsByDateRange(connectionId, {
        start: new Date(startDate),
        end: new Date(endDate),
      });
    } else {
      response.statistics = await getStatistics(connectionId);
    }

    // Get daily statistics if requested
    if (daily) {
      response.dailyStats = await getDailyStatistics(connectionId, limit);
    }

    // Get top endpoints if requested
    if (topEndpoints) {
      response.topEndpoints = await getTopEndpoints(connectionId, 10);
    }

    // Get logs if requested
    if (logs) {
      response.logs = await getUsageLogs(connectionId, { limit });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}

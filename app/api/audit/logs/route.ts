/**
 * Audit Log API
 * GET /api/audit/logs - Query audit logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { auditLogSystem } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    const filter: any = {};

    if (searchParams.has('userId')) {
      filter.userId = searchParams.get('userId');
    }

    if (searchParams.has('action')) {
      filter.action = searchParams.get('action');
    }

    if (searchParams.has('resourceType')) {
      filter.resourceType = searchParams.get('resourceType');
    }

    if (searchParams.has('resourceId')) {
      filter.resourceId = searchParams.get('resourceId');
    }

    if (searchParams.has('result')) {
      filter.result = searchParams.get('result');
    }

    if (searchParams.has('startDate')) {
      filter.startDate = new Date(searchParams.get('startDate')!);
    }

    if (searchParams.has('endDate')) {
      filter.endDate = new Date(searchParams.get('endDate')!);
    }

    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const logs = await auditLogSystem.queryLogs({
      ...filter,
      limit,
      offset,
    });

    return NextResponse.json({
      logs,
      total: logs.length,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

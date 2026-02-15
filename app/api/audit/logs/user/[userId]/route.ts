/**
 * Audit Log API
 * GET /api/audit/logs/user/:userId - Get logs by user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { auditLogSystem } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    const timeRange: any = {};

    if (searchParams.has('startDate')) {
      timeRange.start = new Date(searchParams.get('startDate')!);
    }

    if (searchParams.has('endDate')) {
      timeRange.end = new Date(searchParams.get('endDate')!);
    }

    const logs = await auditLogSystem.getLogsByUser(
      params.userId,
      Object.keys(timeRange).length > 0 ? timeRange : undefined
    );

    return NextResponse.json({
      logs,
      total: logs.length,
    });
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

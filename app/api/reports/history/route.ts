/**
 * Compliance Reporting API
 * GET /api/reports/history - Get report history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { complianceReporter } from '@/lib/compliance';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    const reports = await complianceReporter.getAllReports({
      period,
      status,
      limit,
    });

    return NextResponse.json({
      reports,
      total: reports.length,
    });
  } catch (error) {
    console.error('Error fetching report history:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

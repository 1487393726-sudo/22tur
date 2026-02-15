/**
 * Compliance Reporting API
 * POST /api/reports/compliance - Generate compliance report
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { complianceReporter } from '@/lib/compliance';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.period || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: period, startDate, endDate' },
        { status: 400 }
      );
    }

    // Generate report
    const report = await complianceReporter.generateReport({
      period: data.period,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error generating compliance report:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

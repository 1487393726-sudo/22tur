/**
 * Compliance Reporting API
 * POST /api/reports/:id/export - Export report
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { complianceReporter } from '@/lib/compliance';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate format
    if (!['PDF', 'CSV', 'JSON'].includes(data.format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be PDF, CSV, or JSON' },
        { status: 400 }
      );
    }

    // Export report
    const exported = await complianceReporter.exportReport(params.id, data.format);

    return NextResponse.json({
      filename: exported.filename,
      mimeType: exported.mimeType,
      content: exported.content,
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

/**
 * Report Generation API Endpoint
 * 
 * POST /api/reports/generate - Generate investment report
 */

import { NextRequest, NextResponse } from 'next/server';
import { reportGenerationEngine } from '@/lib/investment-management/report-generation-engine';
import { ReportType } from '@/types/investment-management';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    if (!body.reportType) {
      return NextResponse.json(
        { error: 'Report type is required' },
        { status: 400 }
      );
    }

    // Validate report type
    const validReportTypes = Object.values(ReportType);
    if (!validReportTypes.includes(body.reportType)) {
      return NextResponse.json(
        { 
          error: 'Invalid report type',
          validTypes: validReportTypes
        },
        { status: 400 }
      );
    }

    // Parse dates if provided
    let periodStart: Date | undefined;
    let periodEnd: Date | undefined;

    if (body.periodStart) {
      periodStart = new Date(body.periodStart);
      if (isNaN(periodStart.getTime())) {
        return NextResponse.json(
          { error: 'Invalid period start date' },
          { status: 400 }
        );
      }
    }

    if (body.periodEnd) {
      periodEnd = new Date(body.periodEnd);
      if (isNaN(periodEnd.getTime())) {
        return NextResponse.json(
          { error: 'Invalid period end date' },
          { status: 400 }
        );
      }
    }

    // Validate date range
    if (periodStart && periodEnd && periodStart >= periodEnd) {
      return NextResponse.json(
        { error: 'Period start date must be before end date' },
        { status: 400 }
      );
    }

    // Generate report
    const reportResponse = await reportGenerationEngine.generateReport({
      portfolioId: body.portfolioId,
      reportType: body.reportType,
      periodStart,
      periodEnd,
      includeCharts: body.includeCharts !== false, // Default to true
      format: body.format || 'JSON'
    });

    return NextResponse.json({
      success: true,
      data: reportResponse
    });

  } catch (error) {
    console.error('Report generation failed:', error);
    return NextResponse.json(
      { 
        error: 'Report generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
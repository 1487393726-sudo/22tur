/**
 * Cash Flow Summary API
 * Provides aggregated cash flow data and analytics
 * 
 * Requirements: 7.2, 7.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { cashFlowManager } from '@/lib/investment-management/cash-flow-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const currency = searchParams.get('currency') || 'CNY';

    // Validate required parameters
    if (!accountId) {
      return NextResponse.json(
        { error: 'Missing required parameter: accountId' },
        { status: 400 }
      );
    }

    // Set default date range if not provided (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Get cash flow summary
    const summary = await cashFlowManager.getCashFlowSummary(
      accountId,
      start,
      end,
      currency
    );

    // Get anomaly detection results
    const anomalies = await cashFlowManager.detectAnomalies(accountId, 30);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        anomalies: {
          total: anomalies.length,
          high: anomalies.filter(a => a.severity === 'HIGH').length,
          medium: anomalies.filter(a => a.severity === 'MEDIUM').length,
          low: anomalies.filter(a => a.severity === 'LOW').length,
          recent: anomalies.slice(0, 5) // Show 5 most recent anomalies
        }
      }
    });

  } catch (error) {
    console.error('Cash flow summary error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate cash flow summary',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
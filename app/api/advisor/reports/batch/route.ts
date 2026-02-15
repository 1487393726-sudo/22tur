/**
 * Investment Advisor Batch Reports API
 * POST /api/advisor/reports/batch - Generate batch reports for multiple clients
 * 
 * Requirements: 6.5 - Support batch generation and personalization
 */

import { NextRequest, NextResponse } from 'next/server';
import { advisorClientManager } from '@/lib/investment-management/advisor-client-manager';
import { auditLogSystem } from '@/lib/audit/audit-system';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      advisorId, 
      clientIds, 
      reportType, 
      customizations = {}
    } = body;

    // Validate required fields
    if (!advisorId || !clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return NextResponse.json(
        { error: 'Advisor ID and client IDs array are required' },
        { status: 400 }
      );
    }

    // Validate report type
    const validReportTypes = ['MONTHLY', 'QUARTERLY', 'ANNUAL'];
    if (!reportType || !validReportTypes.includes(reportType)) {
      return NextResponse.json(
        { error: `Invalid report type. Must be one of: ${validReportTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate client IDs limit (prevent abuse)
    if (clientIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 clients allowed per batch request' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Generate batch reports
    const results = await advisorClientManager.generateBatchReports(
      advisorId,
      clientIds,
      reportType,
      customizations
    );

    const successCount = results.filter(r => r.status === 'SUCCESS').length;
    const failureCount = results.filter(r => r.status === 'FAILED').length;

    // Log batch report generation
    await auditLogSystem.logSuccess(
      'BATCH_REPORTS_API_GENERATED',
      'API_ENDPOINT',
      '/api/advisor/reports/batch',
      {
        userId: advisorId,
        ipAddress,
        userAgent,
        details: {
          clientCount: clientIds.length,
          successCount,
          failureCount,
          reportType,
          customizations: Object.keys(customizations),
          endpoint: 'POST /api/advisor/reports/batch'
        }
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        results,
        summary: {
          total: clientIds.length,
          successful: successCount,
          failed: failureCount,
          reportType
        }
      },
      message: `Batch report generation completed. ${successCount} successful, ${failureCount} failed.`
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log API error
    await auditLogSystem.logFailure(
      'BATCH_REPORTS_API_ERROR',
      'API_ENDPOINT',
      '/api/advisor/reports/batch',
      {
        reason: errorMessage,
        details: {
          endpoint: 'POST /api/advisor/reports/batch'
        }
      }
    );

    console.error('Batch reports API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate batch reports',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
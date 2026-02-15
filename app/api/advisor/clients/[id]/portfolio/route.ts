/**
 * Investment Advisor Client Portfolio API
 * GET /api/advisor/clients/[id]/portfolio - Get client portfolio details
 * 
 * Requirements: 6.2 - Load client data within 2 seconds
 */

import { NextRequest, NextResponse } from 'next/server';
import { advisorClientManager } from '@/lib/investment-management/advisor-client-manager';
import { auditLogSystem } from '@/lib/audit/audit-system';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const startTime = Date.now();
  
  try {
    const clientId = params.id;
    const { searchParams } = new URL(request.url);
    const advisorId = searchParams.get('advisorId');

    if (!advisorId) {
      return NextResponse.json(
        { error: 'Advisor ID is required' },
        { status: 400 }
      );
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Get client portfolio with performance tracking
    const portfolioData = await advisorClientManager.getClientPortfolio(
      advisorId,
      clientId
    );

    const totalTime = Date.now() - startTime;

    // Log successful access with performance metrics
    await auditLogSystem.logSuccess(
      'CLIENT_PORTFOLIO_API_ACCESS',
      'API_ENDPOINT',
      `/api/advisor/clients/${clientId}/portfolio`,
      {
        userId: advisorId,
        ipAddress,
        userAgent,
        details: {
          clientId,
          loadTimeMs: totalTime,
          performanceTarget: totalTime <= 2000 ? 'MET' : 'EXCEEDED',
          portfolioCount: portfolioData.portfolios?.length || 0,
          endpoint: `GET /api/advisor/clients/${clientId}/portfolio`
        }
      }
    );

    return NextResponse.json({
      success: true,
      data: portfolioData,
      meta: {
        loadTime: totalTime,
        performanceMet: totalTime <= 2000,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log API error with performance data
    await auditLogSystem.logFailure(
      'CLIENT_PORTFOLIO_API_ERROR',
      'API_ENDPOINT',
      `/api/advisor/clients/${params.id}/portfolio`,
      {
        reason: errorMessage,
        details: {
          clientId: params.id,
          loadTimeMs: totalTime,
          endpoint: `GET /api/advisor/clients/${params.id}/portfolio`
        }
      }
    );

    console.error('Client portfolio API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch client portfolio',
        message: errorMessage,
        meta: {
          loadTime: totalTime
        }
      },
      { status: 500 }
    );
  }
}
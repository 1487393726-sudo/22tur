/**
 * Investment Advisor Strategies API
 * POST /api/advisor/strategies - Create investment strategy
 * GET /api/advisor/strategies - Get strategies for advisor/client
 * 
 * Requirements: 6.3 - Strategy suggestions and risk assessment tools
 */

import { NextRequest, NextResponse } from 'next/server';
import { advisorClientManager } from '@/lib/investment-management/advisor-client-manager';
import { auditLogSystem } from '@/lib/audit/audit-system';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      advisorId, 
      clientId, 
      name, 
      description, 
      targetReturn, 
      riskTolerance, 
      timeHorizon, 
      assetAllocation,
      status = 'DRAFT'
    } = body;

    // Validate required fields
    if (!advisorId || !clientId || !name || !description) {
      return NextResponse.json(
        { error: 'Advisor ID, Client ID, name, and description are required' },
        { status: 400 }
      );
    }

    // Validate asset allocation
    if (!assetAllocation || typeof assetAllocation !== 'object') {
      return NextResponse.json(
        { error: 'Asset allocation is required and must be an object' },
        { status: 400 }
      );
    }

    // Validate asset allocation percentages sum to 100
    const totalAllocation = Object.values(assetAllocation).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
      return NextResponse.json(
        { error: 'Asset allocation must sum to 100%' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create investment strategy
    const strategy = await advisorClientManager.createInvestmentStrategy(
      advisorId,
      clientId,
      {
        name,
        description,
        targetReturn: Number(targetReturn),
        riskTolerance,
        timeHorizon: Number(timeHorizon),
        assetAllocation,
        status
      }
    );

    // Log successful strategy creation
    await auditLogSystem.logSuccess(
      'INVESTMENT_STRATEGY_API_CREATED',
      'API_ENDPOINT',
      '/api/advisor/strategies',
      {
        userId: advisorId,
        ipAddress,
        userAgent,
        details: {
          clientId,
          strategyId: strategy.id,
          strategyName: name,
          targetReturn,
          riskTolerance,
          endpoint: 'POST /api/advisor/strategies'
        }
      }
    );

    return NextResponse.json({
      success: true,
      data: strategy,
      message: 'Investment strategy created successfully'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log API error
    await auditLogSystem.logFailure(
      'INVESTMENT_STRATEGY_API_ERROR',
      'API_ENDPOINT',
      '/api/advisor/strategies',
      {
        reason: errorMessage,
        details: {
          endpoint: 'POST /api/advisor/strategies'
        }
      }
    );

    console.error('Investment strategy API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create investment strategy',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const advisorId = searchParams.get('advisorId');
    const clientId = searchParams.get('clientId');

    if (!advisorId) {
      return NextResponse.json(
        { error: 'Advisor ID is required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // This would typically query the database for strategies
    // For now, return a placeholder response
    const strategies = []; // TODO: Implement strategy retrieval

    // Log successful access
    await auditLogSystem.logSuccess(
      'INVESTMENT_STRATEGIES_API_ACCESS',
      'API_ENDPOINT',
      '/api/advisor/strategies',
      {
        userId: advisorId,
        ipAddress,
        userAgent,
        details: {
          clientId,
          strategyCount: strategies.length,
          endpoint: 'GET /api/advisor/strategies'
        }
      }
    );

    return NextResponse.json({
      success: true,
      data: strategies,
      meta: {
        count: strategies.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log API error
    await auditLogSystem.logFailure(
      'INVESTMENT_STRATEGIES_API_ERROR',
      'API_ENDPOINT',
      '/api/advisor/strategies',
      {
        reason: errorMessage,
        details: {
          endpoint: 'GET /api/advisor/strategies'
        }
      }
    );

    console.error('Investment strategies API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch investment strategies',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
/**
 * Investment Returns API Endpoint
 * GET /api/investments/:id/returns
 * 
 * Provides return calculations for a specific investment
 * Requirements: 3.2, 3.4, 3.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { returnCalculationEngine } from '@/lib/investment-management/return-calculation-engine';
import { 
  InvestmentBusinessError,
  BusinessErrorCodes
} from '@/types/investment-management';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/investments/:id/returns
 * Calculate and return performance metrics for a specific investment
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: investmentId } = params;

    if (!investmentId) {
      return NextResponse.json(
        { 
          error: 'Investment ID is required',
          code: BusinessErrorCodes.INVALID_INVESTMENT_AMOUNT
        },
        { status: 400 }
      );
    }

    // Calculate investment metrics
    const metrics = await returnCalculationEngine.calculateInvestmentMetrics(investmentId);

    return NextResponse.json({
      success: true,
      data: {
        investmentId,
        metrics,
        calculatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Investment returns API error:', error);

    if (error instanceof InvestmentBusinessError) {
      const statusCode = error.code === BusinessErrorCodes.PORTFOLIO_NOT_FOUND ? 404 : 400;
      
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details
        },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error during investment return calculation',
        code: BusinessErrorCodes.CALCULATION_ERROR
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/investments/:id/returns
 * Recalculate and update investment returns (for admin use)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: investmentId } = params;

    if (!investmentId) {
      return NextResponse.json(
        { 
          error: 'Investment ID is required',
          code: BusinessErrorCodes.INVALID_INVESTMENT_AMOUNT
        },
        { status: 400 }
      );
    }

    // Recalculate metrics
    const metrics = await returnCalculationEngine.calculateInvestmentMetrics(investmentId);

    // In a real implementation, you might want to update the database
    // with the calculated values for caching purposes

    return NextResponse.json({
      success: true,
      message: 'Investment returns recalculated successfully',
      data: {
        investmentId,
        metrics,
        recalculatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Investment returns recalculation API error:', error);

    if (error instanceof InvestmentBusinessError) {
      const statusCode = error.code === BusinessErrorCodes.PORTFOLIO_NOT_FOUND ? 404 : 400;
      
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details
        },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error during investment return recalculation',
        code: BusinessErrorCodes.CALCULATION_ERROR
      },
      { status: 500 }
    );
  }
}
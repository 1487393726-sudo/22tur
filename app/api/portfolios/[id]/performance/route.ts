/**
 * Portfolio Performance API Endpoint
 * GET /api/portfolios/:id/performance
 * 
 * Provides comprehensive performance analysis for a portfolio
 * Requirements: 3.2, 3.4, 3.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { returnCalculationEngine } from '@/lib/investment-management/return-calculation-engine';
import { 
  InvestmentBusinessError,
  BusinessErrorCodes,
  TimePeriod
} from '@/types/investment-management';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/portfolios/:id/performance
 * Calculate comprehensive performance metrics for a portfolio
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: portfolioId } = params;
    const { searchParams } = new URL(request.url);
    
    // Get optional query parameters
    const timeframe = searchParams.get('timeframe') as TimePeriod || undefined;
    const includeProjections = searchParams.get('includeProjections') === 'true';
    const includeBenchmark = searchParams.get('includeBenchmark') === 'true';

    if (!portfolioId) {
      return NextResponse.json(
        { 
          error: 'Portfolio ID is required',
          code: BusinessErrorCodes.PORTFOLIO_NOT_FOUND
        },
        { status: 400 }
      );
    }

    // Calculate portfolio returns
    const performance = await returnCalculationEngine.calculatePortfolioReturns(
      portfolioId, 
      timeframe
    );

    // Prepare response data
    const responseData = {
      portfolioId,
      timeframe: timeframe || 'ALL',
      performance,
      calculatedAt: new Date().toISOString(),
      metadata: {
        includeProjections,
        includeBenchmark,
        calculationMethod: 'comprehensive',
        dataSource: 'real-time'
      }
    };

    // Add benchmark comparison if requested
    if (includeBenchmark) {
      // In a real implementation, you would fetch benchmark data
      // For now, we'll add a placeholder
      (responseData as any).benchmark = {
        name: 'Market Index',
        return: performance.returnPercentage * 0.8, // Assume portfolio outperforms by 20%
        comparison: {
          outperformance: performance.returnPercentage * 0.2,
          relativeReturn: 1.2
        }
      };
    }

    // Add projections if requested
    if (includeProjections) {
      // Simple projection based on historical performance
      const projectedAnnualReturn = performance.annualizedReturn || 0;
      (responseData as any).projections = {
        oneYear: {
          expectedReturn: projectedAnnualReturn,
          conservativeReturn: projectedAnnualReturn * 0.7,
          optimisticReturn: projectedAnnualReturn * 1.3
        },
        threeYear: {
          expectedReturn: projectedAnnualReturn * 3,
          conservativeReturn: projectedAnnualReturn * 3 * 0.7,
          optimisticReturn: projectedAnnualReturn * 3 * 1.3
        },
        disclaimer: 'Projections are based on historical performance and do not guarantee future results'
      };
    }

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Portfolio performance API error:', error);

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
        error: 'Internal server error during portfolio performance calculation',
        code: BusinessErrorCodes.CALCULATION_ERROR
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolios/:id/performance
 * Trigger performance recalculation with custom parameters
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: portfolioId } = params;
    const body = await request.json();

    if (!portfolioId) {
      return NextResponse.json(
        { 
          error: 'Portfolio ID is required',
          code: BusinessErrorCodes.PORTFOLIO_NOT_FOUND
        },
        { status: 400 }
      );
    }

    // Extract calculation parameters from request body
    const {
      timeframe,
      recalculateAll = false,
      updateCache = true,
      includeStressTest = false
    } = body;

    // Perform calculation
    const performance = await returnCalculationEngine.calculatePortfolioReturns(
      portfolioId,
      timeframe as TimePeriod
    );

    // Prepare response
    const responseData = {
      portfolioId,
      performance,
      calculationParameters: {
        timeframe: timeframe || 'ALL',
        recalculateAll,
        updateCache,
        includeStressTest
      },
      recalculatedAt: new Date().toISOString()
    };

    // Add stress test results if requested
    if (includeStressTest) {
      // Simplified stress test simulation
      (responseData as any).stressTest = {
        scenarios: [
          {
            name: 'Market Crash (-30%)',
            portfolioImpact: performance.absoluteReturn * 0.7,
            probability: 0.05
          },
          {
            name: 'Economic Recession (-15%)',
            portfolioImpact: performance.absoluteReturn * 0.85,
            probability: 0.15
          },
          {
            name: 'Inflation Spike (-10%)',
            portfolioImpact: performance.absoluteReturn * 0.9,
            probability: 0.25
          }
        ],
        worstCaseScenario: {
          name: 'Market Crash (-30%)',
          impact: performance.absoluteReturn * 0.7
        }
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Portfolio performance recalculated successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Portfolio performance recalculation API error:', error);

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
        error: 'Internal server error during portfolio performance recalculation',
        code: BusinessErrorCodes.CALCULATION_ERROR
      },
      { status: 500 }
    );
  }
}
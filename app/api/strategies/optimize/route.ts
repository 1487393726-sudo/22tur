/**
 * Portfolio Strategy Optimization API Endpoint
 * POST /api/strategies/optimize
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { strategyOptimizer } from '@/lib/investment-management/strategy-optimizer';
import {
  OptimizePortfolioRequest,
  OptimizePortfolioResponse,
  OptimizationObjective,
  BusinessErrorCodes,
  InvestmentBusinessError
} from '@/types/investment-management';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: OptimizePortfolioRequest = await request.json();

    // Validate required fields
    if (!body.portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    if (!body.objective || !Object.values(OptimizationObjective).includes(body.objective)) {
      return NextResponse.json(
        { error: 'Valid optimization objective is required' },
        { status: 400 }
      );
    }

    // Validate target values for specific objectives
    if (body.objective === OptimizationObjective.TARGET_RETURN && !body.targetReturn) {
      return NextResponse.json(
        { error: 'Target return is required for TARGET_RETURN objective' },
        { status: 400 }
      );
    }

    if (body.objective === OptimizationObjective.TARGET_RISK && !body.targetRisk) {
      return NextResponse.json(
        { error: 'Target risk is required for TARGET_RISK objective' },
        { status: 400 }
      );
    }

    // Build optimization request
    const optimizationRequest = {
      portfolioId: body.portfolioId,
      objective: body.objective,
      constraints: {
        maxPositionSize: body.constraints?.maxPositionSize || 0.3,
        minPositionSize: body.constraints?.minPositionSize || 0.01,
        maxSectorConcentration: body.constraints?.maxSectorConcentration || 0.4,
        allowedAssetTypes: body.constraints?.allowedAssetTypes || ['EQUITY', 'BOND', 'REIT'],
        excludedInvestments: body.constraints?.excludedInvestments || [],
        liquidityRequirement: body.constraints?.liquidityRequirement || 0.1,
        riskBudget: body.constraints?.riskBudget || 0.25
      },
      targetReturn: body.targetReturn,
      targetRisk: body.targetRisk,
      rebalancingBudget: body.rebalancingBudget,
      includeNewInvestments: true,
      excludeCurrentHoldings: []
    };

    // Perform optimization
    const optimization = await strategyOptimizer.optimizePortfolio(optimizationRequest);

    // Generate strategy recommendations
    const recommendations = await strategyOptimizer.generateRecommendations(
      body.portfolioId,
      ['OPTIMIZATION'],
      undefined
    );

    const response: OptimizePortfolioResponse = {
      optimization,
      recommendations,
      message: 'Portfolio optimization completed successfully'
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Portfolio optimization error:', error);

    if (error instanceof InvestmentBusinessError) {
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Portfolio optimization failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId');

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    // Get optimization history for the portfolio
    // This would typically fetch from database
    const optimizationHistory = [
      {
        id: 'opt_1',
        portfolioId,
        requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        objective: OptimizationObjective.MAXIMIZE_SHARPE,
        expectedReturn: 0.12,
        expectedRisk: 0.15,
        expectedSharpe: 0.6,
        status: 'COMPLETED'
      },
      {
        id: 'opt_2',
        portfolioId,
        requestedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        objective: OptimizationObjective.MINIMIZE_RISK,
        expectedReturn: 0.08,
        expectedRisk: 0.10,
        expectedSharpe: 0.5,
        status: 'COMPLETED'
      }
    ];

    return NextResponse.json({
      history: optimizationHistory,
      message: 'Optimization history retrieved successfully'
    });

  } catch (error) {
    console.error('Failed to retrieve optimization history:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve optimization history' },
      { status: 500 }
    );
  }
}
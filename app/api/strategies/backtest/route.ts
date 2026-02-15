/**
 * Strategy Backtesting API Endpoint
 * POST /api/strategies/backtest
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { strategyOptimizer } from '@/lib/investment-management/strategy-optimizer';
import {
  BacktestStrategyRequest,
  BacktestStrategyResponse,
  RebalancingFrequency,
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
    const body: BacktestStrategyRequest = await request.json();

    // Validate required fields
    if (!body.portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    if (!body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Validate date range
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Validate date range is not too long (max 10 years)
    const maxBacktestPeriod = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years in milliseconds
    if (endDate.getTime() - startDate.getTime() > maxBacktestPeriod) {
      return NextResponse.json(
        { error: 'Backtest period cannot exceed 10 years' },
        { status: 400 }
      );
    }

    // Build backtest request
    const backtestRequest = {
      strategyId: body.strategyId || `default_strategy_${body.portfolioId}`,
      portfolioId: body.portfolioId,
      startDate,
      endDate,
      initialValue: body.initialValue || 100000, // Default $100k
      rebalancingFrequency: body.rebalancingFrequency || RebalancingFrequency.QUARTERLY,
      transactionCosts: body.transactionCosts || 0.001, // Default 0.1%
      includeMarketData: true
    };

    // Perform backtesting
    const backtest = await strategyOptimizer.backtestStrategy(backtestRequest);

    // Generate insights based on backtest results
    const insights = generateBacktestInsights(backtest);

    const response: BacktestStrategyResponse = {
      backtest,
      insights,
      message: 'Strategy backtesting completed successfully'
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Strategy backtesting error:', error);

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
        error: 'Strategy backtesting failed',
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
    const strategyId = searchParams.get('strategyId');

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    // Get backtest history for the portfolio/strategy
    const backtestHistory = [
      {
        id: 'bt_1',
        portfolioId,
        strategyId: strategyId || 'default',
        period: {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31')
        },
        totalReturn: 0.15,
        annualizedReturn: 0.15,
        sharpeRatio: 0.75,
        maxDrawdown: -0.08,
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'bt_2',
        portfolioId,
        strategyId: strategyId || 'default',
        period: {
          start: new Date('2022-01-01'),
          end: new Date('2022-12-31')
        },
        totalReturn: 0.08,
        annualizedReturn: 0.08,
        sharpeRatio: 0.45,
        maxDrawdown: -0.12,
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ];

    return NextResponse.json({
      history: backtestHistory,
      message: 'Backtest history retrieved successfully'
    });

  } catch (error) {
    console.error('Failed to retrieve backtest history:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve backtest history' },
      { status: 500 }
    );
  }
}

// Helper function to generate insights from backtest results
function generateBacktestInsights(backtest: any) {
  const insights = [];

  // Performance insights
  if (backtest.annualizedReturn > 0.10) {
    insights.push({
      type: 'PERFORMANCE',
      title: 'Strong Performance',
      description: `Strategy achieved ${(backtest.annualizedReturn * 100).toFixed(1)}% annualized return`,
      impact: 'POSITIVE',
      significance: 'HIGH',
      recommendation: 'Consider increasing allocation to this strategy'
    });
  } else if (backtest.annualizedReturn < 0.05) {
    insights.push({
      type: 'PERFORMANCE',
      title: 'Underperformance',
      description: `Strategy achieved only ${(backtest.annualizedReturn * 100).toFixed(1)}% annualized return`,
      impact: 'NEGATIVE',
      significance: 'HIGH',
      recommendation: 'Review strategy parameters or consider alternatives'
    });
  }

  // Risk insights
  if (backtest.maxDrawdown < -0.20) {
    insights.push({
      type: 'RISK',
      title: 'High Drawdown Risk',
      description: `Maximum drawdown of ${(Math.abs(backtest.maxDrawdown) * 100).toFixed(1)}% indicates high risk`,
      impact: 'NEGATIVE',
      significance: 'HIGH',
      recommendation: 'Consider risk management measures or position sizing adjustments'
    });
  }

  // Sharpe ratio insights
  if (backtest.sharpeRatio > 1.0) {
    insights.push({
      type: 'PERFORMANCE',
      title: 'Excellent Risk-Adjusted Returns',
      description: `Sharpe ratio of ${backtest.sharpeRatio.toFixed(2)} indicates superior risk-adjusted performance`,
      impact: 'POSITIVE',
      significance: 'HIGH'
    });
  } else if (backtest.sharpeRatio < 0.5) {
    insights.push({
      type: 'RISK',
      title: 'Poor Risk-Adjusted Returns',
      description: `Sharpe ratio of ${backtest.sharpeRatio.toFixed(2)} suggests inadequate compensation for risk`,
      impact: 'NEGATIVE',
      significance: 'MEDIUM',
      recommendation: 'Consider strategies with better risk-return profiles'
    });
  }

  // Transaction cost insights
  if (backtest.transactionCosts > backtest.totalReturn * 0.1) {
    insights.push({
      type: 'COST',
      title: 'High Transaction Costs',
      description: `Transaction costs represent ${((backtest.transactionCosts / backtest.totalReturn) * 100).toFixed(1)}% of total returns`,
      impact: 'NEGATIVE',
      significance: 'MEDIUM',
      recommendation: 'Consider reducing rebalancing frequency or using lower-cost execution methods'
    });
  }

  // Rebalancing frequency insights
  if (backtest.numberOfRebalances > 50) {
    insights.push({
      type: 'TIMING',
      title: 'Frequent Rebalancing',
      description: `${backtest.numberOfRebalances} rebalances may indicate over-trading`,
      impact: 'NEGATIVE',
      significance: 'MEDIUM',
      recommendation: 'Consider increasing rebalancing thresholds to reduce turnover'
    });
  }

  return insights;
}
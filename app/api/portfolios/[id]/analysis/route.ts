// Portfolio Analysis API Endpoint
// Phase 3, Task 3.1: Portfolio analysis and recommendations endpoint

import { NextRequest, NextResponse } from 'next/server';
import { portfolioAnalyzer } from '@/lib/investment-management/portfolio-analyzer';
import { 
  PortfolioAnalysisRequest,
  PortfolioAnalysisResponse,
  TimePeriod,
  InvestmentBusinessError,
  BusinessErrorCodes
} from '@/types/investment-management';

/**
 * GET /api/portfolios/[id]/analysis
 * Get comprehensive portfolio analysis
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const portfolioId = params.id;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const includeProjections = searchParams.get('includeProjections') === 'true';
    const timeframe = (searchParams.get('timeframe') || '1Y') as TimePeriod;

    // Get user ID from session/auth (placeholder for now)
    const userId = request.headers.get('x-user-id') || 'demo-user-id';
    const userRole = request.headers.get('x-user-role') || 'INVESTOR';

    // Validate timeframe
    const validTimeframes: TimePeriod[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y', 'ALL'];
    if (!validTimeframes.includes(timeframe)) {
      return NextResponse.json(
        { error: 'Invalid timeframe. Must be one of: ' + validTimeframes.join(', ') },
        { status: 400 }
      );
    }

    // Generate comprehensive analysis
    const analysis = await portfolioAnalyzer.generatePerformanceReport(portfolioId, timeframe);
    
    // Generate recommendations
    const recommendations = await portfolioAnalyzer.generateRecommendations(portfolioId);

    // Get portfolio basic info for response
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      select: {
        id: true,
        name: true,
        userId: true,
        totalValue: true,
        totalInvested: true,
        totalReturn: true,
        returnPercentage: true,
        riskScore: true,
        lastUpdated: true
      }
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (!['ADMIN', 'INVESTMENT_MANAGER'].includes(userRole) && portfolio.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only view analysis for your own portfolios' },
        { status: 403 }
      );
    }

    const response: PortfolioAnalysisResponse = {
      portfolio,
      analysis,
      recommendations
    };

    // Add projections if requested
    if (includeProjections) {
      // TODO: Implement portfolio projections
      // This would include future value projections, scenario analysis, etc.
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating portfolio analysis:', error);

    if (error instanceof InvestmentBusinessError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === BusinessErrorCodes.PORTFOLIO_NOT_FOUND ? 404 : 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolios/[id]/analysis
 * Trigger portfolio analysis refresh
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const portfolioId = params.id;
    const body = await request.json();

    // Get user ID from session/auth (placeholder for now)
    const userId = request.headers.get('x-user-id') || 'demo-user-id';
    const userRole = request.headers.get('x-user-role') || 'INVESTOR';

    // Parse request parameters
    const timeframe = (body.timeframe || '1Y') as TimePeriod;
    const forceRefresh = body.forceRefresh === true;

    // Validate timeframe
    const validTimeframes: TimePeriod[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y', 'ALL'];
    if (!validTimeframes.includes(timeframe)) {
      return NextResponse.json(
        { error: 'Invalid timeframe. Must be one of: ' + validTimeframes.join(', ') },
        { status: 400 }
      );
    }

    // Check portfolio ownership
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      select: {
        id: true,
        userId: true,
        lastUpdated: true
      }
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (!['ADMIN', 'INVESTMENT_MANAGER'].includes(userRole) && portfolio.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only refresh analysis for your own portfolios' },
        { status: 403 }
      );
    }

    // Check if refresh is needed (unless forced)
    if (!forceRefresh) {
      const lastUpdated = new Date(portfolio.lastUpdated);
      const now = new Date();
      const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      
      // Only refresh if more than 1 hour has passed
      if (hoursSinceUpdate < 1) {
        return NextResponse.json(
          { 
            message: 'Analysis is up to date',
            lastUpdated: portfolio.lastUpdated,
            nextRefreshAvailable: new Date(lastUpdated.getTime() + 60 * 60 * 1000)
          }
        );
      }
    }

    // Perform analysis refresh
    const startTime = Date.now();
    
    const [analysis, recommendations] = await Promise.all([
      portfolioAnalyzer.generatePerformanceReport(portfolioId, timeframe),
      portfolioAnalyzer.generateRecommendations(portfolioId)
    ]);

    // Update portfolio last updated timestamp
    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        lastUpdated: new Date(),
        // Update calculated metrics
        riskScore: analysis.riskMetrics.portfolioRisk
      }
    });

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      message: 'Portfolio analysis refreshed successfully',
      analysis,
      recommendations,
      metadata: {
        refreshedAt: new Date(),
        processingTimeMs: processingTime,
        timeframe,
        forceRefresh
      }
    });

  } catch (error) {
    console.error('Error refreshing portfolio analysis:', error);

    if (error instanceof InvestmentBusinessError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === BusinessErrorCodes.PORTFOLIO_NOT_FOUND ? 404 : 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
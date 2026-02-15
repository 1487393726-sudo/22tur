/**
 * Portfolio Risk Analysis API
 * 
 * GET /api/portfolios/[id]/risk - Get portfolio risk data
 */

import { NextRequest, NextResponse } from 'next/server';
import { riskAssessmentEngine } from '@/lib/investment-management/risk-assessment-engine';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const portfolioId = params.id;
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const confidenceLevel = parseFloat(searchParams.get('confidenceLevel') || '0.95');

    // Validate portfolio exists
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        investments: true
      }
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Get latest risk assessment
    const latestAssessment = await prisma.riskAssessment.findFirst({
      where: { portfolioId },
      orderBy: { assessmentDate: 'desc' }
    });

    // Calculate current risk metrics
    const currentRisk = await riskAssessmentEngine.assessPortfolioRisk(
      portfolioId,
      { confidenceLevel }
    );

    // Get historical assessments if requested
    let historicalAssessments = [];
    if (includeHistory) {
      historicalAssessments = await prisma.riskAssessment.findMany({
        where: { portfolioId },
        orderBy: { assessmentDate: 'desc' },
        take: 12 // Last 12 assessments
      });
    }

    // Calculate VaR and CVaR
    const valueAtRisk = await riskAssessmentEngine.calculateVaR(
      portfolio as any,
      confidenceLevel
    );

    const conditionalVaR = await riskAssessmentEngine.calculateCVaR(
      portfolio as any,
      confidenceLevel
    );

    return NextResponse.json({
      success: true,
      data: {
        portfolioId,
        currentRisk,
        latestAssessment,
        riskMetrics: {
          valueAtRisk,
          conditionalVaR,
          confidenceLevel
        },
        historicalAssessments: includeHistory ? historicalAssessments : undefined
      }
    });

  } catch (error) {
    console.error('Portfolio risk analysis failed:', error);
    return NextResponse.json(
      { 
        error: 'Risk analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
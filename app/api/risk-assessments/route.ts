/**
 * Risk Assessment API Endpoints
 * 
 * POST /api/risk-assessments - Create new risk assessment
 * GET /api/risk-assessments - Get risk assessments with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { riskAssessmentEngine } from '@/lib/investment-management/risk-assessment-engine';
import { validateRiskAssessmentRequest } from '@/lib/investment-management/validation';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const validation = validateRiskAssessmentRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const { portfolioId, options } = body;

    // Check if portfolio exists
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId }
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Perform risk assessment
    const riskAssessment = await riskAssessmentEngine.assessPortfolioRisk(
      portfolioId,
      options
    );

    // Generate risk alert if necessary
    await riskAssessmentEngine.generateRiskAlert(
      riskAssessment.riskLevel,
      portfolioId
    );

    return NextResponse.json({
      success: true,
      data: riskAssessment
    });

  } catch (error) {
    console.error('Risk assessment creation failed:', error);
    return NextResponse.json(
      { 
        error: 'Risk assessment failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId');
    const riskLevel = searchParams.get('riskLevel');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query filters
    const where: any = {};
    if (portfolioId) {
      where.portfolioId = portfolioId;
    }
    if (riskLevel) {
      where.riskLevel = riskLevel;
    }

    // Get risk assessments with pagination
    const [assessments, total] = await Promise.all([
      prisma.riskAssessment.findMany({
        where,
        orderBy: { assessmentDate: 'desc' },
        take: limit,
        skip: offset,
        include: {
          portfolio: {
            select: {
              id: true,
              name: true,
              totalValue: true
            }
          }
        }
      }),
      prisma.riskAssessment.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        assessments,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });

  } catch (error) {
    console.error('Failed to fetch risk assessments:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch risk assessments',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
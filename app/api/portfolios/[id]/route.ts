// Individual Portfolio API Endpoints
// Phase 3, Task 3.1: Portfolio details and management endpoints

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { portfolioAnalyzer } from '@/lib/investment-management/portfolio-analyzer';
import { 
  validatePortfolio,
  sanitizeInput
} from '@/lib/investment-management/validation';
import { 
  InvestmentBusinessError,
  BusinessErrorCodes
} from '@/types/investment-management';

const prisma = new PrismaClient();

/**
 * GET /api/portfolios/[id]
 * Get detailed portfolio information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const portfolioId = params.id;

    // Get user ID from session/auth (placeholder for now)
    const userId = request.headers.get('x-user-id') || 'demo-user-id';
    const userRole = request.headers.get('x-user-role') || 'INVESTOR';

    // Build where clause based on user role
    const where: any = { id: portfolioId };
    
    // Regular users can only see their own portfolios
    if (!['ADMIN', 'INVESTMENT_MANAGER'].includes(userRole)) {
      where.userId = userId;
    }

    const portfolio = await prisma.portfolio.findUnique({
      where,
      include: {
        investments: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                riskLevel: true,
                expectedReturn: true,
                coverImage: true,
                status: true
              }
            }
          },
          orderBy: { investedAt: 'desc' }
        },
        riskAssessments: {
          orderBy: { assessmentDate: 'desc' },
          take: 5
        },
        reports: {
          orderBy: { generatedAt: 'desc' },
          take: 10,
          select: {
            id: true,
            reportType: true,
            periodStart: true,
            periodEnd: true,
            generatedAt: true,
            fileUrl: true
          }
        },
        cashFlows: {
          orderBy: { date: 'desc' },
          take: 20
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            investments: true,
            reports: true,
            cashFlows: true,
            riskAssessments: true
          }
        }
      }
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Calculate real-time metrics
    try {
      const performanceMetrics = await portfolioAnalyzer.calculatePortfolioMetrics(portfolioId);
      const assetAllocation = await portfolioAnalyzer.getAssetAllocation(portfolioId);
      const sectorDistribution = await portfolioAnalyzer.analyzeSectorDistribution(portfolioId);
      const riskMetrics = await portfolioAnalyzer.calculateRiskMetrics(portfolioId);

      return NextResponse.json({
        ...portfolio,
        analysis: {
          performanceMetrics,
          assetAllocation,
          sectorDistribution,
          riskMetrics
        }
      });

    } catch (analysisError) {
      console.error('Error calculating portfolio analysis:', analysisError);
      
      // Return portfolio data without analysis if calculation fails
      return NextResponse.json(portfolio);
    }

  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/portfolios/[id]
 * Update portfolio information
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const portfolioId = params.id;
    const body = await request.json();

    // Get user ID from session/auth (placeholder for now)
    const userId = request.headers.get('x-user-id') || 'demo-user-id';
    const userRole = request.headers.get('x-user-role') || 'INVESTOR';

    // Check if portfolio exists and user has permission
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId }
    });

    if (!existingPortfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Regular users can only update their own portfolios
    if (!['ADMIN', 'INVESTMENT_MANAGER'].includes(userRole) && existingPortfolio.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only update your own portfolios' },
        { status: 403 }
      );
    }

    // Validate update data
    const validation = validatePortfolio({ ...existingPortfolio, ...body });
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Check for name conflicts if name is being changed
    if (body.name && body.name !== existingPortfolio.name) {
      const nameConflict = await prisma.portfolio.findFirst({
        where: {
          userId: existingPortfolio.userId,
          name: sanitizeInput(body.name),
          id: { not: portfolioId }
        }
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Portfolio with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data (only allow certain fields to be updated)
    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.name) {
      updateData.name = sanitizeInput(body.name);
    }

    // Only allow system updates for financial metrics
    if (['ADMIN', 'SYSTEM'].includes(userRole)) {
      if (body.totalValue !== undefined) updateData.totalValue = body.totalValue;
      if (body.totalInvested !== undefined) updateData.totalInvested = body.totalInvested;
      if (body.totalReturn !== undefined) updateData.totalReturn = body.totalReturn;
      if (body.returnPercentage !== undefined) updateData.returnPercentage = body.returnPercentage;
      if (body.riskScore !== undefined) updateData.riskScore = body.riskScore;
      if (body.lastUpdated !== undefined) updateData.lastUpdated = new Date(body.lastUpdated);
    }

    // Update the portfolio
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: updateData,
      include: {
        investments: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                category: true,
                riskLevel: true,
                expectedReturn: true
              }
            }
          }
        },
        riskAssessments: {
          orderBy: { assessmentDate: 'desc' },
          take: 1
        },
        _count: {
          select: {
            investments: true,
            reports: true,
            cashFlows: true
          }
        }
      }
    });

    return NextResponse.json({
      portfolio: updatedPortfolio,
      message: 'Portfolio updated successfully'
    });

  } catch (error) {
    console.error('Error updating portfolio:', error);

    if (error instanceof InvestmentBusinessError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/portfolios/[id]
 * Delete a portfolio (only if empty)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const portfolioId = params.id;

    // Get user ID from session/auth (placeholder for now)
    const userId = request.headers.get('x-user-id') || 'demo-user-id';
    const userRole = request.headers.get('x-user-role') || 'INVESTOR';

    // Check if portfolio exists and user has permission
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        investments: true,
        _count: {
          select: {
            investments: true,
            reports: true,
            cashFlows: true
          }
        }
      }
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Regular users can only delete their own portfolios
    if (!['ADMIN', 'INVESTMENT_MANAGER'].includes(userRole) && portfolio.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own portfolios' },
        { status: 403 }
      );
    }

    // Check if portfolio has active investments
    if (portfolio.investments.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete portfolio with active investments',
          details: {
            activeInvestments: portfolio.investments.length,
            totalValue: portfolio.totalValue
          }
        },
        { status: 400 }
      );
    }

    // Delete the portfolio (cascade will handle related records)
    await prisma.portfolio.delete({
      where: { id: portfolioId }
    });

    return NextResponse.json({
      message: 'Portfolio deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
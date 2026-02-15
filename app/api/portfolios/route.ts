// Portfolio Management API Endpoints
// Phase 3, Task 3.1: Implement portfolio API endpoints

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { portfolioAnalyzer } from '@/lib/investment-management/portfolio-analyzer';
import { 
  validatePortfolio,
  validatePagination,
  sanitizeInput
} from '@/lib/investment-management/validation';
import { 
  Portfolio,
  InvestmentBusinessError,
  BusinessErrorCodes,
  PaginatedResponse
} from '@/types/investment-management';

const prisma = new PrismaClient();

/**
 * GET /api/portfolios
 * Get user's portfolios with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'lastUpdated';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search');

    // Get user ID from session/auth (placeholder for now)
    const userId = request.headers.get('x-user-id') || 'demo-user-id';

    // Validate pagination
    const paginationValidation = validatePagination(page, limit);
    if (!paginationValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid pagination parameters', 
          details: paginationValidation.errors 
        },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      userId
    };

    if (search) {
      where.name = {
        contains: sanitizeInput(search),
        mode: 'insensitive'
      };
    }

    // Build order by clause
    const orderBy: any = {};
    if (['name', 'totalValue', 'totalReturn', 'returnPercentage', 'riskScore', 'lastUpdated', 'createdAt'].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.lastUpdated = 'desc';
    }

    // Get total count
    const total = await prisma.portfolio.count({ where });

    // Get portfolios with pagination
    const portfolios = await prisma.portfolio.findMany({
      where,
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
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    });

    const response: PaginatedResponse<Portfolio> = {
      data: portfolios as Portfolio[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolios
 * Create a new portfolio
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get user ID from session/auth (placeholder for now)
    const userId = request.headers.get('x-user-id') || 'demo-user-id';

    // Add userId to the data
    const portfolioData = {
      ...body,
      userId
    };

    // Validate portfolio data
    const validation = validatePortfolio(portfolioData);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Check if portfolio name already exists for this user
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: {
        userId,
        name: sanitizeInput(portfolioData.name)
      }
    });

    if (existingPortfolio) {
      return NextResponse.json(
        { error: 'Portfolio with this name already exists' },
        { status: 409 }
      );
    }

    // Create the portfolio
    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        name: sanitizeInput(portfolioData.name),
        totalValue: 0,
        totalInvested: 0,
        totalReturn: 0,
        returnPercentage: 0,
        riskScore: 0
      },
      include: {
        investments: true,
        riskAssessments: true,
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
      portfolio,
      message: 'Portfolio created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating portfolio:', error);

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
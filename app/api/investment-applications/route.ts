// Investment Applications API Endpoints
// Phase 2, Task 2: Implement investment application API endpoints

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { 
  validateInvestmentApplication,
  validateInvestmentConstraints,
  validateStatusTransition,
  sanitizeInput
} from '@/lib/investment-management/validation';
import { 
  CreateInvestmentApplicationRequest,
  CreateInvestmentApplicationResponse,
  ApplicationStatus,
  InvestmentBusinessError,
  BusinessErrorCodes
} from '@/types/investment-management';

const prisma = new PrismaClient();

/**
 * POST /api/investment-applications
 * Create a new investment application
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateInvestmentApplicationRequest = await request.json();
    
    // Validate request data
    const validation = validateInvestmentApplication(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Get user ID from session/auth (placeholder for now)
    const userId = request.headers.get('x-user-id') || 'demo-user-id';

    // Check if project exists and get constraints
    const project = await prisma.investmentProject.findUnique({
      where: { id: body.projectId },
      select: {
        id: true,
        title: true,
        status: true,
        minInvestment: true,
        maxInvestment: true,
        targetAmount: true,
        totalRaised: true
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Investment project not found' },
        { status: 404 }
      );
    }

    if (project.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Investment project is not accepting investments' },
        { status: 400 }
      );
    }

    // Validate investment constraints
    const remainingCapacity = project.targetAmount 
      ? project.targetAmount - project.totalRaised 
      : undefined;

    const constraintValidation = validateInvestmentConstraints(body.amount, {
      minInvestment: project.minInvestment || undefined,
      maxInvestment: project.maxInvestment || undefined,
      remainingCapacity
    });

    if (!constraintValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Investment constraints not met', 
          details: constraintValidation.errors 
        },
        { status: 400 }
      );
    }

    // Check for existing pending application
    const existingApplication = await prisma.investmentApplication.findFirst({
      where: {
        investorId: userId,
        projectId: body.projectId,
        status: {
          in: ['PENDING', 'UNDER_REVIEW']
        }
      }
    });

    if (existingApplication) {
      throw new InvestmentBusinessError(
        'You already have a pending application for this project',
        BusinessErrorCodes.APPLICATION_ALREADY_EXISTS
      );
    }

    // Create the investment application
    const application = await prisma.investmentApplication.create({
      data: {
        investorId: userId,
        projectId: body.projectId,
        amount: body.amount,
        currency: body.currency || 'CNY',
        status: ApplicationStatus.PENDING
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            expectedReturn: true,
            riskLevel: true
          }
        },
        investor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // TODO: Trigger approval workflow (Phase 2, Task 2.2)
    // await startApprovalWorkflow(application.id);

    // Start approval workflow
    const { approvalWorkflowManager } = await import('@/lib/investment-management/approval-workflow');
    try {
      await approvalWorkflowManager.startApprovalWorkflow(application.id);
    } catch (workflowError) {
      console.error('Error starting approval workflow:', workflowError);
      // Continue even if workflow fails - application is still created
    }

    const response: CreateInvestmentApplicationResponse = {
      application: {
        id: application.id,
        investorId: application.investorId,
        projectId: application.projectId,
        amount: application.amount,
        currency: application.currency,
        status: application.status as ApplicationStatus,
        submittedAt: application.submittedAt,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt
      },
      message: 'Investment application submitted successfully'
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creating investment application:', error);

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
 * GET /api/investment-applications
 * Get investment applications for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const projectId = searchParams.get('projectId');

    // Get user ID from session/auth (placeholder for now)
    const userId = request.headers.get('x-user-id') || 'demo-user-id';

    // Build where clause
    const where: any = {
      investorId: userId
    };

    if (status) {
      where.status = status;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    // Get total count
    const total = await prisma.investmentApplication.count({ where });

    // Get applications with pagination
    const applications = await prisma.investmentApplication.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            expectedReturn: true,
            riskLevel: true,
            coverImage: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    return NextResponse.json({
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching investment applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
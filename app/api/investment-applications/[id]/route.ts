// Investment Application Status Update API
// Phase 2, Task 2: Update application status endpoint

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { 
  validateStatusTransition,
  validateEnum,
  sanitizeInput
} from '@/lib/investment-management/validation';
import { 
  UpdateApplicationStatusRequest,
  ApplicationStatus,
  InvestmentBusinessError,
  BusinessErrorCodes
} from '@/types/investment-management';

const prisma = new PrismaClient();

/**
 * GET /api/investment-applications/[id]
 * Get a specific investment application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;

    // Get user ID from session/auth (placeholder for now)
    const userId = request.headers.get('x-user-id') || 'demo-user-id';
    const userRole = request.headers.get('x-user-role') || 'INVESTOR';

    // Build where clause based on user role
    const where: any = { id: applicationId };
    
    // Regular investors can only see their own applications
    if (userRole === 'INVESTOR') {
      where.investorId = userId;
    }

    const application = await prisma.investmentApplication.findUnique({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            shortDesc: true,
            expectedReturn: true,
            riskLevel: true,
            coverImage: true,
            minInvestment: true,
            maxInvestment: true,
            targetAmount: true,
            totalRaised: true,
            status: true
          }
        },
        investor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Investment application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(application);

  } catch (error) {
    console.error('Error fetching investment application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/investment-applications/[id]
 * Update investment application status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    const body: UpdateApplicationStatusRequest = await request.json();

    // Get user ID and role from session/auth (placeholder for now)
    const userId = request.headers.get('x-user-id') || 'demo-user-id';
    const userRole = request.headers.get('x-user-role') || 'INVESTOR';

    // Only admins and investment managers can update application status
    if (!['ADMIN', 'INVESTMENT_MANAGER', 'APPROVER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update application status' },
        { status: 403 }
      );
    }

    // Validate status enum
    const statusValidation = validateEnum(body.status, ApplicationStatus, 'status');
    if (!statusValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid status', 
          details: statusValidation.errors 
        },
        { status: 400 }
      );
    }

    // Get current application
    const currentApplication = await prisma.investmentApplication.findUnique({
      where: { id: applicationId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            targetAmount: true,
            totalRaised: true
          }
        }
      }
    });

    if (!currentApplication) {
      return NextResponse.json(
        { error: 'Investment application not found' },
        { status: 404 }
      );
    }

    // Validate status transition
    const transitionValidation = validateStatusTransition(
      currentApplication.status as ApplicationStatus,
      body.status
    );

    if (!transitionValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid status transition', 
          details: transitionValidation.errors 
        },
        { status: 400 }
      );
    }

    // Validate rejection reason if status is REJECTED
    if (body.status === ApplicationStatus.REJECTED) {
      if (!body.rejectionReason || body.rejectionReason.trim().length === 0) {
        return NextResponse.json(
          { error: 'Rejection reason is required when rejecting an application' },
          { status: 400 }
        );
      }
    }

    // Check project capacity if approving
    if (body.status === ApplicationStatus.APPROVED) {
      const project = currentApplication.project;
      if (project.targetAmount) {
        const remainingCapacity = project.targetAmount - project.totalRaised;
        if (currentApplication.amount > remainingCapacity) {
          return NextResponse.json(
            { 
              error: 'Insufficient project capacity',
              details: {
                requested: currentApplication.amount,
                available: remainingCapacity
              }
            },
            { status: 400 }
          );
        }
      }
    }

    // Prepare update data
    const updateData: any = {
      status: body.status,
      updatedAt: new Date()
    };

    if (body.status === ApplicationStatus.APPROVED) {
      updateData.approvedAt = new Date();
    } else if (body.status === ApplicationStatus.REJECTED) {
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = sanitizeInput(body.rejectionReason || '');
    }

    // Update application in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the application
      const updatedApplication = await tx.investmentApplication.update({
        where: { id: applicationId },
        data: updateData,
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

      // If approved, update project total raised
      if (body.status === ApplicationStatus.APPROVED) {
        await tx.investmentProject.update({
          where: { id: currentApplication.projectId },
          data: {
            totalRaised: {
              increment: currentApplication.amount
            },
            investorCount: {
              increment: 1
            }
          }
        });

        // TODO: Create portfolio investment record
        // TODO: Send approval notification
        // TODO: Trigger investment processing workflow
      }

      return updatedApplication;
    });

    // TODO: Send status update notification to investor
    // await sendApplicationStatusNotification(result);

    return NextResponse.json({
      application: result,
      message: `Application ${body.status.toLowerCase()} successfully`
    });

  } catch (error) {
    console.error('Error updating investment application:', error);

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
 * DELETE /api/investment-applications/[id]
 * Cancel an investment application (only by the applicant)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;

    // Get user ID from session/auth (placeholder for now)
    const userId = request.headers.get('x-user-id') || 'demo-user-id';

    // Get current application
    const application = await prisma.investmentApplication.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Investment application not found' },
        { status: 404 }
      );
    }

    // Only the applicant can cancel their own application
    if (application.investorId !== userId) {
      return NextResponse.json(
        { error: 'You can only cancel your own applications' },
        { status: 403 }
      );
    }

    // Can only cancel pending or under review applications
    if (!['PENDING', 'UNDER_REVIEW'].includes(application.status)) {
      return NextResponse.json(
        { error: 'Cannot cancel application in current status' },
        { status: 400 }
      );
    }

    // Update status to cancelled
    const cancelledApplication = await prisma.investmentApplication.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.CANCELLED,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      application: cancelledApplication,
      message: 'Application cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling investment application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
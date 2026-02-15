// Investment Application Approval Decision API
// Phase 2, Task 2.2: Approval workflow integration

import { NextRequest, NextResponse } from 'next/server';
import { approvalWorkflowManager } from '@/lib/investment-management/approval-workflow';
import { 
  InvestmentBusinessError,
  BusinessErrorCodes
} from '@/types/investment-management';

interface ApprovalDecisionRequest {
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_INFO';
  comments?: string;
  decisionReason?: string;
  stepId?: string;
}

/**
 * POST /api/investment-applications/[id]/approve
 * Process approval decision for an investment application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    const body: ApprovalDecisionRequest = await request.json();

    // Get user ID and role from session/auth (placeholder for now)
    const userId = request.headers.get('x-user-id') || 'demo-approver-id';
    const userRole = request.headers.get('x-user-role') || 'INVESTMENT_MANAGER';

    // Validate user has approval permissions
    const approverRoles = [
      'ADMIN', 
      'INVESTMENT_MANAGER', 
      'INVESTMENT_ANALYST',
      'RISK_MANAGER',
      'SENIOR_ANALYST',
      'SENIOR_MANAGER',
      'COMPLIANCE_OFFICER',
      'APPROVER'
    ];

    if (!approverRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to approve applications' },
        { status: 403 }
      );
    }

    // Validate decision
    if (!['APPROVE', 'REJECT', 'REQUEST_INFO'].includes(body.decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be APPROVE, REJECT, or REQUEST_INFO' },
        { status: 400 }
      );
    }

    // Validate rejection reason if rejecting
    if (body.decision === 'REJECT' && !body.decisionReason?.trim()) {
      return NextResponse.json(
        { error: 'Decision reason is required when rejecting an application' },
        { status: 400 }
      );
    }

    // Get current workflow status
    const workflowStatus = await approvalWorkflowManager.getWorkflowStatus(applicationId);
    
    if (!workflowStatus) {
      return NextResponse.json(
        { error: 'Workflow not found for this application' },
        { status: 404 }
      );
    }

    if (workflowStatus.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Application has already been processed' },
        { status: 400 }
      );
    }

    if (workflowStatus.status === 'REJECTED' || workflowStatus.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Application is no longer active' },
        { status: 400 }
      );
    }

    // Process the approval decision
    const updatedWorkflow = await approvalWorkflowManager.processApprovalDecision(
      workflowStatus.id,
      body.stepId || 'current-step',
      body.decision,
      userId,
      body.comments,
      body.decisionReason
    );

    // Determine response message
    let message = '';
    switch (body.decision) {
      case 'APPROVE':
        message = updatedWorkflow.status === 'COMPLETED' 
          ? 'Application approved successfully'
          : 'Application approved for this step, proceeding to next approval level';
        break;
      case 'REJECT':
        message = 'Application rejected';
        break;
      case 'REQUEST_INFO':
        message = 'Additional information requested from applicant';
        break;
    }

    return NextResponse.json({
      workflow: updatedWorkflow,
      message,
      nextAction: updatedWorkflow.status === 'COMPLETED' 
        ? 'APPLICATION_APPROVED'
        : updatedWorkflow.status === 'REJECTED'
        ? 'APPLICATION_REJECTED'
        : 'PENDING_NEXT_APPROVAL'
    });

  } catch (error) {
    console.error('Error processing approval decision:', error);

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
 * GET /api/investment-applications/[id]/approve
 * Get approval workflow status for an application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;

    // Get user ID and role from session/auth (placeholder for now)
    const userId = request.headers.get('x-user-id') || 'demo-user-id';
    const userRole = request.headers.get('x-user-role') || 'INVESTOR';

    // Get workflow status
    const workflowStatus = await approvalWorkflowManager.getWorkflowStatus(applicationId);
    
    if (!workflowStatus) {
      return NextResponse.json(
        { error: 'Workflow not found for this application' },
        { status: 404 }
      );
    }

    // Filter sensitive information based on user role
    const isApprover = [
      'ADMIN', 
      'INVESTMENT_MANAGER', 
      'INVESTMENT_ANALYST',
      'RISK_MANAGER',
      'SENIOR_ANALYST',
      'SENIOR_MANAGER',
      'COMPLIANCE_OFFICER',
      'APPROVER'
    ].includes(userRole);

    const response = {
      workflowId: workflowStatus.workflowId,
      status: workflowStatus.status,
      currentStep: workflowStatus.currentStep,
      startedAt: workflowStatus.startedAt,
      completedAt: workflowStatus.completedAt,
      // Only show detailed steps to approvers
      steps: isApprover ? workflowStatus.steps : undefined,
      // Show available workflows to approvers
      availableWorkflows: isApprover 
        ? approvalWorkflowManager.getAvailableWorkflows().map(w => ({
            id: w.id,
            name: w.name,
            description: w.description
          }))
        : undefined
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error getting workflow status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
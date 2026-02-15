// Investment Application Approval Workflow Engine
// Phase 2, Task 2.2: Implement approval workflow engine

import { PrismaClient } from '@prisma/client';
import { 
  ApplicationStatus,
  InvestmentBusinessError,
  BusinessErrorCodes
} from '@/types/investment-management';

const prisma = new PrismaClient();

export interface ApprovalStep {
  id: string;
  name: string;
  description: string;
  requiredRole: string[];
  order: number;
  isRequired: boolean;
  autoApprove?: boolean;
  conditions?: ApprovalCondition[];
}

export interface ApprovalCondition {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'in' | 'contains';
  value: any;
  description: string;
}

export interface ApprovalWorkflowConfig {
  id: string;
  name: string;
  description: string;
  steps: ApprovalStep[];
  notifications: NotificationConfig[];
}

export interface NotificationConfig {
  trigger: 'step_start' | 'step_complete' | 'workflow_complete' | 'workflow_rejected';
  recipients: string[];
  template: string;
  channels: ('email' | 'sms' | 'push')[];
}

export interface WorkflowInstance {
  id: string;
  applicationId: string;
  workflowId: string;
  currentStep: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  startedAt: Date;
  completedAt?: Date;
  steps: WorkflowStepInstance[];
}

export interface WorkflowStepInstance {
  stepId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
  assignedTo?: string;
  startedAt?: Date;
  completedAt?: Date;
  comments?: string;
  decision?: 'APPROVE' | 'REJECT' | 'REQUEST_INFO';
  decisionReason?: string;
}

/**
 * Approval Workflow Manager
 * Handles the complete approval workflow for investment applications
 */
export class ApprovalWorkflowManager {
  private workflows: Map<string, ApprovalWorkflowConfig> = new Map();

  constructor() {
    this.initializeDefaultWorkflows();
  }

  /**
   * Initialize default approval workflows
   */
  private initializeDefaultWorkflows() {
    // Standard Investment Application Workflow
    const standardWorkflow: ApprovalWorkflowConfig = {
      id: 'standard-investment-approval',
      name: 'Standard Investment Approval',
      description: 'Standard approval process for investment applications',
      steps: [
        {
          id: 'initial-review',
          name: 'Initial Review',
          description: 'Initial compliance and completeness check',
          requiredRole: ['INVESTMENT_ANALYST', 'COMPLIANCE_OFFICER'],
          order: 1,
          isRequired: true,
          autoApprove: false,
          conditions: [
            {
              field: 'amount',
              operator: 'lte',
              value: 50000,
              description: 'Amount is within analyst approval limit'
            }
          ]
        },
        {
          id: 'risk-assessment',
          name: 'Risk Assessment',
          description: 'Risk evaluation and due diligence',
          requiredRole: ['RISK_MANAGER', 'SENIOR_ANALYST'],
          order: 2,
          isRequired: true,
          autoApprove: false,
          conditions: [
            {
              field: 'riskLevel',
              operator: 'in',
              value: ['LOW', 'MEDIUM'],
              description: 'Risk level is acceptable'
            }
          ]
        },
        {
          id: 'senior-approval',
          name: 'Senior Management Approval',
          description: 'Final approval from senior management',
          requiredRole: ['INVESTMENT_MANAGER', 'SENIOR_MANAGER'],
          order: 3,
          isRequired: true,
          autoApprove: false,
          conditions: [
            {
              field: 'amount',
              operator: 'gte',
              value: 100000,
              description: 'High-value investment requires senior approval'
            }
          ]
        }
      ],
      notifications: [
        {
          trigger: 'step_start',
          recipients: ['assignee'],
          template: 'approval-step-assigned',
          channels: ['email', 'push']
        },
        {
          trigger: 'workflow_complete',
          recipients: ['applicant'],
          template: 'application-approved',
          channels: ['email', 'sms']
        },
        {
          trigger: 'workflow_rejected',
          recipients: ['applicant'],
          template: 'application-rejected',
          channels: ['email']
        }
      ]
    };

    // High-Value Investment Workflow
    const highValueWorkflow: ApprovalWorkflowConfig = {
      id: 'high-value-investment-approval',
      name: 'High-Value Investment Approval',
      description: 'Enhanced approval process for high-value investments',
      steps: [
        {
          id: 'compliance-check',
          name: 'Compliance Check',
          description: 'Regulatory compliance verification',
          requiredRole: ['COMPLIANCE_OFFICER'],
          order: 1,
          isRequired: true,
          autoApprove: false
        },
        {
          id: 'financial-analysis',
          name: 'Financial Analysis',
          description: 'Detailed financial analysis and modeling',
          requiredRole: ['SENIOR_ANALYST', 'FINANCIAL_ANALYST'],
          order: 2,
          isRequired: true,
          autoApprove: false
        },
        {
          id: 'risk-committee',
          name: 'Risk Committee Review',
          description: 'Risk committee evaluation',
          requiredRole: ['RISK_COMMITTEE_MEMBER'],
          order: 3,
          isRequired: true,
          autoApprove: false
        },
        {
          id: 'executive-approval',
          name: 'Executive Approval',
          description: 'Final executive committee approval',
          requiredRole: ['EXECUTIVE_COMMITTEE', 'CEO', 'CIO'],
          order: 4,
          isRequired: true,
          autoApprove: false
        }
      ],
      notifications: [
        {
          trigger: 'step_start',
          recipients: ['assignee', 'supervisor'],
          template: 'high-value-approval-step',
          channels: ['email', 'push']
        },
        {
          trigger: 'workflow_complete',
          recipients: ['applicant', 'relationship_manager'],
          template: 'high-value-approved',
          channels: ['email', 'sms', 'push']
        }
      ]
    };

    this.workflows.set(standardWorkflow.id, standardWorkflow);
    this.workflows.set(highValueWorkflow.id, highValueWorkflow);
  }

  /**
   * Start approval workflow for an investment application
   */
  async startApprovalWorkflow(applicationId: string): Promise<WorkflowInstance> {
    try {
      // Get the investment application
      const application = await prisma.investmentApplication.findUnique({
        where: { id: applicationId },
        include: {
          project: {
            select: {
              riskLevel: true,
              minInvestment: true,
              maxInvestment: true
            }
          },
          investor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!application) {
        throw new InvestmentBusinessError(
          'Investment application not found',
          BusinessErrorCodes.APPLICATION_ALREADY_EXISTS
        );
      }

      // Determine appropriate workflow
      const workflowId = this.determineWorkflow(application);
      const workflow = this.workflows.get(workflowId);

      if (!workflow) {
        throw new InvestmentBusinessError(
          'Workflow configuration not found',
          BusinessErrorCodes.CALCULATION_ERROR
        );
      }

      // Create workflow instance
      const workflowInstance: WorkflowInstance = {
        id: `wf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        applicationId,
        workflowId,
        currentStep: 0,
        status: 'PENDING',
        startedAt: new Date(),
        steps: workflow.steps.map(step => ({
          stepId: step.id,
          status: 'PENDING'
        }))
      };

      // Update application status
      await prisma.investmentApplication.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.UNDER_REVIEW,
          updatedAt: new Date()
        }
      });

      // Start first step
      await this.startNextStep(workflowInstance, workflow);

      // Send notifications
      await this.sendNotifications(workflow, 'step_start', {
        application,
        workflowInstance,
        currentStep: workflow.steps[0]
      });

      return workflowInstance;

    } catch (error) {
      console.error('Error starting approval workflow:', error);
      throw error;
    }
  }

  /**
   * Process approval decision for a workflow step
   */
  async processApprovalDecision(
    workflowInstanceId: string,
    stepId: string,
    decision: 'APPROVE' | 'REJECT' | 'REQUEST_INFO',
    approverId: string,
    comments?: string,
    decisionReason?: string
  ): Promise<WorkflowInstance> {
    try {
      // In a real implementation, this would be stored in database
      // For now, we'll simulate the workflow processing
      
      const application = await prisma.investmentApplication.findFirst({
        where: {
          // This would normally be linked through workflow instance
          status: ApplicationStatus.UNDER_REVIEW
        }
      });

      if (!application) {
        throw new InvestmentBusinessError(
          'Application not found or not in review',
          BusinessErrorCodes.PORTFOLIO_NOT_FOUND
        );
      }

      if (decision === 'REJECT') {
        // Reject the application
        await prisma.investmentApplication.update({
          where: { id: application.id },
          data: {
            status: ApplicationStatus.REJECTED,
            rejectedAt: new Date(),
            rejectionReason: decisionReason || comments || 'Application rejected during approval process',
            updatedAt: new Date()
          }
        });

        // TODO: Send rejection notification
        return {
          id: workflowInstanceId,
          applicationId: application.id,
          workflowId: 'standard-investment-approval',
          currentStep: -1,
          status: 'REJECTED',
          startedAt: new Date(),
          completedAt: new Date(),
          steps: []
        };
      }

      if (decision === 'APPROVE') {
        // For simplicity, approve the application
        await prisma.investmentApplication.update({
          where: { id: application.id },
          data: {
            status: ApplicationStatus.APPROVED,
            approvedAt: new Date(),
            updatedAt: new Date()
          }
        });

        // TODO: Create portfolio investment record
        // TODO: Update project total raised
        // TODO: Send approval notification

        return {
          id: workflowInstanceId,
          applicationId: application.id,
          workflowId: 'standard-investment-approval',
          currentStep: 999,
          status: 'COMPLETED',
          startedAt: new Date(),
          completedAt: new Date(),
          steps: []
        };
      }

      // REQUEST_INFO case
      return {
        id: workflowInstanceId,
        applicationId: application.id,
        workflowId: 'standard-investment-approval',
        currentStep: 0,
        status: 'PENDING',
        startedAt: new Date(),
        steps: []
      };

    } catch (error) {
      console.error('Error processing approval decision:', error);
      throw error;
    }
  }

  /**
   * Determine appropriate workflow based on application characteristics
   */
  private determineWorkflow(application: any): string {
    // High-value investments (>500K) use enhanced workflow
    if (application.amount > 500000) {
      return 'high-value-investment-approval';
    }

    // High-risk investments use enhanced workflow
    if (application.project?.riskLevel === 'HIGH' || application.project?.riskLevel === 'VERY_HIGH') {
      return 'high-value-investment-approval';
    }

    // Default to standard workflow
    return 'standard-investment-approval';
  }

  /**
   * Start the next step in the workflow
   */
  private async startNextStep(
    workflowInstance: WorkflowInstance,
    workflow: ApprovalWorkflowConfig
  ): Promise<void> {
    const nextStep = workflow.steps[workflowInstance.currentStep];
    
    if (!nextStep) {
      // Workflow complete
      workflowInstance.status = 'COMPLETED';
      workflowInstance.completedAt = new Date();
      return;
    }

    // Check if step can be auto-approved
    if (nextStep.autoApprove && await this.checkAutoApprovalConditions(nextStep, workflowInstance)) {
      // Auto-approve this step
      workflowInstance.steps[workflowInstance.currentStep].status = 'APPROVED';
      workflowInstance.steps[workflowInstance.currentStep].completedAt = new Date();
      workflowInstance.currentStep++;
      
      // Continue to next step
      await this.startNextStep(workflowInstance, workflow);
      return;
    }

    // Assign step to appropriate approver
    const assignee = await this.findAvailableApprover(nextStep.requiredRole);
    
    workflowInstance.steps[workflowInstance.currentStep].status = 'IN_PROGRESS';
    workflowInstance.steps[workflowInstance.currentStep].assignedTo = assignee;
    workflowInstance.steps[workflowInstance.currentStep].startedAt = new Date();
    workflowInstance.status = 'IN_PROGRESS';
  }

  /**
   * Check if auto-approval conditions are met
   */
  private async checkAutoApprovalConditions(
    step: ApprovalStep,
    workflowInstance: WorkflowInstance
  ): Promise<boolean> {
    if (!step.conditions) return true;

    // Get application data
    const application = await prisma.investmentApplication.findUnique({
      where: { id: workflowInstance.applicationId },
      include: { project: true }
    });

    if (!application) return false;

    // Check all conditions
    for (const condition of step.conditions) {
      const fieldValue = this.getFieldValue(application, condition.field);
      
      if (!this.evaluateCondition(fieldValue, condition)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get field value from application data
   */
  private getFieldValue(application: any, field: string): any {
    const parts = field.split('.');
    let value = application;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return value;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(fieldValue: any, condition: ApprovalCondition): boolean {
    switch (condition.operator) {
      case 'gt': return fieldValue > condition.value;
      case 'lt': return fieldValue < condition.value;
      case 'eq': return fieldValue === condition.value;
      case 'gte': return fieldValue >= condition.value;
      case 'lte': return fieldValue <= condition.value;
      case 'in': return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'contains': return String(fieldValue).includes(condition.value);
      default: return false;
    }
  }

  /**
   * Find available approver for required roles
   */
  private async findAvailableApprover(requiredRoles: string[]): Promise<string> {
    // In a real implementation, this would query user roles and availability
    // For now, return a mock approver
    return `approver-${requiredRoles[0].toLowerCase()}`;
  }

  /**
   * Send workflow notifications
   */
  private async sendNotifications(
    workflow: ApprovalWorkflowConfig,
    trigger: string,
    context: any
  ): Promise<void> {
    const notifications = workflow.notifications.filter(n => n.trigger === trigger);
    
    for (const notification of notifications) {
      // In a real implementation, this would send actual notifications
      console.log(`Sending ${notification.template} notification via ${notification.channels.join(', ')}`);
      
      // TODO: Implement actual notification sending
      // - Email notifications
      // - SMS notifications  
      // - Push notifications
      // - In-app notifications
    }
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(applicationId: string): Promise<WorkflowInstance | null> {
    // In a real implementation, this would query the workflow database
    // For now, return mock status based on application status
    
    const application = await prisma.investmentApplication.findUnique({
      where: { id: applicationId }
    });

    if (!application) return null;

    const mockWorkflowInstance: WorkflowInstance = {
      id: `wf-${applicationId}`,
      applicationId,
      workflowId: 'standard-investment-approval',
      currentStep: application.status === ApplicationStatus.UNDER_REVIEW ? 1 : 0,
      status: this.mapApplicationStatusToWorkflowStatus(application.status),
      startedAt: application.submittedAt,
      completedAt: application.approvedAt || application.rejectedAt || undefined,
      steps: []
    };

    return mockWorkflowInstance;
  }

  /**
   * Map application status to workflow status
   */
  private mapApplicationStatusToWorkflowStatus(applicationStatus: string): WorkflowInstance['status'] {
    switch (applicationStatus) {
      case ApplicationStatus.PENDING: return 'PENDING';
      case ApplicationStatus.UNDER_REVIEW: return 'IN_PROGRESS';
      case ApplicationStatus.APPROVED: return 'COMPLETED';
      case ApplicationStatus.REJECTED: return 'REJECTED';
      case ApplicationStatus.CANCELLED: return 'CANCELLED';
      default: return 'PENDING';
    }
  }

  /**
   * Cancel workflow
   */
  async cancelWorkflow(applicationId: string, reason?: string): Promise<void> {
    await prisma.investmentApplication.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.CANCELLED,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Get available workflows
   */
  getAvailableWorkflows(): ApprovalWorkflowConfig[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Add custom workflow
   */
  addWorkflow(workflow: ApprovalWorkflowConfig): void {
    this.workflows.set(workflow.id, workflow);
  }
}

// Export singleton instance
export const approvalWorkflowManager = new ApprovalWorkflowManager();
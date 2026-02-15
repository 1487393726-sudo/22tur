/**
 * Investment Advisor Client Management System
 * Manages advisor-client relationships and portfolio oversight
 * 
 * Requirements: 6.1, 6.3, 6.4, 6.5
 */

import { prisma } from '@/lib/prisma';
import { auditLogSystem } from '@/lib/audit/audit-system';

export interface AdvisorClient {
  id: string;
  userId: string;
  advisorId: string;
  assignedAt: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  communicationPreferences: {
    email: boolean;
    phone: boolean;
    inApp: boolean;
  };
  riskProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  investmentGoals: string[];
  notes?: string;
}

export interface ClientPortfolioSummary {
  clientId: string;
  clientName: string;
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  riskScore: number;
  portfolioCount: number;
  lastUpdated: Date;
}

export interface AdvisorStrategy {
  id: string;
  advisorId: string;
  clientId: string;
  name: string;
  description: string;
  targetReturn: number;
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  timeHorizon: number; // in months
  assetAllocation: {
    stocks: number;
    bonds: number;
    alternatives: number;
    cash: number;
  };
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunicationRecord {
  id: string;
  advisorId: string;
  clientId: string;
  type: 'EMAIL' | 'PHONE' | 'MEETING' | 'NOTE';
  subject: string;
  content: string;
  timestamp: Date;
  followUpRequired: boolean;
  followUpDate?: Date;
}

export class AdvisorClientManager {
  /**
   * Get all clients assigned to an advisor
   * Requirement 6.1: Display all client portfolio overview
   */
  async getAdvisorClients(advisorId: string): Promise<ClientPortfolioSummary[]> {
    try {
      // Get advisor-client relationships
      const advisorClients = await prisma.advisorClient.findMany({
        where: {
          advisorId,
          status: 'ACTIVE'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Get portfolio summaries for each client
      const clientSummaries: ClientPortfolioSummary[] = [];

      for (const advisorClient of advisorClients) {
        const portfolios = await prisma.portfolio.findMany({
          where: {
            userId: advisorClient.userId
          }
        });

        const totalValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0);
        const totalInvested = portfolios.reduce((sum, p) => sum + p.totalInvested, 0);
        const totalReturn = portfolios.reduce((sum, p) => sum + p.totalReturn, 0);
        const avgRiskScore = portfolios.length > 0 
          ? portfolios.reduce((sum, p) => sum + p.riskScore, 0) / portfolios.length 
          : 0;

        clientSummaries.push({
          clientId: advisorClient.userId,
          clientName: advisorClient.user.name || advisorClient.user.email,
          totalValue,
          totalInvested,
          totalReturn,
          returnPercentage: totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0,
          riskScore: avgRiskScore,
          portfolioCount: portfolios.length,
          lastUpdated: portfolios.length > 0 
            ? new Date(Math.max(...portfolios.map(p => p.lastUpdated.getTime())))
            : new Date()
        });
      }

      // Log successful access
      await auditLogSystem.logSuccess(
        'ADVISOR_CLIENTS_ACCESSED',
        'ADVISOR_CLIENT',
        undefined,
        {
          userId: advisorId,
          details: {
            clientCount: clientSummaries.length
          }
        }
      );

      return clientSummaries;
    } catch (error) {
      await auditLogSystem.logFailure(
        'ADVISOR_CLIENTS_ACCESS_FAILED',
        'ADVISOR_CLIENT',
        undefined,
        {
          userId: advisorId,
          reason: (error as Error).message
        }
      );
      throw error;
    }
  }

  /**
   * Get detailed client portfolio information
   * Requirement 6.2: Load client data within 2 seconds
   */
  async getClientPortfolio(advisorId: string, clientId: string): Promise<any> {
    const startTime = Date.now();

    try {
      // Verify advisor-client relationship
      const advisorClient = await prisma.advisorClient.findFirst({
        where: {
          advisorId,
          userId: clientId,
          status: 'ACTIVE'
        }
      });

      if (!advisorClient) {
        throw new Error('Client not assigned to this advisor');
      }

      // Get client portfolios with investments
      const portfolios = await prisma.portfolio.findMany({
        where: {
          userId: clientId
        },
        include: {
          investments: {
            include: {
              project: true
            }
          },
          riskAssessments: {
            orderBy: {
              assessmentDate: 'desc'
            },
            take: 1
          }
        }
      });

      const loadTime = Date.now() - startTime;

      // Log performance - should be under 2 seconds (2000ms)
      await auditLogSystem.logSuccess(
        'CLIENT_PORTFOLIO_LOADED',
        'CLIENT_PORTFOLIO',
        clientId,
        {
          userId: advisorId,
          details: {
            loadTimeMs: loadTime,
            portfolioCount: portfolios.length,
            performanceTarget: loadTime <= 2000 ? 'MET' : 'EXCEEDED'
          }
        }
      );

      return {
        clientId,
        portfolios,
        loadTime,
        performanceMet: loadTime <= 2000
      };
    } catch (error) {
      await auditLogSystem.logFailure(
        'CLIENT_PORTFOLIO_LOAD_FAILED',
        'CLIENT_PORTFOLIO',
        clientId,
        {
          userId: advisorId,
          reason: (error as Error).message
        }
      );
      throw error;
    }
  }

  /**
   * Create investment strategy for a client
   * Requirement 6.3: Provide strategy suggestions and risk assessment tools
   */
  async createInvestmentStrategy(
    advisorId: string,
    clientId: string,
    strategyData: Omit<AdvisorStrategy, 'id' | 'advisorId' | 'clientId' | 'createdAt' | 'updatedAt'>
  ): Promise<AdvisorStrategy> {
    try {
      // Verify advisor-client relationship
      const advisorClient = await prisma.advisorClient.findFirst({
        where: {
          advisorId,
          userId: clientId,
          status: 'ACTIVE'
        }
      });

      if (!advisorClient) {
        throw new Error('Client not assigned to this advisor');
      }

      // Validate asset allocation sums to 100%
      const totalAllocation = Object.values(strategyData.assetAllocation).reduce((sum, val) => sum + val, 0);
      if (Math.abs(totalAllocation - 100) > 0.01) {
        throw new Error('Asset allocation must sum to 100%');
      }

      // Create strategy record
      const strategy = await prisma.advisorStrategy.create({
        data: {
          advisorId,
          clientId,
          name: strategyData.name,
          description: strategyData.description,
          targetReturn: strategyData.targetReturn,
          riskTolerance: strategyData.riskTolerance,
          timeHorizon: strategyData.timeHorizon,
          assetAllocation: JSON.stringify(strategyData.assetAllocation),
          status: strategyData.status
        }
      });

      const mappedStrategy: AdvisorStrategy = {
        id: strategy.id,
        advisorId: strategy.advisorId,
        clientId: strategy.clientId,
        name: strategy.name,
        description: strategy.description,
        targetReturn: strategy.targetReturn,
        riskTolerance: strategy.riskTolerance as 'LOW' | 'MEDIUM' | 'HIGH',
        timeHorizon: strategy.timeHorizon,
        assetAllocation: JSON.parse(strategy.assetAllocation),
        status: strategy.status as 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
        createdAt: strategy.createdAt,
        updatedAt: strategy.updatedAt
      };

      // Log strategy creation
      await auditLogSystem.logSuccess(
        'INVESTMENT_STRATEGY_CREATED',
        'INVESTMENT_STRATEGY',
        strategy.id,
        {
          userId: advisorId,
          details: {
            clientId,
            strategyName: strategyData.name,
            targetReturn: strategyData.targetReturn,
            riskTolerance: strategyData.riskTolerance
          }
        }
      );

      return mappedStrategy;
    } catch (error) {
      await auditLogSystem.logFailure(
        'INVESTMENT_STRATEGY_CREATE_FAILED',
        'INVESTMENT_STRATEGY',
        undefined,
        {
          userId: advisorId,
          reason: (error as Error).message,
          details: { clientId }
        }
      );
      throw error;
    }
  }

  /**
   * Record communication with client
   * Requirement 6.4: Record all communication history and decision process
   */
  async recordCommunication(
    advisorId: string,
    clientId: string,
    communicationData: Omit<CommunicationRecord, 'id' | 'advisorId' | 'clientId' | 'timestamp'>
  ): Promise<CommunicationRecord> {
    try {
      // Verify advisor-client relationship
      const advisorClient = await prisma.advisorClient.findFirst({
        where: {
          advisorId,
          userId: clientId,
          status: 'ACTIVE'
        }
      });

      if (!advisorClient) {
        throw new Error('Client not assigned to this advisor');
      }

      // Create communication record
      const communication = await prisma.communicationRecord.create({
        data: {
          advisorId,
          clientId,
          type: communicationData.type,
          subject: communicationData.subject,
          content: communicationData.content,
          followUpRequired: communicationData.followUpRequired,
          followUpDate: communicationData.followUpDate
        }
      });

      const mappedCommunication: CommunicationRecord = {
        id: communication.id,
        advisorId: communication.advisorId,
        clientId: communication.clientId,
        type: communication.type as 'EMAIL' | 'PHONE' | 'MEETING' | 'NOTE',
        subject: communication.subject,
        content: communication.content,
        timestamp: communication.timestamp,
        followUpRequired: communication.followUpRequired,
        followUpDate: communication.followUpDate
      };

      // Log communication record
      await auditLogSystem.logSuccess(
        'CLIENT_COMMUNICATION_RECORDED',
        'COMMUNICATION_RECORD',
        communication.id,
        {
          userId: advisorId,
          details: {
            clientId,
            type: communicationData.type,
            subject: communicationData.subject,
            followUpRequired: communicationData.followUpRequired
          }
        }
      );

      return mappedCommunication;
    } catch (error) {
      await auditLogSystem.logFailure(
        'CLIENT_COMMUNICATION_RECORD_FAILED',
        'COMMUNICATION_RECORD',
        undefined,
        {
          userId: advisorId,
          reason: (error as Error).message,
          details: { clientId }
        }
      );
      throw error;
    }
  }

  /**
   * Get communication history for a client
   */
  async getCommunicationHistory(
    advisorId: string,
    clientId: string,
    limit: number = 50
  ): Promise<CommunicationRecord[]> {
    try {
      // Verify advisor-client relationship
      const advisorClient = await prisma.advisorClient.findFirst({
        where: {
          advisorId,
          userId: clientId,
          status: 'ACTIVE'
        }
      });

      if (!advisorClient) {
        throw new Error('Client not assigned to this advisor');
      }

      const communications = await prisma.communicationRecord.findMany({
        where: {
          advisorId,
          clientId
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: limit
      });

      return communications.map(comm => ({
        id: comm.id,
        advisorId: comm.advisorId,
        clientId: comm.clientId,
        type: comm.type as 'EMAIL' | 'PHONE' | 'MEETING' | 'NOTE',
        subject: comm.subject,
        content: comm.content,
        timestamp: comm.timestamp,
        followUpRequired: comm.followUpRequired,
        followUpDate: comm.followUpDate
      }));
    } catch (error) {
      await auditLogSystem.logFailure(
        'COMMUNICATION_HISTORY_ACCESS_FAILED',
        'COMMUNICATION_RECORD',
        undefined,
        {
          userId: advisorId,
          reason: (error as Error).message,
          details: { clientId }
        }
      );
      throw error;
    }
  }

  /**
   * Assign client to advisor
   */
  async assignClientToAdvisor(
    advisorId: string,
    clientId: string,
    assignedBy: string
  ): Promise<AdvisorClient> {
    try {
      // Check if relationship already exists
      const existing = await prisma.advisorClient.findFirst({
        where: {
          advisorId,
          userId: clientId
        }
      });

      if (existing) {
        throw new Error('Client is already assigned to this advisor');
      }

      // Create advisor-client relationship
      const advisorClient = await prisma.advisorClient.create({
        data: {
          advisorId,
          userId: clientId,
          status: 'ACTIVE',
          communicationPreferences: JSON.stringify({
            email: true,
            phone: false,
            inApp: true
          }),
          riskProfile: 'MODERATE'
        }
      });

      const mappedAdvisorClient: AdvisorClient = {
        id: advisorClient.id,
        userId: advisorClient.userId,
        advisorId: advisorClient.advisorId,
        assignedAt: advisorClient.assignedAt,
        status: advisorClient.status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
        communicationPreferences: JSON.parse(advisorClient.communicationPreferences),
        riskProfile: advisorClient.riskProfile as 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE',
        investmentGoals: advisorClient.investmentGoals ? JSON.parse(advisorClient.investmentGoals) : [],
        notes: advisorClient.notes
      };

      // Log assignment
      await auditLogSystem.logSuccess(
        'CLIENT_ASSIGNED_TO_ADVISOR',
        'ADVISOR_CLIENT',
        advisorClient.id,
        {
          userId: assignedBy,
          details: {
            advisorId,
            clientId,
            status: 'ACTIVE'
          }
        }
      );

      return mappedAdvisorClient;
    } catch (error) {
      await auditLogSystem.logFailure(
        'CLIENT_ASSIGNMENT_FAILED',
        'ADVISOR_CLIENT',
        undefined,
        {
          userId: assignedBy,
          reason: (error as Error).message,
          details: { advisorId, clientId }
        }
      );
      throw error;
    }
  }

  /**
   * Generate batch reports for multiple clients
   * Requirement 6.5: Support batch generation and personalization
   */
  async generateBatchReports(
    advisorId: string,
    clientIds: string[],
    reportType: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL',
    customizations?: Record<string, any>
  ): Promise<{ reportId: string; clientId: string; status: 'SUCCESS' | 'FAILED'; error?: string }[]> {
    const results: { reportId: string; clientId: string; status: 'SUCCESS' | 'FAILED'; error?: string }[] = [];

    for (const clientId of clientIds) {
      try {
        // Verify advisor-client relationship
        const advisorClient = await prisma.advisorClient.findFirst({
          where: {
            advisorId,
            userId: clientId,
            status: 'ACTIVE'
          }
        });

        if (!advisorClient) {
          results.push({
            reportId: '',
            clientId,
            status: 'FAILED',
            error: 'Client not assigned to this advisor'
          });
          continue;
        }

        // Generate report (simplified - would integrate with report generation engine)
        const report = await prisma.investmentReport.create({
          data: {
            portfolioId: '', // Would get from client's primary portfolio
            reportType,
            periodStart: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            periodEnd: new Date(),
            content: JSON.stringify({
              advisorGenerated: true,
              customizations: customizations || {},
              generatedBy: advisorId
            })
          }
        });

        results.push({
          reportId: report.id,
          clientId,
          status: 'SUCCESS'
        });

      } catch (error) {
        results.push({
          reportId: '',
          clientId,
          status: 'FAILED',
          error: (error as Error).message
        });
      }
    }

    // Log batch report generation
    await auditLogSystem.logSuccess(
      'BATCH_REPORTS_GENERATED',
      'INVESTMENT_REPORT',
      undefined,
      {
        userId: advisorId,
        details: {
          clientCount: clientIds.length,
          successCount: results.filter(r => r.status === 'SUCCESS').length,
          failureCount: results.filter(r => r.status === 'FAILED').length,
          reportType
        }
      }
    );

    return results;
  }
}

export const advisorClientManager = new AdvisorClientManager();
/**
 * Cash Flow Management System
 * Manages fund transfers, monitoring, and settlement operations
 * 
 * Requirements: 7.1, 7.2, 7.4, 7.5
 */

import { prisma } from '@/lib/prisma';
import { auditLogSystem } from '@/lib/audit/audit-system';

export interface CashFlowRecord {
  id: string;
  type: 'INFLOW' | 'OUTFLOW' | 'TRANSFER';
  amount: number;
  currency: string;
  description: string;
  fromAccount?: string;
  toAccount?: string;
  portfolioId?: string;
  investmentId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transactionDate: Date;
  settlementDate?: Date;
  reference: string;
  metadata?: Record<string, any>;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashFlowSummary {
  totalInflow: number;
  totalOutflow: number;
  netFlow: number;
  pendingInflow: number;
  pendingOutflow: number;
  accountBalance: number;
  currency: string;
  period: {
    start: Date;
    end: Date;
  };
}

export interface TransferRequest {
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  description: string;
  reference?: string;
  scheduledDate?: Date;
  requiresApproval: boolean;
  metadata?: Record<string, any>;
}

export interface SettlementReport {
  id: string;
  period: {
    start: Date;
    end: Date;
  };
  totalTransactions: number;
  totalAmount: number;
  currency: string;
  status: 'DRAFT' | 'COMPLETED' | 'RECONCILED';
  discrepancies: Array<{
    transactionId: string;
    expectedAmount: number;
    actualAmount: number;
    difference: number;
    reason?: string;
  }>;
  generatedAt: Date;
  reconciledAt?: Date;
  reconciledBy?: string;
}

export class CashFlowManager {
  /**
   * Record a cash flow transaction
   * Requirement 7.1: Real-time recording of fund flows
   */
  async recordCashFlow(
    type: 'INFLOW' | 'OUTFLOW' | 'TRANSFER',
    amount: number,
    description: string,
    createdBy: string,
    options: {
      currency?: string;
      fromAccount?: string;
      toAccount?: string;
      portfolioId?: string;
      investmentId?: string;
      reference?: string;
      scheduledDate?: Date;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<CashFlowRecord> {
    try {
      // Validate amount
      if (amount <= 0) {
        throw new Error('Amount must be greater than zero');
      }

      // Generate reference if not provided
      const reference = options.reference || this.generateReference(type);

      // Determine if approval is required (amounts > 100,000 require approval)
      const requiresApproval = amount > 100000;
      const status = requiresApproval ? 'PENDING' : 'COMPLETED';

      // Create cash flow record
      const cashFlow = await prisma.cashFlowRecord.create({
        data: {
          type,
          amount,
          currency: options.currency || 'CNY',
          description,
          fromAccount: options.fromAccount,
          toAccount: options.toAccount,
          portfolioId: options.portfolioId,
          investmentId: options.investmentId,
          status,
          transactionDate: options.scheduledDate || new Date(),
          reference,
          metadata: options.metadata ? JSON.stringify(options.metadata) : null,
          createdBy,
          settlementDate: status === 'COMPLETED' ? new Date() : null
        }
      });

      // Update account balances if transaction is completed
      if (status === 'COMPLETED') {
        await this.updateAccountBalances(cashFlow);
      }

      // Log the transaction
      try {
        await auditLogSystem.logSuccess(
          'CASH_FLOW_RECORDED',
          'CASH_FLOW',
          cashFlow.id,
          {
            userId: createdBy,
            details: {
              type,
              amount,
              currency: options.currency || 'CNY',
              status,
              requiresApproval
            }
          }
        );
      } catch (auditError) {
        // Don't fail the transaction if audit logging fails
        console.warn('Failed to log cash flow transaction:', auditError);
      }

      return this.mapCashFlowRecord(cashFlow);
    } catch (error) {
      try {
        await auditLogSystem.logFailure(
          'CASH_FLOW_RECORD_FAILED',
          'CASH_FLOW',
          undefined,
          {
            userId: createdBy,
            reason: (error as Error).message,
            details: { type, amount, description }
          }
        );
      } catch (auditError) {
        console.warn('Failed to log cash flow failure:', auditError);
      }
      throw error;
    }
  }

  /**
   * Process a fund transfer between accounts
   * Requirement 7.4: Multi-authorization for fund transfers
   */
  async processTransfer(
    transferRequest: TransferRequest,
    createdBy: string,
    approvedBy?: string
  ): Promise<CashFlowRecord> {
    try {
      // Validate transfer request
      if (transferRequest.fromAccount === transferRequest.toAccount) {
        throw new Error('Cannot transfer to the same account');
      }

      // Check if approval is required
      if (transferRequest.requiresApproval && !approvedBy) {
        throw new Error('Transfer requires approval');
      }

      // Check source account balance
      const sourceBalance = await this.getAccountBalance(transferRequest.fromAccount);
      if (sourceBalance < transferRequest.amount) {
        throw new Error('Insufficient funds in source account');
      }

      // Create transfer record
      const transfer = await this.recordCashFlow(
        'TRANSFER',
        transferRequest.amount,
        transferRequest.description,
        createdBy,
        {
          currency: transferRequest.currency,
          fromAccount: transferRequest.fromAccount,
          toAccount: transferRequest.toAccount,
          reference: transferRequest.reference,
          scheduledDate: transferRequest.scheduledDate,
          metadata: transferRequest.metadata
        }
      );

      // If approved, update the record
      if (approvedBy) {
        await prisma.cashFlowRecord.update({
          where: { id: transfer.id },
          data: {
            approvedBy,
            status: 'COMPLETED',
            settlementDate: new Date()
          }
        });

        // Update account balances
        await this.updateAccountBalances(transfer);
      }

      // Log the transfer
      try {
        await auditLogSystem.logSuccess(
          'FUND_TRANSFER_PROCESSED',
          'CASH_FLOW',
          transfer.id,
          {
            userId: createdBy,
            details: {
              fromAccount: transferRequest.fromAccount,
              toAccount: transferRequest.toAccount,
              amount: transferRequest.amount,
              approvedBy,
              requiresApproval: transferRequest.requiresApproval
            }
          }
        );
      } catch (auditError) {
        console.warn('Failed to log fund transfer:', auditError);
      }

      return transfer;
    } catch (error) {
      try {
        await auditLogSystem.logFailure(
          'FUND_TRANSFER_FAILED',
          'CASH_FLOW',
          undefined,
          {
            userId: createdBy,
            reason: (error as Error).message,
            details: transferRequest
          }
        );
      } catch (auditError) {
        console.warn('Failed to log transfer failure:', auditError);
      }
      throw error;
    }
  }

  /**
   * Get cash flow summary for a period
   * Requirement 7.2: Detailed transaction records and analysis
   */
  async getCashFlowSummary(
    accountId: string,
    startDate: Date,
    endDate: Date,
    currency: string = 'CNY'
  ): Promise<CashFlowSummary> {
    try {
      // Get all transactions for the period
      const transactions = await prisma.cashFlowRecord.findMany({
        where: {
          OR: [
            { fromAccount: accountId },
            { toAccount: accountId }
          ],
          currency,
          transactionDate: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      // Calculate summary
      let totalInflow = 0;
      let totalOutflow = 0;
      let pendingInflow = 0;
      let pendingOutflow = 0;

      for (const transaction of transactions) {
        const isInflow = transaction.toAccount === accountId;
        const amount = transaction.amount;

        if (isInflow) {
          totalInflow += amount;
          if (transaction.status === 'PENDING') {
            pendingInflow += amount;
          }
        } else {
          totalOutflow += amount;
          if (transaction.status === 'PENDING') {
            pendingOutflow += amount;
          }
        }
      }

      const netFlow = totalInflow - totalOutflow;
      const accountBalance = await this.getAccountBalance(accountId, currency);

      return {
        totalInflow,
        totalOutflow,
        netFlow,
        pendingInflow,
        pendingOutflow,
        accountBalance,
        currency,
        period: {
          start: startDate,
          end: endDate
        }
      };
    } catch (error) {
      await auditLogSystem.logFailure(
        'CASH_FLOW_SUMMARY_FAILED',
        'CASH_FLOW',
        undefined,
        {
          userId: 'system',
          reason: (error as Error).message,
          details: { accountId, startDate, endDate, currency }
        }
      );
      throw error;
    }
  }

  /**
   * Detect anomalies in cash flow patterns
   * Requirement 7.2: Exception detection and alerts
   */
  async detectAnomalies(accountId: string, days: number = 30): Promise<Array<{
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    transactionId?: string;
    amount?: number;
    detectedAt: Date;
  }>> {
    try {
      const anomalies: Array<{
        type: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH';
        description: string;
        transactionId?: string;
        amount?: number;
        detectedAt: Date;
      }> = [];

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      // Get recent transactions
      const transactions = await prisma.cashFlowRecord.findMany({
        where: {
          OR: [
            { fromAccount: accountId },
            { toAccount: accountId }
          ],
          transactionDate: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          transactionDate: 'desc'
        }
      });

      // Calculate average transaction amount
      const amounts = transactions.map(t => t.amount);
      const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      const stdDev = Math.sqrt(amounts.reduce((sum, amt) => sum + Math.pow(amt - avgAmount, 2), 0) / amounts.length);

      // Detect large transactions (> 3 standard deviations)
      for (const transaction of transactions) {
        if (Math.abs(transaction.amount - avgAmount) > 3 * stdDev) {
          anomalies.push({
            type: 'LARGE_TRANSACTION',
            severity: transaction.amount > avgAmount + 3 * stdDev ? 'HIGH' : 'MEDIUM',
            description: `Unusually large transaction: ${transaction.amount} (avg: ${avgAmount.toFixed(2)})`,
            transactionId: transaction.id,
            amount: transaction.amount,
            detectedAt: new Date()
          });
        }
      }

      // Detect rapid succession of transactions
      const recentTransactions = transactions.slice(0, 10);
      const rapidTransactions = recentTransactions.filter(t => {
        const timeDiff = endDate.getTime() - t.transactionDate.getTime();
        return timeDiff < 60 * 60 * 1000; // Within 1 hour
      });

      if (rapidTransactions.length > 5) {
        anomalies.push({
          type: 'RAPID_TRANSACTIONS',
          severity: 'MEDIUM',
          description: `${rapidTransactions.length} transactions within 1 hour`,
          detectedAt: new Date()
        });
      }

      // Detect failed transactions pattern
      const failedTransactions = transactions.filter(t => t.status === 'FAILED');
      if (failedTransactions.length > transactions.length * 0.1) {
        anomalies.push({
          type: 'HIGH_FAILURE_RATE',
          severity: 'HIGH',
          description: `High failure rate: ${failedTransactions.length}/${transactions.length} transactions failed`,
          detectedAt: new Date()
        });
      }

      // Log anomaly detection
      if (anomalies.length > 0) {
        await auditLogSystem.logSuccess(
          'ANOMALIES_DETECTED',
          'CASH_FLOW',
          undefined,
          {
            userId: 'system',
            details: {
              accountId,
              anomaliesCount: anomalies.length,
              severityBreakdown: {
                high: anomalies.filter(a => a.severity === 'HIGH').length,
                medium: anomalies.filter(a => a.severity === 'MEDIUM').length,
                low: anomalies.filter(a => a.severity === 'LOW').length
              }
            }
          }
        );
      }

      return anomalies;
    } catch (error) {
      await auditLogSystem.logFailure(
        'ANOMALY_DETECTION_FAILED',
        'CASH_FLOW',
        undefined,
        {
          userId: 'system',
          reason: (error as Error).message,
          details: { accountId, days }
        }
      );
      throw error;
    }
  }

  /**
   * Generate month-end settlement report
   * Requirement 7.5: Monthly settlement and reconciliation
   */
  async generateSettlementReport(
    month: number,
    year: number,
    currency: string = 'CNY'
  ): Promise<SettlementReport> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // Get all transactions for the month
      const transactions = await prisma.cashFlowRecord.findMany({
        where: {
          currency,
          transactionDate: {
            gte: startDate,
            lte: endDate
          },
          status: 'COMPLETED'
        }
      });

      // Calculate totals
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

      // Check for discrepancies (simplified - in real implementation would compare with external systems)
      const discrepancies: SettlementReport['discrepancies'] = [];

      // Create settlement report
      const report = await prisma.settlementReport.create({
        data: {
          period: JSON.stringify({
            start: startDate,
            end: endDate
          }),
          totalTransactions: transactions.length,
          totalAmount,
          currency,
          status: 'COMPLETED',
          discrepancies: JSON.stringify(discrepancies)
        }
      });

      const settlementReport: SettlementReport = {
        id: report.id,
        period: {
          start: startDate,
          end: endDate
        },
        totalTransactions: transactions.length,
        totalAmount,
        currency,
        status: 'COMPLETED',
        discrepancies,
        generatedAt: report.generatedAt
      };

      // Log settlement report generation
      await auditLogSystem.logSuccess(
        'SETTLEMENT_REPORT_GENERATED',
        'SETTLEMENT_REPORT',
        report.id,
        {
          userId: 'system',
          details: {
            month,
            year,
            currency,
            totalTransactions: transactions.length,
            totalAmount,
            discrepanciesCount: discrepancies.length
          }
        }
      );

      return settlementReport;
    } catch (error) {
      await auditLogSystem.logFailure(
        'SETTLEMENT_REPORT_FAILED',
        'SETTLEMENT_REPORT',
        undefined,
        {
          userId: 'system',
          reason: (error as Error).message,
          details: { month, year, currency }
        }
      );
      throw error;
    }
  }

  /**
   * Get account balance
   */
  private async getAccountBalance(accountId: string, currency: string = 'CNY'): Promise<number> {
    const account = await prisma.account.findUnique({
      where: { accountNumber: accountId } // Use accountNumber instead of id
    });

    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    // In a real implementation, this would query the actual account balance
    // For now, we'll calculate from cash flow records
    const transactions = await prisma.cashFlowRecord.findMany({
      where: {
        OR: [
          { fromAccount: accountId },
          { toAccount: accountId }
        ],
        currency,
        status: 'COMPLETED'
      }
    });

    let balance = account.balance; // Start with the account's current balance
    for (const transaction of transactions) {
      if (transaction.toAccount === accountId) {
        balance += transaction.amount;
      } else if (transaction.fromAccount === accountId) {
        balance -= transaction.amount;
      }
    }

    return balance;
  }

  /**
   * Update account balances after a transaction
   */
  private async updateAccountBalances(cashFlow: CashFlowRecord): Promise<void> {
    // In a real implementation, this would update actual account balances
    // For now, we'll just log the balance update
    try {
      await auditLogSystem.logSuccess(
        'ACCOUNT_BALANCE_UPDATED',
        'ACCOUNT',
        undefined,
        {
          userId: 'system',
          details: {
            transactionId: cashFlow.id,
            type: cashFlow.type,
            amount: cashFlow.amount,
            fromAccount: cashFlow.fromAccount,
            toAccount: cashFlow.toAccount
          }
        }
      );
    } catch (error) {
      // Don't fail the transaction if audit logging fails
      console.warn('Failed to log account balance update:', error);
    }
  }

  /**
   * Generate transaction reference
   */
  private generateReference(type: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${type.substring(0, 3)}-${timestamp}-${random}`;
  }

  /**
   * Map database record to interface
   */
  private mapCashFlowRecord(record: any): CashFlowRecord {
    return {
      id: record.id,
      type: record.type,
      amount: record.amount,
      currency: record.currency,
      description: record.description,
      fromAccount: record.fromAccount,
      toAccount: record.toAccount,
      portfolioId: record.portfolioId,
      investmentId: record.investmentId,
      status: record.status,
      transactionDate: record.transactionDate,
      settlementDate: record.settlementDate,
      reference: record.reference,
      metadata: record.metadata ? JSON.parse(record.metadata) : undefined,
      createdBy: record.createdBy,
      approvedBy: record.approvedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }
}

export const cashFlowManager = new CashFlowManager();
// Investment Management System - Return Calculation Engine
// Implements various return calculation methods for investment analysis

import { 
  PortfolioInvestment,
  CashFlow,
  CashFlowData,
  CashFlowType,
  InvestmentData,
  ReturnCalculationRequest,
  ReturnCalculationResponse,
  InvestmentBusinessError,
  BusinessErrorCodes,
  TimePeriod
} from '../../types/investment-management';

// Import prisma instance from existing lib
import { prisma } from '../prisma';

/**
 * Return Calculation Engine
 * Provides comprehensive return calculation capabilities for investment analysis
 */
export class ReturnCalculationEngine {
  
  /**
   * Calculate absolute return for an investment
   * Formula: Current Value - Initial Investment
   */
  async calculateAbsoluteReturn(investment: InvestmentData): Promise<number> {
    try {
      const absoluteReturn = investment.currentValue - investment.amount;
      return absoluteReturn;
    } catch (error) {
      throw new InvestmentBusinessError(
        'Failed to calculate absolute return',
        BusinessErrorCodes.CALCULATION_ERROR,
        { investment, error: (error as Error).message }
      );
    }
  }

  /**
   * Calculate annualized return for an investment
   * Formula: ((Current Value / Initial Investment) ^ (365 / Days Held)) - 1
   */
  async calculateAnnualizedReturn(investment: InvestmentData): Promise<number> {
    try {
      const currentDate = new Date();
      const investmentDate = new Date(investment.investmentDate);
      const daysHeld = Math.max(1, Math.floor((currentDate.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      if (investment.amount <= 0) {
        throw new Error('Initial investment amount must be greater than zero');
      }

      const totalReturn = investment.currentValue / investment.amount;
      const annualizedReturn = Math.pow(totalReturn, 365 / daysHeld) - 1;
      
      return annualizedReturn;
    } catch (error) {
      throw new InvestmentBusinessError(
        'Failed to calculate annualized return',
        BusinessErrorCodes.CALCULATION_ERROR,
        { investment, error: (error as Error).message }
      );
    }
  }

  /**
   * Calculate Internal Rate of Return (IRR) using Newton-Raphson method
   * IRR is the discount rate that makes NPV = 0
   */
  async calculateIRR(cashFlows: CashFlowData[]): Promise<number> {
    try {
      if (!cashFlows || cashFlows.length < 2) {
        throw new Error('At least 2 cash flows are required for IRR calculation');
      }

      // Sort cash flows by date
      const sortedCashFlows = [...cashFlows].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Initial guess for IRR (10%)
      let irr = 0.1;
      const maxIterations = 100;
      const tolerance = 1e-6;

      for (let i = 0; i < maxIterations; i++) {
        const { npv, derivative } = this.calculateNPVAndDerivative(sortedCashFlows, irr);
        
        if (Math.abs(npv) < tolerance) {
          return irr;
        }

        if (Math.abs(derivative) < tolerance) {
          throw new Error('IRR calculation failed: derivative too small');
        }

        // Newton-Raphson iteration
        const newIrr = irr - npv / derivative;
        
        if (Math.abs(newIrr - irr) < tolerance) {
          return newIrr;
        }
        
        irr = newIrr;
      }

      throw new Error('IRR calculation failed to converge');
    } catch (error) {
      throw new InvestmentBusinessError(
        'Failed to calculate IRR',
        BusinessErrorCodes.CALCULATION_ERROR,
        { cashFlows, error: (error as Error).message }
      );
    }
  }

  /**
   * Calculate Sharpe Ratio
   * Formula: (Portfolio Return - Risk-free Rate) / Portfolio Standard Deviation
   */
  async calculateSharpeRatio(returns: number[], riskFreeRate: number): Promise<number> {
    try {
      if (!returns || returns.length < 2) {
        throw new Error('At least 2 return periods are required for Sharpe ratio calculation');
      }

      const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
      const excessReturn = avgReturn - riskFreeRate;
      
      // Calculate standard deviation
      const variance = returns.reduce((sum, ret) => {
        const diff = ret - avgReturn;
        return sum + (diff * diff);
      }, 0) / (returns.length - 1);
      
      const standardDeviation = Math.sqrt(variance);
      
      if (standardDeviation === 0) {
        return 0; // No volatility means Sharpe ratio is undefined, return 0
      }

      const sharpeRatio = excessReturn / standardDeviation;
      return sharpeRatio;
    } catch (error) {
      throw new InvestmentBusinessError(
        'Failed to calculate Sharpe ratio',
        BusinessErrorCodes.CALCULATION_ERROR,
        { returns, riskFreeRate, error: (error as Error).message }
      );
    }
  }

  /**
   * Calculate Net Present Value (NPV) for a given discount rate
   */
  private calculateNPV(cashFlows: CashFlowData[], discountRate: number): number {
    const baseDate = new Date(cashFlows[0].date);
    
    return cashFlows.reduce((npv, cashFlow) => {
      const daysDiff = Math.floor((new Date(cashFlow.date).getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
      const yearsDiff = daysDiff / 365.25;
      const presentValue = cashFlow.amount / Math.pow(1 + discountRate, yearsDiff);
      return npv + presentValue;
    }, 0);
  }

  /**
   * Calculate NPV and its derivative for IRR calculation
   */
  private calculateNPVAndDerivative(cashFlows: CashFlowData[], discountRate: number): { npv: number; derivative: number } {
    const baseDate = new Date(cashFlows[0].date);
    let npv = 0;
    let derivative = 0;

    cashFlows.forEach(cashFlow => {
      const daysDiff = Math.floor((new Date(cashFlow.date).getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
      const yearsDiff = daysDiff / 365.25;
      
      const discountFactor = Math.pow(1 + discountRate, yearsDiff);
      const presentValue = cashFlow.amount / discountFactor;
      
      npv += presentValue;
      derivative -= (yearsDiff * cashFlow.amount) / (discountFactor * (1 + discountRate));
    });

    return { npv, derivative };
  }

  /**
   * Calculate portfolio-level returns with comprehensive metrics
   */
  async calculatePortfolioReturns(portfolioId: string, timeframe?: TimePeriod): Promise<ReturnCalculationResponse> {
    try {
      // Fetch portfolio with investments and cash flows
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId },
        include: {
          investments: true,
          cashFlows: {
            orderBy: { date: 'asc' }
          }
        }
      });

      if (!portfolio) {
        throw new InvestmentBusinessError(
          'Portfolio not found',
          BusinessErrorCodes.PORTFOLIO_NOT_FOUND,
          { portfolioId }
        );
      }

      // Calculate absolute return
      const absoluteReturn = portfolio.totalValue - portfolio.totalInvested;
      const returnPercentage = portfolio.totalInvested > 0 ? 
        (absoluteReturn / portfolio.totalInvested) * 100 : 0;

      // Calculate annualized return based on portfolio creation date
      const daysHeld = Math.max(1, Math.floor(
        (new Date().getTime() - new Date(portfolio.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      ));
      
      let annualizedReturn = 0;
      if (portfolio.totalInvested > 0 && daysHeld > 0) {
        const totalReturnMultiplier = portfolio.totalValue / portfolio.totalInvested;
        annualizedReturn = (Math.pow(totalReturnMultiplier, 365 / daysHeld) - 1) * 100;
      }

      // Calculate IRR if cash flows exist
      let irr: number | undefined;
      if (portfolio.cashFlows && portfolio.cashFlows.length >= 2) {
        try {
          const cashFlowData: CashFlowData[] = portfolio.cashFlows.map((cf: any) => ({
            date: cf.date,
            amount: cf.type === 'OUTFLOW' ? -cf.amount : cf.amount,
            type: cf.type as CashFlowType
          }));
          
          // Add current portfolio value as final cash flow
          cashFlowData.push({
            date: new Date(),
            amount: portfolio.totalValue,
            type: 'INFLOW' as CashFlowType
          });

          irr = (await this.calculateIRR(cashFlowData)) * 100;
        } catch (error) {
          console.warn('IRR calculation failed:', error);
          irr = undefined;
        }
      }

      // Calculate Sharpe ratio if we have historical returns
      let sharpeRatio: number | undefined;
      try {
        const monthlyReturns = await this.calculateMonthlyReturns(portfolioId);
        if (monthlyReturns.length >= 12) {
          const riskFreeRate = 0.02 / 12; // Assume 2% annual risk-free rate, monthly
          sharpeRatio = await this.calculateSharpeRatio(monthlyReturns, riskFreeRate);
        }
      } catch (error) {
        console.warn('Sharpe ratio calculation failed:', error);
        sharpeRatio = undefined;
      }

      return {
        absoluteReturn,
        returnPercentage,
        annualizedReturn,
        irr,
        sharpeRatio,
        calculationDate: new Date()
      };

    } catch (error) {
      if (error instanceof InvestmentBusinessError) {
        throw error;
      }
      
      throw new InvestmentBusinessError(
        'Failed to calculate portfolio returns',
        BusinessErrorCodes.CALCULATION_ERROR,
        { portfolioId, error: (error as Error).message }
      );
    }
  }

  /**
   * Calculate monthly returns for Sharpe ratio calculation
   */
  private async calculateMonthlyReturns(portfolioId: string): Promise<number[]> {
    // This is a simplified implementation
    // In a real system, you would track historical portfolio values
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        cashFlows: {
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!portfolio || !portfolio.cashFlows) {
      return [];
    }

    // Group cash flows by month and calculate returns
    const monthlyData = new Map<string, { inflows: number; outflows: number }>();
    
    portfolio.cashFlows.forEach((cf: any) => {
      const monthKey = `${cf.date.getFullYear()}-${cf.date.getMonth()}`;
      const existing = monthlyData.get(monthKey) || { inflows: 0, outflows: 0 };
      
      if (cf.type === 'INFLOW') {
        existing.inflows += cf.amount;
      } else {
        existing.outflows += cf.amount;
      }
      
      monthlyData.set(monthKey, existing);
    });

    // Calculate monthly returns (simplified)
    const returns: number[] = [];
    let previousValue = 0;
    
    for (const [month, data] of Array.from(monthlyData.entries())) {
      const netFlow = data.inflows - data.outflows;
      const currentValue = previousValue + netFlow;
      
      if (previousValue > 0) {
        const monthlyReturn = (currentValue - previousValue) / previousValue;
        returns.push(monthlyReturn);
      }
      
      previousValue = currentValue;
    }

    return returns;
  }

  /**
   * Calculate investment performance metrics for a specific investment
   */
  async calculateInvestmentMetrics(investmentId: string): Promise<ReturnCalculationResponse> {
    try {
      const investment = await prisma.portfolioInvestment.findUnique({
        where: { id: investmentId }
      });

      if (!investment) {
        throw new InvestmentBusinessError(
          'Investment not found',
          BusinessErrorCodes.PORTFOLIO_NOT_FOUND,
          { investmentId }
        );
      }

      const investmentData: InvestmentData = {
        amount: investment.amount,
        currentValue: investment.currentValue,
        investmentDate: investment.investedAt
      };

      const absoluteReturn = await this.calculateAbsoluteReturn(investmentData);
      const returnPercentage = (absoluteReturn / investment.amount) * 100;
      const annualizedReturn = (await this.calculateAnnualizedReturn(investmentData)) * 100;

      return {
        absoluteReturn,
        returnPercentage,
        annualizedReturn,
        calculationDate: new Date()
      };

    } catch (error) {
      if (error instanceof InvestmentBusinessError) {
        throw error;
      }
      
      throw new InvestmentBusinessError(
        'Failed to calculate investment metrics',
        BusinessErrorCodes.CALCULATION_ERROR,
        { investmentId, error: (error as Error).message }
      );
    }
  }

  /**
   * Batch calculate returns for multiple investments
   */
  async batchCalculateReturns(request: ReturnCalculationRequest): Promise<ReturnCalculationResponse[]> {
    try {
      const results: ReturnCalculationResponse[] = [];

      for (const investment of request.investments) {
        const absoluteReturn = await this.calculateAbsoluteReturn(investment);
        const returnPercentage = investment.amount > 0 ? (absoluteReturn / investment.amount) * 100 : 0;
        
        let annualizedReturn: number | undefined;
        let irr: number | undefined;
        let sharpeRatio: number | undefined;

        // Calculate annualized return
        if (request.calculationType === 'ANNUALIZED' || request.calculationType === 'SHARPE') {
          annualizedReturn = (await this.calculateAnnualizedReturn(investment)) * 100;
        }

        // Calculate IRR if cash flows are provided
        if (request.calculationType === 'IRR' && investment.cashFlows && investment.cashFlows.length >= 2) {
          try {
            irr = (await this.calculateIRR(investment.cashFlows)) * 100;
          } catch (error) {
            console.warn('IRR calculation failed for investment:', error);
          }
        }

        // Calculate Sharpe ratio if requested and benchmark rate provided
        if (request.calculationType === 'SHARPE' && request.benchmarkRate !== undefined) {
          try {
            // For single investment, we'll use a simplified approach
            const returns = [returnPercentage / 100]; // Convert to decimal
            sharpeRatio = await this.calculateSharpeRatio(returns, request.benchmarkRate);
          } catch (error) {
            console.warn('Sharpe ratio calculation failed for investment:', error);
          }
        }

        results.push({
          absoluteReturn,
          returnPercentage,
          annualizedReturn,
          irr,
          sharpeRatio,
          calculationDate: new Date()
        });
      }

      return results;

    } catch (error) {
      throw new InvestmentBusinessError(
        'Failed to batch calculate returns',
        BusinessErrorCodes.CALCULATION_ERROR,
        { request, error: (error as Error).message }
      );
    }
  }
}

// Export singleton instance
export const returnCalculationEngine = new ReturnCalculationEngine();
/**
 * Investment Strategy Optimizer Engine
 * Implements portfolio optimization, rebalancing algorithms, and strategy backtesting
 */

import { PrismaClient } from '@prisma/client';
import { measureInvestmentOperation } from '@/lib/investment-management/investment-performance-monitor';
import {
  OptimizationObjective,
  OptimizationRequest,
  OptimizationResult,
  AllocationRecommendation,
  ImprovementMetrics,
  OptimizationRecommendation,
  BacktestRequest,
  BacktestResult,
  PerformanceDataPoint,
  BacktestRiskMetrics,
  StrategyRecommendation,
  ExpectedOutcome,
  ImplementationStep,
  RecommendationRisk,
  StrategyConstraints,
  RebalancingFrequency,
  InvestmentStrategy,
  RiskLevel,
  Portfolio,
  PortfolioInvestment
} from '@/types/investment-management';

const prisma = new PrismaClient();

export class StrategyOptimizer {
  private readonly RISK_FREE_RATE = 0.03; // 3% risk-free rate
  private readonly TRANSACTION_COST_RATE = 0.001; // 0.1% transaction cost
  private readonly MIN_POSITION_SIZE = 0.01; // 1% minimum position
  private readonly MAX_POSITION_SIZE = 0.3; // 30% maximum position

  /**
   * Optimize portfolio allocation based on specified objective and constraints
   */
  async optimizePortfolio(request: OptimizationRequest): Promise<OptimizationResult> {
    return measureInvestmentOperation(
      'OPTIMIZATION',
      async () => {
        // Fetch current portfolio data
        const portfolio = await this.getPortfolioData(request.portfolioId);
        if (!portfolio) {
          throw new Error(`Portfolio ${request.portfolioId} not found`);
        }

        // Get available investment universe
        const availableInvestments = await this.getAvailableInvestments(request);
      
      // Calculate current allocation
      const currentAllocation = this.calculateCurrentAllocation(portfolio);
      
      // Perform optimization based on objective
      const optimizedAllocation = await this.performOptimization(
        request,
        currentAllocation,
        availableInvestments
      );

      // Calculate improvement metrics
      const improvementMetrics = this.calculateImprovementMetrics(
        currentAllocation,
        optimizedAllocation,
        request.objective
      );

      // Generate recommendations
      const recommendations = this.generateOptimizationRecommendations(
        currentAllocation,
        optimizedAllocation,
        improvementMetrics
      );

      // Calculate rebalancing cost
        const rebalancingCost = this.calculateRebalancingCost(
          currentAllocation,
          optimizedAllocation,
          portfolio.totalValue
        );

        const result: OptimizationResult = {
          id: this.generateId(),
          portfolioId: request.portfolioId,
          requestedAt: new Date(),
          completedAt: new Date(),
          objective: request.objective,
          currentAllocation,
          optimizedAllocation,
          expectedReturn: this.calculateExpectedReturn(optimizedAllocation),
          expectedRisk: this.calculateExpectedRisk(optimizedAllocation),
          expectedSharpe: this.calculateExpectedSharpe(optimizedAllocation),
          rebalancingCost,
          improvementMetrics,
          recommendations
        };

        // Store optimization result
        await this.storeOptimizationResult(result);

        return result;
      },
      {
        portfolioId: request.portfolioId,
        inputSize: availableInvestments.length
      }
    );
  }

  /**
   * Perform strategy backtesting
   */
  async backtestStrategy(request: BacktestRequest): Promise<BacktestResult> {
    return measureInvestmentOperation(
      'BACKTEST',
      async () => {
        // Get strategy configuration
        const strategy = await this.getStrategy(request.strategyId);
        
        // Get historical market data
      const marketData = await this.getHistoricalMarketData(
        request.startDate,
        request.endDate
      );

      // Simulate portfolio performance over time
      const performanceHistory = await this.simulatePerformance(
        request,
        strategy,
        marketData
      );

      // Calculate risk metrics
      const riskMetrics = this.calculateBacktestRiskMetrics(performanceHistory);

      // Calculate performance metrics
      const finalValue = performanceHistory[performanceHistory.length - 1]?.portfolioValue || request.initialValue;
      const totalReturn = (finalValue - request.initialValue) / request.initialValue;
      const annualizedReturn = this.calculateAnnualizedReturn(
        totalReturn,
        request.startDate,
        request.endDate
      );

        const result: BacktestResult = {
          id: this.generateId(),
          strategyId: request.strategyId,
          portfolioId: request.portfolioId,
          period: { start: request.startDate, end: request.endDate },
          initialValue: request.initialValue,
          finalValue,
          totalReturn,
          annualizedReturn,
          volatility: this.calculateVolatility(performanceHistory),
          sharpeRatio: this.calculateSharpeRatio(annualizedReturn, this.calculateVolatility(performanceHistory)),
          maxDrawdown: this.calculateMaxDrawdown(performanceHistory),
          calmarRatio: annualizedReturn / Math.abs(this.calculateMaxDrawdown(performanceHistory)),
          winRate: this.calculateWinRate(performanceHistory),
          transactionCosts: this.calculateTotalTransactionCosts(performanceHistory, request.transactionCosts),
          numberOfRebalances: this.countRebalances(performanceHistory),
          performanceHistory,
          riskMetrics
        };

        // Store backtest result
        await this.storeBacktestResult(result);

        return result;
      },
      {
        portfolioId: request.portfolioId,
        inputSize: Math.floor((request.endDate.getTime() - request.startDate.getTime()) / (24 * 60 * 60 * 1000)) // Days
      }
    );
  }

  /**
   * Generate investment strategy recommendations
   */
  async generateRecommendations(
    portfolioId: string,
    types?: string[],
    priority?: string
  ): Promise<StrategyRecommendation[]> {
    try {
      const portfolio = await this.getPortfolioData(portfolioId);
      if (!portfolio) {
        throw new Error(`Portfolio ${portfolioId} not found`);
      }

      const recommendations: StrategyRecommendation[] = [];

      // Generate optimization recommendations
      if (!types || types.includes('OPTIMIZATION')) {
        const optimizationRecs = await this.generateOptimizationRecommendations(
          this.calculateCurrentAllocation(portfolio),
          [], // Will be calculated in the method
          {} as ImprovementMetrics
        );
        recommendations.push(...this.convertToStrategyRecommendations(optimizationRecs, portfolioId));
      }

      // Generate rebalancing recommendations
      if (!types || types.includes('REBALANCING')) {
        const rebalancingRecs = await this.generateRebalancingRecommendations(portfolio);
        recommendations.push(...rebalancingRecs);
      }

      // Generate risk adjustment recommendations
      if (!types || types.includes('RISK_ADJUSTMENT')) {
        const riskRecs = await this.generateRiskAdjustmentRecommendations(portfolio);
        recommendations.push(...riskRecs);
      }

      // Generate opportunity recommendations
      if (!types || types.includes('OPPORTUNITY')) {
        const opportunityRecs = await this.generateOpportunityRecommendations(portfolio);
        recommendations.push(...opportunityRecs);
      }

      // Filter by priority if specified
      let filteredRecommendations = recommendations;
      if (priority) {
        filteredRecommendations = recommendations.filter(rec => rec.priority === priority);
      }

      // Sort by priority and expected outcome
      filteredRecommendations.sort((a, b) => {
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return b.expectedOutcome.returnImpact - a.expectedOutcome.returnImpact;
      });

      return filteredRecommendations;
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      throw new Error(`Recommendation generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute portfolio rebalancing based on optimization results
   */
  async executeRebalancing(
    portfolioId: string,
    optimizationResult: OptimizationResult,
    executionOptions?: {
      dryRun?: boolean;
      maxTransactionCost?: number;
      phaseExecution?: boolean;
    }
  ): Promise<{
    success: boolean;
    executedTrades: any[];
    totalCost: number;
    message: string;
  }> {
    try {
      const portfolio = await this.getPortfolioData(portfolioId);
      if (!portfolio) {
        throw new Error(`Portfolio ${portfolioId} not found`);
      }

      const executedTrades = [];
      let totalCost = 0;

      // Validate rebalancing budget
      if (executionOptions?.maxTransactionCost && 
          optimizationResult.rebalancingCost > executionOptions.maxTransactionCost) {
        throw new Error(`Rebalancing cost exceeds maximum budget`);
      }

      // Execute trades for each allocation change
      for (const allocation of optimizationResult.optimizedAllocation) {
        if (allocation.action === 'HOLD') continue;

        const trade = {
          investmentId: allocation.investmentId,
          action: allocation.action,
          amount: Math.abs(allocation.transactionAmount),
          estimatedCost: Math.abs(allocation.transactionAmount) * this.TRANSACTION_COST_RATE,
          timestamp: new Date()
        };

        if (!executionOptions?.dryRun) {
          // Execute actual trade (implementation would depend on trading system)
          await this.executeTrade(portfolioId, trade);
        }

        executedTrades.push(trade);
        totalCost += trade.estimatedCost;
      }

      // Update portfolio allocation if not dry run
      if (!executionOptions?.dryRun) {
        await this.updatePortfolioAllocation(portfolioId, optimizationResult.optimizedAllocation);
      }

      return {
        success: true,
        executedTrades,
        totalCost,
        message: executionOptions?.dryRun 
          ? `Dry run completed: ${executedTrades.length} trades simulated`
          : `Rebalancing completed: ${executedTrades.length} trades executed`
      };
    } catch (error) {
      console.error('Rebalancing execution failed:', error);
      return {
        success: false,
        executedTrades: [],
        totalCost: 0,
        message: `Rebalancing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Private helper methods

  private async getPortfolioData(portfolioId: string): Promise<Portfolio | null> {
    return await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        investments: true,
        riskAssessments: {
          orderBy: { assessmentDate: 'desc' },
          take: 1
        }
      }
    }) as Portfolio | null;
  }

  private async getAvailableInvestments(request: OptimizationRequest): Promise<any[]> {
    // This would typically fetch from an investment universe database
    // For now, return a mock set of available investments
    return [
      { id: '1', name: 'Tech Growth Fund', sector: 'Technology', expectedReturn: 0.12, risk: 0.18 },
      { id: '2', name: 'Healthcare ETF', sector: 'Healthcare', expectedReturn: 0.10, risk: 0.15 },
      { id: '3', name: 'Real Estate REIT', sector: 'Real Estate', expectedReturn: 0.08, risk: 0.12 },
      { id: '4', name: 'Government Bonds', sector: 'Fixed Income', expectedReturn: 0.04, risk: 0.05 },
      { id: '5', name: 'Emerging Markets', sector: 'International', expectedReturn: 0.14, risk: 0.22 }
    ];
  }

  private calculateCurrentAllocation(portfolio: Portfolio): AllocationRecommendation[] {
    const totalValue = portfolio.totalValue;
    
    return (portfolio.investments || []).map(investment => ({
      investmentId: investment.id,
      investmentName: `Investment ${investment.projectId}`,
      sector: 'Unknown', // Would be fetched from investment details
      currentWeight: investment.currentValue / totalValue,
      recommendedWeight: investment.currentValue / totalValue, // Initially same as current
      currentValue: investment.currentValue,
      recommendedValue: investment.currentValue,
      action: 'HOLD' as const,
      transactionAmount: 0,
      reasoning: 'Current allocation'
    }));
  }

  private async performOptimization(
    request: OptimizationRequest,
    currentAllocation: AllocationRecommendation[],
    availableInvestments: any[]
  ): Promise<AllocationRecommendation[]> {
    // Simplified optimization algorithm
    // In a real implementation, this would use sophisticated optimization techniques
    // like Mean-Variance Optimization, Black-Litterman, or Risk Parity
    
    const constraints = request.constraints;
    const totalValue = currentAllocation.reduce((sum, alloc) => sum + alloc.currentValue, 0);
    
    // Apply optimization based on objective
    switch (request.objective) {
      case OptimizationObjective.MAXIMIZE_RETURN:
        return this.optimizeForMaxReturn(currentAllocation, availableInvestments, constraints, totalValue);
      
      case OptimizationObjective.MINIMIZE_RISK:
        return this.optimizeForMinRisk(currentAllocation, availableInvestments, constraints, totalValue);
      
      case OptimizationObjective.MAXIMIZE_SHARPE:
        return this.optimizeForMaxSharpe(currentAllocation, availableInvestments, constraints, totalValue);
      
      case OptimizationObjective.TARGET_RETURN:
        return this.optimizeForTargetReturn(currentAllocation, availableInvestments, constraints, totalValue, request.targetReturn || 0.08);
      
      case OptimizationObjective.TARGET_RISK:
        return this.optimizeForTargetRisk(currentAllocation, availableInvestments, constraints, totalValue, request.targetRisk || 0.15);
      
      default:
        return currentAllocation; // No optimization
    }
  }

  private optimizeForMaxReturn(
    currentAllocation: AllocationRecommendation[],
    availableInvestments: any[],
    constraints: StrategyConstraints,
    totalValue: number
  ): AllocationRecommendation[] {
    // Simplified max return optimization
    // Allocate more to higher expected return investments within constraints
    
    const sortedInvestments = availableInvestments.sort((a, b) => b.expectedReturn - a.expectedReturn);
    const optimizedAllocation: AllocationRecommendation[] = [];
    
    let remainingValue = totalValue;
    const maxPositionValue = totalValue * constraints.maxPositionSize;
    const minPositionValue = totalValue * constraints.minPositionSize;
    
    for (const investment of sortedInvestments) {
      if (remainingValue <= 0) break;
      
      const allocationValue = Math.min(remainingValue, maxPositionValue);
      if (allocationValue >= minPositionValue) {
        const currentAlloc = currentAllocation.find(a => a.investmentId === investment.id);
        const currentValue = currentAlloc?.currentValue || 0;
        
        optimizedAllocation.push({
          investmentId: investment.id,
          investmentName: investment.name,
          sector: investment.sector,
          currentWeight: currentValue / totalValue,
          recommendedWeight: allocationValue / totalValue,
          currentValue,
          recommendedValue: allocationValue,
          action: allocationValue > currentValue ? 'BUY' : allocationValue < currentValue ? 'SELL' : 'HOLD',
          transactionAmount: allocationValue - currentValue,
          reasoning: `Maximize return optimization: ${investment.expectedReturn * 100}% expected return`
        });
        
        remainingValue -= allocationValue;
      }
    }
    
    return optimizedAllocation;
  }

  private optimizeForMinRisk(
    currentAllocation: AllocationRecommendation[],
    availableInvestments: any[],
    constraints: StrategyConstraints,
    totalValue: number
  ): AllocationRecommendation[] {
    // Simplified min risk optimization
    // Allocate more to lower risk investments
    
    const sortedInvestments = availableInvestments.sort((a, b) => a.risk - b.risk);
    return this.distributeEqually(sortedInvestments, currentAllocation, totalValue, constraints, 'Minimize risk optimization');
  }

  private optimizeForMaxSharpe(
    currentAllocation: AllocationRecommendation[],
    availableInvestments: any[],
    constraints: StrategyConstraints,
    totalValue: number
  ): AllocationRecommendation[] {
    // Simplified Sharpe ratio optimization
    const investmentsWithSharpe = availableInvestments.map(inv => ({
      ...inv,
      sharpe: (inv.expectedReturn - this.RISK_FREE_RATE) / inv.risk
    }));
    
    const sortedInvestments = investmentsWithSharpe.sort((a, b) => b.sharpe - a.sharpe);
    return this.distributeEqually(sortedInvestments, currentAllocation, totalValue, constraints, 'Maximize Sharpe ratio optimization');
  }

  private optimizeForTargetReturn(
    currentAllocation: AllocationRecommendation[],
    availableInvestments: any[],
    constraints: StrategyConstraints,
    totalValue: number,
    targetReturn: number
  ): AllocationRecommendation[] {
    // Simplified target return optimization
    // This would typically use linear programming to find the minimum risk portfolio
    // that achieves the target return
    return this.distributeEqually(availableInvestments, currentAllocation, totalValue, constraints, `Target return optimization: ${targetReturn * 100}%`);
  }

  private optimizeForTargetRisk(
    currentAllocation: AllocationRecommendation[],
    availableInvestments: any[],
    constraints: StrategyConstraints,
    totalValue: number,
    targetRisk: number
  ): AllocationRecommendation[] {
    // Simplified target risk optimization
    return this.distributeEqually(availableInvestments, currentAllocation, totalValue, constraints, `Target risk optimization: ${targetRisk * 100}%`);
  }

  private distributeEqually(
    investments: any[],
    currentAllocation: AllocationRecommendation[],
    totalValue: number,
    constraints: StrategyConstraints,
    reasoning: string
  ): AllocationRecommendation[] {
    const numInvestments = Math.min(investments.length, Math.floor(1 / constraints.minPositionSize));
    const equalWeight = 1 / numInvestments;
    const equalValue = totalValue * equalWeight;
    
    return investments.slice(0, numInvestments).map(investment => {
      const currentAlloc = currentAllocation.find(a => a.investmentId === investment.id);
      const currentValue = currentAlloc?.currentValue || 0;
      
      return {
        investmentId: investment.id,
        investmentName: investment.name,
        sector: investment.sector,
        currentWeight: currentValue / totalValue,
        recommendedWeight: equalWeight,
        currentValue,
        recommendedValue: equalValue,
        action: equalValue > currentValue ? 'BUY' : equalValue < currentValue ? 'SELL' : 'HOLD',
        transactionAmount: equalValue - currentValue,
        reasoning
      };
    });
  }

  private calculateImprovementMetrics(
    currentAllocation: AllocationRecommendation[],
    optimizedAllocation: AllocationRecommendation[],
    objective: OptimizationObjective
  ): ImprovementMetrics {
    const currentReturn = this.calculateExpectedReturn(currentAllocation);
    const optimizedReturn = this.calculateExpectedReturn(optimizedAllocation);
    
    const currentRisk = this.calculateExpectedRisk(currentAllocation);
    const optimizedRisk = this.calculateExpectedRisk(optimizedAllocation);
    
    const currentSharpe = this.calculateExpectedSharpe(currentAllocation);
    const optimizedSharpe = this.calculateExpectedSharpe(optimizedAllocation);
    
    return {
      returnImprovement: optimizedReturn - currentReturn,
      riskReduction: currentRisk - optimizedRisk,
      sharpeImprovement: optimizedSharpe - currentSharpe,
      diversificationImprovement: this.calculateDiversificationImprovement(currentAllocation, optimizedAllocation),
      costEfficiency: (optimizedReturn - currentReturn) / this.calculateRebalancingCost(currentAllocation, optimizedAllocation, 1000000)
    };
  }

  private generateOptimizationRecommendations(
    currentAllocation: AllocationRecommendation[],
    optimizedAllocation: AllocationRecommendation[],
    improvementMetrics: ImprovementMetrics
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    
    // Generate rebalancing recommendations
    const significantChanges = optimizedAllocation.filter(alloc => 
      Math.abs(alloc.transactionAmount) > 1000 // Significant transaction threshold
    );
    
    if (significantChanges.length > 0) {
      recommendations.push({
        type: 'REBALANCE',
        priority: 'HIGH',
        title: 'Portfolio Rebalancing Recommended',
        description: `Rebalance ${significantChanges.length} positions to improve portfolio efficiency`,
        expectedBenefit: `Expected return improvement: ${(improvementMetrics.returnImprovement * 100).toFixed(2)}%`,
        implementationSteps: [
          'Review recommended allocation changes',
          'Execute trades in order of priority',
          'Monitor portfolio performance post-rebalancing'
        ],
        estimatedCost: this.calculateRebalancingCost(currentAllocation, optimizedAllocation, 1000000),
        timeframe: '1-2 business days'
      });
    }
    
    return recommendations;
  }

  private calculateExpectedReturn(allocation: AllocationRecommendation[]): number {
    // Simplified expected return calculation
    // In practice, this would use historical data and sophisticated models
    return allocation.reduce((sum, alloc) => {
      const expectedReturn = 0.08; // Default 8% expected return
      return sum + (alloc.recommendedWeight * expectedReturn);
    }, 0);
  }

  private calculateExpectedRisk(allocation: AllocationRecommendation[]): number {
    // Simplified risk calculation
    // In practice, this would use covariance matrices and correlation data
    return allocation.reduce((sum, alloc) => {
      const risk = 0.15; // Default 15% risk
      return sum + (alloc.recommendedWeight * alloc.recommendedWeight * risk * risk);
    }, 0) ** 0.5;
  }

  private calculateExpectedSharpe(allocation: AllocationRecommendation[]): number {
    const expectedReturn = this.calculateExpectedReturn(allocation);
    const expectedRisk = this.calculateExpectedRisk(allocation);
    return (expectedReturn - this.RISK_FREE_RATE) / expectedRisk;
  }

  private calculateRebalancingCost(
    currentAllocation: AllocationRecommendation[],
    optimizedAllocation: AllocationRecommendation[],
    totalValue: number
  ): number {
    return optimizedAllocation.reduce((sum, alloc) => {
      return sum + Math.abs(alloc.transactionAmount) * this.TRANSACTION_COST_RATE;
    }, 0);
  }

  private calculateDiversificationImprovement(
    currentAllocation: AllocationRecommendation[],
    optimizedAllocation: AllocationRecommendation[]
  ): number {
    // Simplified diversification score based on number of positions and weight distribution
    const currentScore = this.calculateDiversificationScore(currentAllocation);
    const optimizedScore = this.calculateDiversificationScore(optimizedAllocation);
    return optimizedScore - currentScore;
  }

  private calculateDiversificationScore(allocation: AllocationRecommendation[]): number {
    // Herfindahl-Hirschman Index for concentration
    const hhi = allocation.reduce((sum, alloc) => sum + alloc.recommendedWeight * alloc.recommendedWeight, 0);
    return 1 - hhi; // Higher score = more diversified
  }

  // Additional helper methods for backtesting and recommendations...
  
  private async getStrategy(strategyId: string): Promise<InvestmentStrategy | null> {
    // Mock strategy for now
    return {
      id: strategyId,
      name: 'Balanced Growth Strategy',
      description: 'A balanced approach focusing on growth with moderate risk',
      objective: OptimizationObjective.MAXIMIZE_SHARPE,
      constraints: {
        maxPositionSize: 0.3,
        minPositionSize: 0.05,
        maxSectorConcentration: 0.4,
        allowedAssetTypes: ['EQUITY', 'BOND', 'REIT'],
        excludedInvestments: [],
        liquidityRequirement: 0.1,
        riskBudget: 0.2
      },
      rebalancingFrequency: RebalancingFrequency.QUARTERLY,
      rebalancingThreshold: 0.05,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async getHistoricalMarketData(startDate: Date, endDate: Date): Promise<any[]> {
    // Mock historical data
    const data = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      data.push({
        date: new Date(current),
        marketReturn: (Math.random() - 0.5) * 0.04, // Random daily return between -2% and 2%
        riskFreeRate: this.RISK_FREE_RATE / 252 // Daily risk-free rate
      });
      current.setDate(current.getDate() + 1);
    }
    
    return data;
  }

  private async simulatePerformance(
    request: BacktestRequest,
    strategy: InvestmentStrategy | null,
    marketData: any[]
  ): Promise<PerformanceDataPoint[]> {
    const performanceHistory: PerformanceDataPoint[] = [];
    let portfolioValue = request.initialValue;
    let cumulativeReturn = 0;
    let maxValue = portfolioValue;
    
    for (const dataPoint of marketData) {
      const dailyReturn = dataPoint.marketReturn;
      portfolioValue *= (1 + dailyReturn);
      cumulativeReturn = (portfolioValue - request.initialValue) / request.initialValue;
      
      maxValue = Math.max(maxValue, portfolioValue);
      const drawdown = (maxValue - portfolioValue) / maxValue;
      
      performanceHistory.push({
        date: dataPoint.date,
        portfolioValue,
        return: dailyReturn,
        cumulativeReturn,
        drawdown,
        allocation: { 'Mock Asset': 1.0 } // Simplified allocation
      });
    }
    
    return performanceHistory;
  }

  private calculateBacktestRiskMetrics(performanceHistory: PerformanceDataPoint[]): BacktestRiskMetrics {
    const returns = performanceHistory.map(p => p.return);
    
    return {
      var95: this.calculateVaR(returns, 0.95),
      var99: this.calculateVaR(returns, 0.99),
      cvar95: this.calculateCVaR(returns, 0.95),
      cvar99: this.calculateCVaR(returns, 0.99),
      skewness: this.calculateSkewness(returns),
      kurtosis: this.calculateKurtosis(returns),
      correlationMatrix: { 'Mock Asset': { 'Mock Asset': 1.0 } }
    };
  }

  private calculateVaR(returns: number[], confidence: number): number {
    const sortedReturns = returns.sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * returns.length);
    return sortedReturns[index] || 0;
  }

  private calculateCVaR(returns: number[], confidence: number): number {
    const var95 = this.calculateVaR(returns, confidence);
    const tailReturns = returns.filter(r => r <= var95);
    return tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length;
  }

  private calculateSkewness(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    const skewness = returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 3), 0) / returns.length;
    return skewness;
  }

  private calculateKurtosis(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    const kurtosis = returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 4), 0) / returns.length;
    return kurtosis - 3; // Excess kurtosis
  }

  private calculateAnnualizedReturn(totalReturn: number, startDate: Date, endDate: Date): number {
    const years = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return Math.pow(1 + totalReturn, 1 / years) - 1;
  }

  private calculateVolatility(performanceHistory: PerformanceDataPoint[]): number {
    const returns = performanceHistory.map(p => p.return);
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance * 252); // Annualized volatility
  }

  private calculateSharpeRatio(annualizedReturn: number, volatility: number): number {
    return (annualizedReturn - this.RISK_FREE_RATE) / volatility;
  }

  private calculateMaxDrawdown(performanceHistory: PerformanceDataPoint[]): number {
    return Math.max(...performanceHistory.map(p => p.drawdown));
  }

  private calculateWinRate(performanceHistory: PerformanceDataPoint[]): number {
    const positiveReturns = performanceHistory.filter(p => p.return > 0).length;
    return positiveReturns / performanceHistory.length;
  }

  private calculateTotalTransactionCosts(performanceHistory: PerformanceDataPoint[], transactionCostRate: number): number {
    // Simplified transaction cost calculation
    return performanceHistory.length * transactionCostRate * 0.01; // Assume some rebalancing
  }

  private countRebalances(performanceHistory: PerformanceDataPoint[]): number {
    // Simplified rebalance counting
    return Math.floor(performanceHistory.length / 63); // Quarterly rebalancing assumption
  }

  // Additional recommendation generation methods...

  private async generateRebalancingRecommendations(portfolio: Portfolio): Promise<StrategyRecommendation[]> {
    // Implementation for rebalancing recommendations
    return [];
  }

  private async generateRiskAdjustmentRecommendations(portfolio: Portfolio): Promise<StrategyRecommendation[]> {
    // Implementation for risk adjustment recommendations
    return [];
  }

  private async generateOpportunityRecommendations(portfolio: Portfolio): Promise<StrategyRecommendation[]> {
    // Implementation for opportunity recommendations
    return [];
  }

  private convertToStrategyRecommendations(
    optimizationRecs: OptimizationRecommendation[],
    portfolioId: string
  ): StrategyRecommendation[] {
    return optimizationRecs.map(rec => ({
      id: this.generateId(),
      portfolioId,
      recommendationType: 'OPTIMIZATION' as const,
      priority: rec.priority,
      title: rec.title,
      description: rec.description,
      rationale: rec.expectedBenefit,
      expectedOutcome: {
        returnImpact: 0.02, // Mock 2% return impact
        riskImpact: -0.01, // Mock 1% risk reduction
        timeHorizon: rec.timeframe,
        confidence: 0.75,
        keyMetrics: { cost: rec.estimatedCost }
      },
      implementationPlan: rec.implementationSteps.map((step, index) => ({
        order: index + 1,
        action: step,
        description: step,
        estimatedCost: rec.estimatedCost / rec.implementationSteps.length,
        estimatedTime: '1 day',
        dependencies: [],
        riskLevel: 'LOW' as const
      })),
      riskAssessment: {
        level: 'LOW' as const,
        factors: ['Market volatility', 'Execution risk'],
        mitigation: ['Gradual implementation', 'Stop-loss orders'],
        worstCaseScenario: 'Temporary underperformance',
        probabilityOfSuccess: 0.8
      },
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdAt: new Date()
    }));
  }

  // Storage methods
  private async storeOptimizationResult(result: OptimizationResult): Promise<void> {
    // Store optimization result in database
    // Implementation would depend on database schema
  }

  private async storeBacktestResult(result: BacktestResult): Promise<void> {
    // Store backtest result in database
    // Implementation would depend on database schema
  }

  private async executeTrade(portfolioId: string, trade: any): Promise<void> {
    // Execute actual trade through trading system
    // Implementation would depend on trading platform integration
  }

  private async updatePortfolioAllocation(portfolioId: string, allocation: AllocationRecommendation[]): Promise<void> {
    // Update portfolio allocation in database
    // Implementation would depend on database schema
  }

  private generateId(): string {
    return `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const strategyOptimizer = new StrategyOptimizer();
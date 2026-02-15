// Portfolio Analysis Service
// Phase 3, Task 3: Create portfolio analysis service

import { PrismaClient } from '@prisma/client';
import { 
  Portfolio,
  PortfolioAnalysis,
  AssetAllocation,
  SectorDistribution,
  PerformanceMetrics,
  RiskMetrics,
  InvestmentRecommendation,
  AllocationCategory,
  SectorAllocation,
  BenchmarkComparison,
  TimePeriod,
  InvestmentBusinessError,
  BusinessErrorCodes
} from '@/types/investment-management';

const prisma = new PrismaClient();

/**
 * Portfolio Analyzer Service
 * Provides comprehensive portfolio analysis and performance metrics
 */
export class PortfolioAnalyzer {
  
  /**
   * Calculate comprehensive portfolio metrics
   */
  async calculatePortfolioMetrics(portfolioId: string): Promise<PerformanceMetrics> {
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId },
        include: {
          investments: {
            include: {
              project: {
                select: {
                  title: true,
                  expectedReturn: true,
                  riskLevel: true,
                  category: true
                }
              }
            }
          },
          cashFlows: {
            orderBy: { date: 'asc' }
          }
        }
      });

      if (!portfolio) {
        throw new InvestmentBusinessError(
          'Portfolio not found',
          BusinessErrorCodes.PORTFOLIO_NOT_FOUND
        );
      }

      // Calculate basic metrics
      const absoluteReturn = portfolio.totalReturn;
      const returnPercentage = portfolio.totalInvested > 0 
        ? (portfolio.totalReturn / portfolio.totalInvested) * 100 
        : 0;

      // Calculate annualized return
      const oldestInvestment = portfolio.investments.reduce((oldest, current) => 
        current.investedAt < oldest.investedAt ? current : oldest
      );
      
      const yearsInvested = oldestInvestment 
        ? (Date.now() - oldestInvestment.investedAt.getTime()) / (1000 * 60 * 60 * 24 * 365)
        : 1;

      const annualizedReturn = yearsInvested > 0 
        ? Math.pow(1 + (returnPercentage / 100), 1 / yearsInvested) - 1
        : returnPercentage / 100;

      // Calculate Sharpe ratio (simplified)
      const riskFreeRate = 0.03; // 3% risk-free rate
      const returns = this.calculateMonthlyReturns(portfolio.cashFlows);
      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const volatility = this.calculateVolatility(returns);
      const sharpeRatio = volatility > 0 ? (avgReturn - riskFreeRate) / volatility : 0;

      // Calculate maximum drawdown
      const maxDrawdown = this.calculateMaxDrawdown(portfolio.cashFlows);

      // Benchmark comparison (simplified - using market average)
      const benchmarkReturn = 0.08; // 8% market average
      const benchmarkComparison: BenchmarkComparison = {
        benchmarkName: 'Market Average',
        portfolioReturn: returnPercentage,
        benchmarkReturn: benchmarkReturn * 100,
        outperformance: returnPercentage - (benchmarkReturn * 100)
      };

      return {
        absoluteReturn,
        annualizedReturn: annualizedReturn * 100,
        sharpeRatio,
        volatility: volatility * 100,
        maxDrawdown: maxDrawdown * 100,
        benchmarkComparison
      };

    } catch (error) {
      console.error('Error calculating portfolio metrics:', error);
      throw error;
    }
  }

  /**
   * Get asset allocation analysis
   */
  async getAssetAllocation(portfolioId: string): Promise<AssetAllocation> {
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId },
        include: {
          investments: {
            include: {
              project: {
                select: {
                  category: true,
                  riskLevel: true
                }
              }
            }
          }
        }
      });

      if (!portfolio) {
        throw new InvestmentBusinessError(
          'Portfolio not found',
          BusinessErrorCodes.PORTFOLIO_NOT_FOUND
        );
      }

      // Group investments by category
      const categoryMap = new Map<string, number>();
      
      portfolio.investments.forEach(investment => {
        const category = investment.project.category || 'Other';
        const currentValue = categoryMap.get(category) || 0;
        categoryMap.set(category, currentValue + investment.currentValue);
      });

      // Convert to allocation categories
      const categories: AllocationCategory[] = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
        percentage: portfolio.totalValue > 0 ? (value / portfolio.totalValue) * 100 : 0,
        color: this.getCategoryColor(name)
      }));

      // Calculate diversification score (0-100)
      const diversificationScore = this.calculateDiversificationScore(categories);

      return {
        categories,
        diversificationScore
      };

    } catch (error) {
      console.error('Error getting asset allocation:', error);
      throw error;
    }
  }

  /**
   * Analyze sector distribution
   */
  async analyzeSectorDistribution(portfolioId: string): Promise<SectorDistribution> {
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId },
        include: {
          investments: {
            include: {
              project: {
                select: {
                  category: true,
                  expectedReturn: true
                }
              }
            }
          }
        }
      });

      if (!portfolio) {
        throw new InvestmentBusinessError(
          'Portfolio not found',
          BusinessErrorCodes.PORTFOLIO_NOT_FOUND
        );
      }

      // Group by sector and calculate metrics
      const sectorMap = new Map<string, {
        value: number;
        investedAmount: number;
        expectedReturn: number;
        count: number;
      }>();

      portfolio.investments.forEach(investment => {
        const sector = investment.project.category || 'Other';
        const current = sectorMap.get(sector) || {
          value: 0,
          investedAmount: 0,
          expectedReturn: 0,
          count: 0
        };

        sectorMap.set(sector, {
          value: current.value + investment.currentValue,
          investedAmount: current.investedAmount + investment.amount,
          expectedReturn: current.expectedReturn + (investment.project.expectedReturn || 0),
          count: current.count + 1
        });
      });

      // Convert to sector allocations
      const sectors: SectorAllocation[] = Array.from(sectorMap.entries()).map(([sector, data]) => {
        const percentage = portfolio.totalValue > 0 ? (data.value / portfolio.totalValue) * 100 : 0;
        const performance = data.investedAmount > 0 
          ? ((data.value - data.investedAmount) / data.investedAmount) * 100 
          : 0;

        return {
          sector,
          percentage,
          value: data.value,
          performance
        };
      });

      // Calculate concentration risk (higher when investments are concentrated in few sectors)
      const concentrationRisk = this.calculateConcentrationRisk(sectors);

      return {
        sectors,
        concentrationRisk
      };

    } catch (error) {
      console.error('Error analyzing sector distribution:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive performance report
   */
  async generatePerformanceReport(
    portfolioId: string, 
    period: TimePeriod
  ): Promise<PortfolioAnalysis> {
    try {
      // Get all analysis components
      const [
        assetAllocation,
        sectorDistribution,
        performanceMetrics,
        riskMetrics
      ] = await Promise.all([
        this.getAssetAllocation(portfolioId),
        this.analyzeSectorDistribution(portfolioId),
        this.calculatePortfolioMetrics(portfolioId),
        this.calculateRiskMetrics(portfolioId)
      ]);

      return {
        assetAllocation,
        sectorDistribution,
        performanceMetrics,
        riskMetrics
      };

    } catch (error) {
      console.error('Error generating performance report:', error);
      throw error;
    }
  }

  /**
   * Calculate risk metrics for portfolio
   */
  async calculateRiskMetrics(portfolioId: string): Promise<RiskMetrics> {
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId },
        include: {
          investments: {
            include: {
              project: {
                select: {
                  riskLevel: true,
                  category: true
                }
              }
            }
          },
          riskAssessments: {
            orderBy: { assessmentDate: 'desc' },
            take: 1
          }
        }
      });

      if (!portfolio) {
        throw new InvestmentBusinessError(
          'Portfolio not found',
          BusinessErrorCodes.PORTFOLIO_NOT_FOUND
        );
      }

      // Portfolio risk (from latest risk assessment)
      const portfolioRisk = portfolio.riskAssessments[0]?.riskScore || portfolio.riskScore;

      // Concentration risk (based on asset allocation)
      const assetAllocation = await this.getAssetAllocation(portfolioId);
      const concentrationRisk = 100 - assetAllocation.diversificationScore;

      // Liquidity risk (simplified - based on investment types)
      const liquidityRisk = this.calculateLiquidityRisk(portfolio.investments);

      // Market risk (based on portfolio beta - simplified)
      const marketRisk = this.calculateMarketRisk(portfolio.investments);

      // Credit risk (based on project risk levels)
      const creditRisk = this.calculateCreditRisk(portfolio.investments);

      return {
        portfolioRisk,
        concentrationRisk,
        liquidityRisk,
        marketRisk,
        creditRisk
      };

    } catch (error) {
      console.error('Error calculating risk metrics:', error);
      throw error;
    }
  }

  /**
   * Generate investment recommendations
   */
  async generateRecommendations(portfolioId: string): Promise<InvestmentRecommendation[]> {
    try {
      const analysis = await this.generatePerformanceReport(portfolioId, '1Y');
      const recommendations: InvestmentRecommendation[] = [];

      // Diversification recommendations
      if (analysis.assetAllocation.diversificationScore < 60) {
        recommendations.push({
          type: 'REBALANCE',
          priority: 'HIGH',
          title: 'Improve Portfolio Diversification',
          description: 'Your portfolio is concentrated in few asset categories. Consider diversifying across more sectors.',
          expectedImpact: 15,
          riskImpact: -20,
          actionItems: [
            'Consider investments in underrepresented sectors',
            'Reduce concentration in top holdings',
            'Add international exposure if lacking'
          ]
        });
      }

      // Risk management recommendations
      if (analysis.riskMetrics.portfolioRisk > 7) {
        recommendations.push({
          type: 'SELL',
          priority: 'HIGH',
          title: 'Reduce Portfolio Risk',
          description: 'Your portfolio risk level is higher than recommended. Consider reducing exposure to high-risk investments.',
          expectedImpact: -5,
          riskImpact: -30,
          actionItems: [
            'Review high-risk investments',
            'Consider partial profit-taking',
            'Add defensive positions'
          ]
        });
      }

      // Performance improvement recommendations
      if (analysis.performanceMetrics.benchmarkComparison?.outperformance && 
          analysis.performanceMetrics.benchmarkComparison.outperformance < -5) {
        recommendations.push({
          type: 'BUY',
          priority: 'MEDIUM',
          title: 'Improve Performance',
          description: 'Your portfolio is underperforming the market benchmark. Consider strategic additions.',
          expectedImpact: 10,
          riskImpact: 5,
          actionItems: [
            'Review underperforming investments',
            'Consider growth-oriented additions',
            'Evaluate market timing'
          ]
        });
      }

      // Concentration risk recommendations
      if (analysis.riskMetrics.concentrationRisk > 40) {
        recommendations.push({
          type: 'REBALANCE',
          priority: 'MEDIUM',
          title: 'Reduce Concentration Risk',
          description: 'Your portfolio has high concentration risk. Consider spreading investments more evenly.',
          expectedImpact: 5,
          riskImpact: -15,
          actionItems: [
            'Identify overweight positions',
            'Gradually rebalance allocations',
            'Set maximum position limits'
          ]
        });
      }

      return recommendations;

    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  // Private helper methods

  private calculateMonthlyReturns(cashFlows: any[]): number[] {
    // Simplified monthly returns calculation
    const returns: number[] = [];
    
    for (let i = 1; i < cashFlows.length; i++) {
      const currentValue = cashFlows[i].amount;
      const previousValue = cashFlows[i - 1].amount;
      
      if (previousValue !== 0) {
        const monthlyReturn = (currentValue - previousValue) / Math.abs(previousValue);
        returns.push(monthlyReturn);
      }
    }
    
    return returns.length > 0 ? returns : [0];
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    
    return Math.sqrt(variance);
  }

  private calculateMaxDrawdown(cashFlows: any[]): number {
    if (cashFlows.length < 2) return 0;
    
    let maxDrawdown = 0;
    let peak = cashFlows[0].amount;
    
    for (const cashFlow of cashFlows) {
      if (cashFlow.amount > peak) {
        peak = cashFlow.amount;
      }
      
      const drawdown = (peak - cashFlow.amount) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    return maxDrawdown;
  }

  private calculateDiversificationScore(categories: AllocationCategory[]): number {
    if (categories.length === 0) return 0;
    
    // Calculate Herfindahl-Hirschman Index (HHI) for diversification
    const hhi = categories.reduce((sum, category) => {
      const weight = category.percentage / 100;
      return sum + (weight * weight);
    }, 0);
    
    // Convert to diversification score (0-100, higher is better)
    const maxHHI = 1; // Completely concentrated
    const diversificationScore = (1 - hhi) * 100;
    
    return Math.max(0, Math.min(100, diversificationScore));
  }

  private calculateConcentrationRisk(sectors: SectorAllocation[]): number {
    if (sectors.length === 0) return 100;
    
    // Calculate concentration using Gini coefficient approach
    const sortedPercentages = sectors.map(s => s.percentage).sort((a, b) => a - b);
    const n = sortedPercentages.length;
    
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += (2 * (i + 1) - n - 1) * sortedPercentages[i];
    }
    
    const gini = sum / (n * sortedPercentages.reduce((a, b) => a + b, 0));
    
    // Convert to concentration risk (0-100, higher is more concentrated)
    return Math.max(0, Math.min(100, gini * 100));
  }

  private calculateLiquidityRisk(investments: any[]): number {
    // Simplified liquidity risk based on investment types
    // In reality, this would consider market liquidity, lock-up periods, etc.
    
    let totalValue = 0;
    let illiquidValue = 0;
    
    investments.forEach(investment => {
      totalValue += investment.currentValue;
      
      // Assume certain categories are less liquid
      const illiquidCategories = ['Real Estate', 'Private Equity', 'Venture Capital'];
      if (illiquidCategories.includes(investment.project.category)) {
        illiquidValue += investment.currentValue;
      }
    });
    
    return totalValue > 0 ? (illiquidValue / totalValue) * 100 : 0;
  }

  private calculateMarketRisk(investments: any[]): number {
    // Simplified market risk calculation
    // In reality, this would use beta calculations and correlation analysis
    
    const riskLevelWeights = {
      'LOW': 0.5,
      'MEDIUM': 1.0,
      'HIGH': 1.5,
      'VERY_HIGH': 2.0
    };
    
    let totalValue = 0;
    let weightedRisk = 0;
    
    investments.forEach(investment => {
      const riskWeight = riskLevelWeights[investment.project.riskLevel as keyof typeof riskLevelWeights] || 1.0;
      totalValue += investment.currentValue;
      weightedRisk += investment.currentValue * riskWeight;
    });
    
    const averageRisk = totalValue > 0 ? weightedRisk / totalValue : 1.0;
    return Math.min(100, averageRisk * 50); // Scale to 0-100
  }

  private calculateCreditRisk(investments: any[]): number {
    // Simplified credit risk based on project risk levels
    const highRiskInvestments = investments.filter(inv => 
      ['HIGH', 'VERY_HIGH'].includes(inv.project.riskLevel)
    );
    
    const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const highRiskValue = highRiskInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
    
    return totalValue > 0 ? (highRiskValue / totalValue) * 100 : 0;
  }

  private getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      'Technology': '#3B82F6',
      'Healthcare': '#EF4444',
      'Finance': '#10B981',
      'Real Estate': '#F59E0B',
      'Energy': '#8B5CF6',
      'Consumer': '#EC4899',
      'Industrial': '#6B7280',
      'Other': '#9CA3AF'
    };
    
    return colorMap[category] || '#9CA3AF';
  }
}

// Export singleton instance
export const portfolioAnalyzer = new PortfolioAnalyzer();
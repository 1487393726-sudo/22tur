/**
 * 盈亏分析仓库
 * Profit Loss Repository
 * 
 * 处理盈亏分析、ROI计算、趋势数据等数据库操作
 */

import { BaseRepository } from './base-repository';

export interface ProfitLossSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  profitMargin: number;
  roi: number;
  estimatedPaybackMonths: number;
}

export interface MonthlyTrendItem {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ProfitLossAnalysis extends ProfitLossSummary {
  monthlyTrend: MonthlyTrendItem[];
}

export interface ProjectComparison {
  projectId: string;
  projectName: string;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  profitMargin: number;
  roi: number;
}

export class ProfitLossRepository extends BaseRepository {
  /**
   * 获取盈亏汇总
   */
  async getProfitLossSummary(
    projectId: string,
    investedAmount?: number
  ): Promise<ProfitLossSummary> {
    return this.executeQuery(async () => {
      // 获取所有运营数据
      const operations = await this.prisma.dailyOperations.findMany({
        where: { projectId },
        include: { expenses: true },
      });

      let totalRevenue = 0;
      let totalExpenses = 0;

      operations.forEach(op => {
        totalRevenue += op.revenue;
        totalExpenses += op.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      });

      const totalProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      // 获取投资金额（如果未提供）
      let investment = investedAmount;
      if (!investment) {
        const project = await this.prisma.investmentProject.findUnique({
          where: { id: projectId },
          select: { targetAmount: true },
        });
        investment = project?.targetAmount || 0;
      }

      const roi = investment > 0 ? (totalProfit / investment) * 100 : 0;

      // 估算回本时间（月）
      const operatingDays = operations.length || 1;
      const avgDailyProfit = totalProfit / operatingDays;
      const estimatedPaybackMonths = avgDailyProfit > 0 
        ? Math.ceil(investment / (avgDailyProfit * 30))
        : 999;

      return {
        totalRevenue,
        totalExpenses,
        totalProfit,
        profitMargin,
        roi,
        estimatedPaybackMonths,
      };
    }, `Failed to get profit loss summary for project ${projectId}`);
  }

  /**
   * 获取月度趋势数据
   */
  async getMonthlyTrend(
    projectId: string,
    months: number = 12
  ): Promise<MonthlyTrendItem[]> {
    return this.executeQuery(async () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const operations = await this.prisma.dailyOperations.findMany({
        where: {
          projectId,
          date: { gte: startDate },
        },
        include: { expenses: true },
        orderBy: { date: 'asc' },
      });

      // 按月份分组
      const monthlyData = new Map<string, { revenue: number; expenses: number }>();

      operations.forEach(op => {
        const monthKey = `${op.date.getFullYear()}-${String(op.date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { revenue: 0, expenses: 0 });
        }

        const data = monthlyData.get(monthKey)!;
        data.revenue += op.revenue;
        data.expenses += op.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      });

      return Array.from(monthlyData.entries())
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          expenses: data.expenses,
          profit: data.revenue - data.expenses,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    }, `Failed to get monthly trend for project ${projectId}`);
  }

  /**
   * 获取完整盈亏分析
   */
  async getProfitLossAnalysis(
    projectId: string,
    investedAmount?: number
  ): Promise<ProfitLossAnalysis> {
    const [summary, monthlyTrend] = await Promise.all([
      this.getProfitLossSummary(projectId, investedAmount),
      this.getMonthlyTrend(projectId),
    ]);

    return {
      ...summary,
      monthlyTrend,
    };
  }

  /**
   * 计算投资者 ROI
   */
  async calculateInvestorROI(
    investorId: string,
    projectId: string
  ): Promise<{
    investedAmount: number;
    shareholdingRatio: number;
    shareOfProfit: number;
    roi: number;
  }> {
    return this.executeQuery(async () => {
      // 获取投资者在项目中的投资信息
      const access = await this.prisma.investorProjectAccess.findFirst({
        where: {
          investorId,
          projectId,
          isActive: true,
        },
      });

      if (!access) {
        return {
          investedAmount: 0,
          shareholdingRatio: 0,
          shareOfProfit: 0,
          roi: 0,
        };
      }

      // 获取投资金额
      const investments = await this.prisma.projectInvestment.findMany({
        where: {
          userId: investorId,
          projectId,
        },
      });

      const investedAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);

      // 获取项目总利润
      const summary = await this.getProfitLossSummary(projectId);
      
      // 计算投资者份额
      const shareholdingRatio = access.shareholdingRatio;
      const shareOfProfit = summary.totalProfit * (shareholdingRatio / 100);
      const roi = investedAmount > 0 ? (shareOfProfit / investedAmount) * 100 : 0;

      return {
        investedAmount,
        shareholdingRatio,
        shareOfProfit,
        roi,
      };
    }, `Failed to calculate ROI for investor ${investorId} in project ${projectId}`);
  }

  /**
   * 多项目对比
   */
  async compareProjects(projectIds: string[]): Promise<ProjectComparison[]> {
    return this.executeQuery(async () => {
      const comparisons: ProjectComparison[] = [];

      for (const projectId of projectIds) {
        const project = await this.prisma.investmentProject.findUnique({
          where: { id: projectId },
          select: { id: true, title: true, targetAmount: true },
        });

        if (!project) continue;

        const summary = await this.getProfitLossSummary(projectId, project.targetAmount);

        comparisons.push({
          projectId: project.id,
          projectName: project.title,
          totalRevenue: summary.totalRevenue,
          totalExpenses: summary.totalExpenses,
          totalProfit: summary.totalProfit,
          profitMargin: summary.profitMargin,
          roi: summary.roi,
        });
      }

      return comparisons;
    }, `Failed to compare projects`);
  }

  /**
   * 获取亏损预警项目
   */
  async getLossAlertProjects(
    investorId: string,
    lossThreshold: number = -10 // 亏损超过10%触发预警
  ): Promise<Array<{
    projectId: string;
    projectName: string;
    profitMargin: number;
    consecutiveLossDays: number;
  }>> {
    return this.executeQuery(async () => {
      // 获取投资者可访问的项目
      const accessRecords = await this.prisma.investorProjectAccess.findMany({
        where: {
          investorId,
          isActive: true,
        },
        include: {
          project: true,
        },
      });

      const alerts: Array<{
        projectId: string;
        projectName: string;
        profitMargin: number;
        consecutiveLossDays: number;
      }> = [];

      for (const record of accessRecords) {
        const summary = await this.getProfitLossSummary(record.projectId);
        
        if (summary.profitMargin < lossThreshold) {
          // 计算连续亏损天数
          const recentOps = await this.prisma.dailyOperations.findMany({
            where: { projectId: record.projectId },
            include: { expenses: true },
            orderBy: { date: 'desc' },
            take: 30,
          });

          let consecutiveLossDays = 0;
          for (const op of recentOps) {
            const expenses = op.expenses.reduce((sum, exp) => sum + exp.amount, 0);
            if (op.revenue < expenses) {
              consecutiveLossDays++;
            } else {
              break;
            }
          }

          alerts.push({
            projectId: record.projectId,
            projectName: record.project.title,
            profitMargin: summary.profitMargin,
            consecutiveLossDays,
          });
        }
      }

      return alerts;
    }, `Failed to get loss alert projects for investor ${investorId}`);
  }
}

// 导出单例实例
export const profitLossRepository = new ProfitLossRepository();

/**
 * 盈亏分析服务
 * Profit Loss Analyzer Service
 * 
 * 实现盈亏汇总、趋势计算、ROI计算、多项目对比和亏损预警
 */

import {
  ProfitLossSummary,
  ProfitLossTrend,
  ROIAnalysis,
  ProjectComparison,
  LossAlert,
  DateRange,
  TrendPeriod,
  AlertType,
  AlertSeverity,
  calculateProfitLossRate,
  calculateROI
} from '@/types/investor-operations-monitoring';

// 使用动态导入避免 Prisma 类型问题
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prismaClient: any = null;

async function getPrisma() {
  if (!prismaClient) {
    const { prisma } = await import('@/lib/prisma');
    prismaClient = prisma;
  }
  return prismaClient;
}

/**
 * 盈亏分析错误
 */
export class ProfitLossError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ProfitLossError';
  }
}

/**
 * 错误代码
 */
export const ProfitLossErrorCodes = {
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  INVESTOR_NOT_FOUND: 'INVESTOR_NOT_FOUND',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  NO_DATA_AVAILABLE: 'NO_DATA_AVAILABLE'
} as const;

/**
 * 亏损预警阈值配置
 */
export interface LossAlertThresholds {
  consecutiveLossDays: number;      // 连续亏损天数
  lossRateThreshold: number;        // 亏损率阈值 (%)
  monthlyLossThreshold: number;     // 月度亏损金额阈值
}

const DEFAULT_THRESHOLDS: LossAlertThresholds = {
  consecutiveLossDays: 7,
  lossRateThreshold: -10,
  monthlyLossThreshold: -50000
};

/**
 * 盈亏分析器
 */
export class ProfitLossAnalyzer {
  private thresholds: LossAlertThresholds;

  constructor(thresholds: LossAlertThresholds = DEFAULT_THRESHOLDS) {
    this.thresholds = thresholds;
  }

  /**
   * 获取盈亏汇总
   */
  async getProfitLossSummary(
    projectId: string,
    dateRange: DateRange
  ): Promise<ProfitLossSummary> {
    const prisma = await getPrisma();

    if (dateRange.startDate > dateRange.endDate) {
      throw new ProfitLossError(
        '开始日期不能晚于结束日期',
        ProfitLossErrorCodes.INVALID_DATE_RANGE
      );
    }

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new ProfitLossError(
        `项目不存在: ${projectId}`,
        ProfitLossErrorCodes.PROJECT_NOT_FOUND
      );
    }

    // 获取运营数据汇总
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalProfit = 0;

    if (prisma.dailyOperations) {
      const aggregation = await prisma.dailyOperations.aggregate({
        where: {
          projectId,
          date: {
            gte: dateRange.startDate,
            lte: dateRange.endDate
          }
        },
        _sum: {
          revenue: true,
          totalExpenses: true,
          profit: true
        }
      });

      totalRevenue = aggregation._sum.revenue || 0;
      totalExpenses = aggregation._sum.totalExpenses || 0;
      totalProfit = aggregation._sum.profit || 0;
    }

    const profitMargin = totalRevenue > 0 
      ? Number(((totalProfit / totalRevenue) * 100).toFixed(2))
      : 0;

    const profitLossRate = calculateProfitLossRate(totalProfit, project.targetAmount || 0);

    return {
      projectId,
      dateRange,
      totalRevenue,
      totalExpenses,
      totalProfit,
      profitMargin,
      profitLossRate,
      isProfit: totalProfit >= 0
    };
  }

  /**
   * 获取盈亏趋势
   */
  async getProfitLossTrend(
    projectId: string,
    dateRange: DateRange,
    period: TrendPeriod = 'DAILY'
  ): Promise<ProfitLossTrend> {
    const prisma = await getPrisma();

    if (dateRange.startDate > dateRange.endDate) {
      throw new ProfitLossError(
        '开始日期不能晚于结束日期',
        ProfitLossErrorCodes.INVALID_DATE_RANGE
      );
    }

    if (!prisma.dailyOperations) {
      return {
        projectId,
        period,
        data: []
      };
    }

    // 获取每日数据
    const dailyData = await prisma.dailyOperations.findMany({
      where: {
        projectId,
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      select: {
        date: true,
        revenue: true,
        totalExpenses: true,
        profit: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    // 根据周期聚合数据
    const aggregatedData = this.aggregateByPeriod(dailyData, period);

    return {
      projectId,
      period,
      data: aggregatedData
    };
  }

  /**
   * 获取投资回报分析
   */
  async getROIAnalysis(
    investorId: string,
    projectId: string
  ): Promise<ROIAnalysis> {
    const prisma = await getPrisma();

    // 获取投资记录
    const investment = await prisma.investment.findFirst({
      where: {
        investorId,
        projectId
      },
      include: {
        project: true
      }
    });

    if (!investment) {
      throw new ProfitLossError(
        `未找到投资记录`,
        ProfitLossErrorCodes.INVESTOR_NOT_FOUND
      );
    }

    const investedAmount = investment.amount;
    const investmentDate = investment.createdAt;
    const holdingPeriodDays = Math.floor(
      (new Date().getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 计算当前价值（基于项目当前金额和持股比例）
    const project = investment.project;
    const shareholdingRatio = project.targetAmount > 0 
      ? investedAmount / project.targetAmount 
      : 0;
    const currentValue = project.currentAmount * shareholdingRatio;

    // 获取分红记录（如果有）
    let totalDividends = 0;
    if (prisma.dividend) {
      const dividends = await prisma.dividend.aggregate({
        where: {
          investorId,
          projectId
        },
        _sum: {
          amount: true
        }
      });
      totalDividends = dividends._sum.amount || 0;
    }

    const unrealizedGain = currentValue - investedAmount;
    const roi = calculateROI(currentValue, totalDividends, investedAmount);
    
    // 计算年化收益率
    const annualizedReturn = holdingPeriodDays > 0
      ? Number(((roi / holdingPeriodDays) * 365).toFixed(2))
      : 0;

    // 估算回本日期
    let estimatedPaybackDate: Date | undefined;
    if (roi > 0 && annualizedReturn > 0) {
      const remainingReturn = 100 - roi;
      const daysToPayback = (remainingReturn / annualizedReturn) * 365;
      estimatedPaybackDate = new Date();
      estimatedPaybackDate.setDate(estimatedPaybackDate.getDate() + Math.ceil(daysToPayback));
    }

    return {
      investorId,
      projectId,
      investedAmount,
      currentValue,
      totalDividends,
      unrealizedGain,
      roi,
      roiPercentage: roi,
      estimatedPaybackDate,
      holdingPeriodDays,
      annualizedReturn
    };
  }

  /**
   * 项目对比分析
   */
  async compareProjects(
    projectIds: string[],
    dateRange: DateRange
  ): Promise<ProjectComparison> {
    const prisma = await getPrisma();

    const projects: ProjectComparison['projects'] = [];

    for (const projectId of projectIds) {
      try {
        const project = await prisma.investmentProject.findUnique({
          where: { id: projectId }
        });

        if (!project) continue;

        const summary = await this.getProfitLossSummary(projectId, dateRange);

        // 计算 ROI（基于项目目标金额）
        const roi = project.targetAmount > 0
          ? Number(((summary.totalProfit / project.targetAmount) * 100).toFixed(2))
          : 0;

        projects.push({
          projectId,
          projectName: project.name,
          totalRevenue: summary.totalRevenue,
          totalExpenses: summary.totalExpenses,
          totalProfit: summary.totalProfit,
          profitMargin: summary.profitMargin,
          roi
        });
      } catch (error) {
        // 跳过无法获取数据的项目
        console.error(`获取项目 ${projectId} 数据失败:`, error);
      }
    }

    // 按利润排序
    projects.sort((a, b) => b.totalProfit - a.totalProfit);

    return {
      projects,
      dateRange
    };
  }

  /**
   * 检查亏损预警
   */
  async checkLossAlerts(projectId: string): Promise<LossAlert[]> {
    const prisma = await getPrisma();
    const alerts: LossAlert[] = [];

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new ProfitLossError(
        `项目不存在: ${projectId}`,
        ProfitLossErrorCodes.PROJECT_NOT_FOUND
      );
    }

    if (!prisma.dailyOperations) {
      return alerts;
    }

    // 检查连续亏损天数
    const recentData = await prisma.dailyOperations.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
      take: this.thresholds.consecutiveLossDays + 5,
      select: {
        date: true,
        profit: true
      }
    });

    let consecutiveLossDays = 0;
    for (const data of recentData) {
      if (data.profit < 0) {
        consecutiveLossDays++;
      } else {
        break;
      }
    }

    if (consecutiveLossDays >= this.thresholds.consecutiveLossDays) {
      alerts.push({
        id: `alert-consecutive-${projectId}-${Date.now()}`,
        projectId,
        alertType: AlertType.LOSS_WARNING,
        severity: consecutiveLossDays >= 14 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
        title: '连续亏损预警',
        message: `项目已连续 ${consecutiveLossDays} 天亏损，请关注运营状况`,
        thresholdValue: this.thresholds.consecutiveLossDays,
        actualValue: consecutiveLossDays,
        isRead: false,
        isResolved: false,
        createdAt: new Date()
      });
    }

    // 检查月度亏损
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyAggregation = await prisma.dailyOperations.aggregate({
      where: {
        projectId,
        date: { gte: thirtyDaysAgo }
      },
      _sum: {
        profit: true
      }
    });

    const monthlyProfit = monthlyAggregation._sum.profit || 0;

    if (monthlyProfit < this.thresholds.monthlyLossThreshold) {
      alerts.push({
        id: `alert-monthly-${projectId}-${Date.now()}`,
        projectId,
        alertType: AlertType.LOSS_WARNING,
        severity: monthlyProfit < this.thresholds.monthlyLossThreshold * 2 
          ? AlertSeverity.CRITICAL 
          : AlertSeverity.HIGH,
        title: '月度亏损预警',
        message: `项目近30天累计亏损 ¥${Math.abs(monthlyProfit).toLocaleString()}`,
        thresholdValue: this.thresholds.monthlyLossThreshold,
        actualValue: monthlyProfit,
        isRead: false,
        isResolved: false,
        createdAt: new Date()
      });
    }

    // 检查亏损率
    const summary = await this.getProfitLossSummary(projectId, {
      startDate: thirtyDaysAgo,
      endDate: new Date()
    });

    if (summary.profitLossRate < this.thresholds.lossRateThreshold) {
      alerts.push({
        id: `alert-rate-${projectId}-${Date.now()}`,
        projectId,
        alertType: AlertType.LOSS_WARNING,
        severity: summary.profitLossRate < this.thresholds.lossRateThreshold * 2
          ? AlertSeverity.CRITICAL
          : AlertSeverity.MEDIUM,
        title: '亏损率预警',
        message: `项目亏损率达到 ${summary.profitLossRate}%，超过预警阈值`,
        thresholdValue: this.thresholds.lossRateThreshold,
        actualValue: summary.profitLossRate,
        isRead: false,
        isResolved: false,
        createdAt: new Date()
      });
    }

    return alerts;
  }

  /**
   * 获取投资者所有项目的盈亏汇总
   */
  async getInvestorProfitLossSummary(
    investorId: string,
    dateRange: DateRange
  ): Promise<{
    totalInvested: number;
    totalCurrentValue: number;
    totalProfit: number;
    overallROI: number;
    projectSummaries: ProfitLossSummary[];
  }> {
    const prisma = await getPrisma();

    // 获取投资者的所有投资
    const investments = await prisma.investment.findMany({
      where: { investorId },
      include: { project: true }
    });

    let totalInvested = 0;
    let totalCurrentValue = 0;
    const projectSummaries: ProfitLossSummary[] = [];

    for (const investment of investments) {
      totalInvested += investment.amount;
      
      const shareholdingRatio = investment.project.targetAmount > 0
        ? investment.amount / investment.project.targetAmount
        : 0;
      totalCurrentValue += investment.project.currentAmount * shareholdingRatio;

      try {
        const summary = await this.getProfitLossSummary(investment.projectId, dateRange);
        projectSummaries.push(summary);
      } catch (error) {
        // 跳过无法获取数据的项目
      }
    }

    const totalProfit = totalCurrentValue - totalInvested;
    const overallROI = totalInvested > 0
      ? Number(((totalProfit / totalInvested) * 100).toFixed(2))
      : 0;

    return {
      totalInvested,
      totalCurrentValue,
      totalProfit,
      overallROI,
      projectSummaries
    };
  }

  // =====================================================
  // 私有辅助方法
  // =====================================================

  /**
   * 按周期聚合数据
   */
  private aggregateByPeriod(
    dailyData: { date: Date; revenue: number; totalExpenses: number; profit: number }[],
    period: TrendPeriod
  ): { date: string; revenue: number; expenses: number; profit: number; profitMargin: number }[] {
    if (period === 'DAILY') {
      return dailyData.map(d => ({
        date: d.date.toISOString().split('T')[0],
        revenue: d.revenue,
        expenses: d.totalExpenses,
        profit: d.profit,
        profitMargin: d.revenue > 0 ? Number(((d.profit / d.revenue) * 100).toFixed(2)) : 0
      }));
    }

    const groupedData = new Map<string, { revenue: number; expenses: number; profit: number }>();

    dailyData.forEach(d => {
      const key = this.getPeriodKey(d.date, period);
      const existing = groupedData.get(key) || { revenue: 0, expenses: 0, profit: 0 };
      groupedData.set(key, {
        revenue: existing.revenue + d.revenue,
        expenses: existing.expenses + d.totalExpenses,
        profit: existing.profit + d.profit
      });
    });

    return Array.from(groupedData.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.profit,
        profitMargin: data.revenue > 0 ? Number(((data.profit / data.revenue) * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * 获取周期键
   */
  private getPeriodKey(date: Date, period: TrendPeriod): string {
    const d = new Date(date);
    
    switch (period) {
      case 'WEEKLY': {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return weekStart.toISOString().split('T')[0];
      }
      case 'MONTHLY':
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      case 'QUARTERLY': {
        const quarter = Math.floor(d.getMonth() / 3) + 1;
        return `${d.getFullYear()}-Q${quarter}`;
      }
      case 'YEARLY':
        return String(d.getFullYear());
      default:
        return d.toISOString().split('T')[0];
    }
  }
}

// 导出单例实例
export const profitLossAnalyzer = new ProfitLossAnalyzer();

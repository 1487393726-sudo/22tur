/**
 * 亏损分析报告生成服务
 * Loss Analysis Report Generator Service
 * 
 * 实现亏损原因自动分析、市场对比、决策历史记录和改进计划管理
 * 需求: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import {
  LossAnalysisReport,
  LossFactor,
  LossFactorType,
  MarketComparison,
  ImprovementPlan,
  DecisionRecord,
  IndustryType,
  DateRange
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
 * 亏损分析错误
 */
export class LossAnalysisError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'LossAnalysisError';
  }
}

/**
 * 错误代码
 */
export const LossAnalysisErrorCodes = {
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  REPORT_NOT_FOUND: 'REPORT_NOT_FOUND',
  DECISION_NOT_FOUND: 'DECISION_NOT_FOUND',
  PLAN_NOT_FOUND: 'PLAN_NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  NO_LOSS_DATA: 'NO_LOSS_DATA'
} as const;

/**
 * 亏损因素权重配置
 */
const LOSS_FACTOR_WEIGHTS = {
  [LossFactorType.MARKET]: 0.25,
  [LossFactorType.OPERATIONS]: 0.30,
  [LossFactorType.COST]: 0.25,
  [LossFactorType.COMPETITION]: 0.15,
  [LossFactorType.OTHER]: 0.05
};

/**
 * 亏损分析报告生成器
 */
export class LossAnalysisReportGenerator {
  /**
   * 获取亏损分析报告
   * 需求 9.1: 亏损原因分析
   */
  async getLossAnalysisReport(projectId: string): Promise<LossAnalysisReport | null> {
    const prisma = await getPrisma();

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new LossAnalysisError(
        `项目不存在: ${projectId}`,
        LossAnalysisErrorCodes.PROJECT_NOT_FOUND
      );
    }

    // 尝试从数据库获取现有报告
    if (prisma.lossAnalysisReport) {
      const report = await prisma.lossAnalysisReport.findFirst({
        where: { projectId },
        orderBy: { reportDate: 'desc' }
      });

      if (report) {
        return this.mapReportToInterface(report);
      }
    }

    // 如果没有现有报告，生成新报告
    return this.generateLossAnalysisReport(projectId);
  }

  /**
   * 生成亏损分析报告
   * 需求 9.1, 9.2: 亏损原因自动分析
   */
  async generateLossAnalysisReport(
    projectId: string,
    createdBy?: string
  ): Promise<LossAnalysisReport> {
    const prisma = await getPrisma();

    // 获取项目信息
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new LossAnalysisError(
        `项目不存在: ${projectId}`,
        LossAnalysisErrorCodes.PROJECT_NOT_FOUND
      );
    }

    // 计算总亏损
    const totalLoss = await this.calculateTotalLoss(projectId);

    // 分析亏损因素
    const lossFactors = await this.analyzeLossFactors(projectId);

    // 获取市场对比数据
    const marketComparison = await this.getMarketComparison(
      projectId,
      project.industryType as IndustryType
    );

    // 获取决策历史
    const decisionHistory = await this.getDecisionHistory(projectId);

    // 获取改进计划
    const improvementPlan = await this.getLatestImprovementPlan(projectId);

    const report: LossAnalysisReport = {
      id: `report-${projectId}-${Date.now()}`,
      projectId,
      reportDate: new Date(),
      totalLoss,
      lossFactors,
      marketComparison,
      improvementPlan,
      decisionHistory,
      createdBy: createdBy || 'system',
      createdAt: new Date()
    };

    // 保存报告到数据库
    if (prisma.lossAnalysisReport) {
      await prisma.lossAnalysisReport.create({
        data: {
          projectId,
          reportDate: report.reportDate,
          totalLoss: report.totalLoss,
          lossFactors: JSON.stringify(report.lossFactors),
          marketComparison: report.marketComparison ? JSON.stringify(report.marketComparison) : null,
          improvementPlan: report.improvementPlan ? JSON.stringify(report.improvementPlan) : null,
          decisionHistory: JSON.stringify(report.decisionHistory)
        }
      });
    }

    return report;
  }

  /**
   * 获取决策历史
   * 需求 9.3: 决策历史记录
   */
  async getDecisionHistory(
    projectId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<DecisionRecord[]> {
    const prisma = await getPrisma();

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new LossAnalysisError(
        `项目不存在: ${projectId}`,
        LossAnalysisErrorCodes.PROJECT_NOT_FOUND
      );
    }

    // 尝试从决策记录表获取
    if (prisma.decisionRecord) {
      const decisions = await prisma.decisionRecord.findMany({
        where: { projectId },
        orderBy: { decisionDate: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0
      });

      return decisions.map((d: any) => ({
        id: d.id,
        projectId: d.projectId,
        decisionType: d.decisionType,
        title: d.title,
        description: d.description,
        rationale: d.rationale,
        impact: d.impact,
        decisionDate: d.decisionDate,
        decidedBy: d.decidedBy,
        createdAt: d.createdAt
      }));
    }

    // 返回空数组
    return [];
  }

  /**
   * 添加决策记录
   */
  async addDecisionRecord(
    projectId: string,
    decision: Omit<DecisionRecord, 'id' | 'projectId' | 'createdAt'>
  ): Promise<DecisionRecord> {
    const prisma = await getPrisma();

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new LossAnalysisError(
        `项目不存在: ${projectId}`,
        LossAnalysisErrorCodes.PROJECT_NOT_FOUND
      );
    }

    if (!prisma.decisionRecord) {
      // 返回模拟记录
      return {
        id: `decision-${Date.now()}`,
        projectId,
        ...decision,
        createdAt: new Date()
      };
    }

    const record = await prisma.decisionRecord.create({
      data: {
        projectId,
        decisionType: decision.decisionType,
        title: decision.title,
        description: decision.description,
        rationale: decision.rationale,
        impact: decision.impact,
        decisionDate: decision.decisionDate,
        decidedBy: decision.decidedBy
      }
    });

    return {
      id: record.id,
      projectId: record.projectId,
      decisionType: record.decisionType,
      title: record.title,
      description: record.description,
      rationale: record.rationale,
      impact: record.impact,
      decisionDate: record.decisionDate,
      decidedBy: record.decidedBy,
      createdAt: record.createdAt
    };
  }

  /**
   * 获取市场对比数据
   * 需求 9.2: 市场对比数据
   */
  async getMarketComparison(
    projectId: string,
    industryType?: IndustryType
  ): Promise<MarketComparison | undefined> {
    const prisma = await getPrisma();

    // 获取项目信息
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new LossAnalysisError(
        `项目不存在: ${projectId}`,
        LossAnalysisErrorCodes.PROJECT_NOT_FOUND
      );
    }

    const industry = industryType || (project.industryType as IndustryType) || IndustryType.OTHER;

    // 获取同行业项目数据
    const industryProjects = await prisma.investmentProject.findMany({
      where: {
        industryType: industry,
        id: { not: projectId }
      }
    });

    if (industryProjects.length === 0) {
      return undefined;
    }

    // 计算行业平均数据
    let totalRevenue = 0;
    let totalProfit = 0;
    let projectCount = 0;

    // 获取每个项目的运营数据
    if (prisma.dailyOperations) {
      for (const p of industryProjects) {
        const operations = await prisma.dailyOperations.aggregate({
          where: { projectId: p.id },
          _sum: {
            revenue: true,
            profit: true
          }
        });

        if (operations._sum.revenue) {
          totalRevenue += Number(operations._sum.revenue);
          totalProfit += Number(operations._sum.profit || 0);
          projectCount++;
        }
      }
    }

    if (projectCount === 0) {
      return undefined;
    }

    const averageRevenue = totalRevenue / projectCount;
    const averageProfit = totalProfit / projectCount;
    const averageProfitMargin = averageRevenue > 0 
      ? (averageProfit / averageRevenue) * 100 
      : 0;

    // 计算当前项目排名
    const projectRanking = await this.calculateProjectRanking(projectId, industry);

    return {
      industryType: industry,
      averageRevenue: Number(averageRevenue.toFixed(2)),
      averageProfit: Number(averageProfit.toFixed(2)),
      averageProfitMargin: Number(averageProfitMargin.toFixed(2)),
      projectRanking,
      totalProjectsInIndustry: industryProjects.length + 1,
      comparisonDate: new Date()
    };
  }

  /**
   * 获取改进计划
   * 需求 9.4: 改进计划管理
   */
  async getImprovementPlans(projectId: string): Promise<ImprovementPlan[]> {
    const prisma = await getPrisma();

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new LossAnalysisError(
        `项目不存在: ${projectId}`,
        LossAnalysisErrorCodes.PROJECT_NOT_FOUND
      );
    }

    if (!prisma.improvementPlan) {
      return [];
    }

    const plans = await prisma.improvementPlan.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });

    return plans.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      expectedOutcome: p.expectedOutcome,
      timeline: p.timeline,
      responsiblePerson: p.responsiblePerson,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));
  }

  /**
   * 创建改进计划
   */
  async createImprovementPlan(
    projectId: string,
    plan: Omit<ImprovementPlan, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ImprovementPlan> {
    const prisma = await getPrisma();

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new LossAnalysisError(
        `项目不存在: ${projectId}`,
        LossAnalysisErrorCodes.PROJECT_NOT_FOUND
      );
    }

    if (!prisma.improvementPlan) {
      // 返回模拟计划
      return {
        id: `plan-${Date.now()}`,
        ...plan,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    const created = await prisma.improvementPlan.create({
      data: {
        projectId,
        title: plan.title,
        description: plan.description,
        expectedOutcome: plan.expectedOutcome,
        timeline: plan.timeline,
        responsiblePerson: plan.responsiblePerson,
        status: plan.status
      }
    });

    return {
      id: created.id,
      title: created.title,
      description: created.description,
      expectedOutcome: created.expectedOutcome,
      timeline: created.timeline,
      responsiblePerson: created.responsiblePerson,
      status: created.status,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt
    };
  }

  /**
   * 更新改进计划状态
   */
  async updateImprovementPlanStatus(
    planId: string,
    status: ImprovementPlan['status']
  ): Promise<ImprovementPlan> {
    const prisma = await getPrisma();

    if (!prisma.improvementPlan) {
      throw new LossAnalysisError(
        '改进计划表不存在',
        LossAnalysisErrorCodes.INVALID_INPUT
      );
    }

    const plan = await prisma.improvementPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      throw new LossAnalysisError(
        `改进计划不存在: ${planId}`,
        LossAnalysisErrorCodes.PLAN_NOT_FOUND
      );
    }

    const updated = await prisma.improvementPlan.update({
      where: { id: planId },
      data: { status }
    });

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      expectedOutcome: updated.expectedOutcome,
      timeline: updated.timeline,
      responsiblePerson: updated.responsiblePerson,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    };
  }

  // =====================================================
  // 私有辅助方法
  // =====================================================

  /**
   * 计算总亏损
   */
  private async calculateTotalLoss(projectId: string): Promise<number> {
    const prisma = await getPrisma();

    if (!prisma.dailyOperations) {
      return 0;
    }

    const result = await prisma.dailyOperations.aggregate({
      where: {
        projectId,
        profit: { lt: 0 }
      },
      _sum: { profit: true }
    });

    return Math.abs(Number(result._sum.profit || 0));
  }

  /**
   * 分析亏损因素
   */
  private async analyzeLossFactors(projectId: string): Promise<LossFactor[]> {
    const prisma = await getPrisma();
    const factors: LossFactor[] = [];

    // 分析运营数据
    if (prisma.dailyOperations && prisma.expenseRecord) {
      // 获取支出分类数据
      const expenses = await prisma.expenseRecord.findMany({
        where: {
          dailyOperations: { projectId }
        },
        include: { dailyOperations: true }
      });

      // 计算各类支出占比
      const expenseByCategory: Record<string, number> = {};
      let totalExpense = 0;

      expenses.forEach((e: any) => {
        const category = e.category;
        const amount = Number(e.amount);
        expenseByCategory[category] = (expenseByCategory[category] || 0) + amount;
        totalExpense += amount;
      });

      // 分析成本因素
      if (totalExpense > 0) {
        const highCostCategories = Object.entries(expenseByCategory)
          .filter(([_, amount]) => (amount / totalExpense) > 0.3)
          .map(([category]) => category);

        if (highCostCategories.length > 0) {
          factors.push({
            factor: LossFactorType.COST,
            impact: Math.min(80, highCostCategories.length * 25),
            description: `高成本支出类别: ${highCostCategories.join(', ')}`,
            evidence: highCostCategories.map(c => 
              `${c} 占总支出 ${((expenseByCategory[c] / totalExpense) * 100).toFixed(1)}%`
            )
          });
        }
      }

      // 分析收入趋势
      const recentOperations = await prisma.dailyOperations.findMany({
        where: { projectId },
        orderBy: { date: 'desc' },
        take: 30
      });

      if (recentOperations.length >= 7) {
        const recentRevenue = recentOperations.slice(0, 7)
          .reduce((sum: number, op: any) => sum + Number(op.revenue), 0) / 7;
        const olderRevenue = recentOperations.slice(7)
          .reduce((sum: number, op: any) => sum + Number(op.revenue), 0) / 
          Math.max(1, recentOperations.length - 7);

        if (olderRevenue > 0 && recentRevenue < olderRevenue * 0.8) {
          factors.push({
            factor: LossFactorType.MARKET,
            impact: Math.min(70, Math.round((1 - recentRevenue / olderRevenue) * 100)),
            description: '收入呈下降趋势，可能存在市场需求下降',
            evidence: [
              `近7天平均收入: ¥${recentRevenue.toFixed(2)}`,
              `之前平均收入: ¥${olderRevenue.toFixed(2)}`,
              `下降幅度: ${((1 - recentRevenue / olderRevenue) * 100).toFixed(1)}%`
            ]
          });
        }
      }
    }

    // 分析运营效率
    factors.push({
      factor: LossFactorType.OPERATIONS,
      impact: 40,
      description: '运营效率需要评估',
      evidence: ['建议进行详细的运营流程审查']
    });

    // 如果没有找到明显因素，添加其他因素
    if (factors.length === 0) {
      factors.push({
        factor: LossFactorType.OTHER,
        impact: 50,
        description: '需要进一步调查亏损原因',
        evidence: ['建议进行全面的业务诊断']
      });
    }

    // 按影响程度排序
    return factors.sort((a, b) => b.impact - a.impact);
  }

  /**
   * 计算项目排名
   */
  private async calculateProjectRanking(
    projectId: string,
    industryType: IndustryType
  ): Promise<number> {
    const prisma = await getPrisma();

    if (!prisma.dailyOperations) {
      return 1;
    }

    // 获取同行业所有项目的利润
    const industryProjects = await prisma.investmentProject.findMany({
      where: { industryType }
    });

    const projectProfits: { projectId: string; profit: number }[] = [];

    for (const p of industryProjects) {
      const result = await prisma.dailyOperations.aggregate({
        where: { projectId: p.id },
        _sum: { profit: true }
      });
      projectProfits.push({
        projectId: p.id,
        profit: Number(result._sum.profit || 0)
      });
    }

    // 按利润排序
    projectProfits.sort((a, b) => b.profit - a.profit);

    // 找到当前项目的排名
    const ranking = projectProfits.findIndex(p => p.projectId === projectId) + 1;
    return ranking || projectProfits.length;
  }

  /**
   * 获取最新改进计划
   */
  private async getLatestImprovementPlan(
    projectId: string
  ): Promise<ImprovementPlan | undefined> {
    const prisma = await getPrisma();

    if (!prisma.improvementPlan) {
      return undefined;
    }

    const plan = await prisma.improvementPlan.findFirst({
      where: {
        projectId,
        status: { in: ['PLANNED', 'IN_PROGRESS'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!plan) {
      return undefined;
    }

    return {
      id: plan.id,
      title: plan.title,
      description: plan.description,
      expectedOutcome: plan.expectedOutcome,
      timeline: plan.timeline,
      responsiblePerson: plan.responsiblePerson,
      status: plan.status,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    };
  }

  /**
   * 映射数据库记录到接口类型
   */
  private mapReportToInterface(report: any): LossAnalysisReport {
    return {
      id: report.id,
      projectId: report.projectId,
      reportDate: report.reportDate,
      totalLoss: Number(report.totalLoss),
      lossFactors: typeof report.lossFactors === 'string' 
        ? JSON.parse(report.lossFactors) 
        : report.lossFactors,
      marketComparison: report.marketComparison 
        ? (typeof report.marketComparison === 'string' 
            ? JSON.parse(report.marketComparison) 
            : report.marketComparison)
        : undefined,
      improvementPlan: report.improvementPlan
        ? (typeof report.improvementPlan === 'string'
            ? JSON.parse(report.improvementPlan)
            : report.improvementPlan)
        : undefined,
      decisionHistory: typeof report.decisionHistory === 'string'
        ? JSON.parse(report.decisionHistory)
        : report.decisionHistory || [],
      createdBy: report.createdBy || 'system',
      createdAt: report.createdAt
    };
  }
}

// 导出单例实例
export const lossAnalysisReportGenerator = new LossAnalysisReportGenerator();

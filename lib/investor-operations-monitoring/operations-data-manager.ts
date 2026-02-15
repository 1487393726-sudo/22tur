/**
 * 运营数据管理服务
 * Operations Data Manager Service
 * 
 * 实现每日运营数据录入、查询、支出明细分类管理和数据聚合汇总计算
 */

import {
  DailyOperationsData,
  ExpenseItem,
  OperationsSummary,
  ExpenseBreakdown,
  RevenueBreakdown,
  DateRange,
  ExpenseCategory,
  DailyOperationsInput,
  ExpenseItemInput,
  DataValidationResult,
  validateDailyOperationsData,
  isValidExpenseCategory
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
 * 运营数据管理错误
 */
export class OperationsDataError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'OperationsDataError';
  }
}

/**
 * 错误代码
 */
export const OperationsErrorCodes = {
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  OPERATIONS_NOT_FOUND: 'OPERATIONS_NOT_FOUND',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY'
} as const;

/**
 * 运营数据管理器
 */
export class OperationsDataManager {
  /**
   * 录入每日运营数据
   */
  async createDailyOperations(
    input: DailyOperationsInput,
    userId: string
  ): Promise<DailyOperationsData> {
    const prisma = await getPrisma();

    // 验证数据
    const validation = validateDailyOperationsData(input);
    if (!validation.isValid) {
      throw new OperationsDataError(
        `数据验证失败: ${validation.errors.map(e => e.message).join(', ')}`,
        OperationsErrorCodes.VALIDATION_FAILED,
        validation.errors
      );
    }

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: input.projectId }
    });

    if (!project) {
      throw new OperationsDataError(
        `项目不存在: ${input.projectId}`,
        OperationsErrorCodes.PROJECT_NOT_FOUND
      );
    }

    // 检查是否已有当天数据
    if (prisma.dailyOperations) {
      const existingData = await prisma.dailyOperations.findFirst({
        where: {
          projectId: input.projectId,
          date: {
            gte: new Date(input.date.setHours(0, 0, 0, 0)),
            lt: new Date(input.date.setHours(23, 59, 59, 999))
          }
        }
      });

      if (existingData) {
        throw new OperationsDataError(
          `该日期已有运营数据记录`,
          OperationsErrorCodes.DUPLICATE_ENTRY
        );
      }
    }

    // 计算总支出和利润
    const totalExpenses = input.expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = input.revenue - totalExpenses;

    // 创建运营数据记录
    if (!prisma.dailyOperations) {
      // 如果表不存在，返回模拟数据
      return this.createMockDailyOperations(input, userId, totalExpenses, profit);
    }

    const operations = await prisma.dailyOperations.create({
      data: {
        projectId: input.projectId,
        date: input.date,
        revenue: input.revenue,
        totalExpenses,
        profit,
        customerCount: input.customerCount,
        notes: input.notes,
        createdBy: userId,
        expenses: {
          create: input.expenses.map((e: ExpenseItemInput) => ({
            category: e.category,
            amount: e.amount,
            description: e.description,
            receiptUrl: e.receiptUrl
          }))
        }
      },
      include: {
        expenses: true
      }
    });

    return this.mapToDailyOperationsData(operations);
  }

  /**
   * 获取每日运营数据
   */
  async getDailyOperations(
    projectId: string,
    date: Date
  ): Promise<DailyOperationsData | null> {
    const prisma = await getPrisma();

    if (!prisma.dailyOperations) {
      return null;
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const operations = await prisma.dailyOperations.findFirst({
      where: {
        projectId,
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        expenses: true
      }
    });

    if (!operations) {
      return null;
    }

    return this.mapToDailyOperationsData(operations);
  }

  /**
   * 获取日期范围内的运营数据列表
   */
  async getOperationsList(
    projectId: string,
    dateRange: DateRange
  ): Promise<DailyOperationsData[]> {
    const prisma = await getPrisma();

    if (dateRange.startDate > dateRange.endDate) {
      throw new OperationsDataError(
        '开始日期不能晚于结束日期',
        OperationsErrorCodes.INVALID_DATE_RANGE
      );
    }

    if (!prisma.dailyOperations) {
      return [];
    }

    const operationsList = await prisma.dailyOperations.findMany({
      where: {
        projectId,
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      include: {
        expenses: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    return operationsList.map((o: DailyOperationsRecord) => this.mapToDailyOperationsData(o));
  }

  /**
   * 获取运营数据汇总
   */
  async getOperationsSummary(
    projectId: string,
    dateRange: DateRange
  ): Promise<OperationsSummary> {
    const prisma = await getPrisma();

    if (dateRange.startDate > dateRange.endDate) {
      throw new OperationsDataError(
        '开始日期不能晚于结束日期',
        OperationsErrorCodes.INVALID_DATE_RANGE
      );
    }

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new OperationsDataError(
        `项目不存在: ${projectId}`,
        OperationsErrorCodes.PROJECT_NOT_FOUND
      );
    }

    if (!prisma.dailyOperations) {
      return this.createEmptySummary(projectId, dateRange);
    }

    // 获取汇总数据
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
        profit: true,
        customerCount: true
      },
      _count: true
    });

    // 获取支出明细
    const expenseBreakdown = await this.getExpenseBreakdown(projectId, dateRange);

    const dayCount = aggregation._count || 1;
    const totalRevenue = aggregation._sum.revenue || 0;
    const totalExpenses = aggregation._sum.totalExpenses || 0;
    const totalProfit = aggregation._sum.profit || 0;
    const totalCustomers = aggregation._sum.customerCount || 0;

    return {
      projectId,
      dateRange,
      totalRevenue,
      totalExpenses,
      totalProfit,
      averageDailyRevenue: dayCount > 0 ? totalRevenue / dayCount : 0,
      averageDailyExpenses: dayCount > 0 ? totalExpenses / dayCount : 0,
      averageDailyProfit: dayCount > 0 ? totalProfit / dayCount : 0,
      totalCustomers,
      expenseBreakdown
    };
  }

  /**
   * 获取支出明细分类
   */
  async getExpenseBreakdown(
    projectId: string,
    dateRange: DateRange
  ): Promise<ExpenseBreakdown> {
    const prisma = await getPrisma();

    if (!prisma.expenseItem) {
      return this.createEmptyExpenseBreakdown();
    }

    // 获取所有支出项
    const expenses = await prisma.expenseItem.findMany({
      where: {
        dailyOperations: {
          projectId,
          date: {
            gte: dateRange.startDate,
            lte: dateRange.endDate
          }
        }
      }
    });

    // 按类别分组统计
    const breakdown: ExpenseBreakdown = {};
    let totalAmount = 0;

    expenses.forEach((expense: { category: string; amount: number }) => {
      const category = expense.category;
      if (!breakdown[category]) {
        breakdown[category] = {
          amount: 0,
          percentage: 0,
          count: 0
        };
      }
      breakdown[category].amount += expense.amount;
      breakdown[category].count += 1;
      totalAmount += expense.amount;
    });

    // 计算百分比
    Object.keys(breakdown).forEach(category => {
      breakdown[category].percentage = totalAmount > 0
        ? Number(((breakdown[category].amount / totalAmount) * 100).toFixed(2))
        : 0;
    });

    return breakdown;
  }

  /**
   * 获取收入明细
   */
  async getRevenueBreakdown(
    projectId: string,
    dateRange: DateRange
  ): Promise<RevenueBreakdown> {
    const prisma = await getPrisma();

    if (!prisma.dailyOperations) {
      return {
        projectId,
        dateRange,
        dailyRevenue: [],
        weeklyRevenue: [],
        monthlyRevenue: []
      };
    }

    // 获取每日收入
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
        revenue: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    const dailyRevenue = dailyData.map((d: { date: Date; revenue: number }) => ({
      date: d.date,
      amount: d.revenue
    }));

    // 按周汇总
    const weeklyRevenue = this.aggregateByWeek(dailyData);

    // 按月汇总
    const monthlyRevenue = this.aggregateByMonth(dailyData);

    return {
      projectId,
      dateRange,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue
    };
  }

  /**
   * 更新每日运营数据
   */
  async updateDailyOperations(
    operationsId: string,
    input: Partial<DailyOperationsInput>,
    userId: string
  ): Promise<DailyOperationsData> {
    const prisma = await getPrisma();

    if (!prisma.dailyOperations) {
      throw new OperationsDataError(
        '运营数据功能尚未启用',
        OperationsErrorCodes.OPERATIONS_NOT_FOUND
      );
    }

    const existing = await prisma.dailyOperations.findUnique({
      where: { id: operationsId },
      include: { expenses: true }
    });

    if (!existing) {
      throw new OperationsDataError(
        `运营数据不存在: ${operationsId}`,
        OperationsErrorCodes.OPERATIONS_NOT_FOUND
      );
    }

    // 计算新的总支出和利润
    let totalExpenses = existing.totalExpenses;
    let profit = existing.profit;

    if (input.expenses) {
      totalExpenses = input.expenses.reduce((sum, e) => sum + e.amount, 0);
      profit = (input.revenue ?? existing.revenue) - totalExpenses;

      // 删除旧的支出项
      await prisma.expenseItem.deleteMany({
        where: { dailyOperationsId: operationsId }
      });
    } else if (input.revenue !== undefined) {
      profit = input.revenue - totalExpenses;
    }

    // 更新运营数据
    const updated = await prisma.dailyOperations.update({
      where: { id: operationsId },
      data: {
        ...(input.revenue !== undefined && { revenue: input.revenue }),
        ...(input.expenses && { totalExpenses }),
        profit,
        ...(input.customerCount !== undefined && { customerCount: input.customerCount }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.expenses && {
          expenses: {
            create: input.expenses.map((e: ExpenseItemInput) => ({
              category: e.category,
              amount: e.amount,
              description: e.description,
              receiptUrl: e.receiptUrl
            }))
          }
        })
      },
      include: {
        expenses: true
      }
    });

    return this.mapToDailyOperationsData(updated);
  }

  /**
   * 删除每日运营数据
   */
  async deleteDailyOperations(operationsId: string): Promise<void> {
    const prisma = await getPrisma();

    if (!prisma.dailyOperations) {
      throw new OperationsDataError(
        '运营数据功能尚未启用',
        OperationsErrorCodes.OPERATIONS_NOT_FOUND
      );
    }

    const existing = await prisma.dailyOperations.findUnique({
      where: { id: operationsId }
    });

    if (!existing) {
      throw new OperationsDataError(
        `运营数据不存在: ${operationsId}`,
        OperationsErrorCodes.OPERATIONS_NOT_FOUND
      );
    }

    // 删除支出项（级联删除）
    await prisma.expenseItem.deleteMany({
      where: { dailyOperationsId: operationsId }
    });

    // 删除运营数据
    await prisma.dailyOperations.delete({
      where: { id: operationsId }
    });
  }

  /**
   * 验证运营数据
   */
  validateOperationsData(input: DailyOperationsInput): DataValidationResult {
    return validateDailyOperationsData(input);
  }

  /**
   * 获取支出类别列表
   */
  getExpenseCategories(): { value: ExpenseCategory; label: string }[] {
    return [
      { value: ExpenseCategory.RAW_MATERIALS, label: '原材料' },
      { value: ExpenseCategory.LABOR, label: '人工' },
      { value: ExpenseCategory.RENT, label: '租金' },
      { value: ExpenseCategory.UTILITIES, label: '水电' },
      { value: ExpenseCategory.MARKETING, label: '营销' },
      { value: ExpenseCategory.EQUIPMENT, label: '设备' },
      { value: ExpenseCategory.MAINTENANCE, label: '维护' },
      { value: ExpenseCategory.OTHER, label: '其他' }
    ];
  }

  // =====================================================
  // 私有辅助方法
  // =====================================================

  /**
   * 映射数据库记录到 DailyOperationsData
   */
  private mapToDailyOperationsData(record: DailyOperationsRecord): DailyOperationsData {
    return {
      id: record.id,
      projectId: record.projectId,
      date: record.date,
      revenue: record.revenue,
      totalExpenses: record.totalExpenses,
      profit: record.profit,
      customerCount: record.customerCount || undefined,
      expenses: (record.expenses || []).map((e: ExpenseRecord) => ({
        id: e.id,
        dailyOperationsId: e.dailyOperationsId,
        category: e.category as ExpenseCategory,
        amount: e.amount,
        description: e.description || undefined,
        receiptUrl: e.receiptUrl || undefined,
        createdAt: e.createdAt
      })),
      notes: record.notes || undefined,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  /**
   * 创建模拟的每日运营数据
   */
  private createMockDailyOperations(
    input: DailyOperationsInput,
    userId: string,
    totalExpenses: number,
    profit: number
  ): DailyOperationsData {
    const now = new Date();
    return {
      id: `mock-${Date.now()}`,
      projectId: input.projectId,
      date: input.date,
      revenue: input.revenue,
      totalExpenses,
      profit,
      customerCount: input.customerCount,
      expenses: input.expenses.map((e, index) => ({
        id: `mock-expense-${index}`,
        dailyOperationsId: `mock-${Date.now()}`,
        category: e.category,
        amount: e.amount,
        description: e.description,
        receiptUrl: e.receiptUrl,
        createdAt: now
      })),
      notes: input.notes,
      createdBy: userId,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * 创建空的汇总数据
   */
  private createEmptySummary(projectId: string, dateRange: DateRange): OperationsSummary {
    return {
      projectId,
      dateRange,
      totalRevenue: 0,
      totalExpenses: 0,
      totalProfit: 0,
      averageDailyRevenue: 0,
      averageDailyExpenses: 0,
      averageDailyProfit: 0,
      totalCustomers: 0,
      expenseBreakdown: this.createEmptyExpenseBreakdown()
    };
  }

  /**
   * 创建空的支出明细
   */
  private createEmptyExpenseBreakdown(): ExpenseBreakdown {
    const breakdown: ExpenseBreakdown = {};
    Object.values(ExpenseCategory).forEach(category => {
      breakdown[category] = {
        amount: 0,
        percentage: 0,
        count: 0
      };
    });
    return breakdown;
  }

  /**
   * 按周汇总数据
   */
  private aggregateByWeek(
    dailyData: { date: Date; revenue: number }[]
  ): { week: string; amount: number }[] {
    const weekMap = new Map<string, number>();

    dailyData.forEach(d => {
      const date = new Date(d.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + d.revenue);
    });

    return Array.from(weekMap.entries())
      .map(([week, amount]) => ({ week, amount }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }

  /**
   * 按月汇总数据
   */
  private aggregateByMonth(
    dailyData: { date: Date; revenue: number }[]
  ): { month: string; amount: number }[] {
    const monthMap = new Map<string, number>();

    dailyData.forEach(d => {
      const date = new Date(d.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + d.revenue);
    });

    return Array.from(monthMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}

// 类型定义
interface DailyOperationsRecord {
  id: string;
  projectId: string;
  date: Date;
  revenue: number;
  totalExpenses: number;
  profit: number;
  customerCount: number | null;
  notes: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  expenses?: ExpenseRecord[];
}

interface ExpenseRecord {
  id: string;
  dailyOperationsId: string;
  category: string;
  amount: number;
  description: string | null;
  receiptUrl: string | null;
  createdAt: Date;
}

// 导出单例实例
export const operationsDataManager = new OperationsDataManager();

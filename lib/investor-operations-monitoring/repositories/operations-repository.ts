/**
 * 运营数据仓库
 * Operations Repository
 * 
 * 处理每日运营数据、支出明细等数据库操作
 */

import { BaseRepository } from './base-repository';
import { ExpenseCategory } from '@/types/investor-operations-monitoring';

export interface DailyOperationsData {
  id: string;
  date: Date;
  revenue: number;
  expenses: number;
  profit: number;
  customerCount: number;
  expenseBreakdown: ExpenseBreakdownItem[];
}

export interface ExpenseBreakdownItem {
  category: ExpenseCategory;
  amount: number;
  description: string;
}

export interface OperationsSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  averageDailyRevenue: number;
  averageDailyExpenses: number;
  averageDailyProfit: number;
  totalCustomers: number;
  operatingDays: number;
}

export interface CreateDailyOperationsInput {
  projectId: string;
  date: Date;
  revenue: number;
  customerCount: number;
  createdBy: string;
  expenses: Array<{
    category: ExpenseCategory;
    amount: number;
    description?: string;
    receiptUrl?: string;
  }>;
}

export class OperationsRepository extends BaseRepository {
  /**
   * 获取指定日期的运营数据
   */
  async getDailyOperations(
    projectId: string,
    date: Date
  ): Promise<DailyOperationsData | null> {
    return this.executeQuery(async () => {
      // 获取当天开始和结束时间
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const operations = await this.prisma.dailyOperations.findFirst({
        where: {
          projectId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          expenses: true,
        },
      });

      if (!operations) return null;

      const totalExpenses = operations.expenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );

      return {
        id: operations.id,
        date: operations.date,
        revenue: operations.revenue,
        expenses: totalExpenses,
        profit: operations.revenue - totalExpenses,
        customerCount: operations.customerCount,
        expenseBreakdown: operations.expenses.map(exp => ({
          category: exp.category as ExpenseCategory,
          amount: exp.amount,
          description: exp.description || '',
        })),
      };
    }, `Failed to get daily operations for project ${projectId}`);
  }

  /**
   * 获取日期范围内的运营数据列表
   */
  async getOperationsRange(
    projectId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailyOperationsData[]> {
    return this.executeQuery(async () => {
      const operationsList = await this.prisma.dailyOperations.findMany({
        where: {
          projectId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          expenses: true,
        },
        orderBy: { date: 'desc' },
      });

      return operationsList.map(operations => {
        const totalExpenses = operations.expenses.reduce(
          (sum, exp) => sum + exp.amount,
          0
        );
        return {
          id: operations.id,
          date: operations.date,
          revenue: operations.revenue,
          expenses: totalExpenses,
          profit: operations.revenue - totalExpenses,
          customerCount: operations.customerCount,
          expenseBreakdown: operations.expenses.map(exp => ({
            category: exp.category as ExpenseCategory,
            amount: exp.amount,
            description: exp.description || '',
          })),
        };
      });
    }, `Failed to get operations range for project ${projectId}`);
  }

  /**
   * 获取运营数据汇总
   */
  async getOperationsSummary(
    projectId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<OperationsSummary> {
    return this.executeQuery(async () => {
      const dateFilter = this.getDateRangeFilter(startDate, endDate);

      const operations = await this.prisma.dailyOperations.findMany({
        where: {
          projectId,
          ...(dateFilter && { date: dateFilter }),
        },
        include: {
          expenses: true,
        },
      });

      if (operations.length === 0) {
        return {
          totalRevenue: 0,
          totalExpenses: 0,
          totalProfit: 0,
          averageDailyRevenue: 0,
          averageDailyExpenses: 0,
          averageDailyProfit: 0,
          totalCustomers: 0,
          operatingDays: 0,
        };
      }

      let totalRevenue = 0;
      let totalExpenses = 0;
      let totalCustomers = 0;

      operations.forEach(op => {
        totalRevenue += op.revenue;
        totalExpenses += op.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        totalCustomers += op.customerCount;
      });

      const operatingDays = operations.length;
      const totalProfit = totalRevenue - totalExpenses;

      return {
        totalRevenue,
        totalExpenses,
        totalProfit,
        averageDailyRevenue: totalRevenue / operatingDays,
        averageDailyExpenses: totalExpenses / operatingDays,
        averageDailyProfit: totalProfit / operatingDays,
        totalCustomers,
        operatingDays,
      };
    }, `Failed to get operations summary for project ${projectId}`);
  }

  /**
   * 获取支出分类汇总
   */
  async getExpensesByCategory(
    projectId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Record<ExpenseCategory, number>> {
    return this.executeQuery(async () => {
      const dateFilter = this.getDateRangeFilter(startDate, endDate);

      const expenses = await this.prisma.expenseRecord.findMany({
        where: {
          dailyOperations: {
            projectId,
            ...(dateFilter && { date: dateFilter }),
          },
        },
      });

      const categoryTotals: Record<string, number> = {};
      
      expenses.forEach(exp => {
        if (!categoryTotals[exp.category]) {
          categoryTotals[exp.category] = 0;
        }
        categoryTotals[exp.category] += exp.amount;
      });

      return categoryTotals as Record<ExpenseCategory, number>;
    }, `Failed to get expenses by category for project ${projectId}`);
  }

  /**
   * 创建每日运营数据
   */
  async createDailyOperations(input: CreateDailyOperationsInput): Promise<DailyOperationsData> {
    return this.executeQuery(async () => {
      const totalExpenses = input.expenses.reduce((sum, exp) => sum + exp.amount, 0);

      const operations = await this.prisma.dailyOperations.create({
        data: {
          projectId: input.projectId,
          date: input.date,
          revenue: input.revenue,
          customerCount: input.customerCount,
          createdBy: input.createdBy,
          expenses: {
            create: input.expenses.map(exp => ({
              category: exp.category,
              amount: exp.amount,
              description: exp.description,
              receiptUrl: exp.receiptUrl,
            })),
          },
        },
        include: {
          expenses: true,
        },
      });

      return {
        id: operations.id,
        date: operations.date,
        revenue: operations.revenue,
        expenses: totalExpenses,
        profit: operations.revenue - totalExpenses,
        customerCount: operations.customerCount,
        expenseBreakdown: operations.expenses.map(exp => ({
          category: exp.category as ExpenseCategory,
          amount: exp.amount,
          description: exp.description || '',
        })),
      };
    }, `Failed to create daily operations for project ${input.projectId}`);
  }

  /**
   * 更新每日运营数据
   */
  async updateDailyOperations(
    operationsId: string,
    data: Partial<{
      revenue: number;
      customerCount: number;
    }>
  ): Promise<void> {
    return this.executeQuery(async () => {
      await this.prisma.dailyOperations.update({
        where: { id: operationsId },
        data,
      });
    }, `Failed to update daily operations ${operationsId}`);
  }

  /**
   * 获取年度固定支出估算
   */
  async getAnnualExpensesEstimate(projectId: string): Promise<{
    rent: number;
    utilities: number;
    taxes: number;
    insurance: number;
    maintenance: number;
  }> {
    return this.executeQuery(async () => {
      // 获取最近30天的支出数据来估算年度支出
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const categoryTotals = await this.getExpensesByCategory(
        projectId,
        thirtyDaysAgo,
        new Date()
      );

      // 将月度数据乘以12估算年度支出
      const monthlyMultiplier = 12;

      return {
        rent: (categoryTotals[ExpenseCategory.RENT] || 0) * monthlyMultiplier,
        utilities: (categoryTotals[ExpenseCategory.UTILITIES] || 0) * monthlyMultiplier,
        taxes: 0, // 税费需要单独计算
        insurance: 0, // 保险需要单独计算
        maintenance: (categoryTotals[ExpenseCategory.MAINTENANCE] || 0) * monthlyMultiplier,
      };
    }, `Failed to get annual expenses estimate for project ${projectId}`);
  }
}

// 导出单例实例
export const operationsRepository = new OperationsRepository();

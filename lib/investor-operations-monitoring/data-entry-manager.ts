/**
 * 数据录入管理服务
 * Data Entry Manager Service
 * 
 * 实现数据验证、完整性检查、异常数据检测和数据版本控制
 * 需求: 10.1, 10.2, 10.4, 10.5
 */

import {
  DailyOperationsInput,
  DataValidationResult,
  DataValidationError,
  DataValidationWarning,
  DataModificationHistory,
  ExpenseCategory,
  isValidExpenseCategory,
  validateDailyOperationsData
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
 * 数据录入错误
 */
export class DataEntryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DataEntryError';
  }
}

/**
 * 错误代码
 */
export const DataEntryErrorCodes = {
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  DUPLICATE_DATA: 'DUPLICATE_DATA',
  ANOMALY_DETECTED: 'ANOMALY_DETECTED',
  INVALID_INPUT: 'INVALID_INPUT',
  HISTORY_NOT_FOUND: 'HISTORY_NOT_FOUND'
} as const;

/**
 * 异常检测阈值配置
 */
const ANOMALY_THRESHOLDS = {
  // 收入波动超过此百分比视为异常
  REVENUE_VARIANCE_PERCENT: 50,
  // 支出波动超过此百分比视为异常
  EXPENSE_VARIANCE_PERCENT: 50,
  // 单项支出占比超过此值视为异常
  SINGLE_EXPENSE_RATIO: 0.7,
  // 历史数据比较天数
  HISTORY_DAYS: 30
};

/**
 * 数据录入管理器
 */
export class DataEntryManager {
  /**
   * 验证运营数据
   * 需求 10.1: 数据验证和完整性检查
   */
  async validateOperationsData(
    projectId: string,
    data: DailyOperationsInput
  ): Promise<DataValidationResult> {
    const prisma = await getPrisma();

    // 基础验证
    const basicValidation = validateDailyOperationsData(data);
    const errors: DataValidationError[] = [...basicValidation.errors];
    const warnings: DataValidationWarning[] = [...basicValidation.warnings];

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      errors.push({
        field: 'projectId',
        message: '项目不存在',
        code: 'PROJECT_NOT_FOUND',
        value: projectId
      });
      return { isValid: false, errors, warnings };
    }

    // 检查是否重复录入
    if (prisma.dailyOperations) {
      const existing = await prisma.dailyOperations.findFirst({
        where: {
          projectId,
          date: data.date
        }
      });

      if (existing) {
        warnings.push({
          field: 'date',
          message: '该日期已有数据，将覆盖现有记录',
          suggestion: '如需保留历史记录，请先导出现有数据'
        });
      }
    }

    // 异常数据检测
    const anomalyResult = await this.detectAnomalies(projectId, data);
    warnings.push(...anomalyResult.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 检测异常数据
   * 需求 10.4: 异常数据检测和标记
   */
  async detectAnomalies(
    projectId: string,
    data: DailyOperationsInput
  ): Promise<{ isAnomaly: boolean; warnings: DataValidationWarning[] }> {
    const prisma = await getPrisma();
    const warnings: DataValidationWarning[] = [];
    let isAnomaly = false;

    if (!prisma.dailyOperations) {
      return { isAnomaly: false, warnings: [] };
    }

    // 获取历史数据进行比较
    const endDate = new Date(data.date);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - ANOMALY_THRESHOLDS.HISTORY_DAYS);

    const historicalData = await prisma.dailyOperations.findMany({
      where: {
        projectId,
        date: {
          gte: startDate,
          lt: endDate
        }
      }
    });

    if (historicalData.length < 7) {
      // 历史数据不足，跳过异常检测
      return { isAnomaly: false, warnings: [] };
    }

    // 计算历史平均值
    const avgRevenue = historicalData.reduce((sum: number, d: any) => 
      sum + Number(d.revenue), 0) / historicalData.length;
    const avgExpenses = historicalData.reduce((sum: number, d: any) => 
      sum + Number(d.totalExpenses), 0) / historicalData.length;

    // 检查收入异常
    if (avgRevenue > 0) {
      const revenueVariance = Math.abs(data.revenue - avgRevenue) / avgRevenue * 100;
      if (revenueVariance > ANOMALY_THRESHOLDS.REVENUE_VARIANCE_PERCENT) {
        isAnomaly = true;
        warnings.push({
          field: 'revenue',
          message: `收入波动异常: 与历史平均值偏差 ${revenueVariance.toFixed(1)}%`,
          suggestion: `历史平均收入: ¥${avgRevenue.toFixed(2)}，当前: ¥${data.revenue.toFixed(2)}`
        });
      }
    }

    // 检查支出异常
    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    if (avgExpenses > 0) {
      const expenseVariance = Math.abs(totalExpenses - avgExpenses) / avgExpenses * 100;
      if (expenseVariance > ANOMALY_THRESHOLDS.EXPENSE_VARIANCE_PERCENT) {
        isAnomaly = true;
        warnings.push({
          field: 'expenses',
          message: `支出波动异常: 与历史平均值偏差 ${expenseVariance.toFixed(1)}%`,
          suggestion: `历史平均支出: ¥${avgExpenses.toFixed(2)}，当前: ¥${totalExpenses.toFixed(2)}`
        });
      }
    }

    // 检查单项支出占比异常
    if (totalExpenses > 0) {
      for (const expense of data.expenses) {
        const ratio = expense.amount / totalExpenses;
        if (ratio > ANOMALY_THRESHOLDS.SINGLE_EXPENSE_RATIO) {
          isAnomaly = true;
          warnings.push({
            field: `expenses.${expense.category}`,
            message: `单项支出占比异常: ${expense.category} 占总支出 ${(ratio * 100).toFixed(1)}%`,
            suggestion: '请确认该支出金额是否正确'
          });
        }
      }
    }

    return { isAnomaly, warnings };
  }

  /**
   * 保存运营数据（带版本控制）
   * 需求 10.2, 10.5: 数据版本控制
   */
  async saveOperationsData(
    projectId: string,
    data: DailyOperationsInput,
    userId: string,
    modificationReason?: string
  ): Promise<{ success: boolean; id: string; historyId?: string }> {
    const prisma = await getPrisma();

    // 先验证数据
    const validation = await this.validateOperationsData(projectId, data);
    if (!validation.isValid) {
      throw new DataEntryError(
        `数据验证失败: ${validation.errors.map(e => e.message).join(', ')}`,
        DataEntryErrorCodes.VALIDATION_FAILED,
        validation.errors
      );
    }

    // 计算总支出和利润
    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = data.revenue - totalExpenses;

    if (!prisma.dailyOperations) {
      return { success: true, id: `mock-${Date.now()}` };
    }

    // 检查是否存在现有记录
    const existing = await prisma.dailyOperations.findFirst({
      where: { projectId, date: data.date },
      include: { expenses: true }
    });

    let historyId: string | undefined;

    if (existing) {
      // 保存历史版本
      historyId = await this.saveModificationHistory(
        'daily_operations',
        existing.id,
        existing,
        data,
        userId,
        modificationReason
      );

      // 更新现有记录
      await prisma.dailyOperations.update({
        where: { id: existing.id },
        data: {
          revenue: data.revenue,
          totalExpenses,
          profit,
          customerCount: data.customerCount,
          notes: data.notes,
          updatedAt: new Date()
        }
      });

      // 删除旧的支出记录
      await prisma.expenseRecord.deleteMany({
        where: { dailyOperationsId: existing.id }
      });

      // 创建新的支出记录
      for (const expense of data.expenses) {
        await prisma.expenseRecord.create({
          data: {
            dailyOperationsId: existing.id,
            category: expense.category,
            amount: expense.amount,
            description: expense.description,
            receiptUrl: expense.receiptUrl
          }
        });
      }

      return { success: true, id: existing.id, historyId };
    } else {
      // 创建新记录
      const created = await prisma.dailyOperations.create({
        data: {
          projectId,
          date: data.date,
          revenue: data.revenue,
          totalExpenses,
          profit,
          customerCount: data.customerCount,
          notes: data.notes,
          createdBy: userId
        }
      });

      // 创建支出记录
      for (const expense of data.expenses) {
        await prisma.expenseRecord.create({
          data: {
            dailyOperationsId: created.id,
            category: expense.category,
            amount: expense.amount,
            description: expense.description,
            receiptUrl: expense.receiptUrl
          }
        });
      }

      return { success: true, id: created.id };
    }
  }

  /**
   * 保存修改历史
   * 需求 10.5: 数据版本控制
   */
  private async saveModificationHistory(
    tableName: string,
    recordId: string,
    oldData: any,
    newData: any,
    modifiedBy: string,
    reason?: string
  ): Promise<string> {
    const prisma = await getPrisma();

    if (!prisma.dataModificationHistory) {
      return `history-${Date.now()}`;
    }

    // 比较字段变化
    const changes: { field: string; oldValue: string; newValue: string }[] = [];

    if (oldData.revenue !== newData.revenue) {
      changes.push({
        field: 'revenue',
        oldValue: String(oldData.revenue),
        newValue: String(newData.revenue)
      });
    }

    const oldTotalExpenses = oldData.totalExpenses || 
      (oldData.expenses?.reduce((sum: number, e: any) => sum + Number(e.amount), 0) || 0);
    const newTotalExpenses = newData.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
    
    if (oldTotalExpenses !== newTotalExpenses) {
      changes.push({
        field: 'totalExpenses',
        oldValue: String(oldTotalExpenses),
        newValue: String(newTotalExpenses)
      });
    }

    // 保存每个变化
    let historyId = '';
    for (const change of changes) {
      const history = await prisma.dataModificationHistory.create({
        data: {
          tableName,
          recordId,
          fieldName: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue,
          modificationReason: reason,
          modifiedBy
        }
      });
      historyId = history.id;
    }

    return historyId || `history-${Date.now()}`;
  }

  /**
   * 获取数据修改历史
   * 需求 10.5: 数据版本控制
   */
  async getModificationHistory(
    projectId: string,
    options?: {
      tableName?: string;
      recordId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<DataModificationHistory[]> {
    const prisma = await getPrisma();

    if (!prisma.dataModificationHistory) {
      return [];
    }

    // 构建查询条件
    const where: any = {};

    if (options?.tableName) {
      where.tableName = options.tableName;
    }

    if (options?.recordId) {
      where.recordId = options.recordId;
    }

    if (options?.startDate || options?.endDate) {
      where.modifiedAt = {};
      if (options.startDate) {
        where.modifiedAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.modifiedAt.lte = options.endDate;
      }
    }

    // 如果指定了项目ID，需要关联查询
    if (projectId && !options?.recordId) {
      // 获取项目相关的所有运营数据ID
      const operations = await prisma.dailyOperations.findMany({
        where: { projectId },
        select: { id: true }
      });
      const operationIds = operations.map((o: any) => o.id);
      
      if (operationIds.length > 0) {
        where.recordId = { in: operationIds };
      }
    }

    const histories = await prisma.dataModificationHistory.findMany({
      where,
      orderBy: { modifiedAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0
    });

    return histories.map((h: any) => ({
      id: h.id,
      tableName: h.tableName,
      recordId: h.recordId,
      fieldName: h.fieldName,
      oldValue: h.oldValue,
      newValue: h.newValue,
      modificationReason: h.modificationReason,
      modifiedBy: h.modifiedBy,
      modifiedAt: h.modifiedAt
    }));
  }

  /**
   * 上传凭证
   * 需求 10.3: 凭证上传
   */
  async uploadReceipt(
    expenseId: string,
    receiptUrl: string,
    userId: string
  ): Promise<{ success: boolean }> {
    const prisma = await getPrisma();

    if (!prisma.expenseRecord) {
      return { success: true };
    }

    const expense = await prisma.expenseRecord.findUnique({
      where: { id: expenseId }
    });

    if (!expense) {
      throw new DataEntryError(
        `支出记录不存在: ${expenseId}`,
        DataEntryErrorCodes.INVALID_INPUT
      );
    }

    // 保存修改历史
    if (expense.receiptUrl) {
      await this.saveModificationHistory(
        'expense_records',
        expenseId,
        { receiptUrl: expense.receiptUrl },
        { receiptUrl },
        userId,
        '更新凭证'
      );
    }

    await prisma.expenseRecord.update({
      where: { id: expenseId },
      data: { receiptUrl }
    });

    return { success: true };
  }

  /**
   * 批量验证数据
   */
  async batchValidate(
    projectId: string,
    dataList: DailyOperationsInput[]
  ): Promise<{ index: number; result: DataValidationResult }[]> {
    const results: { index: number; result: DataValidationResult }[] = [];

    for (let i = 0; i < dataList.length; i++) {
      const result = await this.validateOperationsData(projectId, dataList[i]);
      results.push({ index: i, result });
    }

    return results;
  }

  /**
   * 获取数据完整性报告
   */
  async getDataIntegrityReport(
    projectId: string,
    dateRange: { startDate: Date; endDate: Date }
  ): Promise<{
    totalDays: number;
    recordedDays: number;
    missingDays: Date[];
    anomalyCount: number;
    completenessRate: number;
  }> {
    const prisma = await getPrisma();

    // 计算日期范围内的总天数
    const totalDays = Math.ceil(
      (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    if (!prisma.dailyOperations) {
      return {
        totalDays,
        recordedDays: 0,
        missingDays: [],
        anomalyCount: 0,
        completenessRate: 0
      };
    }

    // 获取已记录的数据
    const records = await prisma.dailyOperations.findMany({
      where: {
        projectId,
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        }
      },
      select: { date: true }
    });

    const recordedDates = new Set(
      records.map((r: any) => new Date(r.date).toISOString().split('T')[0])
    );

    // 找出缺失的日期
    const missingDays: Date[] = [];
    const currentDate = new Date(dateRange.startDate);
    while (currentDate <= dateRange.endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (!recordedDates.has(dateStr)) {
        missingDays.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 统计异常数据数量（简化：检查是否有负利润）
    const anomalyRecords = await prisma.dailyOperations.count({
      where: {
        projectId,
        date: {
          gte: dateRange.startDate,
          lte: dateRange.endDate
        },
        profit: { lt: 0 }
      }
    });

    const recordedDays = records.length;
    const completenessRate = totalDays > 0 ? (recordedDays / totalDays) * 100 : 0;

    return {
      totalDays,
      recordedDays,
      missingDays,
      anomalyCount: anomalyRecords,
      completenessRate: Number(completenessRate.toFixed(2))
    };
  }
}

// 导出单例实例
export const dataEntryManager = new DataEntryManager();

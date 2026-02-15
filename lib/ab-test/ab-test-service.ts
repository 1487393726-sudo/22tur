/**
 * A/B Test Service
 * A/B 测试服务
 */

import { randomUUID } from 'crypto';
import type {
  ABTest,
  ABTestVariant,
  ABTestAssignment,
  ABTestConversion,
  ABTestStatus,
  ABTestResults,
  VariantResults,
  CreateABTestParams,
  SignificanceParams,
  SignificanceResult,
} from './types';

// 模拟数据库存储
const tests = new Map<string, ABTest>();
const variants = new Map<string, ABTestVariant>();
const assignments = new Map<string, ABTestAssignment>();
const conversions: ABTestConversion[] = [];

// 用户分配缓存 (testId:userId -> variantId)
const userAssignmentCache = new Map<string, string>();

export class ABTestService {
  /**
   * 创建 A/B 测试
   */
  async createTest(params: CreateABTestParams): Promise<ABTest> {
    const testId = randomUUID();
    const now = new Date();

    // 验证变体分配总和
    const totalAllocation = params.variants.reduce((sum, v) => sum + v.allocation, 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
      throw new Error(`变体分配总和必须为 100%，当前为 ${totalAllocation}%`);
    }

    // 确保有且仅有一个对照组
    const controlCount = params.variants.filter((v) => v.isControl).length;
    if (controlCount === 0) {
      // 自动将第一个变体设为对照组
      params.variants[0].isControl = true;
    } else if (controlCount > 1) {
      throw new Error('只能有一个对照组');
    }

    // 创建变体
    const testVariants: ABTestVariant[] = params.variants.map((v) => {
      const variantId = randomUUID();
      const variant: ABTestVariant = {
        id: variantId,
        testId,
        name: v.name,
        description: v.description,
        allocation: v.allocation,
        isControl: v.isControl || false,
        config: v.config,
      };
      variants.set(variantId, variant);
      return variant;
    });

    // 创建测试
    const test: ABTest = {
      id: testId,
      name: params.name,
      description: params.description,
      status: 'DRAFT',
      variants: testVariants,
      targetAudience: params.targetAudience,
      startDate: params.startDate,
      endDate: params.endDate,
      createdBy: params.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    tests.set(testId, test);
    return test;
  }

  /**
   * 获取测试
   */
  async getTest(testId: string): Promise<ABTest | null> {
    return tests.get(testId) || null;
  }

  /**
   * 获取所有测试
   */
  async getAllTests(options?: {
    status?: ABTestStatus;
    page?: number;
    pageSize?: number;
  }): Promise<{ tests: ABTest[]; total: number }> {
    const { status, page = 1, pageSize = 10 } = options || {};

    let allTests = Array.from(tests.values());

    if (status) {
      allTests = allTests.filter((t) => t.status === status);
    }

    // 按创建时间倒序
    allTests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = allTests.length;
    const start = (page - 1) * pageSize;
    const paginatedTests = allTests.slice(start, start + pageSize);

    return { tests: paginatedTests, total };
  }

  /**
   * 启动测试
   */
  async startTest(testId: string): Promise<ABTest> {
    const test = await this.getTest(testId);
    if (!test) {
      throw new Error('测试不存在');
    }

    if (test.status !== 'DRAFT' && test.status !== 'PAUSED') {
      throw new Error(`无法启动状态为 ${test.status} 的测试`);
    }

    test.status = 'RUNNING';
    test.startDate = test.startDate || new Date();
    test.updatedAt = new Date();
    tests.set(testId, test);

    return test;
  }

  /**
   * 暂停测试
   */
  async pauseTest(testId: string): Promise<ABTest> {
    const test = await this.getTest(testId);
    if (!test) {
      throw new Error('测试不存在');
    }

    if (test.status !== 'RUNNING') {
      throw new Error('只能暂停运行中的测试');
    }

    test.status = 'PAUSED';
    test.updatedAt = new Date();
    tests.set(testId, test);

    return test;
  }

  /**
   * 结束测试
   */
  async endTest(testId: string): Promise<ABTest> {
    const test = await this.getTest(testId);
    if (!test) {
      throw new Error('测试不存在');
    }

    test.status = 'COMPLETED';
    test.endDate = new Date();
    test.updatedAt = new Date();
    tests.set(testId, test);

    return test;
  }

  /**
   * 为用户分配变体
   * 使用一致性哈希确保同一用户始终分配到同一变体
   */
  async assignVariant(testId: string, userId: string): Promise<ABTestVariant | null> {
    const test = await this.getTest(testId);
    if (!test || test.status !== 'RUNNING') {
      return null;
    }

    // 检查缓存
    const cacheKey = `${testId}:${userId}`;
    const cachedVariantId = userAssignmentCache.get(cacheKey);
    if (cachedVariantId) {
      return variants.get(cachedVariantId) || null;
    }

    // 检查是否已有分配记录
    const existingAssignment = Array.from(assignments.values()).find(
      (a) => a.testId === testId && a.userId === userId
    );

    if (existingAssignment) {
      userAssignmentCache.set(cacheKey, existingAssignment.variantId);
      return variants.get(existingAssignment.variantId) || null;
    }

    // 检查受众过滤
    if (test.targetAudience) {
      if (test.targetAudience.userIds && !test.targetAudience.userIds.includes(userId)) {
        return null;
      }
      if (test.targetAudience.percentage) {
        const hash = this.hashString(`${testId}:${userId}:audience`);
        if (hash > test.targetAudience.percentage) {
          return null;
        }
      }
    }

    // 使用一致性哈希分配变体
    const hash = this.hashString(`${testId}:${userId}`);
    let cumulative = 0;
    let selectedVariant: ABTestVariant | null = null;

    for (const variant of test.variants) {
      cumulative += variant.allocation;
      if (hash <= cumulative) {
        selectedVariant = variant;
        break;
      }
    }

    // 如果没有选中（浮点数精度问题），选择最后一个
    if (!selectedVariant) {
      selectedVariant = test.variants[test.variants.length - 1];
    }

    // 记录分配
    const assignment: ABTestAssignment = {
      id: randomUUID(),
      testId,
      variantId: selectedVariant.id,
      userId,
      assignedAt: new Date(),
    };
    assignments.set(assignment.id, assignment);
    userAssignmentCache.set(cacheKey, selectedVariant.id);

    return selectedVariant;
  }

  /**
   * 获取用户当前分配的变体
   */
  async getUserVariant(testId: string, userId: string): Promise<ABTestVariant | null> {
    const cacheKey = `${testId}:${userId}`;
    const cachedVariantId = userAssignmentCache.get(cacheKey);
    if (cachedVariantId) {
      return variants.get(cachedVariantId) || null;
    }

    const assignment = Array.from(assignments.values()).find(
      (a) => a.testId === testId && a.userId === userId
    );

    if (assignment) {
      userAssignmentCache.set(cacheKey, assignment.variantId);
      return variants.get(assignment.variantId) || null;
    }

    return null;
  }

  /**
   * 记录转化事件
   */
  async recordConversion(
    testId: string,
    userId: string,
    eventType: string,
    value?: number,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const test = await this.getTest(testId);
    if (!test) return false;

    // 获取用户分配的变体
    const variant = await this.getUserVariant(testId, userId);
    if (!variant) return false;

    const conversion: ABTestConversion = {
      id: randomUUID(),
      testId,
      variantId: variant.id,
      userId,
      eventType,
      value,
      metadata,
      createdAt: new Date(),
    };

    conversions.push(conversion);
    return true;
  }


  /**
   * 获取测试结果
   */
  async getTestResults(testId: string): Promise<ABTestResults> {
    const test = await this.getTest(testId);
    if (!test) {
      throw new Error('测试不存在');
    }

    const variantResults: VariantResults[] = [];
    let controlVariant: VariantResults | null = null;

    for (const variant of test.variants) {
      // 统计参与人数
      const participants = Array.from(assignments.values()).filter(
        (a) => a.testId === testId && a.variantId === variant.id
      ).length;

      // 统计转化数
      const variantConversions = conversions.filter(
        (c) => c.testId === testId && c.variantId === variant.id
      );
      const uniqueConversions = new Set(variantConversions.map((c) => c.userId)).size;

      const conversionRate = participants > 0 ? uniqueConversions / participants : 0;

      const result: VariantResults = {
        variantId: variant.id,
        variantName: variant.name,
        isControl: variant.isControl,
        allocation: variant.allocation,
        participants,
        conversions: uniqueConversions,
        conversionRate,
      };

      if (variant.isControl) {
        controlVariant = result;
      }

      variantResults.push(result);
    }

    // 计算相对于对照组的提升和统计显著性
    let isSignificant = false;
    let confidenceLevel = 0.95;
    let winner: string | undefined;

    if (controlVariant && controlVariant.participants > 0) {
      for (const result of variantResults) {
        if (!result.isControl && result.participants > 0) {
          // 计算提升百分比
          if (controlVariant.conversionRate > 0) {
            result.improvement =
              ((result.conversionRate - controlVariant.conversionRate) /
                controlVariant.conversionRate) *
              100;
          }

          // 计算统计显著性
          const significance = this.calculateSignificance({
            controlConversions: controlVariant.conversions,
            controlParticipants: controlVariant.participants,
            treatmentConversions: result.conversions,
            treatmentParticipants: result.participants,
          });

          result.confidenceInterval = significance.confidenceInterval;
          result.pValue = significance.pValue;

          if (significance.isSignificant && result.conversionRate > controlVariant.conversionRate) {
            isSignificant = true;
            if (!winner || result.conversionRate > (variantResults.find(v => v.variantId === winner)?.conversionRate || 0)) {
              winner = result.variantId;
            }
          }
        }
      }
    }

    return {
      testId: test.id,
      testName: test.name,
      status: test.status,
      startDate: test.startDate,
      endDate: test.endDate,
      variants: variantResults,
      winner,
      isSignificant,
      confidenceLevel,
    };
  }

  /**
   * 计算统计显著性 (使用 Z 检验)
   */
  calculateSignificance(params: SignificanceParams): SignificanceResult {
    const {
      controlConversions,
      controlParticipants,
      treatmentConversions,
      treatmentParticipants,
      confidenceLevel = 0.95,
    } = params;

    // 转化率
    const controlRate = controlParticipants > 0 ? controlConversions / controlParticipants : 0;
    const treatmentRate = treatmentParticipants > 0 ? treatmentConversions / treatmentParticipants : 0;

    // 相对提升
    const relativeImprovement = controlRate > 0 ? ((treatmentRate - controlRate) / controlRate) * 100 : 0;

    // 如果样本量太小，返回不显著
    if (controlParticipants < 30 || treatmentParticipants < 30) {
      return {
        isSignificant: false,
        pValue: 1,
        confidenceLevel,
        controlRate,
        treatmentRate,
        relativeImprovement,
        confidenceInterval: { lower: 0, upper: 0 },
        sampleSizeRecommendation: Math.max(100, controlParticipants * 2, treatmentParticipants * 2),
      };
    }

    // 合并转化率
    const pooledRate =
      (controlConversions + treatmentConversions) / (controlParticipants + treatmentParticipants);

    // 标准误差
    const standardError = Math.sqrt(
      pooledRate * (1 - pooledRate) * (1 / controlParticipants + 1 / treatmentParticipants)
    );

    // Z 值
    const zScore = standardError > 0 ? (treatmentRate - controlRate) / standardError : 0;

    // P 值 (双尾检验)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));

    // 置信区间
    const zCritical = this.getZCritical(confidenceLevel);
    const marginOfError = zCritical * standardError;
    const diff = treatmentRate - controlRate;

    return {
      isSignificant: pValue < (1 - confidenceLevel),
      pValue,
      confidenceLevel,
      controlRate,
      treatmentRate,
      relativeImprovement,
      confidenceInterval: {
        lower: diff - marginOfError,
        upper: diff + marginOfError,
      },
    };
  }

  /**
   * 一致性哈希函数
   * 返回 0-100 之间的值
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // 转换为 0-100 的值
    return Math.abs(hash % 10000) / 100;
  }

  /**
   * 标准正态分布累积分布函数
   */
  private normalCDF(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  }

  /**
   * 获取 Z 临界值
   */
  private getZCritical(confidenceLevel: number): number {
    // 常用置信水平对应的 Z 值
    const zValues: Record<number, number> = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576,
    };
    return zValues[confidenceLevel] || 1.96;
  }

  /**
   * 删除测试
   */
  async deleteTest(testId: string): Promise<boolean> {
    const test = await this.getTest(testId);
    if (!test) return false;

    if (test.status === 'RUNNING') {
      throw new Error('无法删除运行中的测试');
    }

    // 删除变体
    for (const variant of test.variants) {
      variants.delete(variant.id);
    }

    // 删除分配记录
    for (const [id, assignment] of assignments) {
      if (assignment.testId === testId) {
        assignments.delete(id);
      }
    }

    // 清除缓存
    for (const key of userAssignmentCache.keys()) {
      if (key.startsWith(`${testId}:`)) {
        userAssignmentCache.delete(key);
      }
    }

    tests.delete(testId);
    return true;
  }

  /**
   * 更新测试
   */
  async updateTest(
    testId: string,
    updates: Partial<Pick<ABTest, 'name' | 'description' | 'targetAudience' | 'endDate'>>
  ): Promise<ABTest> {
    const test = await this.getTest(testId);
    if (!test) {
      throw new Error('测试不存在');
    }

    if (test.status === 'COMPLETED' || test.status === 'ARCHIVED') {
      throw new Error('无法更新已完成或已归档的测试');
    }

    Object.assign(test, updates, { updatedAt: new Date() });
    tests.set(testId, test);

    return test;
  }
}

// 导出单例
export const abTestService = new ABTestService();

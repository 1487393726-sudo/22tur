/**
 * AI 助手监控和日志系统
 * 监控 AI 调用、性能指标和使用统计
 */

import { prisma } from '@/lib/prisma';

export interface AICallLog {
  id: string;
  userId: string;
  projectId?: string;
  conversationId?: string;
  operation: AIOperation;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  duration: number; // 毫秒
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT';
  errorMessage?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export type AIOperation = 
  | 'CHAT'
  | 'TASK_ANALYSIS'
  | 'PROGRESS_PREDICTION'
  | 'RISK_ANALYSIS'
  | 'RESOURCE_OPTIMIZATION'
  | 'REPORT_GENERATION'
  | 'CONTEXT_LEARNING';

export interface PerformanceMetrics {
  totalCalls: number;
  successRate: number;
  averageResponseTime: number;
  averageTokensPerCall: number;
  totalCost: number;
  errorRate: number;
  timeoutRate: number;
  topOperations: Array<{ operation: AIOperation; count: number }>;
  topUsers: Array<{ userId: string; count: number }>;
  topProjects: Array<{ projectId: string; count: number }>;
}

export interface UsageStatistics {
  period: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
  startDate: Date;
  endDate: Date;
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  uniqueUsers: number;
  uniqueProjects: number;
  operationBreakdown: Record<AIOperation, number>;
  hourlyDistribution: number[];
  dailyDistribution: number[];
}

export interface SystemHealth {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  uptime: number;
  responseTime: number;
  errorRate: number;
  queueLength: number;
  memoryUsage: number;
  cpuUsage: number;
  lastCheck: Date;
  issues: HealthIssue[];
}

export interface HealthIssue {
  type: 'PERFORMANCE' | 'ERROR' | 'RESOURCE' | 'QUOTA';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details: Record<string, any>;
  firstOccurred: Date;
  lastOccurred: Date;
  count: number;
}

export interface AlertThreshold {
  metric: string;
  operator: 'gt' | 'lt' | 'eq';
  value: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isActive: boolean;
}

/**
 * 记录 AI 调用日志
 */
export async function logAICall(callData: Omit<AICallLog, 'id' | 'createdAt'>): Promise<string> {
  try {
    const log = await prisma.aICallLog.create({
      data: {
        userId: callData.userId,
        projectId: callData.projectId,
        conversationId: callData.conversationId,
        operation: callData.operation,
        model: callData.model,
        inputTokens: callData.inputTokens,
        outputTokens: callData.outputTokens,
        totalTokens: callData.totalTokens,
        cost: callData.cost,
        duration: callData.duration,
        status: callData.status,
        errorMessage: callData.errorMessage,
        metadata: JSON.stringify(callData.metadata),
      },
    });

    return log.id;
  } catch (error) {
    console.error('Error logging AI call:', error);
    throw new Error('Failed to log AI call');
  }
}

/**
 * 获取性能指标
 */
export async function getPerformanceMetrics(
  startDate: Date,
  endDate: Date,
  projectId?: string
): Promise<PerformanceMetrics> {
  try {
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    // 获取基本统计
    const totalCalls = await prisma.aICallLog.count({ where: whereClause });
    
    const successfulCalls = await prisma.aICallLog.count({
      where: { ...whereClause, status: 'SUCCESS' },
    });

    const errorCalls = await prisma.aICallLog.count({
      where: { ...whereClause, status: 'ERROR' },
    });

    const timeoutCalls = await prisma.aICallLog.count({
      where: { ...whereClause, status: 'TIMEOUT' },
    });

    // 获取聚合数据
    const aggregateData = await prisma.aICallLog.aggregate({
      where: whereClause,
      _avg: {
        duration: true,
        totalTokens: true,
      },
      _sum: {
        cost: true,
      },
    });

    // 获取操作分布
    const operationStats = await prisma.aICallLog.groupBy({
      by: ['operation'],
      where: whereClause,
      _count: {
        operation: true,
      },
      orderBy: {
        _count: {
          operation: 'desc',
        },
      },
      take: 10,
    });

    // 获取用户分布
    const userStats = await prisma.aICallLog.groupBy({
      by: ['userId'],
      where: whereClause,
      _count: {
        userId: true,
      },
      orderBy: {
        _count: {
          userId: 'desc',
        },
      },
      take: 10,
    });

    // 获取项目分布
    const projectStats = await prisma.aICallLog.groupBy({
      by: ['projectId'],
      where: { ...whereClause, projectId: { not: null } },
      _count: {
        projectId: true,
      },
      orderBy: {
        _count: {
          projectId: 'desc',
        },
      },
      take: 10,
    });

    return {
      totalCalls,
      successRate: totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0,
      averageResponseTime: aggregateData._avg.duration || 0,
      averageTokensPerCall: aggregateData._avg.totalTokens || 0,
      totalCost: aggregateData._sum.cost || 0,
      errorRate: totalCalls > 0 ? (errorCalls / totalCalls) * 100 : 0,
      timeoutRate: totalCalls > 0 ? (timeoutCalls / totalCalls) * 100 : 0,
      topOperations: operationStats.map(stat => ({
        operation: stat.operation as AIOperation,
        count: stat._count.operation,
      })),
      topUsers: userStats.map(stat => ({
        userId: stat.userId,
        count: stat._count.userId,
      })),
      topProjects: projectStats.map(stat => ({
        projectId: stat.projectId!,
        count: stat._count.projectId,
      })),
    };
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    throw new Error('Failed to get performance metrics');
  }
}

/**
 * 获取使用统计
 */
export async function getUsageStatistics(
  period: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH',
  startDate: Date,
  endDate: Date
): Promise<UsageStatistics> {
  try {
    const whereClause = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // 基本统计
    const totalCalls = await prisma.aICallLog.count({ where: whereClause });
    
    const aggregateData = await prisma.aICallLog.aggregate({
      where: whereClause,
      _sum: {
        totalTokens: true,
        cost: true,
      },
    });

    // 唯一用户和项目
    const uniqueUsers = await prisma.aICallLog.findMany({
      where: whereClause,
      select: { userId: true },
      distinct: ['userId'],
    });

    const uniqueProjects = await prisma.aICallLog.findMany({
      where: { ...whereClause, projectId: { not: null } },
      select: { projectId: true },
      distinct: ['projectId'],
    });

    // 操作分布
    const operationBreakdown = await prisma.aICallLog.groupBy({
      by: ['operation'],
      where: whereClause,
      _count: {
        operation: true,
      },
    });

    const operationBreakdownMap = operationBreakdown.reduce((acc, item) => {
      acc[item.operation as AIOperation] = item._count.operation;
      return acc;
    }, {} as Record<AIOperation, number>);

    // 时间分布
    const hourlyDistribution = await getHourlyDistribution(startDate, endDate);
    const dailyDistribution = await getDailyDistribution(startDate, endDate);

    return {
      period,
      startDate,
      endDate,
      totalCalls,
      totalTokens: aggregateData._sum.totalTokens || 0,
      totalCost: aggregateData._sum.cost || 0,
      uniqueUsers: uniqueUsers.length,
      uniqueProjects: uniqueProjects.length,
      operationBreakdown: operationBreakdownMap,
      hourlyDistribution,
      dailyDistribution,
    };
  } catch (error) {
    console.error('Error getting usage statistics:', error);
    throw new Error('Failed to get usage statistics');
  }
}

/**
 * 获取系统健康状态
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 获取最近一小时的统计
    const recentCalls = await prisma.aICallLog.count({
      where: {
        createdAt: { gte: oneHourAgo },
      },
    });

    const recentErrors = await prisma.aICallLog.count({
      where: {
        createdAt: { gte: oneHourAgo },
        status: 'ERROR',
      },
    });

    const recentTimeouts = await prisma.aICallLog.count({
      where: {
        createdAt: { gte: oneHourAgo },
        status: 'TIMEOUT',
      },
    });

    // 计算平均响应时间
    const avgResponseTime = await prisma.aICallLog.aggregate({
      where: {
        createdAt: { gte: oneHourAgo },
        status: 'SUCCESS',
      },
      _avg: {
        duration: true,
      },
    });

    const errorRate = recentCalls > 0 ? ((recentErrors + recentTimeouts) / recentCalls) * 100 : 0;
    const responseTime = avgResponseTime._avg.duration || 0;

    // 检查健康问题
    const issues: HealthIssue[] = [];

    // 检查错误率
    if (errorRate > 10) {
      issues.push({
        type: 'ERROR',
        severity: errorRate > 25 ? 'CRITICAL' : errorRate > 15 ? 'HIGH' : 'MEDIUM',
        message: `高错误率: ${errorRate.toFixed(1)}%`,
        details: { errorRate, recentErrors, recentTimeouts, recentCalls },
        firstOccurred: oneHourAgo,
        lastOccurred: now,
        count: recentErrors + recentTimeouts,
      });
    }

    // 检查响应时间
    if (responseTime > 5000) {
      issues.push({
        type: 'PERFORMANCE',
        severity: responseTime > 10000 ? 'HIGH' : 'MEDIUM',
        message: `响应时间过长: ${responseTime.toFixed(0)}ms`,
        details: { responseTime },
        firstOccurred: oneHourAgo,
        lastOccurred: now,
        count: 1,
      });
    }

    // 确定整体状态
    let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
    if (issues.some(issue => issue.severity === 'CRITICAL')) {
      status = 'CRITICAL';
    } else if (issues.some(issue => issue.severity === 'HIGH' || issue.severity === 'MEDIUM')) {
      status = 'WARNING';
    }

    return {
      status,
      uptime: getUptime(),
      responseTime,
      errorRate,
      queueLength: 0, // 简化实现
      memoryUsage: getMemoryUsage(),
      cpuUsage: getCPUUsage(),
      lastCheck: now,
      issues,
    };
  } catch (error) {
    console.error('Error getting system health:', error);
    return {
      status: 'CRITICAL',
      uptime: 0,
      responseTime: 0,
      errorRate: 100,
      queueLength: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      lastCheck: new Date(),
      issues: [{
        type: 'ERROR',
        severity: 'CRITICAL',
        message: 'Failed to get system health',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        firstOccurred: new Date(),
        lastOccurred: new Date(),
        count: 1,
      }],
    };
  }
}

/**
 * 检查警报阈值
 */
export async function checkAlertThresholds(): Promise<HealthIssue[]> {
  try {
    const issues: HealthIssue[] = [];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 预定义的阈值
    const thresholds: AlertThreshold[] = [
      { metric: 'error_rate', operator: 'gt', value: 10, severity: 'MEDIUM', isActive: true },
      { metric: 'error_rate', operator: 'gt', value: 25, severity: 'CRITICAL', isActive: true },
      { metric: 'response_time', operator: 'gt', value: 5000, severity: 'MEDIUM', isActive: true },
      { metric: 'response_time', operator: 'gt', value: 10000, severity: 'HIGH', isActive: true },
      { metric: 'cost_per_hour', operator: 'gt', value: 10, severity: 'MEDIUM', isActive: true },
      { metric: 'cost_per_hour', operator: 'gt', value: 50, severity: 'HIGH', isActive: true },
    ];

    // 获取当前指标
    const metrics = await getPerformanceMetrics(oneHourAgo, now);

    // 检查每个阈值
    for (const threshold of thresholds) {
      if (!threshold.isActive) continue;

      let currentValue: number;
      let metricName: string;

      switch (threshold.metric) {
        case 'error_rate':
          currentValue = metrics.errorRate;
          metricName = '错误率';
          break;
        case 'response_time':
          currentValue = metrics.averageResponseTime;
          metricName = '响应时间';
          break;
        case 'cost_per_hour':
          currentValue = metrics.totalCost;
          metricName = '每小时成本';
          break;
        default:
          continue;
      }

      let thresholdExceeded = false;
      switch (threshold.operator) {
        case 'gt':
          thresholdExceeded = currentValue > threshold.value;
          break;
        case 'lt':
          thresholdExceeded = currentValue < threshold.value;
          break;
        case 'eq':
          thresholdExceeded = currentValue === threshold.value;
          break;
      }

      if (thresholdExceeded) {
        issues.push({
          type: 'PERFORMANCE',
          severity: threshold.severity,
          message: `${metricName}超过阈值: ${currentValue} ${threshold.operator} ${threshold.value}`,
          details: {
            metric: threshold.metric,
            currentValue,
            threshold: threshold.value,
            operator: threshold.operator,
          },
          firstOccurred: oneHourAgo,
          lastOccurred: now,
          count: 1,
        });
      }
    }

    return issues;
  } catch (error) {
    console.error('Error checking alert thresholds:', error);
    return [];
  }
}

/**
 * 生成监控报告
 */
export async function generateMonitoringReport(
  startDate: Date,
  endDate: Date,
  format: 'JSON' | 'TEXT' = 'JSON'
): Promise<string> {
  try {
    const metrics = await getPerformanceMetrics(startDate, endDate);
    const usage = await getUsageStatistics('DAY', startDate, endDate);
    const health = await getSystemHealth();

    const report = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        duration: `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days`,
      },
      performance: metrics,
      usage,
      health,
      generatedAt: new Date().toISOString(),
    };

    if (format === 'TEXT') {
      return formatReportAsText(report);
    }

    return JSON.stringify(report, null, 2);
  } catch (error) {
    console.error('Error generating monitoring report:', error);
    throw new Error('Failed to generate monitoring report');
  }
}

/**
 * 清理旧日志
 */
export async function cleanupOldLogs(retentionDays = 30): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const result = await prisma.aICallLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  } catch (error) {
    console.error('Error cleaning up old logs:', error);
    throw new Error('Failed to cleanup old logs');
  }
}

// 辅助函数
async function getHourlyDistribution(startDate: Date, endDate: Date): Promise<number[]> {
  const distribution = new Array(24).fill(0);
  
  try {
    const logs = await prisma.aICallLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    logs.forEach(log => {
      const hour = log.createdAt.getHours();
      distribution[hour]++;
    });
  } catch (error) {
    console.error('Error getting hourly distribution:', error);
  }

  return distribution;
}

async function getDailyDistribution(startDate: Date, endDate: Date): Promise<number[]> {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const distribution = new Array(days).fill(0);
  
  try {
    const logs = await prisma.aICallLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    logs.forEach(log => {
      const dayIndex = Math.floor((log.createdAt.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < distribution.length) {
        distribution[dayIndex]++;
      }
    });
  } catch (error) {
    console.error('Error getting daily distribution:', error);
  }

  return distribution;
}

function getUptime(): number {
  // 简化实现，返回进程运行时间
  return process.uptime() * 1000;
}

function getMemoryUsage(): number {
  const usage = process.memoryUsage();
  return (usage.heapUsed / usage.heapTotal) * 100;
}

function getCPUUsage(): number {
  // 简化实现，返回模拟值
  return Math.random() * 100;
}

function formatReportAsText(report: any): string {
  const lines: string[] = [];
  
  lines.push('AI 助手监控报告');
  lines.push('='.repeat(50));
  lines.push('');
  
  lines.push(`报告期间: ${report.period.start} - ${report.period.end}`);
  lines.push(`持续时间: ${report.period.duration}`);
  lines.push('');
  
  lines.push('性能指标');
  lines.push('-'.repeat(20));
  lines.push(`总调用次数: ${report.performance.totalCalls}`);
  lines.push(`成功率: ${report.performance.successRate.toFixed(1)}%`);
  lines.push(`平均响应时间: ${report.performance.averageResponseTime.toFixed(0)}ms`);
  lines.push(`总成本: $${report.performance.totalCost.toFixed(2)}`);
  lines.push(`错误率: ${report.performance.errorRate.toFixed(1)}%`);
  lines.push('');
  
  lines.push('使用统计');
  lines.push('-'.repeat(20));
  lines.push(`总 Token 数: ${report.usage.totalTokens}`);
  lines.push(`唯一用户数: ${report.usage.uniqueUsers}`);
  lines.push(`唯一项目数: ${report.usage.uniqueProjects}`);
  lines.push('');
  
  lines.push('系统健康');
  lines.push('-'.repeat(20));
  lines.push(`状态: ${report.health.status}`);
  lines.push(`运行时间: ${(report.health.uptime / 1000 / 60 / 60).toFixed(1)} 小时`);
  lines.push(`内存使用: ${report.health.memoryUsage.toFixed(1)}%`);
  
  if (report.health.issues.length > 0) {
    lines.push('');
    lines.push('健康问题');
    lines.push('-'.repeat(20));
    report.health.issues.forEach((issue: HealthIssue) => {
      lines.push(`- ${issue.message} (${issue.severity})`);
    });
  }
  
  lines.push('');
  lines.push(`报告生成时间: ${report.generatedAt}`);
  
  return lines.join('\n');
}
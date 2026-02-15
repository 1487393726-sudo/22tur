import { prisma } from '@/lib/prisma';
import type { ApiStatistics, ApiUsageLog, DateRange } from '@/types/api-management';

/**
 * Gets statistics for a connection
 */
export async function getStatistics(connectionId: string): Promise<ApiStatistics> {
  const logs = await prisma.apiUsageLog.findMany({
    where: { connectionId },
  });
  
  return calculateStatistics(connectionId, logs);
}

/**
 * Gets statistics for a connection within a date range
 */
export async function getStatisticsByDateRange(
  connectionId: string,
  dateRange: DateRange
): Promise<ApiStatistics> {
  const logs = await prisma.apiUsageLog.findMany({
    where: {
      connectionId,
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
  });
  
  return calculateStatistics(connectionId, logs);
}

/**
 * Logs an API call
 */
export async function logApiCall(input: {
  connectionId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}): Promise<ApiUsageLog> {
  const log = await prisma.apiUsageLog.create({
    data: {
      connectionId: input.connectionId,
      endpoint: input.endpoint,
      method: input.method,
      statusCode: input.statusCode,
      responseTime: input.responseTime,
      success: input.success,
      errorMessage: input.errorMessage,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
  
  return mapToApiUsageLog(log);
}


/**
 * Gets usage logs for a connection
 */
export async function getUsageLogs(
  connectionId: string,
  options?: {
    limit?: number;
    offset?: number;
    success?: boolean;
  }
): Promise<ApiUsageLog[]> {
  const where: Record<string, unknown> = { connectionId };
  if (options?.success !== undefined) where.success = options.success;
  
  const logs = await prisma.apiUsageLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit ?? 100,
    skip: options?.offset ?? 0,
  });
  
  return logs.map(mapToApiUsageLog);
}

/**
 * Gets usage logs within a date range
 */
export async function getLogsByDateRange(
  connectionId: string,
  dateRange: DateRange
): Promise<ApiUsageLog[]> {
  const logs = await prisma.apiUsageLog.findMany({
    where: {
      connectionId,
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return logs.map(mapToApiUsageLog);
}

/**
 * Checks if error threshold is exceeded
 */
export async function checkThreshold(
  connectionId: string,
  threshold: number,
  windowMinutes: number = 60
): Promise<{ exceeded: boolean; errorRate: number; errorCount: number }> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  
  const logs = await prisma.apiUsageLog.findMany({
    where: {
      connectionId,
      createdAt: { gte: windowStart },
    },
  });
  
  const totalCalls = logs.length;
  const errorCount = logs.filter((log) => !log.success).length;
  const errorRate = totalCalls > 0 ? (errorCount / totalCalls) * 100 : 0;
  
  return {
    exceeded: errorRate > threshold,
    errorRate,
    errorCount,
  };
}

/**
 * Gets daily statistics for a connection
 */
export async function getDailyStatistics(
  connectionId: string,
  days: number = 30
): Promise<Array<{ date: string; calls: number; success: number; avgResponseTime: number }>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  const logs = await prisma.apiUsageLog.findMany({
    where: {
      connectionId,
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'asc' },
  });
  
  // Group by date
  const dailyStats = new Map<string, { calls: number; success: number; totalResponseTime: number }>();
  
  for (const log of logs) {
    const dateKey = log.createdAt.toISOString().split('T')[0];
    const existing = dailyStats.get(dateKey) || { calls: 0, success: 0, totalResponseTime: 0 };
    
    existing.calls++;
    if (log.success) existing.success++;
    existing.totalResponseTime += log.responseTime;
    
    dailyStats.set(dateKey, existing);
  }
  
  // Convert to array
  return Array.from(dailyStats.entries()).map(([date, stats]) => ({
    date,
    calls: stats.calls,
    success: stats.success,
    avgResponseTime: stats.calls > 0 ? Math.round(stats.totalResponseTime / stats.calls) : 0,
  }));
}

/**
 * Gets top endpoints by usage
 */
export async function getTopEndpoints(
  connectionId: string,
  limit: number = 10
): Promise<Array<{ endpoint: string; calls: number; avgResponseTime: number }>> {
  const logs = await prisma.apiUsageLog.findMany({
    where: { connectionId },
  });
  
  // Group by endpoint
  const endpointStats = new Map<string, { calls: number; totalResponseTime: number }>();
  
  for (const log of logs) {
    const existing = endpointStats.get(log.endpoint) || { calls: 0, totalResponseTime: 0 };
    existing.calls++;
    existing.totalResponseTime += log.responseTime;
    endpointStats.set(log.endpoint, existing);
  }
  
  // Sort by calls and take top N
  return Array.from(endpointStats.entries())
    .map(([endpoint, stats]) => ({
      endpoint,
      calls: stats.calls,
      avgResponseTime: stats.calls > 0 ? Math.round(stats.totalResponseTime / stats.calls) : 0,
    }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, limit);
}

/**
 * Deletes old logs (for cleanup)
 */
export async function deleteOldLogs(connectionId: string, daysToKeep: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const result = await prisma.apiUsageLog.deleteMany({
    where: {
      connectionId,
      createdAt: { lt: cutoffDate },
    },
  });
  
  return result.count;
}

/**
 * Calculates statistics from logs
 */
function calculateStatistics(
  connectionId: string,
  logs: Array<{
    success: boolean;
    responseTime: number;
    errorMessage: string | null;
  }>
): ApiStatistics {
  const totalCalls = logs.length;
  const successCount = logs.filter((log) => log.success).length;
  const failureCount = totalCalls - successCount;
  const successRate = totalCalls > 0 ? (successCount / totalCalls) * 100 : 0;
  
  const totalResponseTime = logs.reduce((sum, log) => sum + log.responseTime, 0);
  const avgResponseTime = totalCalls > 0 ? Math.round(totalResponseTime / totalCalls) : 0;
  
  // Count errors by type
  const errorsByType: Record<string, number> = {};
  for (const log of logs) {
    if (!log.success && log.errorMessage) {
      const errorType = categorizeError(log.errorMessage);
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
    }
  }
  
  return {
    connectionId,
    totalCalls,
    successCount,
    failureCount,
    successRate: Math.round(successRate * 100) / 100,
    avgResponseTime,
    errorsByType,
  };
}

/**
 * Categorizes an error message
 */
function categorizeError(errorMessage: string): string {
  const lowerMessage = errorMessage.toLowerCase();
  
  if (lowerMessage.includes('timeout')) return 'TIMEOUT';
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('401')) return 'UNAUTHORIZED';
  if (lowerMessage.includes('forbidden') || lowerMessage.includes('403')) return 'FORBIDDEN';
  if (lowerMessage.includes('not found') || lowerMessage.includes('404')) return 'NOT_FOUND';
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('429')) return 'RATE_LIMITED';
  if (lowerMessage.includes('server error') || lowerMessage.includes('500')) return 'SERVER_ERROR';
  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) return 'NETWORK_ERROR';
  
  return 'OTHER';
}

/**
 * Maps Prisma model to ApiUsageLog type
 */
function mapToApiUsageLog(log: {
  id: string;
  connectionId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  success: boolean;
  errorMessage: string | null;
  metadata: string | null;
  createdAt: Date;
}): ApiUsageLog {
  return {
    id: log.id,
    connectionId: log.connectionId,
    endpoint: log.endpoint,
    method: log.method,
    statusCode: log.statusCode,
    responseTime: log.responseTime,
    success: log.success,
    errorMessage: log.errorMessage,
    metadata: log.metadata,
    createdAt: log.createdAt,
  };
}

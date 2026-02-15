/**
 * Audit Logger
 * Logs all AI assistant activities for security and compliance
 */

import { prisma } from '@/lib/prisma';

export interface AuditLogEntry {
  userId?: string;
  projectId?: string;
  conversationId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  status: 'success' | 'failed' | 'warning';
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        details: entry.details ? JSON.stringify(entry.details) : null,
        status: entry.status,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        risk: entry.status === 'failed' ? 'MEDIUM' : 'LOW',
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Log conversation access
 */
export async function logConversationAccess(
  userId: string,
  conversationId: string,
  action: 'view' | 'create' | 'delete' | 'archive',
  ipAddress?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    conversationId,
    action: `conversation_${action}`,
    resource: 'conversation',
    resourceId: conversationId,
    status: 'success',
    ipAddress,
  });
}

/**
 * Log message sent
 */
export async function logMessageSent(
  userId: string,
  conversationId: string,
  messageLength: number,
  ipAddress?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    conversationId,
    action: 'message_sent',
    resource: 'message',
    details: { messageLength },
    status: 'success',
    ipAddress,
  });
}

/**
 * Log analysis execution
 */
export async function logAnalysisExecution(
  userId: string,
  projectId: string,
  analysisType: string,
  duration: number,
  success: boolean,
  ipAddress?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    projectId,
    action: `analysis_${analysisType}`,
    resource: 'analysis',
    resourceId: projectId,
    details: { duration, analysisType },
    status: success ? 'success' : 'failed',
    ipAddress,
  });
}

/**
 * Log recommendation action
 */
export async function logRecommendationAction(
  userId: string,
  projectId: string,
  recommendationId: string,
  action: 'view' | 'apply' | 'reject' | 'rate',
  details?: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    projectId,
    action: `recommendation_${action}`,
    resource: 'recommendation',
    resourceId: recommendationId,
    details,
    status: 'success',
    ipAddress,
  });
}

/**
 * Log configuration change
 */
export async function logConfigChange(
  userId: string,
  projectId: string | null,
  changes: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    projectId: projectId || undefined,
    action: 'config_updated',
    resource: 'configuration',
    resourceId: projectId || 'global',
    details: changes,
    status: 'success',
    ipAddress,
  });
}

/**
 * Log failed access attempt
 */
export async function logFailedAccess(
  userId: string | undefined,
  resource: string,
  reason: string,
  ipAddress?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'access_denied',
    resource,
    details: { reason },
    status: 'failed',
    ipAddress,
    risk: 'MEDIUM',
  });
}

/**
 * Log API error
 */
export async function logAPIError(
  userId: string | undefined,
  endpoint: string,
  error: string,
  ipAddress?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'api_error',
    resource: endpoint,
    details: { error },
    status: 'failed',
    ipAddress,
    risk: 'MEDIUM',
  });
}

/**
 * Get audit logs for project
 */
export async function getProjectAuditLogs(
  projectId: string,
  limit: number = 100
): Promise<any[]> {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        resource: 'conversation',
        // Filter by project through conversation
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs;
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    return [];
  }
}

/**
 * Get audit logs for user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 100
): Promise<any[]> {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs;
  } catch (error) {
    console.error('Failed to get user audit logs:', error);
    return [];
  }
}

/**
 * Get recent security events
 */
export async function getRecentSecurityEvents(
  hoursBack: number = 24,
  limit: number = 50
): Promise<any[]> {
  try {
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const logs = await prisma.auditLog.findMany({
      where: {
        createdAt: { gte: since },
        status: { in: ['failed', 'warning'] },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs;
  } catch (error) {
    console.error('Failed to get security events:', error);
    return [];
  }
}

/**
 * Generate audit report
 */
export async function generateAuditReport(
  projectId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalEvents: number;
  successfulActions: number;
  failedActions: number;
  topUsers: Array<{ userId: string; count: number }>;
  topActions: Array<{ action: string; count: number }>;
}> {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const successfulActions = logs.filter((l) => l.status === 'success').length;
    const failedActions = logs.filter((l) => l.status === 'failed').length;

    // Count by user
    const userCounts = new Map<string, number>();
    logs.forEach((log) => {
      if (log.userId) {
        userCounts.set(log.userId, (userCounts.get(log.userId) || 0) + 1);
      }
    });

    const topUsers = Array.from(userCounts.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Count by action
    const actionCounts = new Map<string, number>();
    logs.forEach((log) => {
      actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
    });

    const topActions = Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: logs.length,
      successfulActions,
      failedActions,
      topUsers,
      topActions,
    };
  } catch (error) {
    console.error('Failed to generate audit report:', error);
    return {
      totalEvents: 0,
      successfulActions: 0,
      failedActions: 0,
      topUsers: [],
      topActions: [],
    };
  }
}

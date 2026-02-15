/**
 * 审计日志工具
 * 用于记录系统中的重要操作
 */

import { prisma } from '@/lib/prisma';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  status: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
}

/**
 * 记录审计日志
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    // 如果 AuditLog 表不存在，则跳过
    if (!prisma.auditLog) {
      console.log('[Audit]', entry.action, entry.resource, entry.status);
      return;
    }

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
        timestamp: new Date(),
      },
    });
  } catch (error) {
    // 审计日志失败不应该影响主业务流程
    console.error('[Audit Log Error]', error);
  }
}

/**
 * 记录成功的操作
 */
export async function logSuccess(
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, any>,
  userId?: string
): Promise<void> {
  await logAudit({
    userId,
    action,
    resource,
    resourceId,
    details,
    status: 'success',
  });
}

/**
 * 记录失败的操作
 */
export async function logFailure(
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, any>,
  userId?: string
): Promise<void> {
  await logAudit({
    userId,
    action,
    resource,
    resourceId,
    details,
    status: 'failure',
  });
}

/**
 * 记录用户登录
 */
export async function logLogin(userId: string, ipAddress?: string): Promise<void> {
  await logSuccess('LOGIN', 'USER', userId, { ipAddress }, userId);
}

/**
 * 记录用户登出
 */
export async function logLogout(userId: string): Promise<void> {
  await logSuccess('LOGOUT', 'USER', userId, {}, userId);
}

/**
 * 记录数据创建
 */
export async function logCreate(
  resource: string,
  resourceId: string,
  data?: Record<string, any>,
  userId?: string
): Promise<void> {
  await logSuccess('CREATE', resource, resourceId, { data }, userId);
}

/**
 * 记录数据更新
 */
export async function logUpdate(
  resource: string,
  resourceId: string,
  changes?: Record<string, any>,
  userId?: string
): Promise<void> {
  await logSuccess('UPDATE', resource, resourceId, { changes }, userId);
}

/**
 * 记录数据删除
 */
export async function logDelete(
  resource: string,
  resourceId: string,
  data?: Record<string, any>,
  userId?: string
): Promise<void> {
  await logSuccess('DELETE', resource, resourceId, { data }, userId);
}

/**
 * 记录数据访问
 */
export async function logAccess(
  resource: string,
  resourceId?: string,
  userId?: string
): Promise<void> {
  await logSuccess('ACCESS', resource, resourceId, {}, userId);
}

/**
 * 记录权限拒绝
 */
export async function logPermissionDenied(
  resource: string,
  resourceId?: string,
  userId?: string
): Promise<void> {
  await logFailure('ACCESS_DENIED', resource, resourceId, {}, userId);
}

/**
 * 记录错误
 */
export async function logError(
  action: string,
  resource: string,
  error: Error,
  userId?: string
): Promise<void> {
  await logFailure(action, resource, undefined, { error: error.message }, userId);
}

/**
 * 获取审计日志
 */
export async function getAuditLogs(
  filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    status?: 'success' | 'failure';
    startDate?: Date;
    endDate?: Date;
  },
  limit: number = 100,
  offset: number = 0
) {
  try {
    if (!prisma.auditLog) {
      return [];
    }

    const where: any = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.resource) {
      where.resource = filters.resource;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    return await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });
  } catch (error) {
    console.error('[Get Audit Logs Error]', error);
    return [];
  }
}

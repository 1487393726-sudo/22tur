/**
 * Audit Log System
 * Comprehensive audit logging for all security-relevant events
 * Ensures 100% completeness and immediate persistence
 */

import { prisma } from '@/lib/prisma';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  action: string;
  resourceId?: string;
  resourceType: string;
  result: 'SUCCESS' | 'FAILURE';
  originalState?: Record<string, any>;
  newState?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export interface AuditLogFilter {
  userId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  result?: 'SUCCESS' | 'FAILURE';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class AuditLogSystem {
  /**
   * Log an audit event
   * Ensures immediate persistence and 100% completeness
   */
  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent> {
    try {
      const auditEvent = await prisma.auditLog.create({
        data: {
          userId: event.userId,
          action: event.action,
          resource: event.resourceType, // Map resourceType to resource field
          resourceId: event.resourceId,
          status: event.result, // Map result to status field
          details: JSON.stringify({
            originalState: event.originalState,
            newState: event.newState,
            ...event.details
          }),
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
        },
      });

      return this.mapAuditEvent(auditEvent);
    } catch (error) {
      console.error('Critical: Failed to persist audit log', error);
      throw new Error('Audit log persistence failed');
    }
  }

  /**
   * Log a successful action
   */
  async logSuccess(
    action: string,
    resourceType: string,
    resourceId?: string,
    data?: {
      userId?: string;
      originalState?: Record<string, any>;
      newState?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, any>;
    }
  ): Promise<AuditEvent> {
    return this.logEvent({
      userId: data?.userId,
      action,
      resourceType,
      resourceId,
      result: 'SUCCESS',
      originalState: data?.originalState,
      newState: data?.newState,
      ipAddress: data?.ipAddress,
      userAgent: data?.userAgent,
      details: data?.details,
    });
  }

  /**
   * Log a failed action
   */
  async logFailure(
    action: string,
    resourceType: string,
    resourceId?: string,
    data?: {
      userId?: string;
      reason?: string;
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, any>;
    }
  ): Promise<AuditEvent> {
    return this.logEvent({
      userId: data?.userId,
      action,
      resourceType,
      resourceId,
      result: 'FAILURE',
      ipAddress: data?.ipAddress,
      userAgent: data?.userAgent,
      details: {
        reason: data?.reason,
        ...data?.details,
      },
    });
  }

  /**
   * Log access approval
   */
  async logAccessApproval(
    userId: string,
    resourceType: string,
    resourceId: string,
    data?: {
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, any>;
    }
  ): Promise<AuditEvent> {
    return this.logSuccess('ACCESS_APPROVED', resourceType, resourceId, {
      userId,
      ipAddress: data?.ipAddress,
      userAgent: data?.userAgent,
      details: data?.details,
    });
  }

  /**
   * Log access denial
   */
  async logAccessDenial(
    userId: string,
    resourceType: string,
    resourceId: string,
    data?: {
      reason?: string;
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, any>;
    }
  ): Promise<AuditEvent> {
    return this.logFailure('ACCESS_DENIED', resourceType, resourceId, {
      userId,
      reason: data?.reason,
      ipAddress: data?.ipAddress,
      userAgent: data?.userAgent,
      details: data?.details,
    });
  }

  /**
   * Log permission change
   */
  async logPermissionChange(
    userId: string,
    action: 'PERMISSION_CREATED' | 'PERMISSION_UPDATED' | 'PERMISSION_DELETED',
    permissionId: string,
    data?: {
      originalState?: Record<string, any>;
      newState?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<AuditEvent> {
    return this.logSuccess(action, 'PERMISSION', permissionId, {
      userId,
      originalState: data?.originalState,
      newState: data?.newState,
      ipAddress: data?.ipAddress,
      userAgent: data?.userAgent,
    });
  }

  /**
   * Log role change
   */
  async logRoleChange(
    userId: string,
    action: 'ROLE_CREATED' | 'ROLE_UPDATED' | 'ROLE_DELETED' | 'ROLE_ASSIGNED' | 'ROLE_REMOVED',
    roleId: string,
    data?: {
      targetUserId?: string;
      originalState?: Record<string, any>;
      newState?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<AuditEvent> {
    return this.logSuccess(action, 'ROLE', roleId, {
      userId,
      originalState: data?.originalState,
      newState: data?.newState,
      ipAddress: data?.ipAddress,
      userAgent: data?.userAgent,
      details: {
        targetUserId: data?.targetUserId,
      },
    });
  }

  /**
   * Query audit logs with filters
   */
  async queryLogs(filter: AuditLogFilter): Promise<AuditEvent[]> {
    const where: any = {};

    if (filter.userId) {
      where.userId = filter.userId;
    }

    if (filter.action) {
      where.action = filter.action;
    }

    if (filter.resourceType) {
      where.resource = filter.resourceType; // Map resourceType to resource field
    }

    if (filter.resourceId) {
      where.resourceId = filter.resourceId;
    }

    if (filter.result) {
      where.status = filter.result; // Map result to status field
    }

    if (filter.startDate || filter.endDate) {
      where.createdAt = {}; // Map to createdAt field
      if (filter.startDate) {
        where.createdAt.gte = filter.startDate;
      }
      if (filter.endDate) {
        where.createdAt.lte = filter.endDate;
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' }, // Map to createdAt field
      take: filter.limit ?? 100,
      skip: filter.offset ?? 0,
    });

    return logs.map((log) => this.mapAuditEvent(log));
  }

  /**
   * Get logs by user
   */
  async getLogsByUser(userId: string, timeRange?: { start: Date; end: Date }): Promise<AuditEvent[]> {
    return this.queryLogs({
      userId,
      startDate: timeRange?.start,
      endDate: timeRange?.end,
    });
  }

  /**
   * Get logs by resource
   */
  async getLogsByResource(
    resourceId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<AuditEvent[]> {
    return this.queryLogs({
      resourceId,
      startDate: timeRange?.start,
      endDate: timeRange?.end,
    });
  }

  /**
   * Get logs by action
   */
  async getLogsByAction(
    action: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<AuditEvent[]> {
    return this.queryLogs({
      action,
      startDate: timeRange?.start,
      endDate: timeRange?.end,
    });
  }

  /**
   * Get access logs (approvals and denials)
   */
  async getAccessLogs(
    timeRange?: { start: Date; end: Date }
  ): Promise<AuditEvent[]> {
    const approvals = await this.queryLogs({
      action: 'ACCESS_APPROVED',
      startDate: timeRange?.start,
      endDate: timeRange?.end,
    });

    const denials = await this.queryLogs({
      action: 'ACCESS_DENIED',
      startDate: timeRange?.start,
      endDate: timeRange?.end,
    });

    return [...approvals, ...denials].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get a single audit log entry
   */
  async getLogEntry(id: string): Promise<AuditEvent | null> {
    const log = await prisma.auditLog.findUnique({
      where: { id },
    });

    return log ? this.mapAuditEvent(log) : null;
  }

  /**
   * Map database audit log to AuditEvent
   */
  private mapAuditEvent(log: any): AuditEvent {
    let parsedDetails = {};
    try {
      if (log.details) {
        parsedDetails = JSON.parse(log.details);
      }
    } catch (error) {
      console.warn('Failed to parse audit log details:', error);
    }

    return {
      id: log.id,
      timestamp: log.createdAt, // Map createdAt to timestamp
      userId: log.userId,
      action: log.action,
      resourceId: log.resourceId,
      resourceType: log.resource, // Map resource to resourceType
      result: log.status, // Map status to result
      originalState: parsedDetails.originalState,
      newState: parsedDetails.newState,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      details: parsedDetails,
    };
  }
}

export const auditLogSystem = new AuditLogSystem();

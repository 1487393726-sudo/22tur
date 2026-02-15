/**
 * Audit Log Service for Enterprise Admin System
 * Records and manages all user operations and system events
 */

import { AuditLog, LoginLog, ValidationError } from '../types';
import { validateRequired, generateId, paginate } from '../utils';
import { AUDIT_ACTIONS } from '../constants';

/**
 * Audit Log Service
 * Handles recording and querying of audit logs
 */
export class AuditLogService {
  private auditLogs: Map<string, AuditLog> = new Map();
  private loginLogs: Map<string, LoginLog> = new Map();

  /**
   * Records an audit log entry
   */
  recordAuditLog(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    changes: Record<string, any>,
    ipAddress: string,
    userAgent?: string,
    status: 'success' | 'failure' = 'success',
    errorMessage?: string
  ): AuditLog {
    validateRequired(userId, 'User ID');
    validateRequired(action, 'Action');
    validateRequired(resource, 'Resource');
    validateRequired(resourceId, 'Resource ID');
    validateRequired(ipAddress, 'IP Address');

    const logId = generateId();
    const auditLog: AuditLog = {
      id: logId,
      userId,
      action,
      resource,
      resourceId,
      changes,
      timestamp: new Date(),
      ipAddress,
      userAgent,
      status,
      errorMessage,
    };

    this.auditLogs.set(logId, auditLog);
    return auditLog;
  }

  /**
   * Records a login event
   */
  recordLoginLog(
    userId: string,
    ipAddress: string,
    userAgent: string,
    status: 'success' | 'failure' = 'success',
    failureReason?: string
  ): LoginLog {
    validateRequired(userId, 'User ID');
    validateRequired(ipAddress, 'IP Address');
    validateRequired(userAgent, 'User Agent');

    const logId = generateId();
    const loginLog: LoginLog = {
      id: logId,
      userId,
      loginTime: new Date(),
      ipAddress,
      userAgent,
      status,
      failureReason,
    };

    this.loginLogs.set(logId, loginLog);
    return loginLog;
  }

  /**
   * Records a logout event
   */
  recordLogoutLog(loginLogId: string): LoginLog {
    const loginLog = this.getLoginLog(loginLogId);
    loginLog.logoutTime = new Date();
    this.loginLogs.set(loginLogId, loginLog);
    return loginLog;
  }

  /**
   * Gets an audit log by ID
   */
  getAuditLog(logId: string): AuditLog {
    const log = this.auditLogs.get(logId);
    if (!log) {
      throw new Error(`Audit log with id ${logId} not found`);
    }
    return log;
  }

  /**
   * Gets a login log by ID
   */
  getLoginLog(logId: string): LoginLog {
    const log = this.loginLogs.get(logId);
    if (!log) {
      throw new Error(`Login log with id ${logId} not found`);
    }
    return log;
  }

  /**
   * Gets all audit logs
   */
  getAllAuditLogs(): AuditLog[] {
    return Array.from(this.auditLogs.values());
  }

  /**
   * Gets all login logs
   */
  getAllLoginLogs(): LoginLog[] {
    return Array.from(this.loginLogs.values());
  }

  /**
   * Filters audit logs by criteria
   */
  filterAuditLogs(criteria: {
    userId?: string;
    action?: string;
    resource?: string;
    status?: 'success' | 'failure';
    startDate?: Date;
    endDate?: Date;
  }): AuditLog[] {
    let logs = this.getAllAuditLogs();

    if (criteria.userId) {
      logs = logs.filter((log) => log.userId === criteria.userId);
    }

    if (criteria.action) {
      logs = logs.filter((log) => log.action === criteria.action);
    }

    if (criteria.resource) {
      logs = logs.filter((log) => log.resource === criteria.resource);
    }

    if (criteria.status) {
      logs = logs.filter((log) => log.status === criteria.status);
    }

    if (criteria.startDate) {
      logs = logs.filter((log) => log.timestamp >= criteria.startDate!);
    }

    if (criteria.endDate) {
      logs = logs.filter((log) => log.timestamp <= criteria.endDate!);
    }

    return logs;
  }

  /**
   * Filters login logs by criteria
   */
  filterLoginLogs(criteria: {
    userId?: string;
    status?: 'success' | 'failure';
    startDate?: Date;
    endDate?: Date;
  }): LoginLog[] {
    let logs = this.getAllLoginLogs();

    if (criteria.userId) {
      logs = logs.filter((log) => log.userId === criteria.userId);
    }

    if (criteria.status) {
      logs = logs.filter((log) => log.status === criteria.status);
    }

    if (criteria.startDate) {
      logs = logs.filter((log) => log.loginTime >= criteria.startDate!);
    }

    if (criteria.endDate) {
      logs = logs.filter((log) => log.loginTime <= criteria.endDate!);
    }

    return logs;
  }

  /**
   * Searches audit logs by keyword
   */
  searchAuditLogs(keyword: string): AuditLog[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.getAllAuditLogs().filter(
      (log) =>
        log.userId.toLowerCase().includes(lowerKeyword) ||
        log.action.toLowerCase().includes(lowerKeyword) ||
        log.resource.toLowerCase().includes(lowerKeyword) ||
        log.resourceId.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * Gets audit logs for a specific user
   */
  getUserAuditLogs(userId: string): AuditLog[] {
    return this.filterAuditLogs({ userId });
  }

  /**
   * Gets login logs for a specific user
   */
  getUserLoginLogs(userId: string): LoginLog[] {
    return this.filterLoginLogs({ userId });
  }

  /**
   * Gets audit logs for a specific resource
   */
  getResourceAuditLogs(resource: string, resourceId: string): AuditLog[] {
    return this.getAllAuditLogs().filter(
      (log) => log.resource === resource && log.resourceId === resourceId
    );
  }

  /**
   * Gets audit logs for a specific action
   */
  getActionAuditLogs(action: string): AuditLog[] {
    return this.filterAuditLogs({ action });
  }

  /**
   * Gets failed operations
   */
  getFailedOperations(): AuditLog[] {
    return this.filterAuditLogs({ status: 'failure' });
  }

  /**
   * Gets failed login attempts
   */
  getFailedLoginAttempts(): LoginLog[] {
    return this.filterLoginLogs({ status: 'failure' });
  }

  /**
   * Gets failed login attempts for a user
   */
  getUserFailedLoginAttempts(userId: string): LoginLog[] {
    return this.filterLoginLogs({ userId, status: 'failure' });
  }

  /**
   * Counts audit logs by action
   */
  countByAction(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.getAllAuditLogs().forEach((log) => {
      counts[log.action] = (counts[log.action] || 0) + 1;
    });
    return counts;
  }

  /**
   * Counts audit logs by resource
   */
  countByResource(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.getAllAuditLogs().forEach((log) => {
      counts[log.resource] = (counts[log.resource] || 0) + 1;
    });
    return counts;
  }

  /**
   * Counts audit logs by user
   */
  countByUser(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.getAllAuditLogs().forEach((log) => {
      counts[log.userId] = (counts[log.userId] || 0) + 1;
    });
    return counts;
  }

  /**
   * Gets audit logs with pagination
   */
  getAuditLogsPaginated(
    page: number = 1,
    pageSize: number = 20,
    sortByField?: string
  ): {
    items: AuditLog[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  } {
    let logs = this.getAllAuditLogs();

    // Sort by timestamp descending by default
    logs = logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const result = paginate(logs, page, pageSize);
    return {
      items: result.items,
      total: result.total,
      page,
      pageSize,
      hasMore: result.hasMore,
    };
  }

  /**
   * Generates an audit report
   */
  generateAuditReport(startDate: Date, endDate: Date): {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    operationsByAction: Record<string, number>;
    operationsByResource: Record<string, number>;
    operationsByUser: Record<string, number>;
    topUsers: Array<{ userId: string; count: number }>;
    topResources: Array<{ resource: string; count: number }>;
  } {
    const logs = this.filterAuditLogs({ startDate, endDate });

    const totalOperations = logs.length;
    const successfulOperations = logs.filter((log) => log.status === 'success').length;
    const failedOperations = logs.filter((log) => log.status === 'failure').length;

    const operationsByAction: Record<string, number> = {};
    const operationsByResource: Record<string, number> = {};
    const operationsByUser: Record<string, number> = {};

    logs.forEach((log) => {
      operationsByAction[log.action] = (operationsByAction[log.action] || 0) + 1;
      operationsByResource[log.resource] = (operationsByResource[log.resource] || 0) + 1;
      operationsByUser[log.userId] = (operationsByUser[log.userId] || 0) + 1;
    });

    const topUsers = Object.entries(operationsByUser)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topResources = Object.entries(operationsByResource)
      .map(([resource, count]) => ({ resource, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      operationsByAction,
      operationsByResource,
      operationsByUser,
      topUsers,
      topResources,
    };
  }

  /**
   * Deletes old audit logs (for maintenance)
   */
  deleteOldLogs(beforeDate: Date): number {
    let deletedCount = 0;

    this.auditLogs.forEach((log, logId) => {
      if (log.timestamp < beforeDate) {
        this.auditLogs.delete(logId);
        deletedCount++;
      }
    });

    this.loginLogs.forEach((log, logId) => {
      if (log.loginTime < beforeDate) {
        this.loginLogs.delete(logId);
        deletedCount++;
      }
    });

    return deletedCount;
  }

  /**
   * Clears all data (for testing)
   */
  clear(): void {
    this.auditLogs.clear();
    this.loginLogs.clear();
  }
}

// Export singleton instance
export const auditLogService = new AuditLogService();

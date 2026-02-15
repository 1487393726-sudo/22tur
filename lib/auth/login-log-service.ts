// lib/auth/login-log-service.ts
// 登录日志服务

import { prisma } from '@/lib/prisma';
import type {
  LoginLog,
  LoginAttemptData,
  LoginLogFilters,
  GeoLocation,
} from '@/types/auth';

export class LoginLogService {
  /**
   * 记录登录尝试
   */
  static async logAttempt(data: LoginAttemptData): Promise<LoginLog> {
    const log = await prisma.loginLog.create({
      data: {
        userId: data.userId,
        identifier: data.identifier,
        ipAddress: data.ipAddress,
        browser: data.deviceInfo.browser,
        os: data.deviceInfo.os,
        location: data.deviceInfo.location
          ? JSON.stringify(data.deviceInfo.location)
          : null,
        result: data.result,
        failureReason: data.failureReason,
        method: data.method,
        provider: data.provider,
      },
    });

    return this.mapToLoginLog(log);
  }

  /**
   * 获取登录日志列表
   */
  static async getLogs(filters: LoginLogFilters): Promise<{
    logs: LoginLog[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where = this.buildWhereClause(filters);

    const [logs, total] = await Promise.all([
      prisma.loginLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.loginLog.count({ where }),
    ]);

    return {
      logs: logs.map(this.mapToLoginLog),
      total,
      page,
      pageSize,
    };
  }


  /**
   * 导出登录日志
   */
  static async exportLogs(
    filters: LoginLogFilters,
    format: 'csv' | 'json'
  ): Promise<string> {
    // 获取所有匹配的日志（不分页）
    const where = this.buildWhereClause(filters);
    const logs = await prisma.loginLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const mappedLogs = logs.map(this.mapToLoginLog);

    if (format === 'json') {
      return JSON.stringify(mappedLogs, null, 2);
    }

    // CSV 格式
    const headers = [
      'ID',
      'User ID',
      'Identifier',
      'IP Address',
      'Browser',
      'OS',
      'Location',
      'Result',
      'Failure Reason',
      'Method',
      'Provider',
      'Created At',
    ];

    const rows = mappedLogs.map((log) => [
      log.id,
      log.userId || '',
      log.identifier,
      log.ipAddress,
      log.browser || '',
      log.os || '',
      log.location ? JSON.stringify(log.location) : '',
      log.result,
      log.failureReason || '',
      log.method,
      log.provider || '',
      log.createdAt.toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    return csvContent;
  }

  /**
   * 获取用户最近的登录日志
   */
  static async getRecentLogsForUser(
    userId: string,
    limit: number = 10
  ): Promise<LoginLog[]> {
    const logs = await prisma.loginLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs.map(this.mapToLoginLog);
  }

  /**
   * 获取指定时间范围内的失败登录次数
   */
  static async getFailedAttemptsCount(
    identifier: string,
    since: Date
  ): Promise<number> {
    return prisma.loginLog.count({
      where: {
        identifier,
        result: 'FAILED',
        createdAt: { gte: since },
      },
    });
  }

  /**
   * 构建查询条件
   */
  private static buildWhereClause(filters: LoginLogFilters) {
    const where: Record<string, unknown> = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.identifier) {
      where.identifier = { contains: filters.identifier };
    }

    if (filters.result) {
      where.result = filters.result;
    }

    if (filters.method) {
      where.method = filters.method;
    }

    if (filters.provider) {
      where.provider = filters.provider;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        (where.createdAt as Record<string, Date>).gte = filters.startDate;
      }
      if (filters.endDate) {
        (where.createdAt as Record<string, Date>).lte = filters.endDate;
      }
    }

    return where;
  }

  /**
   * 映射数据库记录到 LoginLog 类型
   */
  private static mapToLoginLog(log: {
    id: string;
    userId: string | null;
    identifier: string;
    ipAddress: string;
    browser: string | null;
    os: string | null;
    location: string | null;
    result: string;
    failureReason: string | null;
    method: string;
    provider: string | null;
    deviceId: string | null;
    createdAt: Date;
  }): LoginLog {
    let location: GeoLocation | undefined;
    if (log.location) {
      try {
        location = JSON.parse(log.location) as GeoLocation;
      } catch {
        location = undefined;
      }
    }

    return {
      id: log.id,
      userId: log.userId || undefined,
      identifier: log.identifier,
      ipAddress: log.ipAddress,
      browser: log.browser || undefined,
      os: log.os || undefined,
      location,
      result: log.result as LoginLog['result'],
      failureReason: log.failureReason || undefined,
      method: log.method as LoginLog['method'],
      provider: log.provider as LoginLog['provider'],
      deviceId: log.deviceId || undefined,
      createdAt: log.createdAt,
    };
  }
}

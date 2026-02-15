/**
 * 安全事件检测器
 * 自动检测异常行为并创建安全事件
 */

import { prisma } from '@/lib/prisma';

export interface SecurityEventData {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

/**
 * 创建安全事件
 */
export async function createSecurityEvent(data: SecurityEventData): Promise<void> {
  try {
    await prisma.securityEvent.create({
      data: {
        type: data.type,
        severity: data.severity,
        description: data.description,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        details: data.details ? JSON.stringify(data.details) : undefined,
        resolved: false,
      },
    });

    console.log(`🚨 安全事件已创建: ${data.type} - ${data.severity}`);
  } catch (error) {
    console.error('创建安全事件失败:', error);
  }
}

/**
 * 检测登录失败次数
 * 如果同一 IP 或用户在短时间内多次登录失败，创建安全事件
 */
export async function detectLoginFailures(
  identifier: string, // IP 地址或用户 ID
  identifierType: 'ip' | 'user',
  timeWindowMinutes: number = 15,
  threshold: number = 5
): Promise<void> {
  try {
    const timeWindow = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    // 查询时间窗口内的登录失败记录
    const where: any = {
      action: 'LOGIN',
      status: 'FAILED',
      createdAt: { gte: timeWindow },
    };

    if (identifierType === 'ip') {
      where.ipAddress = identifier;
    } else {
      where.userId = identifier;
    }

    const failedAttempts = await prisma.auditLog.count({ where });

    // 如果失败次数超过阈值，创建安全事件
    if (failedAttempts >= threshold) {
      // 检查是否已经创建过相同的安全事件（避免重复）
      const existingEvent = await prisma.securityEvent.findFirst({
        where: {
          type: 'BRUTE_FORCE',
          [identifierType === 'ip' ? 'ipAddress' : 'userId']: identifier,
          resolved: false,
          createdAt: { gte: timeWindow },
        },
      });

      if (!existingEvent) {
        await createSecurityEvent({
          type: 'BRUTE_FORCE',
          severity: failedAttempts >= threshold * 2 ? 'CRITICAL' : 'HIGH',
          description: `检测到暴力破解尝试：${identifierType === 'ip' ? 'IP地址' : '用户'} ${identifier} 在 ${timeWindowMinutes} 分钟内失败登录 ${failedAttempts} 次`,
          [identifierType === 'ip' ? 'ipAddress' : 'userId']: identifier,
          details: {
            identifierType,
            identifier,
            failedAttempts,
            timeWindowMinutes,
            threshold,
          },
        });
      }
    }
  } catch (error) {
    console.error('检测登录失败失败:', error);
  }
}

/**
 * 检测异常 IP 登录
 * 如果用户从新的 IP 地址登录，创建安全事件
 */
export async function detectAbnormalIpLogin(
  userId: string,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  try {
    // 查询用户最近 30 天的登录记录
    const recentLogins = await prisma.auditLog.findMany({
      where: {
        userId,
        action: 'LOGIN',
        status: 'SUCCESS',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        ipAddress: true,
      },
      distinct: ['ipAddress'],
    });

    // 获取用户常用的 IP 地址列表
    const knownIps = recentLogins.map((log) => log.ipAddress).filter(Boolean);

    // 如果当前 IP 不在常用列表中，创建安全事件
    if (knownIps.length > 0 && !knownIps.includes(ipAddress)) {
      await createSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'MEDIUM',
        description: `检测到异常 IP 登录：用户从新的 IP 地址 ${ipAddress} 登录`,
        userId,
        ipAddress,
        userAgent,
        details: {
          newIp: ipAddress,
          knownIps: knownIps.slice(0, 5), // 只记录前 5 个常用 IP
          userAgent,
        },
      });
    }
  } catch (error) {
    console.error('检测异常 IP 登录失败:', error);
  }
}

/**
 * 检测频繁操作
 * 如果用户在短时间内执行大量操作，创建安全事件
 */
export async function detectFrequentOperations(
  userId: string,
  action: string,
  timeWindowMinutes: number = 5,
  threshold: number = 50
): Promise<void> {
  try {
    const timeWindow = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    // 查询时间窗口内的操作次数
    const operationCount = await prisma.auditLog.count({
      where: {
        userId,
        action,
        createdAt: { gte: timeWindow },
      },
    });

    // 如果操作次数超过阈值，创建安全事件
    if (operationCount >= threshold) {
      // 检查是否已经创建过相同的安全事件
      const existingEvent = await prisma.securityEvent.findFirst({
        where: {
          type: 'SUSPICIOUS_ACTIVITY',
          userId,
          resolved: false,
          createdAt: { gte: timeWindow },
          details: {
            contains: `"action":"${action}"`,
          },
        },
      });

      if (!existingEvent) {
        await createSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          severity: operationCount >= threshold * 2 ? 'HIGH' : 'MEDIUM',
          description: `检测到频繁操作：用户在 ${timeWindowMinutes} 分钟内执行 ${action} 操作 ${operationCount} 次`,
          userId,
          details: {
            action,
            operationCount,
            timeWindowMinutes,
            threshold,
          },
        });
      }
    }
  } catch (error) {
    console.error('检测频繁操作失败:', error);
  }
}

/**
 * 检测敏感操作
 * 对于删除、导出等敏感操作，创建安全事件
 */
export async function detectSensitiveOperation(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const sensitiveActions = ['DELETE', 'EXPORT', 'DOWNLOAD'];
    const sensitiveResources = ['users', 'security', 'admin', 'financial'];

    const isSensitiveAction = sensitiveActions.includes(action);
    const isSensitiveResource = sensitiveResources.some((r) =>
      resource.toLowerCase().includes(r)
    );

    if (isSensitiveAction || isSensitiveResource) {
      const severity = isSensitiveAction && isSensitiveResource ? 'HIGH' : 'MEDIUM';

      await createSecurityEvent({
        type: 'DATA_ACCESS',
        severity,
        description: `敏感操作：用户执行了 ${action} 操作，资源：${resource}${resourceId ? ` (${resourceId})` : ''}`,
        userId,
        ipAddress,
        userAgent,
        details: {
          action,
          resource,
          resourceId,
          isSensitiveAction,
          isSensitiveResource,
        },
      });
    }
  } catch (error) {
    console.error('检测敏感操作失败:', error);
  }
}

/**
 * 检测权限提升
 * 如果用户角色被修改，创建安全事件
 */
export async function detectPrivilegeEscalation(
  targetUserId: string,
  oldRole: string,
  newRole: string,
  operatorUserId: string,
  ipAddress?: string
): Promise<void> {
  try {
    const roleHierarchy: Record<string, number> = {
      USER: 1,
      EMPLOYEE: 2,
      MANAGER: 3,
      ADMIN: 4,
      SUPER_ADMIN: 5,
    };

    const oldLevel = roleHierarchy[oldRole] || 0;
    const newLevel = roleHierarchy[newRole] || 0;

    // 如果角色提升，创建安全事件
    if (newLevel > oldLevel) {
      await createSecurityEvent({
        type: 'SYSTEM_CHANGE',
        severity: newLevel >= 4 ? 'CRITICAL' : 'HIGH',
        description: `权限提升：用户角色从 ${oldRole} 提升到 ${newRole}`,
        userId: operatorUserId,
        ipAddress,
        details: {
          targetUserId,
          oldRole,
          newRole,
          oldLevel,
          newLevel,
          operatorUserId,
        },
      });
    }
  } catch (error) {
    console.error('检测权限提升失败:', error);
  }
}

/**
 * 检测数据泄露风险
 * 如果用户在短时间内导出或下载大量数据，创建安全事件
 */
export async function detectDataLeakageRisk(
  userId: string,
  timeWindowMinutes: number = 10,
  threshold: number = 10
): Promise<void> {
  try {
    const timeWindow = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    // 查询时间窗口内的导出和下载操作
    const dataAccessCount = await prisma.auditLog.count({
      where: {
        userId,
        action: { in: ['EXPORT', 'DOWNLOAD'] },
        createdAt: { gte: timeWindow },
      },
    });

    // 如果操作次数超过阈值，创建安全事件
    if (dataAccessCount >= threshold) {
      // 检查是否已经创建过相同的安全事件
      const existingEvent = await prisma.securityEvent.findFirst({
        where: {
          type: 'DATA_BREACH',
          userId,
          resolved: false,
          createdAt: { gte: timeWindow },
        },
      });

      if (!existingEvent) {
        await createSecurityEvent({
          type: 'DATA_BREACH',
          severity: 'CRITICAL',
          description: `检测到数据泄露风险：用户在 ${timeWindowMinutes} 分钟内执行 ${dataAccessCount} 次导出/下载操作`,
          userId,
          details: {
            dataAccessCount,
            timeWindowMinutes,
            threshold,
          },
        });
      }
    }
  } catch (error) {
    console.error('检测数据泄露风险失败:', error);
  }
}

/**
 * 综合安全检测
 * 在关键操作后调用，执行多项安全检测
 */
export async function performSecurityChecks(params: {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
}): Promise<void> {
  const { userId, action, resource, resourceId, ipAddress, userAgent, status } = params;

  try {
    // 1. 检测登录失败
    if (action === 'LOGIN' && status === 'FAILED') {
      if (ipAddress) {
        await detectLoginFailures(ipAddress, 'ip');
      }
      if (userId) {
        await detectLoginFailures(userId, 'user');
      }
    }

    // 2. 检测异常 IP 登录
    if (action === 'LOGIN' && status === 'SUCCESS' && userId && ipAddress) {
      await detectAbnormalIpLogin(userId, ipAddress, userAgent);
    }

    // 3. 检测频繁操作
    if (userId && status === 'SUCCESS') {
      await detectFrequentOperations(userId, action);
    }

    // 4. 检测敏感操作
    if (userId && status === 'SUCCESS') {
      await detectSensitiveOperation(userId, action, resource, resourceId, ipAddress, userAgent);
    }

    // 5. 检测数据泄露风险
    if (userId && ['EXPORT', 'DOWNLOAD'].includes(action) && status === 'SUCCESS') {
      await detectDataLeakageRisk(userId);
    }
  } catch (error) {
    console.error('执行安全检测失败:', error);
  }
}

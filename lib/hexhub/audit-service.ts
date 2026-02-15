import hexhubPrisma from './prisma'

export class HexHubAuditService {
  /**
   * 记录审计日志
   */
  static async logAction(data: {
    userId?: string
    action: string
    resource: string
    resourceId?: string
    details?: string
    ipAddress?: string
    userAgent?: string
  }) {
    return hexhubPrisma.hexHubAuditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  }

  /**
   * 获取审计日志
   */
  static async getAuditLogs(options?: {
    skip?: number
    take?: number
    userId?: string
    action?: string
    resource?: string
    startDate?: Date
    endDate?: Date
  }) {
    return hexhubPrisma.hexHubAuditLog.findMany({
      where: {
        userId: options?.userId,
        action: options?.action,
        resource: options?.resource,
        createdAt: {
          gte: options?.startDate,
          lte: options?.endDate,
        },
      },
      skip: options?.skip,
      take: options?.take,
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * 获取用户的审计日志
   */
  static async getUserAuditLogs(
    userId: string,
    options?: {
      skip?: number
      take?: number
      action?: string
    }
  ) {
    return hexhubPrisma.hexHubAuditLog.findMany({
      where: {
        userId,
        action: options?.action,
      },
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * 记录安全事件
   */
  static async logSecurityEvent(data: {
    type: string
    severity?: string
    description?: string
    userId?: string
    ipAddress?: string
  }) {
    return hexhubPrisma.hexHubSecurityEvent.create({
      data: {
        type: data.type,
        severity: data.severity || 'LOW',
        description: data.description,
        userId: data.userId,
        ipAddress: data.ipAddress,
      },
    })
  }

  /**
   * 获取安全事件
   */
  static async getSecurityEvents(options?: {
    skip?: number
    take?: number
    type?: string
    severity?: string
    status?: string
  }) {
    return hexhubPrisma.hexHubSecurityEvent.findMany({
      where: {
        type: options?.type,
        severity: options?.severity,
        status: options?.status,
      },
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * 解决安全事件
   */
  static async resolveSecurityEvent(id: string) {
    return hexhubPrisma.hexHubSecurityEvent.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    })
  }
}

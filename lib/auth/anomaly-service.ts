// lib/auth/anomaly-service.ts
// 异常检测服务

import { prisma } from '@/lib/prisma';
import type {
  AnomalyResult,
  DeviceInfo,
  GeoLocation,
  SecuritySeverity,
  SecurityEventType,
} from '@/types/auth';

// 配置常量
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;
const IMPOSSIBLE_TRAVEL_SPEED_KMH = 1000; // km/h

export class AnomalyService {
  /**
   * 检查登录是否异常
   */
  static async checkLogin(
    userId: string,
    deviceInfo: DeviceInfo
  ): Promise<AnomalyResult> {
    const reasons: string[] = [];
    let riskScore = 0;

    // 检查是否是新位置
    if (deviceInfo.location) {
      const isNew = await this.isNewLocation(userId, deviceInfo.location);
      if (isNew) {
        reasons.push('NEW_LOCATION');
        riskScore += 20;
      }
    }

    // 检查是否是新设备
    const existingDevice = await prisma.loginDevice.findFirst({
      where: {
        userId,
        fingerprint: deviceInfo.fingerprint,
        isRevoked: false,
      },
    });

    if (!existingDevice) {
      reasons.push('NEW_DEVICE');
      riskScore += 15;
    }

    // 检查不可能的旅行
    const impossibleTravel = await this.detectImpossibleTravel(userId, deviceInfo);
    if (impossibleTravel) {
      reasons.push('IMPOSSIBLE_TRAVEL');
      riskScore += 50;
    }

    return {
      suspicious: riskScore >= 30,
      reasons,
      requiresVerification: riskScore >= 50,
      riskScore,
    };
  }


  /**
   * 检查是否是新位置
   */
  static async isNewLocation(
    userId: string,
    location: GeoLocation
  ): Promise<boolean> {
    if (!location.country && !location.city) {
      return false;
    }

    // 获取用户历史登录位置
    const recentLogs = await prisma.loginLog.findMany({
      where: {
        userId,
        result: 'SUCCESS',
        location: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (recentLogs.length === 0) {
      return true; // 首次登录
    }

    // 检查是否有相同位置的历史记录
    for (const log of recentLogs) {
      if (log.location) {
        try {
          const logLocation = JSON.parse(log.location) as GeoLocation;
          if (
            logLocation.country === location.country &&
            logLocation.city === location.city
          ) {
            return false;
          }
        } catch {
          continue;
        }
      }
    }

    return true;
  }

  /**
   * 检测不可能的旅行
   */
  static async detectImpossibleTravel(
    userId: string,
    currentDeviceInfo: DeviceInfo
  ): Promise<boolean> {
    if (!currentDeviceInfo.location?.lat || !currentDeviceInfo.location?.lng) {
      return false;
    }

    // 获取最近一次成功登录
    const lastLogin = await prisma.loginLog.findFirst({
      where: {
        userId,
        result: 'SUCCESS',
        location: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastLogin || !lastLogin.location) {
      return false;
    }

    try {
      const lastLocation = JSON.parse(lastLogin.location) as GeoLocation;
      if (!lastLocation.lat || !lastLocation.lng) {
        return false;
      }

      // 计算距离（公里）
      const distance = this.calculateDistance(
        lastLocation.lat,
        lastLocation.lng,
        currentDeviceInfo.location.lat,
        currentDeviceInfo.location.lng
      );

      // 计算时间差（小时）
      const timeDiffHours =
        (Date.now() - lastLogin.createdAt.getTime()) / (1000 * 60 * 60);

      if (timeDiffHours <= 0) {
        return distance > 0; // 同一时间不同位置
      }

      // 计算所需速度
      const requiredSpeed = distance / timeDiffHours;

      return requiredSpeed > IMPOSSIBLE_TRAVEL_SPEED_KMH;
    } catch {
      return false;
    }
  }

  /**
   * 增加失败尝试次数
   */
  static async incrementFailedAttempts(identifier: string): Promise<number> {
    const existing = await prisma.accountLock.findUnique({
      where: { identifier },
    });

    if (existing) {
      // 如果锁已过期，重置计数
      if (existing.expiresAt < new Date() && !existing.unlockedAt) {
        await prisma.accountLock.update({
          where: { identifier },
          data: {
            attempts: 1,
            lockedAt: new Date(),
            expiresAt: new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000),
            unlockedAt: null,
            unlockedBy: null,
          },
        });
        return 1;
      }

      const updated = await prisma.accountLock.update({
        where: { identifier },
        data: { attempts: { increment: 1 } },
      });
      return updated.attempts;
    }

    // 创建新记录
    await prisma.accountLock.create({
      data: {
        identifier,
        reason: 'FAILED_LOGIN_ATTEMPTS',
        attempts: 1,
        expiresAt: new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000),
      },
    });

    return 1;
  }

  /**
   * 检查账户是否被锁定
   */
  static async isAccountLocked(identifier: string): Promise<boolean> {
    const lock = await prisma.accountLock.findUnique({
      where: { identifier },
    });

    if (!lock) {
      return false;
    }

    // 已手动解锁
    if (lock.unlockedAt) {
      return false;
    }

    // 锁已过期
    if (lock.expiresAt < new Date()) {
      return false;
    }

    // 尝试次数达到阈值
    return lock.attempts >= MAX_FAILED_ATTEMPTS;
  }


  /**
   * 锁定账户
   */
  static async lockAccount(identifier: string, reason: string): Promise<void> {
    const expiresAt = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);

    await prisma.accountLock.upsert({
      where: { identifier },
      create: {
        identifier,
        reason,
        attempts: MAX_FAILED_ATTEMPTS,
        expiresAt,
      },
      update: {
        reason,
        attempts: MAX_FAILED_ATTEMPTS,
        lockedAt: new Date(),
        expiresAt,
        unlockedAt: null,
        unlockedBy: null,
      },
    });

    // 记录安全事件
    await this.createSecurityEvent({
      eventType: 'ACCOUNT_LOCKED',
      severity: 'HIGH',
      description: `Account locked: ${reason}`,
      metadata: { identifier, reason },
    });
  }

  /**
   * 解锁账户
   */
  static async unlockAccount(
    identifier: string,
    unlockedBy?: string
  ): Promise<void> {
    await prisma.accountLock.update({
      where: { identifier },
      data: {
        unlockedAt: new Date(),
        unlockedBy,
      },
    });
  }

  /**
   * 获取账户锁定信息
   */
  static async getAccountLock(identifier: string) {
    return prisma.accountLock.findUnique({
      where: { identifier },
    });
  }

  /**
   * 获取安全事件列表
   */
  static async getSecurityEvents(filters: {
    userId?: string;
    eventType?: SecurityEventType;
    severity?: SecuritySeverity;
    resolved?: boolean;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    pageSize?: number;
  }) {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.eventType) where.eventType = filters.eventType;
    if (filters.severity) where.severity = filters.severity;
    if (filters.resolved !== undefined) where.resolved = filters.resolved;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        (where.createdAt as Record<string, Date>).gte = filters.startDate;
      }
      if (filters.endDate) {
        (where.createdAt as Record<string, Date>).lte = filters.endDate;
      }
    }

    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.securityEvent.count({ where }),
    ]);

    return { events, total, page, pageSize };
  }

  /**
   * 创建安全事件
   */
  static async createSecurityEvent(data: {
    userId?: string;
    eventType: SecurityEventType;
    severity: SecuritySeverity;
    description: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    return prisma.securityEvent.create({
      data: {
        userId: data.userId,
        eventType: data.eventType,
        severity: data.severity,
        description: data.description,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        ipAddress: data.ipAddress,
      },
    });
  }

  /**
   * 解决安全事件
   */
  static async resolveSecurityEvent(
    eventId: string,
    resolvedBy: string
  ): Promise<void> {
    await prisma.securityEvent.update({
      where: { id: eventId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy,
      },
    });
  }

  /**
   * 计算两点之间的距离（Haversine 公式）
   */
  private static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

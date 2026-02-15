// lib/auth/device-service.ts
// 设备管理服务 - 登录设备记录和会话管理

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import type { LoginDevice, DeviceInfo, GeoLocation } from '@/types/auth';

/**
 * Device Service - Handles login device management
 */
export class DeviceService {
  /**
   * Generate a device fingerprint from device info
   */
  static generateFingerprint(deviceInfo: DeviceInfo): string {
    const data = `${deviceInfo.browser}|${deviceInfo.os}|${deviceInfo.userAgent}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
  }

  /**
   * Record a new device login
   */
  static async recordDevice(
    userId: string,
    deviceInfo: DeviceInfo
  ): Promise<LoginDevice> {
    const fingerprint = deviceInfo.fingerprint || this.generateFingerprint(deviceInfo);
    const locationJson = deviceInfo.location ? JSON.stringify(deviceInfo.location) : null;

    // Upsert device - update if exists, create if not
    const device = await prisma.loginDevice.upsert({
      where: {
        userId_fingerprint: {
          userId,
          fingerprint,
        },
      },
      create: {
        userId,
        fingerprint,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ipAddress: deviceInfo.ipAddress,
        location: locationJson,
        userAgent: deviceInfo.userAgent,
        lastActiveAt: new Date(),
        isRevoked: false,
      },
      update: {
        ipAddress: deviceInfo.ipAddress,
        location: locationJson,
        lastActiveAt: new Date(),
        isRevoked: false,
        revokedAt: null,
      },
    });

    return this.mapToLoginDevice(device);
  }

  /**
   * Get all devices for a user
   */
  static async getDevices(userId: string): Promise<LoginDevice[]> {
    const devices = await prisma.loginDevice.findMany({
      where: {
        userId,
        isRevoked: false,
      },
      orderBy: {
        lastActiveAt: 'desc',
      },
    });

    return devices.map(this.mapToLoginDevice);
  }

  /**
   * Revoke a specific device session
   */
  static async revokeDevice(userId: string, deviceId: string): Promise<void> {
    await prisma.loginDevice.updateMany({
      where: {
        id: deviceId,
        userId,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Revoke all devices except the current one
   */
  static async revokeAllDevices(
    userId: string,
    exceptFingerprint?: string
  ): Promise<number> {
    const result = await prisma.loginDevice.updateMany({
      where: {
        userId,
        isRevoked: false,
        ...(exceptFingerprint && {
          NOT: {
            fingerprint: exceptFingerprint,
          },
        }),
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Check if a device is new for the user
   */
  static async isNewDevice(userId: string, fingerprint: string): Promise<boolean> {
    const device = await prisma.loginDevice.findUnique({
      where: {
        userId_fingerprint: {
          userId,
          fingerprint,
        },
      },
    });

    return !device || device.isRevoked;
  }

  /**
   * Check if a device session is valid (not revoked)
   */
  static async isDeviceValid(userId: string, fingerprint: string): Promise<boolean> {
    const device = await prisma.loginDevice.findUnique({
      where: {
        userId_fingerprint: {
          userId,
          fingerprint,
        },
      },
    });

    return device !== null && !device.isRevoked;
  }

  /**
   * Update device last active time
   */
  static async updateLastActive(userId: string, fingerprint: string): Promise<void> {
    await prisma.loginDevice.updateMany({
      where: {
        userId,
        fingerprint,
        isRevoked: false,
      },
      data: {
        lastActiveAt: new Date(),
      },
    });
  }

  /**
   * Get device by ID
   */
  static async getDeviceById(
    userId: string,
    deviceId: string
  ): Promise<LoginDevice | null> {
    const device = await prisma.loginDevice.findFirst({
      where: {
        id: deviceId,
        userId,
      },
    });

    return device ? this.mapToLoginDevice(device) : null;
  }

  /**
   * Get device count for a user
   */
  static async getDeviceCount(userId: string): Promise<number> {
    return prisma.loginDevice.count({
      where: {
        userId,
        isRevoked: false,
      },
    });
  }

  /**
   * Clean up old revoked devices
   */
  static async cleanupRevokedDevices(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.loginDevice.deleteMany({
      where: {
        isRevoked: true,
        revokedAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  /**
   * Map Prisma model to LoginDevice type
   */
  private static mapToLoginDevice(device: any): LoginDevice {
    let location: GeoLocation | undefined;
    if (device.location) {
      try {
        location = JSON.parse(device.location);
      } catch {
        location = undefined;
      }
    }

    return {
      id: device.id,
      userId: device.userId,
      fingerprint: device.fingerprint,
      browser: device.browser,
      os: device.os,
      ipAddress: device.ipAddress,
      location,
      userAgent: device.userAgent,
      lastActiveAt: device.lastActiveAt,
      createdAt: device.createdAt,
      isRevoked: device.isRevoked,
      revokedAt: device.revokedAt || undefined,
    };
  }

  /**
   * Parse user agent to extract browser and OS info
   */
  static parseUserAgent(userAgent: string): { browser: string; os: string } {
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect browser
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
    } else if (userAgent.includes('Edg')) {
      browser = 'Edge';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      browser = 'Opera';
    }

    // Detect OS (order matters - check more specific first)
    if (userAgent.includes('Android')) {
      os = 'Android';
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      os = 'iOS';
    } else if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Mac OS')) {
      os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    }

    return { browser, os };
  }
}

export default DeviceService;

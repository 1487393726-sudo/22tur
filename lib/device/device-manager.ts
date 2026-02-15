/**
 * Device Management System
 * Manages device fingerprints, trust scores, and device-based access control
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export interface DeviceInfo {
  id: string;
  fingerprint: string;
  name: string;
  owner: string;
  trustScore: number;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPROMISED';
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceSession {
  id: string;
  deviceId: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export class DeviceManager {
  /**
   * Generate device fingerprint
   * Based on hardware and software characteristics
   */
  generateFingerprint(data: {
    userAgent: string;
    ipAddress: string;
    screenResolution?: string;
    timezone?: string;
    language?: string;
    platform?: string;
  }): string {
    const fingerprintData = [
      data.userAgent,
      data.ipAddress,
      data.screenResolution || 'unknown',
      data.timezone || 'unknown',
      data.language || 'unknown',
      data.platform || 'unknown',
    ].join('|');

    return crypto.createHash('sha256').update(fingerprintData).digest('hex');
  }

  /**
   * Register a new device
   */
  async registerDevice(data: {
    fingerprint: string;
    name: string;
    owner: string;
  }): Promise<DeviceInfo> {
    try {
      const device = await prisma.device.create({
        data: {
          fingerprint: data.fingerprint,
          name: data.name,
          owner: data.owner,
          trustScore: 100, // Start with full trust
          status: 'ACTIVE',
          lastSeen: new Date(),
        },
      });

      return device as DeviceInfo;
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new Error(`Device with fingerprint "${data.fingerprint}" already exists`);
      }
      throw error;
    }
  }

  /**
   * Get device by fingerprint
   */
  async getDevice(fingerprint: string): Promise<DeviceInfo | null> {
    const device = await prisma.device.findUnique({
      where: { fingerprint },
    });

    return device as DeviceInfo | null;
  }

  /**
   * Get device by ID
   */
  async getDeviceById(id: string): Promise<DeviceInfo | null> {
    const device = await prisma.device.findUnique({
      where: { id },
    });

    return device as DeviceInfo | null;
  }

  /**
   * Get all devices for a user
   */
  async getUserDevices(owner: string): Promise<DeviceInfo[]> {
    const devices = await prisma.device.findMany({
      where: { owner },
      orderBy: { lastSeen: 'desc' },
    });

    return devices as DeviceInfo[];
  }

  /**
   * Update device
   */
  async updateDevice(
    fingerprint: string,
    data: Partial<{
      name: string;
      status: 'ACTIVE' | 'INACTIVE' | 'COMPROMISED';
    }>
  ): Promise<DeviceInfo> {
    const device = await prisma.device.update({
      where: { fingerprint },
      data: {
        ...data,
        lastSeen: new Date(),
      },
    });

    return device as DeviceInfo;
  }

  /**
   * Update device trust score
   */
  async updateTrustScore(fingerprint: string, score: number): Promise<DeviceInfo> {
    // Ensure score is between 0 and 100
    const normalizedScore = Math.max(0, Math.min(100, score));

    const device = await prisma.device.update({
      where: { fingerprint },
      data: {
        trustScore: normalizedScore,
        lastSeen: new Date(),
      },
    });

    return device as DeviceInfo;
  }

  /**
   * Decrease trust score
   */
  async decreaseTrustScore(fingerprint: string, amount: number = 10): Promise<DeviceInfo> {
    const device = await this.getDevice(fingerprint);
    if (!device) {
      throw new Error(`Device with fingerprint "${fingerprint}" not found`);
    }

    return this.updateTrustScore(fingerprint, device.trustScore - amount);
  }

  /**
   * Increase trust score
   */
  async increaseTrustScore(fingerprint: string, amount: number = 5): Promise<DeviceInfo> {
    const device = await this.getDevice(fingerprint);
    if (!device) {
      throw new Error(`Device with fingerprint "${fingerprint}" not found`);
    }

    return this.updateTrustScore(fingerprint, device.trustScore + amount);
  }

  /**
   * Mark device as compromised
   */
  async markAsCompromised(fingerprint: string): Promise<DeviceInfo> {
    const device = await this.updateDevice(fingerprint, {
      status: 'COMPROMISED',
    });

    // Revoke all sessions from this device
    await this.revokeAllSessions(device.id);

    return device;
  }

  /**
   * Check if device is trusted
   */
  async isDeviceTrusted(fingerprint: string, minTrustScore: number = 50): Promise<boolean> {
    const device = await this.getDevice(fingerprint);

    if (!device) {
      return false;
    }

    if (device.status === 'COMPROMISED') {
      return false;
    }

    if (device.status === 'INACTIVE') {
      return false;
    }

    return device.trustScore >= minTrustScore;
  }

  /**
   * Create device session
   */
  async createSession(
    deviceId: string,
    userId: string,
    expiresIn: number = 24 * 60 * 60 * 1000 // 24 hours
  ): Promise<DeviceSession> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresIn);

    const session = await prisma.deviceSession.create({
      data: {
        deviceId,
        userId,
        token,
        expiresAt,
      },
    });

    return session as DeviceSession;
  }

  /**
   * Get device session
   */
  async getSession(token: string): Promise<DeviceSession | null> {
    const session = await prisma.deviceSession.findUnique({
      where: { token },
    });

    if (!session) {
      return null;
    }

    // Check if session has expired
    if (session.expiresAt < new Date()) {
      await prisma.deviceSession.delete({
        where: { token },
      });
      return null;
    }

    return session as DeviceSession;
  }

  /**
   * Revoke a session
   */
  async revokeSession(token: string): Promise<void> {
    await prisma.deviceSession.delete({
      where: { token },
    });
  }

  /**
   * Revoke all sessions for a device
   */
  async revokeAllSessions(deviceId: string): Promise<void> {
    await prisma.deviceSession.deleteMany({
      where: { deviceId },
    });
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeUserSessions(userId: string): Promise<void> {
    await prisma.deviceSession.deleteMany({
      where: { userId },
    });
  }

  /**
   * Get active sessions for a device
   */
  async getDeviceSessions(deviceId: string): Promise<DeviceSession[]> {
    const sessions = await prisma.deviceSession.findMany({
      where: {
        deviceId,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions as DeviceSession[];
  }

  /**
   * Log device activity
   */
  async logActivity(
    deviceId: string,
    action: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      await prisma.deviceLog.create({
        data: {
          deviceId,
          action,
          details: details ? JSON.stringify(details) : null,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to log device activity:', error);
    }
  }

  /**
   * Get device logs
   */
  async getDeviceLogs(
    deviceId: string,
    limit: number = 100
  ): Promise<any[]> {
    const logs = await prisma.deviceLog.findMany({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : undefined,
    }));
  }

  /**
   * Clean up inactive devices (mark as inactive if not seen for 30 days)
   */
  async cleanupInactiveDevices(): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await prisma.device.updateMany({
      where: {
        lastSeen: {
          lt: thirtyDaysAgo,
        },
        status: 'ACTIVE',
      },
      data: {
        status: 'INACTIVE',
      },
    });

    return result.count;
  }
}

export const deviceManager = new DeviceManager();

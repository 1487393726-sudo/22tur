/**
 * Anomaly Detection System
 * Detects unusual user behavior patterns and generates alerts
 */

import { prisma } from '@/lib/prisma';

export interface UserBehavior {
  userId: string;
  accessCount: number;
  failedAccessCount: number;
  uniqueResourcesAccessed: number;
  averageAccessTime: number;
  lastAccessTime: Date;
}

export interface Anomaly {
  id: string;
  userId: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  context?: Record<string, any>;
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';
  detectedAt: Date;
  resolvedAt?: Date;
}

export interface Alert {
  id: string;
  anomalyId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  action?: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: Date;
}

export class AnomalyDetector {
  private readonly BASELINE_WINDOW = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly ALERT_TIMEOUT = 60 * 1000; // 1 minute

  /**
   * Update user behavior baseline
   */
  async updateBaseline(userId: string, behavior: Partial<UserBehavior>): Promise<void> {
    try {
      await prisma.userBehavior.upsert({
        where: { userId },
        update: {
          accessCount: behavior.accessCount ?? 0,
          failedAccessCount: behavior.failedAccessCount ?? 0,
          uniqueResourcesAccessed: behavior.uniqueResourcesAccessed ?? 0,
          averageAccessTime: behavior.averageAccessTime ?? 0,
          lastAccessTime: behavior.lastAccessTime ?? new Date(),
        },
        create: {
          userId,
          accessCount: behavior.accessCount ?? 0,
          failedAccessCount: behavior.failedAccessCount ?? 0,
          uniqueResourcesAccessed: behavior.uniqueResourcesAccessed ?? 0,
          averageAccessTime: behavior.averageAccessTime ?? 0,
          lastAccessTime: behavior.lastAccessTime ?? new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to update user baseline:', error);
    }
  }

  /**
   * Get user behavior baseline
   */
  async getBaseline(userId: string): Promise<UserBehavior | null> {
    const behavior = await prisma.userBehavior.findUnique({
      where: { userId },
    });

    return behavior as UserBehavior | null;
  }

  /**
   * Detect anomalies in user access
   */
  async detectAnomalies(event: {
    userId: string;
    action: string;
    resourceType: string;
    result: 'SUCCESS' | 'FAILURE';
    ipAddress?: string;
    timestamp: Date;
  }): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    // Get user baseline
    const baseline = await this.getBaseline(event.userId);

    // Check for brute force attacks (multiple failed attempts)
    if (event.result === 'FAILURE') {
      const recentFailures = await this.getRecentFailures(event.userId, 5 * 60 * 1000); // Last 5 minutes

      if (recentFailures >= 5) {
        const anomaly = await this.createAnomaly({
          userId: event.userId,
          type: 'BRUTE_FORCE',
          severity: 'HIGH',
          description: `Multiple failed access attempts detected (${recentFailures} in last 5 minutes)`,
          context: {
            failureCount: recentFailures,
            action: event.action,
            resourceType: event.resourceType,
          },
        });

        anomalies.push(anomaly);
      }
    }

    // Check for unusual access patterns
    if (baseline) {
      // Check for access outside normal hours
      const hour = event.timestamp.getHours();
      if (hour < 6 || hour > 22) {
        const anomaly = await this.createAnomaly({
          userId: event.userId,
          type: 'UNUSUAL_ACCESS_TIME',
          severity: 'LOW',
          description: `Access attempt outside normal hours (${hour}:00)`,
          context: {
            hour,
            action: event.action,
            resourceType: event.resourceType,
          },
        });

        anomalies.push(anomaly);
      }

      // Check for unusual resource access
      if (event.resourceType === 'SENSITIVE_DATA' && baseline.accessCount < 10) {
        const anomaly = await this.createAnomaly({
          userId: event.userId,
          type: 'SENSITIVE_DATA_ACCESS',
          severity: 'MEDIUM',
          description: 'Access to sensitive data by user with low access history',
          context: {
            resourceType: event.resourceType,
            userAccessCount: baseline.accessCount,
          },
        });

        anomalies.push(anomaly);
      }
    }

    // Check for data exfiltration patterns
    const recentAccesses = await this.getRecentAccesses(event.userId, 60 * 1000); // Last minute
    if (recentAccesses > 20) {
      const anomaly = await this.createAnomaly({
        userId: event.userId,
        type: 'DATA_EXFILTRATION',
        severity: 'CRITICAL',
        description: `Unusually high access rate detected (${recentAccesses} accesses in 1 minute)`,
        context: {
          accessCount: recentAccesses,
          timeWindow: '1 minute',
        },
      });

      anomalies.push(anomaly);
    }

    // Create alerts for detected anomalies
    for (const anomaly of anomalies) {
      await this.createAlert(anomaly.id, anomaly.severity, anomaly.description);
    }

    return anomalies;
  }

  /**
   * Create an anomaly
   */
  async createAnomaly(data: {
    userId: string;
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    context?: Record<string, any>;
  }): Promise<Anomaly> {
    const anomaly = await prisma.anomaly.create({
      data: {
        userId: data.userId,
        type: data.type,
        severity: data.severity,
        description: data.description,
        context: data.context ? JSON.stringify(data.context) : null,
        status: 'NEW',
        detectedAt: new Date(),
      },
    });

    return this.mapAnomaly(anomaly);
  }

  /**
   * Get anomaly by ID
   */
  async getAnomaly(id: string): Promise<Anomaly | null> {
    const anomaly = await prisma.anomaly.findUnique({
      where: { id },
    });

    return anomaly ? this.mapAnomaly(anomaly) : null;
  }

  /**
   * Get anomalies for a user
   */
  async getUserAnomalies(userId: string, limit: number = 100): Promise<Anomaly[]> {
    const anomalies = await prisma.anomaly.findMany({
      where: { userId },
      orderBy: { detectedAt: 'desc' },
      take: limit,
    });

    return anomalies.map((a) => this.mapAnomaly(a));
  }

  /**
   * Update anomaly status
   */
  async updateAnomalyStatus(
    id: string,
    status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED'
  ): Promise<Anomaly> {
    const anomaly = await prisma.anomaly.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
      },
    });

    return this.mapAnomaly(anomaly);
  }

  /**
   * Create an alert
   */
  async createAlert(
    anomalyId: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    description: string,
    action?: string
  ): Promise<Alert> {
    const alert = await prisma.alert.create({
      data: {
        anomalyId,
        severity,
        description,
        action,
        status: 'NEW',
      },
    });

    // Send notification for critical alerts
    if (severity === 'CRITICAL') {
      await this.notifyAdministrators(alert);
    }

    return alert as Alert;
  }

  /**
   * Get alerts
   */
  async getAlerts(filters?: {
    severity?: string;
    status?: string;
    limit?: number;
  }): Promise<Alert[]> {
    const where: any = {};

    if (filters?.severity) {
      where.severity = filters.severity;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit ?? 100,
    });

    return alerts as Alert[];
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(id: string): Promise<Alert> {
    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status: 'ACKNOWLEDGED',
      },
    });

    return alert as Alert;
  }

  /**
   * Correlate multiple anomalies
   */
  async correlateAnomalies(anomalies: Anomaly[]): Promise<{
    correlated: boolean;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
  }> {
    if (anomalies.length < 2) {
      return {
        correlated: false,
        severity: anomalies[0]?.severity || 'LOW',
        description: anomalies[0]?.description || '',
      };
    }

    // Check if anomalies are from same user and within time window
    const firstAnomaly = anomalies[0];
    const timeWindow = 5 * 60 * 1000; // 5 minutes

    const correlated = anomalies.every((a) => {
      const timeDiff = Math.abs(a.detectedAt.getTime() - firstAnomaly.detectedAt.getTime());
      return a.userId === firstAnomaly.userId && timeDiff <= timeWindow;
    });

    if (!correlated) {
      return {
        correlated: false,
        severity: firstAnomaly.severity,
        description: firstAnomaly.description,
      };
    }

    // Escalate severity if multiple anomalies are correlated
    const severityLevels = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    const maxSeverity = Math.max(...anomalies.map((a) => severityLevels[a.severity as keyof typeof severityLevels]));
    const severityMap = { 1: 'LOW', 2: 'MEDIUM', 3: 'HIGH', 4: 'CRITICAL' } as const;

    return {
      correlated: true,
      severity: severityMap[maxSeverity as keyof typeof severityMap],
      description: `Multiple correlated anomalies detected: ${anomalies.map((a) => a.type).join(', ')}`,
    };
  }

  /**
   * Get recent failed access attempts
   */
  private async getRecentFailures(userId: string, timeWindow: number): Promise<number> {
    const since = new Date(Date.now() - timeWindow);

    const count = await prisma.auditLog.count({
      where: {
        userId,
        action: 'ACCESS_DENIED',
        timestamp: {
          gte: since,
        },
      },
    });

    return count;
  }

  /**
   * Get recent access count
   */
  private async getRecentAccesses(userId: string, timeWindow: number): Promise<number> {
    const since = new Date(Date.now() - timeWindow);

    const count = await prisma.auditLog.count({
      where: {
        userId,
        action: 'ACCESS_APPROVED',
        timestamp: {
          gte: since,
        },
      },
    });

    return count;
  }

  /**
   * Notify administrators of critical alerts
   */
  private async notifyAdministrators(alert: Alert): Promise<void> {
    // This would integrate with notification system
    console.log(`[CRITICAL ALERT] ${alert.description}`);
  }

  /**
   * Map database anomaly to Anomaly interface
   */
  private mapAnomaly(anomaly: any): Anomaly {
    return {
      id: anomaly.id,
      userId: anomaly.userId,
      type: anomaly.type,
      severity: anomaly.severity,
      description: anomaly.description,
      context: anomaly.context ? JSON.parse(anomaly.context) : undefined,
      status: anomaly.status,
      detectedAt: anomaly.detectedAt,
      resolvedAt: anomaly.resolvedAt,
    };
  }
}

export const anomalyDetector = new AnomalyDetector();

/**
 * Security Event Response Engine
 * Automated response to security events and threats
 */

import { prisma } from '@/lib/prisma';
import { auditLogSystem } from '@/lib/audit';
import { deviceManager } from '@/lib/device';

export interface ResponsePolicy {
  id: string;
  name: string;
  description?: string;
  trigger: string; // CRITICAL_ANOMALY, BRUTE_FORCE, DATA_EXFILTRATION, COMPROMISED_DEVICE
  action: string; // REVOKE_SESSIONS, ISOLATE_DEVICE, NOTIFY_ADMIN, DISABLE_ACCOUNT
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityResponse {
  id: string;
  policyId: string;
  triggeredBy: string; // anomaly ID, event ID, etc.
  action: string;
  targetUserId?: string;
  targetDeviceId?: string;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  result?: Record<string, any>;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export class SecurityResponseEngine {
  /**
   * Create a response policy
   */
  async createPolicy(data: {
    name: string;
    description?: string;
    trigger: string;
    action: string;
  }): Promise<ResponsePolicy> {
    try {
      const policy = await prisma.automatedResponsePolicy.create({
        data: {
          name: data.name,
          description: data.description,
          trigger: data.trigger,
          action: data.action,
          enabled: true,
        },
      });

      return policy as ResponsePolicy;
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new Error(`Policy with name "${data.name}" already exists`);
      }
      throw error;
    }
  }

  /**
   * Get policy by ID
   */
  async getPolicy(id: string): Promise<ResponsePolicy | null> {
    const policy = await prisma.automatedResponsePolicy.findUnique({
      where: { id },
    });

    return policy as ResponsePolicy | null;
  }

  /**
   * Get all policies
   */
  async getAllPolicies(): Promise<ResponsePolicy[]> {
    const policies = await prisma.automatedResponsePolicy.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return policies as ResponsePolicy[];
  }

  /**
   * Get policies by trigger
   */
  async getPoliciesByTrigger(trigger: string): Promise<ResponsePolicy[]> {
    const policies = await prisma.automatedResponsePolicy.findMany({
      where: {
        trigger,
        enabled: true,
      },
    });

    return policies as ResponsePolicy[];
  }

  /**
   * Update policy
   */
  async updatePolicy(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      trigger: string;
      action: string;
      enabled: boolean;
    }>
  ): Promise<ResponsePolicy> {
    const policy = await prisma.automatedResponsePolicy.update({
      where: { id },
      data,
    });

    return policy as ResponsePolicy;
  }

  /**
   * Delete policy
   */
  async deletePolicy(id: string): Promise<void> {
    await prisma.automatedResponsePolicy.delete({
      where: { id },
    });
  }

  /**
   * Trigger automated response
   */
  async triggerResponse(data: {
    policyId: string;
    triggeredBy: string;
    targetUserId?: string;
    targetDeviceId?: string;
  }): Promise<SecurityResponse> {
    const policy = await this.getPolicy(data.policyId);

    if (!policy) {
      throw new Error(`Policy with ID "${data.policyId}" not found`);
    }

    if (!policy.enabled) {
      throw new Error('Policy is disabled');
    }

    // Create response record
    const response = await prisma.securityResponse.create({
      data: {
        policyId: data.policyId,
        triggeredBy: data.triggeredBy,
        action: policy.action,
        targetUserId: data.targetUserId,
        targetDeviceId: data.targetDeviceId,
        status: 'PENDING',
      },
    });

    // Execute the response asynchronously
    this.executeResponse(response.id, policy.action, data).catch((error) => {
      console.error('Failed to execute security response:', error);
    });

    return response as SecurityResponse;
  }

  /**
   * Execute security response
   */
  private async executeResponse(
    responseId: string,
    action: string,
    data: {
      policyId: string;
      triggeredBy: string;
      targetUserId?: string;
      targetDeviceId?: string;
    }
  ): Promise<void> {
    try {
      // Update status to EXECUTING
      await prisma.securityResponse.update({
        where: { id: responseId },
        data: { status: 'EXECUTING' },
      });

      let result: Record<string, any> = {};

      switch (action) {
        case 'REVOKE_SESSIONS':
          result = await this.revokeSessions(data.targetUserId);
          break;

        case 'ISOLATE_DEVICE':
          result = await this.isolateDevice(data.targetDeviceId);
          break;

        case 'NOTIFY_ADMIN':
          result = await this.notifyAdministrators(data);
          break;

        case 'DISABLE_ACCOUNT':
          result = await this.disableAccount(data.targetUserId);
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      // Update response with result
      await prisma.securityResponse.update({
        where: { id: responseId },
        data: {
          status: 'COMPLETED',
          result,
          completedAt: new Date(),
        },
      });

      // Log the response
      await auditLogSystem.logSuccess('SECURITY_RESPONSE_EXECUTED', 'SECURITY_RESPONSE', responseId, {
        details: {
          action,
          result,
        },
      });
    } catch (error) {
      // Update response with error
      await prisma.securityResponse.update({
        where: { id: responseId },
        data: {
          status: 'FAILED',
          error: (error as Error).message,
          completedAt: new Date(),
        },
      });

      // Log the failure
      await auditLogSystem.logFailure('SECURITY_RESPONSE_FAILED', 'SECURITY_RESPONSE', responseId, {
        reason: (error as Error).message,
      });
    }
  }

  /**
   * Revoke all sessions for a user
   */
  private async revokeSessions(userId?: string): Promise<Record<string, any>> {
    if (!userId) {
      throw new Error('User ID is required for revoking sessions');
    }

    // Revoke all device sessions
    const sessions = await prisma.deviceSession.findMany({
      where: { userId },
    });

    await prisma.deviceSession.deleteMany({
      where: { userId },
    });

    return {
      action: 'REVOKE_SESSIONS',
      userId,
      sessionsRevoked: sessions.length,
    };
  }

  /**
   * Isolate device
   */
  private async isolateDevice(deviceId?: string): Promise<Record<string, any>> {
    if (!deviceId) {
      throw new Error('Device ID is required for isolation');
    }

    const device = await deviceManager.getDeviceById(deviceId);

    if (!device) {
      throw new Error(`Device with ID "${deviceId}" not found`);
    }

    // Mark device as compromised
    await deviceManager.markAsCompromised(device.fingerprint);

    return {
      action: 'ISOLATE_DEVICE',
      deviceId,
      deviceFingerprint: device.fingerprint,
      status: 'COMPROMISED',
    };
  }

  /**
   * Notify administrators
   */
  private async notifyAdministrators(data: {
    policyId: string;
    triggeredBy: string;
    targetUserId?: string;
    targetDeviceId?: string;
  }): Promise<Record<string, any>> {
    // Get admin users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    // In production, send notifications via email, SMS, etc.
    console.log(`[SECURITY ALERT] Notifying ${admins.length} administrators`);
    console.log(`Triggered by: ${data.triggeredBy}`);
    console.log(`Target User: ${data.targetUserId || 'N/A'}`);
    console.log(`Target Device: ${data.targetDeviceId || 'N/A'}`);

    return {
      action: 'NOTIFY_ADMIN',
      adminsNotified: admins.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Disable account
   */
  private async disableAccount(userId?: string): Promise<Record<string, any>> {
    if (!userId) {
      throw new Error('User ID is required for disabling account');
    }

    // Update user status
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: 'DISABLED' },
    });

    // Revoke all sessions
    await prisma.deviceSession.deleteMany({
      where: { userId },
    });

    return {
      action: 'DISABLE_ACCOUNT',
      userId,
      userEmail: user.email,
      status: 'DISABLED',
    };
  }

  /**
   * Get response history
   */
  async getResponseHistory(filters?: {
    policyId?: string;
    status?: string;
    limit?: number;
  }): Promise<SecurityResponse[]> {
    const where: any = {};

    if (filters?.policyId) {
      where.policyId = filters.policyId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const responses = await prisma.securityResponse.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit ?? 100,
    });

    return responses as SecurityResponse[];
  }

  /**
   * Get response statistics
   */
  async getResponseStats(): Promise<{
    totalResponses: number;
    completedResponses: number;
    failedResponses: number;
    pendingResponses: number;
    responsesByAction: Record<string, number>;
  }> {
    const total = await prisma.securityResponse.count();

    const completed = await prisma.securityResponse.count({
      where: { status: 'COMPLETED' },
    });

    const failed = await prisma.securityResponse.count({
      where: { status: 'FAILED' },
    });

    const pending = await prisma.securityResponse.count({
      where: { status: 'PENDING' },
    });

    // Get responses by action
    const responses = await prisma.securityResponse.findMany();
    const responsesByAction: Record<string, number> = {};

    for (const response of responses) {
      responsesByAction[response.action] = (responsesByAction[response.action] || 0) + 1;
    }

    return {
      totalResponses: total,
      completedResponses: completed,
      failedResponses: failed,
      pendingResponses: pending,
      responsesByAction,
    };
  }
}

export const securityResponseEngine = new SecurityResponseEngine();

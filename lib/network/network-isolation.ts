/**
 * Network Isolation System
 * Manages network segments and enforces isolation policies
 */

import { prisma } from '@/lib/prisma';

export interface NetworkSegment {
  id: string;
  name: string;
  cidr: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IsolationPolicy {
  id: string;
  sourceSegmentId: string;
  destinationSegmentId: string;
  action: 'ALLOW' | 'DENY';
  conditions?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentAccessRequest {
  sourceSegment: string;
  destinationSegment: string;
  userId?: string;
  deviceTrustScore?: number;
}

export interface SegmentAccessDecision {
  allowed: boolean;
  policyId?: string;
  reason?: string;
}

export class NetworkIsolationSystem {
  /**
   * Create a network segment
   */
  async createSegment(data: {
    name: string;
    cidr: string;
    description?: string;
  }): Promise<NetworkSegment> {
    try {
      const segment = await prisma.networkSegment.create({
        data: {
          name: data.name,
          cidr: data.cidr,
          description: data.description,
        },
      });

      return segment as NetworkSegment;
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new Error(`Segment with name "${data.name}" or CIDR "${data.cidr}" already exists`);
      }
      throw error;
    }
  }

  /**
   * Get segment by ID
   */
  async getSegment(id: string): Promise<NetworkSegment | null> {
    const segment = await prisma.networkSegment.findUnique({
      where: { id },
    });

    return segment as NetworkSegment | null;
  }

  /**
   * Get all segments
   */
  async getAllSegments(): Promise<NetworkSegment[]> {
    const segments = await prisma.networkSegment.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return segments as NetworkSegment[];
  }

  /**
   * Update segment
   */
  async updateSegment(
    id: string,
    data: Partial<{
      name: string;
      cidr: string;
      description: string;
    }>
  ): Promise<NetworkSegment> {
    const segment = await prisma.networkSegment.update({
      where: { id },
      data,
    });

    return segment as NetworkSegment;
  }

  /**
   * Delete segment
   */
  async deleteSegment(id: string): Promise<void> {
    // Delete associated policies first
    await prisma.isolationPolicy.deleteMany({
      where: {
        OR: [
          { sourceSegmentId: id },
          { destinationSegmentId: id },
        ],
      },
    });

    // Delete the segment
    await prisma.networkSegment.delete({
      where: { id },
    });
  }

  /**
   * Create isolation policy
   */
  async createPolicy(data: {
    sourceSegmentId: string;
    destinationSegmentId: string;
    action: 'ALLOW' | 'DENY';
    conditions?: Record<string, any>;
  }): Promise<IsolationPolicy> {
    // Verify segments exist
    const sourceSegment = await this.getSegment(data.sourceSegmentId);
    if (!sourceSegment) {
      throw new Error(`Source segment with ID "${data.sourceSegmentId}" not found`);
    }

    const destSegment = await this.getSegment(data.destinationSegmentId);
    if (!destSegment) {
      throw new Error(`Destination segment with ID "${data.destinationSegmentId}" not found`);
    }

    // Check for duplicate policy
    const existing = await prisma.isolationPolicy.findUnique({
      where: {
        sourceSegmentId_destinationSegmentId: {
          sourceSegmentId: data.sourceSegmentId,
          destinationSegmentId: data.destinationSegmentId,
        },
      },
    });

    if (existing) {
      throw new Error('Policy already exists for this segment pair');
    }

    const policy = await prisma.isolationPolicy.create({
      data: {
        sourceSegmentId: data.sourceSegmentId,
        destinationSegmentId: data.destinationSegmentId,
        action: data.action,
        conditions: data.conditions ? JSON.stringify(data.conditions) : null,
      },
    });

    return this.mapPolicy(policy);
  }

  /**
   * Get policy by ID
   */
  async getPolicy(id: string): Promise<IsolationPolicy | null> {
    const policy = await prisma.isolationPolicy.findUnique({
      where: { id },
    });

    return policy ? this.mapPolicy(policy) : null;
  }

  /**
   * Get all policies
   */
  async getAllPolicies(): Promise<IsolationPolicy[]> {
    const policies = await prisma.isolationPolicy.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return policies.map((p) => this.mapPolicy(p));
  }

  /**
   * Get policies for segment pair
   */
  async getPoliciesForPair(
    sourceSegmentId: string,
    destinationSegmentId: string
  ): Promise<IsolationPolicy[]> {
    const policies = await prisma.isolationPolicy.findMany({
      where: {
        sourceSegmentId,
        destinationSegmentId,
      },
    });

    return policies.map((p) => this.mapPolicy(p));
  }

  /**
   * Update policy
   */
  async updatePolicy(
    id: string,
    data: Partial<{
      action: 'ALLOW' | 'DENY';
      conditions: Record<string, any>;
    }>
  ): Promise<IsolationPolicy> {
    const policy = await prisma.isolationPolicy.update({
      where: { id },
      data: {
        action: data.action,
        conditions: data.conditions ? JSON.stringify(data.conditions) : undefined,
      },
    });

    return this.mapPolicy(policy);
  }

  /**
   * Delete policy
   */
  async deletePolicy(id: string): Promise<void> {
    await prisma.isolationPolicy.delete({
      where: { id },
    });
  }

  /**
   * Evaluate segment access
   */
  async evaluateSegmentAccess(request: SegmentAccessRequest): Promise<SegmentAccessDecision> {
    // Get applicable policies
    const policies = await this.getPoliciesForPair(request.sourceSegment, request.destinationSegment);

    if (policies.length === 0) {
      // Default to DENY if no policy exists
      return {
        allowed: false,
        reason: 'No policy defined for this segment pair',
      };
    }

    // Check each policy
    for (const policy of policies) {
      // Check conditions if any
      if (policy.conditions) {
        const conditionsMet = this.checkConditions(policy.conditions, request);
        if (!conditionsMet) {
          continue;
        }
      }

      // Return the first matching policy
      return {
        allowed: policy.action === 'ALLOW',
        policyId: policy.id,
        reason: policy.action === 'ALLOW' ? undefined : 'Access denied by policy',
      };
    }

    // Default to DENY if no matching policy
    return {
      allowed: false,
      reason: 'No matching policy allows this access',
    };
  }

  /**
   * Check if conditions are met
   */
  private checkConditions(conditions: Record<string, any>, request: SegmentAccessRequest): boolean {
    // Check minimum trust score if specified
    if (conditions.minTrustScore !== undefined && request.deviceTrustScore !== undefined) {
      if (request.deviceTrustScore < conditions.minTrustScore) {
        return false;
      }
    }

    // Check user roles if specified
    if (conditions.allowedRoles && request.userId) {
      // This would need to check user roles from permission engine
      // For now, just return true
      return true;
    }

    return true;
  }

  /**
   * Log isolation violation
   */
  async logViolation(
    sourceSegment: string,
    destinationSegment: string,
    userId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      // This would log to audit system
      console.log(`[ISOLATION VIOLATION] ${sourceSegment} -> ${destinationSegment}`, {
        userId,
        details,
      });
    } catch (error) {
      console.error('Failed to log isolation violation:', error);
    }
  }

  /**
   * Map database policy to IsolationPolicy interface
   */
  private mapPolicy(policy: any): IsolationPolicy {
    return {
      id: policy.id,
      sourceSegmentId: policy.sourceSegmentId,
      destinationSegmentId: policy.destinationSegmentId,
      action: policy.action,
      conditions: policy.conditions ? JSON.parse(policy.conditions) : undefined,
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
    };
  }
}

export const networkIsolationSystem = new NetworkIsolationSystem();

/**
 * Permission Delegation System
 * Manages temporary permission delegation with automatic expiration
 */

import { prisma } from '@/lib/prisma';
import { auditLogSystem } from '@/lib/audit';

export interface PermissionDelegation {
  id: string;
  delegatorId: string;
  delegateeId: string;
  roleId: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;
}

export class DelegationManager {
  /**
   * Create a delegation
   */
  async createDelegation(data: {
    delegatorId: string;
    delegateeId: string;
    roleId: string;
    expiresIn: number; // milliseconds
  }): Promise<PermissionDelegation> {
    // Verify delegator has the role
    const delegatorRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: data.delegatorId,
          roleId: data.roleId,
        },
      },
    });

    if (!delegatorRole) {
      throw new Error('Delegator does not have the role to delegate');
    }

    // Verify delegatee exists
    const delegatee = await prisma.user.findUnique({
      where: { id: data.delegateeId },
    });

    if (!delegatee) {
      throw new Error(`User with ID "${data.delegateeId}" not found`);
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: data.roleId },
    });

    if (!role) {
      throw new Error(`Role with ID "${data.roleId}" not found`);
    }

    const expiresAt = new Date(Date.now() + data.expiresIn);

    const delegation = await prisma.permissionDelegation.create({
      data: {
        delegatorId: data.delegatorId,
        delegateeId: data.delegateeId,
        roleId: data.roleId,
        expiresAt,
      },
    });

    // Log the delegation
    await auditLogSystem.logSuccess('DELEGATION_CREATED', 'DELEGATION', delegation.id, {
      userId: data.delegatorId,
      details: {
        delegatee: data.delegateeId,
        role: data.roleId,
        expiresAt,
      },
    });

    return delegation as PermissionDelegation;
  }

  /**
   * Get delegation by ID
   */
  async getDelegation(id: string): Promise<PermissionDelegation | null> {
    const delegation = await prisma.permissionDelegation.findUnique({
      where: { id },
    });

    if (!delegation) {
      return null;
    }

    // Check if expired
    if (delegation.expiresAt < new Date() && !delegation.revokedAt) {
      await this.revokeDelegation(id);
      return null;
    }

    return delegation as PermissionDelegation;
  }

  /**
   * Get delegations for a user (as delegatee)
   */
  async getUserDelegations(userId: string): Promise<PermissionDelegation[]> {
    const delegations = await prisma.permissionDelegation.findMany({
      where: {
        delegateeId: userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { expiresAt: 'asc' },
    });

    return delegations as PermissionDelegation[];
  }

  /**
   * Get delegations created by a user (as delegator)
   */
  async getDelegationsByDelegator(userId: string): Promise<PermissionDelegation[]> {
    const delegations = await prisma.permissionDelegation.findMany({
      where: {
        delegatorId: userId,
        revokedAt: null,
      },
      orderBy: { expiresAt: 'asc' },
    });

    return delegations as PermissionDelegation[];
  }

  /**
   * Revoke a delegation
   */
  async revokeDelegation(id: string): Promise<void> {
    const delegation = await prisma.permissionDelegation.findUnique({
      where: { id },
    });

    if (!delegation) {
      throw new Error(`Delegation with ID "${id}" not found`);
    }

    await prisma.permissionDelegation.update({
      where: { id },
      data: {
        revokedAt: new Date(),
      },
    });

    // Log the revocation
    await auditLogSystem.logSuccess('DELEGATION_REVOKED', 'DELEGATION', id, {
      userId: delegation.delegatorId,
      details: {
        delegatee: delegation.delegateeId,
        role: delegation.roleId,
      },
    });
  }

  /**
   * Check if a delegation is valid
   */
  async isDelegationValid(delegationId: string): Promise<boolean> {
    const delegation = await prisma.permissionDelegation.findUnique({
      where: { id: delegationId },
    });

    if (!delegation) {
      return false;
    }

    // Check if revoked
    if (delegation.revokedAt) {
      return false;
    }

    // Check if expired
    if (delegation.expiresAt < new Date()) {
      // Auto-revoke expired delegation
      await this.revokeDelegation(delegationId);
      return false;
    }

    return true;
  }

  /**
   * Get effective permissions for a user (including delegated)
   */
  async getEffectivePermissions(userId: string): Promise<any[]> {
    // Get direct roles
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const permissions = new Map<string, any>();

    // Add permissions from direct roles
    for (const ur of userRoles) {
      for (const rp of ur.role.permissions) {
        permissions.set(rp.permission.id, rp.permission);
      }
    }

    // Add permissions from delegations
    const delegations = await this.getUserDelegations(userId);

    for (const delegation of delegations) {
      const role = await prisma.role.findUnique({
        where: { id: delegation.roleId },
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });

      if (role) {
        for (const rp of role.permissions) {
          permissions.set(rp.permission.id, rp.permission);
        }
      }
    }

    return Array.from(permissions.values());
  }

  /**
   * Clean up expired delegations
   */
  async cleanupExpiredDelegations(): Promise<number> {
    const result = await prisma.permissionDelegation.updateMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Get delegation statistics
   */
  async getDelegationStats(): Promise<{
    totalDelegations: number;
    activeDelegations: number;
    expiredDelegations: number;
    revokedDelegations: number;
  }> {
    const total = await prisma.permissionDelegation.count();

    const active = await prisma.permissionDelegation.count({
      where: {
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    const expired = await prisma.permissionDelegation.count({
      where: {
        revokedAt: null,
        expiresAt: {
          lte: new Date(),
        },
      },
    });

    const revoked = await prisma.permissionDelegation.count({
      where: {
        revokedAt: {
          not: null,
        },
      },
    });

    return {
      totalDelegations: total,
      activeDelegations: active,
      expiredDelegations: expired,
      revokedDelegations: revoked,
    };
  }
}

export const delegationManager = new DelegationManager();

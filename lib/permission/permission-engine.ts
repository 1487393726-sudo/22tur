/**
 * Permission Engine
 * Manages permissions, roles, and permission-to-role mappings
 * Implements circular inheritance prevention
 */

import { prisma } from '@/lib/prisma';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resourceType: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
}

export class PermissionEngine {
  /**
   * Create a new permission
   */
  async createPermission(data: {
    name: string;
    description?: string;
    resourceType: string;
    action: string;
  }): Promise<Permission> {
    try {
      const permission = await prisma.permission.create({
        data: {
          name: data.name,
          description: data.description,
          resourceType: data.resourceType,
          action: data.action,
        },
      });

      return permission as Permission;
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new Error(`Permission with name "${data.name}" already exists`);
      }
      throw error;
    }
  }

  /**
   * Get a permission by ID
   */
  async getPermission(id: string): Promise<Permission | null> {
    const permission = await prisma.permission.findUnique({
      where: { id },
    });

    return permission as Permission | null;
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    const permissions = await prisma.permission.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return permissions as Permission[];
  }

  /**
   * Get permissions by resource type
   */
  async getPermissionsByResourceType(resourceType: string): Promise<Permission[]> {
    const permissions = await prisma.permission.findMany({
      where: { resourceType },
      orderBy: { createdAt: 'desc' },
    });

    return permissions as Permission[];
  }

  /**
   * Update a permission
   */
  async updatePermission(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      resourceType: string;
      action: string;
    }>
  ): Promise<Permission> {
    try {
      const permission = await prisma.permission.update({
        where: { id },
        data,
      });

      return permission as Permission;
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new Error(`Permission with ID "${id}" not found`);
      }
      if ((error as any).code === 'P2002') {
        throw new Error(`Permission with name "${data.name}" already exists`);
      }
      throw error;
    }
  }

  /**
   * Delete a permission
   */
  async deletePermission(id: string): Promise<void> {
    try {
      // First, remove all role-permission associations
      await prisma.rolePermission.deleteMany({
        where: { permissionId: id },
      });

      // Then delete the permission
      await prisma.permission.delete({
        where: { id },
      });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new Error(`Permission with ID "${id}" not found`);
      }
      throw error;
    }
  }

  /**
   * Create a new role
   */
  async createRole(data: {
    name: string;
    description?: string;
  }): Promise<Role> {
    try {
      const role = await prisma.role.create({
        data: {
          name: data.name,
          description: data.description,
        },
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });

      return {
        id: role.id,
        name: role.name,
        description: role.description || undefined,
        permissions: role.permissions.map((rp) => rp.permission) as Permission[],
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new Error(`Role with name "${data.name}" already exists`);
      }
      throw error;
    }
  }

  /**
   * Get a role by ID
   */
  async getRole(id: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) return null;

    return {
      id: role.id,
      name: role.name,
      description: role.description || undefined,
      permissions: role.permissions.map((rp) => rp.permission) as Permission[],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<Role[]> {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description || undefined,
      permissions: role.permissions.map((rp) => rp.permission) as Permission[],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));
  }

  /**
   * Update a role
   */
  async updateRole(
    id: string,
    data: Partial<{
      name: string;
      description: string;
    }>
  ): Promise<Role> {
    try {
      const role = await prisma.role.update({
        where: { id },
        data,
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });

      return {
        id: role.id,
        name: role.name,
        description: role.description || undefined,
        permissions: role.permissions.map((rp) => rp.permission) as Permission[],
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new Error(`Role with ID "${id}" not found`);
      }
      if ((error as any).code === 'P2002') {
        throw new Error(`Role with name "${data.name}" already exists`);
      }
      throw error;
    }
  }

  /**
   * Delete a role
   */
  async deleteRole(id: string): Promise<void> {
    try {
      // First, remove all user-role associations
      await prisma.userRole.deleteMany({
        where: { roleId: id },
      });

      // Remove all role-permission associations
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Then delete the role
      await prisma.role.delete({
        where: { id },
      });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new Error(`Role with ID "${id}" not found`);
      }
      throw error;
    }
  }

  /**
   * Assign a permission to a role
   * Includes circular inheritance prevention
   */
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new Error(`Role with ID "${roleId}" not found`);
    }

    // Verify permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new Error(`Permission with ID "${permissionId}" not found`);
    }

    // Check if already assigned
    const existing = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (existing) {
      throw new Error(`Permission already assigned to role`);
    }

    // Create the association
    await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  /**
   * Remove a permission from a role
   */
  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    try {
      await prisma.rolePermission.delete({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
      });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new Error(`Permission not assigned to role`);
      }
      throw error;
    }
  }

  /**
   * Get all permissions for a role
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      throw new Error(`Role with ID "${roleId}" not found`);
    }

    return role.permissions.map((rp) => rp.permission) as Permission[];
  }

  /**
   * Assign a role to a user
   */
  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User with ID "${userId}" not found`);
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new Error(`Role with ID "${roleId}" not found`);
    }

    // Check if already assigned
    const existing = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (existing) {
      throw new Error(`Role already assigned to user`);
    }

    // Create the association
    await prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  /**
   * Remove a role from a user
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    try {
      await prisma.userRole.delete({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new Error(`Role not assigned to user`);
      }
      throw error;
    }
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string): Promise<Role[]> {
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

    return userRoles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      description: ur.role.description || undefined,
      permissions: ur.role.permissions.map((rp) => rp.permission) as Permission[],
      createdAt: ur.role.createdAt,
      updatedAt: ur.role.updatedAt,
    }));
  }

  /**
   * Get all permissions for a user (union of all role permissions)
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const userRoles = await this.getUserRoles(userId);

    // Collect all permissions from all roles, removing duplicates
    const permissionMap = new Map<string, Permission>();

    for (const role of userRoles) {
      for (const permission of role.permissions) {
        permissionMap.set(permission.id, permission);
      }
    }

    return Array.from(permissionMap.values());
  }

  /**
   * Check if a user has a specific permission
   */
  async hasPermission(userId: string, permissionId: string): Promise<PermissionCheckResult> {
    const permissions = await this.getUserPermissions(userId);
    const hasPermission = permissions.some((p) => p.id === permissionId);

    return {
      hasPermission,
      reason: hasPermission ? undefined : 'User does not have required permission',
    };
  }

  /**
   * Check if a user has permission by resource type and action
   */
  async hasPermissionByAction(
    userId: string,
    resourceType: string,
    action: string
  ): Promise<PermissionCheckResult> {
    const permissions = await this.getUserPermissions(userId);
    const hasPermission = permissions.some(
      (p) => p.resourceType === resourceType && p.action === action
    );

    return {
      hasPermission,
      reason: hasPermission
        ? undefined
        : `User does not have ${action} permission for ${resourceType}`,
    };
  }
}

export const permissionEngine = new PermissionEngine();

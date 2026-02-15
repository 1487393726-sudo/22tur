/**
 * Authorization Service for Enterprise Admin System
 * Implements Role-Based Access Control (RBAC)
 */

import {
  User,
  Role,
  Permission,
  AuthorizationError,
  ValidationError,
} from '../types';
import { validateRequired, generateId } from '../utils';
import { PERMISSION_ACTIONS, RESOURCE_TYPES } from '../constants';

/**
 * Authorization Service
 * Manages roles, permissions, and access control
 */
export class AuthorizationService {
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();

  /**
   * Creates a new role
   */
  createRole(name: string, description?: string, parentRole?: Role): Role {
    validateRequired(name, 'Role name');

    const roleId = generateId();
    const role: Role = {
      id: roleId,
      name,
      description,
      permissions: [],
      parentRole,
      parentRoleId: parentRole?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.roles.set(roleId, role);
    return role;
  }

  /**
   * Gets a role by ID
   */
  getRole(roleId: string): Role {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role with id ${roleId} not found`);
    }
    return role;
  }

  /**
   * Updates a role
   */
  updateRole(roleId: string, updates: Partial<Role>): Role {
    const role = this.getRole(roleId);
    const updated = { ...role, ...updates, updatedAt: new Date() };
    this.roles.set(roleId, updated);
    return updated;
  }

  /**
   * Deletes a role
   */
  deleteRole(roleId: string): void {
    this.roles.delete(roleId);
  }

  /**
   * Gets all roles
   */
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * Creates a new permission
   */
  createPermission(
    name: string,
    resource: string,
    action: string,
    description?: string
  ): Permission {
    validateRequired(name, 'Permission name');
    validateRequired(resource, 'Resource');
    validateRequired(action, 'Action');

    const permissionId = generateId();
    const permission: Permission = {
      id: permissionId,
      name,
      resource,
      action,
      description,
      createdAt: new Date(),
    };

    this.permissions.set(permissionId, permission);
    return permission;
  }

  /**
   * Gets a permission by ID
   */
  getPermission(permissionId: string): Permission {
    const permission = this.permissions.get(permissionId);
    if (!permission) {
      throw new Error(`Permission with id ${permissionId} not found`);
    }
    return permission;
  }

  /**
   * Gets all permissions
   */
  getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  /**
   * Assigns a permission to a role
   */
  assignPermissionToRole(roleId: string, permissionId: string): Role {
    const role = this.getRole(roleId);
    const permission = this.getPermission(permissionId);

    // Check if permission is already assigned
    if (role.permissions.some((p) => p.id === permissionId)) {
      throw new ValidationError('Permission is already assigned to this role');
    }

    role.permissions.push(permission);
    role.updatedAt = new Date();
    this.roles.set(roleId, role);
    return role;
  }

  /**
   * Removes a permission from a role
   */
  removePermissionFromRole(roleId: string, permissionId: string): Role {
    const role = this.getRole(roleId);
    role.permissions = role.permissions.filter((p) => p.id !== permissionId);
    role.updatedAt = new Date();
    this.roles.set(roleId, role);
    return role;
  }

  /**
   * Checks if a user has a specific permission
   */
  hasPermission(user: User, resource: string, action: string): boolean {
    const permissions = this.getUserPermissions(user);
    return permissions.some((p) => p.resource === resource && p.action === action);
  }

  /**
   * Checks if a user has any of the specified permissions
   */
  hasAnyPermission(
    user: User,
    permissions: Array<{ resource: string; action: string }>
  ): boolean {
    return permissions.some((p) => this.hasPermission(user, p.resource, p.action));
  }

  /**
   * Checks if a user has all of the specified permissions
   */
  hasAllPermissions(
    user: User,
    permissions: Array<{ resource: string; action: string }>
  ): boolean {
    return permissions.every((p) => this.hasPermission(user, p.resource, p.action));
  }

  /**
   * Validates that a user has a specific permission, throws error if not
   */
  validatePermission(user: User, resource: string, action: string): void {
    if (!this.hasPermission(user, resource, action)) {
      throw new AuthorizationError(
        `User does not have permission to ${action} ${resource}`
      );
    }
  }

  /**
   * Gets all permissions for a user
   */
  getUserPermissions(user: User): Permission[] {
    const permissions: Map<string, Permission> = new Map();

    user.roles.forEach((role) => {
      this.getRolePermissions(role).forEach((permission) => {
        permissions.set(permission.id, permission);
      });
    });

    return Array.from(permissions.values());
  }

  /**
   * Gets all permissions for a role (including inherited from parent)
   */
  getRolePermissions(role: Role): Permission[] {
    const permissions: Map<string, Permission> = new Map();

    // Add direct permissions
    role.permissions.forEach((permission) => {
      permissions.set(permission.id, permission);
    });

    // Add parent role permissions
    if (role.parentRole) {
      this.getRolePermissions(role.parentRole).forEach((permission) => {
        permissions.set(permission.id, permission);
      });
    }

    return Array.from(permissions.values());
  }

  /**
   * Checks if a user has a specific role
   */
  hasRole(user: User, roleName: string): boolean {
    return user.roles.some((r) => r.name === roleName);
  }

  /**
   * Checks if a user has any of the specified roles
   */
  hasAnyRole(user: User, roleNames: string[]): boolean {
    return roleNames.some((roleName) => this.hasRole(user, roleName));
  }

  /**
   * Checks if a user has all of the specified roles
   */
  hasAllRoles(user: User, roleNames: string[]): boolean {
    return roleNames.every((roleName) => this.hasRole(user, roleName));
  }

  /**
   * Gets all users with a specific role
   */
  getUsersWithRole(roleName: string, users: User[]): User[] {
    return users.filter((user) => this.hasRole(user, roleName));
  }

  /**
   * Gets all users with a specific permission
   */
  getUsersWithPermission(
    resource: string,
    action: string,
    users: User[]
  ): User[] {
    return users.filter((user) => this.hasPermission(user, resource, action));
  }

  /**
   * Clears all data (for testing)
   */
  clear(): void {
    this.roles.clear();
    this.permissions.clear();
  }
}

// Export singleton instance
export const authorizationService = new AuthorizationService();

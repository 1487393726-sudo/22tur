/**
 * User Management Service for Enterprise Admin System
 * Handles CRUD operations for users
 */

import {
  User,
  Role,
  SearchResult,
  ValidationError,
  NotFoundError,
  BatchOperation,
} from '../types';
import {
  validateRequired,
  validateEmail,
  generateId,
  sortBy,
  filterBy,
  paginate,
} from '../utils';

/**
 * User Management Service
 * Manages user CRUD operations, search, and batch operations
 */
export class UserManagementService {
  private users: Map<string, User> = new Map();
  private batchOperations: Map<string, BatchOperation> = new Map();

  /**
   * Creates a new user
   */
  createUser(
    username: string,
    email: string,
    roles: Role[] = [],
    status: 'active' | 'inactive' | 'suspended' = 'active'
  ): User {
    validateRequired(username, 'Username');
    validateRequired(email, 'Email');
    validateEmail(email);

    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find(
      (u) => u.username === username || u.email === email
    );
    if (existingUser) {
      throw new ValidationError('User with this username or email already exists');
    }

    const userId = generateId();
    const user: User = {
      id: userId,
      username,
      email,
      roles,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(userId, user);
    return user;
  }

  /**
   * Gets a user by ID
   */
  getUser(userId: string): User {
    const user = this.users.get(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }
    return user;
  }

  /**
   * Gets all users
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * Updates a user
   */
  updateUser(userId: string, updates: Partial<User>): User {
    const user = this.getUser(userId);

    // Validate email if being updated
    if (updates.email && updates.email !== user.email) {
      validateEmail(updates.email);
      const existingUser = Array.from(this.users.values()).find(
        (u) => u.email === updates.email && u.id !== userId
      );
      if (existingUser) {
        throw new ValidationError('Email is already in use');
      }
    }

    const updated: User = {
      ...user,
      ...updates,
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    };

    this.users.set(userId, updated);
    return updated;
  }

  /**
   * Deletes a user
   */
  deleteUser(userId: string): void {
    const user = this.getUser(userId);
    this.users.delete(userId);
  }

  /**
   * Searches users with pagination
   */
  searchUsers(
    keyword: string = '',
    filters: Record<string, any> = {},
    sortBy_: string = 'username',
    sortOrder: 'asc' | 'desc' = 'asc',
    page: number = 1,
    pageSize: number = 10
  ): SearchResult<User> {
    let results = Array.from(this.users.values());

    // Apply keyword search
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      results = results.filter(
        (user) =>
          user.username.toLowerCase().includes(lowerKeyword) ||
          user.email.toLowerCase().includes(lowerKeyword)
      );
    }

    // Apply filters
    if (Object.keys(filters).length > 0) {
      results = results.filter((user) => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === null || value === undefined || value === '') return true;
          const userValue = user[key as keyof User];
          // For exact match (like status)
          if (typeof userValue === 'string' && typeof value === 'string') {
            return userValue === value;
          }
          // For partial match
          if (typeof userValue === 'string') {
            return userValue.toLowerCase().includes(String(value).toLowerCase());
          }
          return userValue === value;
        });
      });
    }

    // Apply sorting
    results = sortBy(results, sortBy_ as keyof User, sortOrder);

    // Apply pagination
    const { items, total, hasMore } = paginate(results, page, pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      hasMore,
    };
  }

  /**
   * Filters users by status
   */
  filterUsersByStatus(status: 'active' | 'inactive' | 'suspended'): User[] {
    return Array.from(this.users.values()).filter((user) => user.status === status);
  }

  /**
   * Filters users by role
   */
  filterUsersByRole(roleId: string): User[] {
    return Array.from(this.users.values()).filter((user) =>
      user.roles.some((role) => role.id === roleId)
    );
  }

  /**
   * Updates user status
   */
  updateUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'suspended'
  ): User {
    return this.updateUser(userId, { status });
  }

  /**
   * Assigns roles to a user
   */
  assignRoles(userId: string, roles: Role[]): User {
    return this.updateUser(userId, { roles });
  }

  /**
   * Batch enable users
   */
  batchEnableUsers(userIds: string[]): BatchOperation {
    const operationId = generateId();
    const operation: BatchOperation = {
      id: operationId,
      type: 'update',
      resourceType: 'user',
      resourceIds: userIds,
      status: 'processing',
      progress: 0,
      createdAt: new Date(),
    };

    this.batchOperations.set(operationId, operation);

    try {
      userIds.forEach((userId) => {
        this.updateUserStatus(userId, 'active');
      });

      operation.status = 'completed';
      operation.progress = 100;
      operation.completedAt = new Date();
    } catch (error) {
      operation.status = 'failed';
      operation.errorMessage = (error as Error).message;
    }

    this.batchOperations.set(operationId, operation);
    return operation;
  }

  /**
   * Batch disable users
   */
  batchDisableUsers(userIds: string[]): BatchOperation {
    const operationId = generateId();
    const operation: BatchOperation = {
      id: operationId,
      type: 'update',
      resourceType: 'user',
      resourceIds: userIds,
      status: 'processing',
      progress: 0,
      createdAt: new Date(),
    };

    this.batchOperations.set(operationId, operation);

    try {
      userIds.forEach((userId) => {
        this.updateUserStatus(userId, 'inactive');
      });

      operation.status = 'completed';
      operation.progress = 100;
      operation.completedAt = new Date();
    } catch (error) {
      operation.status = 'failed';
      operation.errorMessage = (error as Error).message;
    }

    this.batchOperations.set(operationId, operation);
    return operation;
  }

  /**
   * Batch delete users
   */
  batchDeleteUsers(userIds: string[]): BatchOperation {
    const operationId = generateId();
    const operation: BatchOperation = {
      id: operationId,
      type: 'delete',
      resourceType: 'user',
      resourceIds: userIds,
      status: 'processing',
      progress: 0,
      createdAt: new Date(),
    };

    this.batchOperations.set(operationId, operation);

    try {
      userIds.forEach((userId) => {
        this.deleteUser(userId);
      });

      operation.status = 'completed';
      operation.progress = 100;
      operation.completedAt = new Date();
    } catch (error) {
      operation.status = 'failed';
      operation.errorMessage = (error as Error).message;
    }

    this.batchOperations.set(operationId, operation);
    return operation;
  }

  /**
   * Gets a batch operation
   */
  getBatchOperation(operationId: string): BatchOperation {
    const operation = this.batchOperations.get(operationId);
    if (!operation) {
      throw new Error(`Batch operation with id ${operationId} not found`);
    }
    return operation;
  }

  /**
   * Clears all data (for testing)
   */
  clear(): void {
    this.users.clear();
    this.batchOperations.clear();
  }
}

// Export singleton instance
export const userManagementService = new UserManagementService();

/**
 * Authentication Service for Enterprise Admin System
 */

import {
  User,
  Role,
  Permission,
  AuthContext,
  AuthenticationError,
  ValidationError,
} from '../types';
import { validateRequired, validateEmail, generateId } from '../utils';

/**
 * Authentication Service
 * Handles user authentication and session management
 */
export class AuthenticationService {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, AuthContext> = new Map();
  private passwordHashes: Map<string, string> = new Map();

  /**
   * Registers a new user
   */
  registerUser(
    username: string,
    email: string,
    password: string,
    roles: Role[] = []
  ): User {
    validateRequired(username, 'Username');
    validateRequired(email, 'Email');
    validateRequired(password, 'Password');
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
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(userId, user);
    this.passwordHashes.set(userId, this.hashPassword(password));

    return user;
  }

  /**
   * Authenticates a user with username and password
   */
  authenticate(username: string, password: string): AuthContext {
    validateRequired(username, 'Username');
    validateRequired(password, 'Password');

    const user = Array.from(this.users.values()).find((u) => u.username === username);

    if (!user) {
      throw new AuthenticationError('Invalid username or password');
    }

    if (user.status !== 'active') {
      throw new AuthenticationError(`User account is ${user.status}`);
    }

    const passwordHash = this.passwordHashes.get(user.id);
    if (!passwordHash || !this.verifyPassword(password, passwordHash)) {
      throw new AuthenticationError('Invalid username or password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    this.users.set(user.id, user);

    // Create session
    const authContext: AuthContext = {
      user,
      isAuthenticated: true,
      roles: user.roles,
      permissions: this.getPermissionsForRoles(user.roles),
    };

    const sessionId = generateId();
    this.sessions.set(sessionId, authContext);

    return authContext;
  }

  /**
   * Validates a session
   */
  validateSession(sessionId: string): AuthContext {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new AuthenticationError('Invalid or expired session');
    }
    return session;
  }

  /**
   * Logs out a user
   */
  logout(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Gets a user by ID
   */
  getUser(userId: string): User {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    return user;
  }

  /**
   * Updates user information
   */
  updateUser(userId: string, updates: Partial<User>): User {
    const user = this.getUser(userId);
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(userId, updated);
    return updated;
  }

  /**
   * Changes user password
   */
  changePassword(userId: string, oldPassword: string, newPassword: string): void {
    const user = this.getUser(userId);
    const passwordHash = this.passwordHashes.get(userId);

    if (!passwordHash || !this.verifyPassword(oldPassword, passwordHash)) {
      throw new AuthenticationError('Current password is incorrect');
    }

    validateRequired(newPassword, 'New password');
    if (newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters long');
    }

    this.passwordHashes.set(userId, this.hashPassword(newPassword));
  }

  /**
   * Resets user password (admin only)
   */
  resetPassword(userId: string, newPassword: string): void {
    validateRequired(newPassword, 'New password');
    if (newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters long');
    }

    const user = this.getUser(userId);
    this.passwordHashes.set(userId, this.hashPassword(newPassword));
  }

  /**
   * Assigns roles to a user
   */
  assignRoles(userId: string, roles: Role[]): User {
    const user = this.getUser(userId);
    user.roles = roles;
    user.updatedAt = new Date();
    this.users.set(userId, user);
    return user;
  }

  /**
   * Gets all permissions for a user
   */
  getUserPermissions(userId: string): Permission[] {
    const user = this.getUser(userId);
    return this.getPermissionsForRoles(user.roles);
  }

  /**
   * Gets all permissions for a set of roles
   */
  private getPermissionsForRoles(roles: Role[]): Permission[] {
    const permissions: Map<string, Permission> = new Map();

    roles.forEach((role) => {
      role.permissions.forEach((permission) => {
        permissions.set(permission.id, permission);
      });

      // Include parent role permissions
      if (role.parentRole) {
        this.getPermissionsForRoles([role.parentRole]).forEach((permission) => {
          permissions.set(permission.id, permission);
        });
      }
    });

    return Array.from(permissions.values());
  }

  /**
   * Hashes a password (simple implementation for testing)
   */
  private hashPassword(password: string): string {
    // In production, use bcrypt or similar
    return Buffer.from(password).toString('base64');
  }

  /**
   * Verifies a password against a hash
   */
  private verifyPassword(password: string, hash: string): boolean {
    // In production, use bcrypt or similar
    return this.hashPassword(password) === hash;
  }

  /**
   * Gets all users
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * Deletes a user
   */
  deleteUser(userId: string): void {
    this.users.delete(userId);
    this.passwordHashes.delete(userId);
  }

  /**
   * Clears all data (for testing)
   */
  clear(): void {
    this.users.clear();
    this.sessions.clear();
    this.passwordHashes.clear();
  }
}

// Export singleton instance
export const authService = new AuthenticationService();

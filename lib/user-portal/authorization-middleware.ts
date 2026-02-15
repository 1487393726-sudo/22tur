/**
 * Authorization Middleware for User Portal System
 * Implements role-based access control (RBAC) and endpoint protection
 * Validates: Requirements 1.5
 */

import { AuthenticationService, JWTPayload } from '@/lib/user-portal/auth-service';

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  USER = 'USER',
  INVESTOR = 'INVESTOR',
  ADVISOR = 'ADVISOR',
}

/**
 * Authorization context containing user information
 */
export interface AuthorizationContext {
  userId: string;
  email: string;
  role: UserRole;
  isAuthenticated: boolean;
  token?: string;
}

/**
 * Endpoint permission configuration
 */
export interface EndpointPermission {
  path: string;
  method: string;
  allowedRoles: UserRole[];
  requiresAuth: boolean;
}

/**
 * Authorization Middleware
 */
export class AuthorizationMiddleware {
  /**
   * Extract token from request
   */
  static extractToken(request: any): string | null {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  /**
   * Verify token and extract authorization context
   */
  static verifyTokenAndExtractContext(token: string): AuthorizationContext | null {
    try {
      const payload = AuthenticationService.verifyToken(token);

      if (!payload) {
        return null;
      }

      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role as UserRole,
        isAuthenticated: true,
        token,
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * Check if user has required role
   */
  static hasRole(context: AuthorizationContext, requiredRoles: UserRole[]): boolean {
    if (!context.isAuthenticated) {
      return false;
    }

    return requiredRoles.includes(context.role);
  }

  /**
   * Check if user has any of the required roles
   */
  static hasAnyRole(context: AuthorizationContext, requiredRoles: UserRole[]): boolean {
    if (!context.isAuthenticated) {
      return false;
    }

    return requiredRoles.some((role) => context.role === role);
  }

  /**
   * Check if user has all required roles
   */
  static hasAllRoles(context: AuthorizationContext, requiredRoles: UserRole[]): boolean {
    if (!context.isAuthenticated) {
      return false;
    }

    return requiredRoles.every((role) => context.role === role);
  }

  /**
   * Middleware to protect endpoints with authentication
   */
  static authenticate(handler: (request: any, context: AuthorizationContext) => Promise<any>) {
    return async (request: any): Promise<any> => {
      try {
        // Extract token from request
        const token = this.extractToken(request);

        if (!token) {
          const { NextResponse } = require('next/server');
          return NextResponse.json(
            {
              success: false,
              message: 'Missing or invalid authorization header',
              error: 'MISSING_AUTH_HEADER',
            },
            { status: 401 }
          );
        }

        // Verify token and extract context
        const context = this.verifyTokenAndExtractContext(token);

        if (!context) {
          const { NextResponse } = require('next/server');
          return NextResponse.json(
            {
              success: false,
              message: 'Invalid or expired token',
              error: 'INVALID_TOKEN',
            },
            { status: 401 }
          );
        }

        // Call handler with context
        return await handler(request, context);
      } catch (error) {
        console.error('Authentication middleware error:', error);
        const { NextResponse } = require('next/server');
        return NextResponse.json(
          {
            success: false,
            message: 'Authentication failed',
            error: 'AUTH_ERROR',
          },
          { status: 500 }
        );
      }
    };
  }

  /**
   * Middleware to protect endpoints with role-based access control
   */
  static authorize(requiredRoles: UserRole[]) {
    return (handler: (request: any, context: AuthorizationContext) => Promise<any>) => {
      return async (request: any): Promise<any> => {
        try {
          // Extract token from request
          const token = this.extractToken(request);

          if (!token) {
            const { NextResponse } = require('next/server');
            return NextResponse.json(
              {
                success: false,
                message: 'Missing or invalid authorization header',
                error: 'MISSING_AUTH_HEADER',
              },
              { status: 401 }
            );
          }

          // Verify token and extract context
          const context = this.verifyTokenAndExtractContext(token);

          if (!context) {
            const { NextResponse } = require('next/server');
            return NextResponse.json(
              {
                success: false,
                message: 'Invalid or expired token',
                error: 'INVALID_TOKEN',
              },
              { status: 401 }
            );
          }

          // Check if user has required role
          if (!this.hasAnyRole(context, requiredRoles)) {
            const { NextResponse } = require('next/server');
            return NextResponse.json(
              {
                success: false,
                message: 'Insufficient permissions',
                error: 'INSUFFICIENT_PERMISSIONS',
              },
              { status: 403 }
            );
          }

          // Call handler with context
          return await handler(request, context);
        } catch (error) {
          console.error('Authorization middleware error:', error);
          const { NextResponse } = require('next/server');
          return NextResponse.json(
            {
              success: false,
              message: 'Authorization failed',
              error: 'AUTHZ_ERROR',
            },
            { status: 500 }
          );
        }
      };
    };
  }

  /**
   * Middleware to protect endpoints with optional authentication
   */
  static optionalAuth(handler: (request: any, context: AuthorizationContext | null) => Promise<any>) {
    return async (request: any): Promise<any> => {
      try {
        // Extract token from request
        const token = this.extractToken(request);

        let context: AuthorizationContext | null = null;

        if (token) {
          // Verify token and extract context
          context = this.verifyTokenAndExtractContext(token);
        }

        // Call handler with context (may be null)
        return await handler(request, context);
      } catch (error) {
        console.error('Optional authentication middleware error:', error);
        const { NextResponse } = require('next/server');
        return NextResponse.json(
          {
            success: false,
            message: 'Authentication failed',
            error: 'AUTH_ERROR',
          },
          { status: 500 }
        );
      }
    };
  }

  /**
   * Check if user is owner of resource
   */
  static isResourceOwner(context: AuthorizationContext, resourceOwnerId: string): boolean {
    return context.userId === resourceOwnerId;
  }

  /**
   * Check if user is admin
   */
  static isAdmin(context: AuthorizationContext): boolean {
    return context.role === UserRole.ADMIN;
  }

  /**
   * Check if user is employee
   */
  static isEmployee(context: AuthorizationContext): boolean {
    return context.role === UserRole.EMPLOYEE;
  }

  /**
   * Check if user is regular user
   */
  static isRegularUser(context: AuthorizationContext): boolean {
    return context.role === UserRole.USER;
  }

  /**
   * Check if user is investor
   */
  static isInvestor(context: AuthorizationContext): boolean {
    return context.role === UserRole.INVESTOR;
  }

  /**
   * Check if user is advisor
   */
  static isAdvisor(context: AuthorizationContext): boolean {
    return context.role === UserRole.ADVISOR;
  }

  /**
   * Get role hierarchy level (higher number = more permissions)
   */
  static getRoleHierarchyLevel(role: UserRole): number {
    const hierarchy: Record<UserRole, number> = {
      [UserRole.ADMIN]: 4,
      [UserRole.ADVISOR]: 3,
      [UserRole.EMPLOYEE]: 2,
      [UserRole.INVESTOR]: 1,
      [UserRole.USER]: 0,
    };

    return hierarchy[role] || -1;
  }

  /**
   * Check if user has higher or equal role hierarchy
   */
  static hasHigherOrEqualRole(context: AuthorizationContext, minimumRole: UserRole): boolean {
    const userLevel = this.getRoleHierarchyLevel(context.role);
    const minimumLevel = this.getRoleHierarchyLevel(minimumRole);

    return userLevel >= minimumLevel;
  }

  /**
   * Validate endpoint permission
   */
  static validateEndpointPermission(
    context: AuthorizationContext | null,
    permission: EndpointPermission
  ): boolean {
    // If authentication is not required and no specific roles required, allow all
    if (!permission.requiresAuth && permission.allowedRoles.length === 0) {
      return true;
    }

    // Check if authentication is required
    if (permission.requiresAuth && !context?.isAuthenticated) {
      return false;
    }

    // If no specific roles required, allow authenticated users
    if (permission.allowedRoles.length === 0) {
      return context?.isAuthenticated ?? false;
    }

    // Check if user has required role
    if (!context) {
      return false;
    }

    return this.hasAnyRole(context, permission.allowedRoles);
  }
}

export default AuthorizationMiddleware;

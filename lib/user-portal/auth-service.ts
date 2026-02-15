/**
 * Authentication Service for User Portal System
 * Handles JWT token generation, validation, and session management
 * Validates: Requirements 1.5
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * JWT Token Payload
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Session Data
 */
export interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Login Request
 */
export interface LoginRequest {
  identifier: string; // email, phone, or username
  password: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  session?: SessionData;
  error?: string;
}

/**
 * Logout Response
 */
export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * Authentication Service
 */
export class AuthenticationService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  private static readonly JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
  private static readonly REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  /**
   * Generate JWT token
   */
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRY,
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, this.JWT_REFRESH_SECRET) as { userId: string };
      return decoded;
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  /**
   * Login user with credentials
   */
  static async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const { identifier, password } = request;

      if (!identifier || !password) {
        return {
          success: false,
          message: 'Missing identifier or password',
          error: 'MISSING_CREDENTIALS',
        };
      }

      // Find user by email, phone, or username
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { phone: identifier },
            { username: identifier },
          ],
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials',
          error: 'INVALID_CREDENTIALS',
        };
      }

      // Check if account is locked
      const isLocked = await this.isAccountLocked(user.id);
      if (isLocked) {
        return {
          success: false,
          message: 'Account is temporarily locked due to too many failed login attempts',
          error: 'ACCOUNT_LOCKED',
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        // Record failed login attempt
        await this.recordFailedLoginAttempt(user.id);
        return {
          success: false,
          message: 'Invalid credentials',
          error: 'INVALID_CREDENTIALS',
        };
      }

      // Clear failed login attempts
      await this.clearFailedLoginAttempts(user.id);

      // Generate tokens
      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = this.generateRefreshToken(user.id);

      // Store refresh token in database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
        },
      });

      // Create session
      const session: SessionData = {
        userId: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        avatar: user.avatar || undefined,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };

      return {
        success: true,
        message: 'Login successful',
        token,
        refreshToken,
        session,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed',
        error: 'LOGIN_ERROR',
      };
    }
  }

  /**
   * Logout user
   */
  static async logout(userId: string): Promise<LogoutResponse> {
    try {
      // Invalidate refresh tokens (if stored in database)
      // For now, we'll just return success as JWT tokens are stateless
      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed',
      };
    }
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken: string): Promise<{ token?: string; error?: string }> {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);

      if (!decoded) {
        return {
          error: 'INVALID_REFRESH_TOKEN',
        };
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return {
          error: 'USER_NOT_FOUND',
        };
      }

      // Generate new access token
      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return { token };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        error: 'TOKEN_REFRESH_ERROR',
      };
    }
  }

  /**
   * Check if account is locked
   */
  private static async isAccountLocked(userId: string): Promise<boolean> {
    try {
      const loginLog = await prisma.loginLog.findFirst({
        where: {
          userId,
          success: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: this.MAX_LOGIN_ATTEMPTS,
      });

      if (!loginLog) {
        return false;
      }

      // Check if the last failed attempt is within the lockout duration
      const timeSinceLastAttempt = Date.now() - loginLog.createdAt.getTime();
      return timeSinceLastAttempt < this.LOCKOUT_DURATION;
    } catch (error) {
      console.error('Error checking account lock:', error);
      return false;
    }
  }

  /**
   * Record failed login attempt
   */
  private static async recordFailedLoginAttempt(userId: string): Promise<void> {
    try {
      await prisma.loginLog.create({
        data: {
          userId,
          success: false,
          ipAddress: 'unknown', // Should be passed from request
          userAgent: 'unknown', // Should be passed from request
        },
      });
    } catch (error) {
      console.error('Error recording failed login attempt:', error);
    }
  }

  /**
   * Clear failed login attempts
   */
  private static async clearFailedLoginAttempts(userId: string): Promise<void> {
    try {
      await prisma.loginLog.deleteMany({
        where: {
          userId,
          success: false,
        },
      });
    } catch (error) {
      console.error('Error clearing failed login attempts:', error);
    }
  }

  /**
   * Validate session
   */
  static async validateSession(token: string): Promise<SessionData | null> {
    try {
      const payload = this.verifyToken(token);

      if (!payload) {
        return null;
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        return null;
      }

      return {
        userId: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        avatar: user.avatar || undefined,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  /**
   * Hash password
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verify password
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export default AuthenticationService;

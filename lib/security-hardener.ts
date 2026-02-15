/**
 * 安全加固工具库
 * 包含认证、授权、数据保护等安全功能
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * 安全头配置
 */
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

/**
 * 添加安全头到响应
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * CSRF 令牌生成器
 */
export class CSRFTokenGenerator {
  private tokens: Map<string, { token: string; timestamp: number }> =
    new Map();
  private tokenTTL: number = 3600000; // 1 小时

  /**
   * 生成 CSRF 令牌
   */
  generateToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString("hex");
    this.tokens.set(sessionId, {
      token,
      timestamp: Date.now(),
    });
    return token;
  }

  /**
   * 验证 CSRF 令牌
   */
  verifyToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);

    if (!stored) {
      return false;
    }

    // 检查是否过期
    if (Date.now() - stored.timestamp > this.tokenTTL) {
      this.tokens.delete(sessionId);
      return false;
    }

    // 使用恒定时间比较防止时序攻击
    return crypto.timingSafeEqual(
      Buffer.from(stored.token),
      Buffer.from(token)
    );
  }

  /**
   * 删除令牌
   */
  deleteToken(sessionId: string): void {
    this.tokens.delete(sessionId);
  }

  /**
   * 清空过期令牌
   */
  cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [sessionId, data] of this.tokens.entries()) {
      if (now - data.timestamp > this.tokenTTL) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

/**
 * 密码验证器
 */
export class PasswordValidator {
  /**
   * 验证密码强度
   */
  static validateStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // 长度检查
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("密码至少需要 8 个字符");
    }

    if (password.length >= 12) {
      score += 1;
    }

    // 大小写检查
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("密码需要包含小写字母");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("密码需要包含大写字母");
    }

    // 数字检查
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("密码需要包含数字");
    }

    // 特殊字符检查
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push("密码需要包含特殊字符");
    }

    return {
      isValid: score >= 4,
      score,
      feedback,
    };
  }

  /**
   * 检查常见密码
   */
  static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      "password",
      "123456",
      "12345678",
      "qwerty",
      "abc123",
      "password123",
      "admin",
      "letmein",
      "welcome",
      "monkey",
    ];

    return commonPasswords.includes(password.toLowerCase());
  }
}

/**
 * 输入验证器
 */
export class InputValidator {
  /**
   * 验证电子邮件
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * 验证 URL
   */
  static validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证电话号码
   */
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 清理字符串（防止 XSS）
   */
  static sanitizeString(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  /**
   * 验证 JSON
   */
  static validateJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 限制字符串长度
   */
  static limitLength(str: string, maxLength: number): string {
    return str.substring(0, maxLength);
  }
}

/**
 * 加密工具
 */
export class EncryptionUtils {
  private algorithm = "aes-256-gcm";
  private keyLength = 32; // 256 bits

  /**
   * 生成加密密钥
   */
  static generateKey(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * 加密数据
   */
  encrypt(data: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(key, "hex"),
      iv
    );

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  }

  /**
   * 解密数据
   */
  decrypt(encryptedData: string, key: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(":");

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(key, "hex"),
      iv
    );

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * 生成哈希
   */
  static hash(data: string, algorithm: string = "sha256"): string {
    return crypto.createHash(algorithm).update(data).digest("hex");
  }

  /**
   * 验证哈希
   */
  static verifyHash(data: string, hash: string, algorithm: string = "sha256"): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(this.hash(data, algorithm)),
      Buffer.from(hash)
    );
  }
}

/**
 * 会话管理器
 */
export class SessionManager {
  private sessions: Map<
    string,
    {
      userId: string;
      createdAt: number;
      lastActivity: number;
      expiresAt: number;
    }
  > = new Map();

  private sessionTTL: number = 3600000; // 1 小时
  private inactivityTimeout: number = 1800000; // 30 分钟

  /**
   * 创建会话
   */
  createSession(sessionId: string, userId: string): void {
    const now = Date.now();
    this.sessions.set(sessionId, {
      userId,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + this.sessionTTL,
    });
  }

  /**
   * 验证会话
   */
  validateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return false;
    }

    const now = Date.now();

    // 检查是否过期
    if (now > session.expiresAt) {
      this.sessions.delete(sessionId);
      return false;
    }

    // 检查不活动超时
    if (now - session.lastActivity > this.inactivityTimeout) {
      this.sessions.delete(sessionId);
      return false;
    }

    // 更新最后活动时间
    session.lastActivity = now;

    return true;
  }

  /**
   * 获取会话用户
   */
  getSessionUser(sessionId: string): string | null {
    if (!this.validateSession(sessionId)) {
      return null;
    }

    return this.sessions.get(sessionId)?.userId || null;
  }

  /**
   * 销毁会话
   */
  destroySession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * 清空过期会话
   */
  cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

/**
 * 全局 CSRF 令牌生成器
 */
export const globalCSRFGenerator = new CSRFTokenGenerator();

/**
 * 全局加密工具
 */
export const globalEncryption = new EncryptionUtils();

/**
 * 全局会话管理器
 */
export const globalSessionManager = new SessionManager();

/**
 * 安全中间件
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  return addSecurityHeaders(response);
}

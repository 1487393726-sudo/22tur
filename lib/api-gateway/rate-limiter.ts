// 速率限制器
import { RateLimitConfig } from './types';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// 内存存储（生产环境应使用 Redis）
const rateLimitStore: Map<string, RateLimitEntry> = new Map();

// 清理过期条目
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  // 检查速率限制
  check(key: string): RateLimitResult {
    if (!this.config.enabled) {
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        reset: Date.now() + this.config.windowMs,
      };
    }

    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // 如果没有记录或已过期，创建新记录
    if (!entry || entry.resetTime < now) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      rateLimitStore.set(key, newEntry);

      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        reset: newEntry.resetTime,
      };
    }

    // 检查是否超过限制
    if (entry.count >= this.config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        reset: entry.resetTime,
        retryAfter,
      };
    }

    // 增加计数
    entry.count++;
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - entry.count,
      reset: entry.resetTime,
    };
  }

  // 生成限制键
  generateKey(
    type: 'ip' | 'user' | 'api-key',
    value: string,
    route?: string
  ): string {
    const parts = ['ratelimit', type, value];
    if (route) {
      parts.push(route);
    }
    return parts.join(':');
  }

  // 重置限制
  reset(key: string): void {
    rateLimitStore.delete(key);
  }

  // 获取当前状态
  getStatus(key: string): RateLimitEntry | undefined {
    return rateLimitStore.get(key);
  }
}

// 默认速率限制器
export const defaultRateLimiter = new RateLimiter({
  enabled: true,
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 100,
  keyGenerator: 'ip',
});

// 严格速率限制器（用于敏感操作）
export const strictRateLimiter = new RateLimiter({
  enabled: true,
  windowMs: 60 * 1000,
  maxRequests: 10,
  keyGenerator: 'ip',
});

// API 密钥速率限制器
export const apiKeyRateLimiter = new RateLimiter({
  enabled: true,
  windowMs: 60 * 1000,
  maxRequests: 1000,
  keyGenerator: 'api-key',
});

export default RateLimiter;

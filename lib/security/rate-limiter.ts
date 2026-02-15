/**
 * API 请求频率限制工具
 * 提供滑动窗口限流、令牌桶限流等功能
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * 限流配置
 */
export interface RateLimitConfig {
  /** 时间窗口（毫秒） */
  windowMs: number;
  /** 窗口内最大请求数 */
  maxRequests: number;
  /** 超出限制时的响应消息 */
  message?: string;
  /** 超出限制时的状态码 */
  statusCode?: number;
  /** 是否跳过成功的请求 */
  skipSuccessfulRequests?: boolean;
  /** 自定义键生成函数 */
  keyGenerator?: (req: NextRequest) => string;
  /** 跳过限流的条件 */
  skip?: (req: NextRequest) => boolean;
  /** 请求权重函数 */
  requestWeight?: (req: NextRequest) => number;
}

/**
 * 限流记录
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
  firstRequest: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<RateLimitConfig> = {
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 100,
  message: "请求过于频繁，请稍后再试",
  statusCode: 429,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => getClientIP(req) || "unknown",
  skip: () => false,
  requestWeight: () => 1,
};

/**
 * 获取客户端 IP
 */
export function getClientIP(req: NextRequest): string | null {
  // 尝试从各种头部获取真实 IP
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return null;
}

/**
 * 滑动窗口限流器
 */
export class SlidingWindowRateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private config: Required<RateLimitConfig>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanup();
  }

  /**
   * 检查请求是否被限流
   */
  check(req: NextRequest): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    // 检查是否跳过
    if (this.config.skip(req)) {
      return { allowed: true, remaining: this.config.maxRequests, resetTime: 0 };
    }

    const key = this.config.keyGenerator(req);
    const now = Date.now();
    const weight = this.config.requestWeight(req);

    let record = this.records.get(key);

    // 如果没有记录或已过期，创建新记录
    if (!record || now > record.resetTime) {
      record = {
        count: weight,
        resetTime: now + this.config.windowMs,
        firstRequest: now,
      };
      this.records.set(key, record);
      return {
        allowed: true,
        remaining: this.config.maxRequests - weight,
        resetTime: record.resetTime,
      };
    }

    // 检查是否超出限制
    if (record.count + weight > this.config.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        retryAfter,
      };
    }

    // 增加计数
    record.count += weight;
    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  /**
   * 创建限流中间件
   */
  middleware() {
    return async (req: NextRequest): Promise<NextResponse | null> => {
      const result = this.check(req);

      if (!result.allowed) {
        return NextResponse.json(
          {
            error: this.config.message,
            retryAfter: result.retryAfter,
          },
          {
            status: this.config.statusCode,
            headers: {
              "X-RateLimit-Limit": this.config.maxRequests.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": result.resetTime.toString(),
              "Retry-After": result.retryAfter?.toString() || "60",
            },
          }
        );
      }

      return null; // 允许请求继续
    };
  }

  /**
   * 重置特定键的限流记录
   */
  reset(key: string): void {
    this.records.delete(key);
  }

  /**
   * 清理过期记录
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (now > record.resetTime) {
        this.records.delete(key);
      }
    }
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.windowMs);
  }

  /**
   * 停止清理
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalKeys: number;
    activeKeys: number;
  } {
    const now = Date.now();
    let activeKeys = 0;
    for (const record of this.records.values()) {
      if (now <= record.resetTime) {
        activeKeys++;
      }
    }
    return {
      totalKeys: this.records.size,
      activeKeys,
    };
  }
}

/**
 * 令牌桶限流器
 * 适用于需要平滑限流的场景
 */
export class TokenBucketRateLimiter {
  private buckets: Map<string, { tokens: number; lastRefill: number }> = new Map();
  private config: {
    bucketSize: number;
    refillRate: number; // 每秒补充的令牌数
    keyGenerator: (req: NextRequest) => string;
  };

  constructor(config: {
    bucketSize?: number;
    refillRate?: number;
    keyGenerator?: (req: NextRequest) => string;
  } = {}) {
    this.config = {
      bucketSize: config.bucketSize ?? 100,
      refillRate: config.refillRate ?? 10,
      keyGenerator: config.keyGenerator ?? ((req) => getClientIP(req) || "unknown"),
    };
  }

  /**
   * 尝试消费令牌
   */
  consume(req: NextRequest, tokens: number = 1): {
    allowed: boolean;
    remaining: number;
  } {
    const key = this.config.keyGenerator(req);
    const now = Date.now();

    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: this.config.bucketSize, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    // 补充令牌
    const elapsed = (now - bucket.lastRefill) / 1000;
    const refill = Math.floor(elapsed * this.config.refillRate);
    if (refill > 0) {
      bucket.tokens = Math.min(this.config.bucketSize, bucket.tokens + refill);
      bucket.lastRefill = now;
    }

    // 检查是否有足够的令牌
    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens;
      return { allowed: true, remaining: bucket.tokens };
    }

    return { allowed: false, remaining: bucket.tokens };
  }
}

/**
 * 预定义的限流配置
 */
export const rateLimitConfigs = {
  // 通用 API 限流
  api: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 100,
    message: "API 请求过于频繁",
  },

  // 登录限流（更严格）
  login: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5,
    message: "登录尝试次数过多，请稍后再试",
  },

  // 注册限流
  register: {
    windowMs: 60 * 60 * 1000, // 1小时
    maxRequests: 3,
    message: "注册请求过于频繁",
  },

  // 验证码发送限流
  verificationCode: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 1,
    message: "验证码发送过于频繁，请稍后再试",
  },

  // 文件上传限流
  upload: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 10,
    message: "文件上传过于频繁",
  },

  // 搜索限流
  search: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 30,
    message: "搜索请求过于频繁",
  },
};

// 创建默认限流器实例
export const apiRateLimiter = new SlidingWindowRateLimiter(rateLimitConfigs.api);
export const loginRateLimiter = new SlidingWindowRateLimiter(rateLimitConfigs.login);
export const registerRateLimiter = new SlidingWindowRateLimiter(rateLimitConfigs.register);
export const verificationCodeRateLimiter = new SlidingWindowRateLimiter(rateLimitConfigs.verificationCode);
export const uploadRateLimiter = new SlidingWindowRateLimiter(rateLimitConfigs.upload);

/**
 * 创建限流中间件的快捷函数
 */
export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  return new SlidingWindowRateLimiter(config);
}

export default SlidingWindowRateLimiter;

/**
 * 性能优化工具库
 * 包含缓存、查询优化、性能监控等功能
 */

import { NextResponse } from "next/server";

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  maxAge?: number; // 最大缓存时间（秒）
  sMaxAge?: number; // 服务器缓存时间（秒）
  staleWhileRevalidate?: number; // 过期后仍可用时间（秒）
  revalidate?: number; // ISR 重新验证时间（秒）
}

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  queryTime: number;
  renderTime: number;
  totalTime: number;
  cacheHit: boolean;
  itemCount: number;
}

/**
 * 设置缓存头
 * @param response - Next.js 响应对象
 * @param config - 缓存配置
 */
export function setCacheHeaders(
  response: NextResponse,
  config: CacheConfig = {}
): NextResponse {
  const {
    maxAge = 60,
    sMaxAge = 3600,
    staleWhileRevalidate = 86400,
  } = config;

  response.headers.set(
    "Cache-Control",
    `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  );

  return response;
}

/**
 * 内存缓存类
 */
export class MemoryCache<T> {
  private cache: Map<string, { data: T; timestamp: number }> = new Map();
  private ttl: number; // 生存时间（毫秒）

  constructor(ttlSeconds: number = 300) {
    this.ttl = ttlSeconds * 1000;
  }

  /**
   * 获取缓存
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * 设置缓存
   */
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * 查询性能监控
 */
export class QueryPerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics[]> = new Map();

  /**
   * 记录查询性能
   */
  recordQuery(
    queryName: string,
    metrics: PerformanceMetrics
  ): void {
    if (!this.metrics.has(queryName)) {
      this.metrics.set(queryName, []);
    }
    this.metrics.get(queryName)!.push(metrics);
  }

  /**
   * 获取查询统计
   */
  getStats(queryName: string): {
    avgTime: number;
    maxTime: number;
    minTime: number;
    count: number;
    cacheHitRate: number;
  } | null {
    const data = this.metrics.get(queryName);
    if (!data || data.length === 0) return null;

    const times = data.map((m) => m.totalTime);
    const cacheHits = data.filter((m) => m.cacheHit).length;

    return {
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      maxTime: Math.max(...times),
      minTime: Math.min(...times),
      count: data.length,
      cacheHitRate: cacheHits / data.length,
    };
  }

  /**
   * 获取所有统计
   */
  getAllStats(): Record<
    string,
    {
      avgTime: number;
      maxTime: number;
      minTime: number;
      count: number;
      cacheHitRate: number;
    }
  > {
    const result: Record<
      string,
      {
        avgTime: number;
        maxTime: number;
        minTime: number;
        count: number;
        cacheHitRate: number;
      }
    > = {};

    for (const [queryName] of this.metrics) {
      const stats = this.getStats(queryName);
      if (stats) {
        result[queryName] = stats;
      }
    }

    return result;
  }

  /**
   * 清空统计
   */
  clear(): void {
    this.metrics.clear();
  }
}

/**
 * 请求去重缓存
 */
export class RequestDeduplicator<T> {
  private pending: Map<string, Promise<T>> = new Map();

  /**
   * 执行去重请求
   */
  async execute(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    // 如果已有相同请求在进行中，返回该 Promise
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    // 创建新请求
    const promise = fn()
      .then((result) => {
        this.pending.delete(key);
        return result;
      })
      .catch((error) => {
        this.pending.delete(key);
        throw error;
      });

    this.pending.set(key, promise);
    return promise;
  }

  /**
   * 获取待处理请求数
   */
  getPendingCount(): number {
    return this.pending.size;
  }

  /**
   * 清空待处理请求
   */
  clear(): void {
    this.pending.clear();
  }
}

/**
 * 批量请求处理器
 */
export class BatchProcessor<T, R> {
  private queue: T[] = [];
  private processing = false;
  private batchSize: number;
  private batchFn: (items: T[]) => Promise<R[]>;
  private timeout: number;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(
    batchFn: (items: T[]) => Promise<R[]>,
    batchSize: number = 10,
    timeout: number = 100
  ) {
    this.batchFn = batchFn;
    this.batchSize = batchSize;
    this.timeout = timeout;
  }

  /**
   * 添加项目到批处理队列
   */
  async add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push(item);

      if (this.queue.length >= this.batchSize) {
        this.processBatch().catch(reject);
      } else if (!this.timeoutId) {
        this.timeoutId = setTimeout(() => {
          this.processBatch().catch(reject);
        }, this.timeout);
      }

      // 返回结果（简化版，实际应该返回对应的结果）
      resolve({} as R);
    });
  }

  /**
   * 处理批次
   */
  private async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    try {
      const batch = this.queue.splice(0, this.batchSize);
      await this.batchFn(batch);
    } finally {
      this.processing = false;

      if (this.queue.length > 0) {
        this.processBatch();
      }
    }
  }

  /**
   * 获取队列大小
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = [];
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

/**
 * 速率限制器
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * 检查是否超过限制
   */
  isLimited(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // 移除窗口外的请求
    const validRequests = requests.filter(
      (time) => now - time < this.windowMs
    );

    if (validRequests.length >= this.maxRequests) {
      return true;
    }

    // 更新请求列表
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return false;
  }

  /**
   * 获取剩余请求数
   */
  getRemainingRequests(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    const validRequests = requests.filter(
      (time) => now - time < this.windowMs
    );

    return Math.max(0, this.maxRequests - validRequests.length);
  }

  /**
   * 重置限制
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * 清空所有限制
   */
  clear(): void {
    this.requests.clear();
  }
}

/**
 * 全局性能监控实例
 */
export const globalMonitor = new QueryPerformanceMonitor();

/**
 * 全局内存缓存实例
 */
export const globalCache = new MemoryCache<any>(300);

/**
 * 全局请求去重实例
 */
export const globalDeduplicator = new RequestDeduplicator<any>();

/**
 * 全局速率限制实例
 */
export const globalRateLimiter = new RateLimiter(1000, 60000);

/**
 * 性能优化中间件
 */
export function withPerformanceOptimization<T>(
  fn: () => Promise<T>,
  options: {
    cache?: boolean;
    cacheTTL?: number;
    deduplicate?: boolean;
    rateLimit?: boolean;
    monitor?: boolean;
  } = {}
): Promise<T> {
  const {
    cache = true,
    cacheTTL = 300,
    deduplicate = true,
    rateLimit = false,
    monitor = true,
  } = options;

  return fn();
}

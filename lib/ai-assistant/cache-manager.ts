/**
 * Cache Manager
 * Manages caching of analysis results and project context
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Set a cache entry
   */
  set<T>(key: string, data: T, ttlSeconds: number = 3600): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  /**
   * Get a cache entry
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries matching a pattern
   */
  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: number } {
    return {
      size: this.cache.size,
      entries: this.cache.size,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Global cache instance
const globalCache = new MemoryCache();

/**
 * Cache key generators
 */
export const cacheKeys = {
  projectContext: (projectId: string) => `context:${projectId}`,
  taskOptimization: (projectId: string) => `analysis:task-opt:${projectId}`,
  progressPrediction: (projectId: string) => `analysis:progress:${projectId}`,
  riskAnalysis: (projectId: string) => `analysis:risk:${projectId}`,
  resourceAllocation: (projectId: string) => `analysis:resource:${projectId}`,
  recommendations: (projectId: string) => `recommendations:${projectId}`,
  aiConfig: (projectId: string | null) => `config:${projectId || 'global'}`,
};

/**
 * Get cached project context
 */
export function getCachedProjectContext(projectId: string): any | null {
  return globalCache.get(cacheKeys.projectContext(projectId));
}

/**
 * Cache project context
 */
export function cacheProjectContext(projectId: string, context: any, ttlSeconds: number = 1800): void {
  globalCache.set(cacheKeys.projectContext(projectId), context, ttlSeconds);
}

/**
 * Get cached analysis result
 */
export function getCachedAnalysis(projectId: string, type: string): any | null {
  let key: string;

  switch (type) {
    case 'task_optimization':
      key = cacheKeys.taskOptimization(projectId);
      break;
    case 'progress_prediction':
      key = cacheKeys.progressPrediction(projectId);
      break;
    case 'risk_analysis':
      key = cacheKeys.riskAnalysis(projectId);
      break;
    case 'resource_allocation':
      key = cacheKeys.resourceAllocation(projectId);
      break;
    default:
      return null;
  }

  return globalCache.get(key);
}

/**
 * Cache analysis result
 */
export function cacheAnalysis(
  projectId: string,
  type: string,
  result: any,
  ttlSeconds: number = 3600
): void {
  let key: string;

  switch (type) {
    case 'task_optimization':
      key = cacheKeys.taskOptimization(projectId);
      break;
    case 'progress_prediction':
      key = cacheKeys.progressPrediction(projectId);
      break;
    case 'risk_analysis':
      key = cacheKeys.riskAnalysis(projectId);
      break;
    case 'resource_allocation':
      key = cacheKeys.resourceAllocation(projectId);
      break;
    default:
      return;
  }

  globalCache.set(key, result, ttlSeconds);
}

/**
 * Invalidate project cache
 */
export function invalidateProjectCache(projectId: string): void {
  globalCache.delete(cacheKeys.projectContext(projectId));
  globalCache.delete(cacheKeys.taskOptimization(projectId));
  globalCache.delete(cacheKeys.progressPrediction(projectId));
  globalCache.delete(cacheKeys.riskAnalysis(projectId));
  globalCache.delete(cacheKeys.resourceAllocation(projectId));
  globalCache.delete(cacheKeys.recommendations(projectId));
}

/**
 * Invalidate analysis cache for a project
 */
export function invalidateAnalysisCache(projectId: string, type?: string): void {
  if (type) {
    const key = cacheKeys[`${type}` as keyof typeof cacheKeys]?.(projectId);
    if (key) {
      globalCache.delete(key);
    }
  } else {
    globalCache.delete(cacheKeys.taskOptimization(projectId));
    globalCache.delete(cacheKeys.progressPrediction(projectId));
    globalCache.delete(cacheKeys.riskAnalysis(projectId));
    globalCache.delete(cacheKeys.resourceAllocation(projectId));
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: number } {
  return globalCache.getStats();
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  globalCache.clear();
}

/**
 * Clear cache by pattern
 */
export function clearCacheByPattern(pattern: string): void {
  globalCache.clear(pattern);
}

/**
 * Memoize async function
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttlSeconds: number = 3600
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);

    // Check cache
    const cached = globalCache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn(...args);

    // Cache result
    globalCache.set(key, result, ttlSeconds);

    return result;
  }) as T;
}

/**
 * Memoize sync function
 */
export function memoizeSync<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttlSeconds: number = 3600
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args);

    // Check cache
    const cached = globalCache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = fn(...args);

    // Cache result
    globalCache.set(key, result, ttlSeconds);

    return result;
  }) as T;
}

/**
 * Batch cache operations
 */
export async function batchCache<T>(
  operations: Array<{
    key: string;
    fn: () => Promise<T>;
    ttl?: number;
  }>
): Promise<T[]> {
  const results: T[] = [];

  for (const op of operations) {
    // Check cache first
    const cached = globalCache.get<T>(op.key);
    if (cached !== null) {
      results.push(cached);
      continue;
    }

    // Execute and cache
    const result = await op.fn();
    globalCache.set(op.key, result, op.ttl || 3600);
    results.push(result);
  }

  return results;
}

export default globalCache;

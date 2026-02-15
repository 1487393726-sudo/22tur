/**
 * 缓存工具库
 * 提供内存缓存和查询结果缓存功能
 */

// 缓存项接口
interface CacheItem<T> {
  value: T;
  expiry: number;
  createdAt: number;
}

// 缓存配置
interface CacheConfig {
  defaultTTL: number; // 默认过期时间（毫秒）
  maxSize: number; // 最大缓存项数
  cleanupInterval: number; // 清理间隔（毫秒）
}

// 默认配置
const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5分钟
  maxSize: 1000,
  cleanupInterval: 60 * 1000, // 1分钟
};

/**
 * 内存缓存类
 */
class MemoryCache {
  private cache: Map<string, CacheItem<unknown>> = new Map();
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanup();
  }

  /**
   * 获取缓存值
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    if (!item) return null;

    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * 设置缓存值
   */
  set<T>(key: string, value: T, ttl?: number): void {
    // 检查缓存大小限制
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const expiry = Date.now() + (ttl ?? this.config.defaultTTL);
    this.cache.set(key, {
      value,
      expiry,
      createdAt: Date.now(),
    });
  }

  /**
   * 删除缓存值
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 获取或设置缓存（带回调）
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * 按前缀删除缓存
   */
  deleteByPrefix(prefix: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * 淘汰最旧的缓存项
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    if (this.cleanupTimer) return;
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * 停止定期清理
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // 可以扩展实现命中率统计
    };
  }
}

// 创建全局缓存实例
export const cache = new MemoryCache();

// 查询缓存实例（较短TTL）
export const queryCache = new MemoryCache({
  defaultTTL: 30 * 1000, // 30秒
  maxSize: 500,
});

// 会话缓存实例（较长TTL）
export const sessionCache = new MemoryCache({
  defaultTTL: 30 * 60 * 1000, // 30分钟
  maxSize: 200,
});

/**
 * 缓存键生成器
 */
export const cacheKeys = {
  // 项目相关
  projectList: (params: Record<string, unknown>) =>
    `projects:list:${JSON.stringify(params)}`,
  projectDetail: (id: string) => `projects:detail:${id}`,
  projectStats: (id: string) => `projects:stats:${id}`,

  // 投资相关
  investmentList: (userId: string, params: Record<string, unknown>) =>
    `investments:list:${userId}:${JSON.stringify(params)}`,
  investmentDetail: (id: string) => `investments:detail:${id}`,

  // 文件相关
  fileList: (projectId: string) => `files:list:${projectId}`,
  fileAccess: (fileId: string, userId: string) =>
    `files:access:${fileId}:${userId}`,

  // 用户相关
  userProfile: (id: string) => `users:profile:${id}`,
  userInvestments: (id: string) => `users:investments:${id}`,

  // 分析相关
  analyticsInvestments: (params: Record<string, unknown>) =>
    `analytics:investments:${JSON.stringify(params)}`,
  analyticsFileAccess: (params: Record<string, unknown>) =>
    `analytics:file-access:${JSON.stringify(params)}`,
};

/**
 * 缓存失效器
 */
export const cacheInvalidator = {
  // 项目更新时失效相关缓存
  onProjectUpdate: (projectId: string) => {
    cache.delete(cacheKeys.projectDetail(projectId));
    cache.delete(cacheKeys.projectStats(projectId));
    cache.deleteByPrefix("projects:list:");
  },

  // 投资更新时失效相关缓存
  onInvestmentUpdate: (investmentId: string, projectId: string, userId: string) => {
    cache.delete(cacheKeys.investmentDetail(investmentId));
    cache.delete(cacheKeys.projectDetail(projectId));
    cache.delete(cacheKeys.projectStats(projectId));
    cache.deleteByPrefix(`investments:list:${userId}:`);
    cache.deleteByPrefix("analytics:investments:");
  },

  // 文件更新时失效相关缓存
  onFileUpdate: (projectId: string) => {
    cache.delete(cacheKeys.fileList(projectId));
    cache.deleteByPrefix("files:access:");
  },

  // 用户更新时失效相关缓存
  onUserUpdate: (userId: string) => {
    cache.delete(cacheKeys.userProfile(userId));
    cache.delete(cacheKeys.userInvestments(userId));
  },
};

export default MemoryCache;

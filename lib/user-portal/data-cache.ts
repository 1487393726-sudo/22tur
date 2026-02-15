/**
 * Data Cache Utilities for User Portal
 * Handles data caching and cache invalidation strategies
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  tags?: string[];
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  entries: number;
}

export interface CacheConfig {
  maxSize?: number; // Maximum cache size in bytes
  defaultTTL?: number; // Default time to live in milliseconds
  strategy?: 'LRU' | 'LFU' | 'FIFO'; // Cache eviction strategy
}

/**
 * In-memory cache implementation
 */
export class DataCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private stats: CacheStats = { hits: 0, misses: 0, size: 0, entries: 0 };
  private config: Required<CacheConfig>;
  private accessCount: Map<string, number> = new Map();
  private accessTime: Map<string, number> = new Map();

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize || 10 * 1024 * 1024, // 10MB default
      defaultTTL: config.defaultTTL || 5 * 60 * 1000, // 5 minutes default
      strategy: config.strategy || 'LRU',
    };
  }

  /**
   * Set cache entry
   */
  set(key: string, data: T, ttl: number = this.config.defaultTTL, tags?: string[]): void {
    // Remove expired entries first
    this.removeExpired();

    // Check if we need to evict
    const entrySize = this.estimateSize(data);
    if (this.stats.size + entrySize > this.config.maxSize) {
      this.evict();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
    };

    this.cache.set(key, entry);
    this.accessCount.set(key, 0);
    this.accessTime.set(key, Date.now());
    this.stats.entries = this.cache.size;
    this.stats.size += entrySize;
  }

  /**
   * Get cache entry
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.entries = this.cache.size;
      this.stats.misses++;
      return null;
    }

    // Update access tracking
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    this.accessTime.set(key, Date.now());
    this.stats.hits++;

    return entry.data;
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
      this.stats.entries = this.cache.size;
      return false;
    }

    return true;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.accessCount.delete(key);
      this.accessTime.delete(key);
      this.stats.entries = this.cache.size;
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessCount.clear();
    this.accessTime.clear();
    this.stats = { hits: 0, misses: 0, size: 0, entries: 0 };
  }

  /**
   * Remove expired entries
   */
  private removeExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.delete(key);
    }
  }

  /**
   * Evict entries based on strategy
   */
  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string | null = null;

    switch (this.config.strategy) {
      case 'LRU': // Least Recently Used
        keyToEvict = this.findLRUKey();
        break;
      case 'LFU': // Least Frequently Used
        keyToEvict = this.findLFUKey();
        break;
      case 'FIFO': // First In First Out
        keyToEvict = this.findFIFOKey();
        break;
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
    }
  }

  /**
   * Find least recently used key
   */
  private findLRUKey(): string | null {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    for (const [key, time] of this.accessTime.entries()) {
      if (time < lruTime) {
        lruTime = time;
        lruKey = key;
      }
    }

    return lruKey;
  }

  /**
   * Find least frequently used key
   */
  private findLFUKey(): string | null {
    let lfuKey: string | null = null;
    let lfuCount = Infinity;

    for (const [key, count] of this.accessCount.entries()) {
      if (count < lfuCount) {
        lfuCount = count;
        lfuKey = key;
      }
    }

    return lfuKey;
  }

  /**
   * Find first in first out key
   */
  private findFIFOKey(): string | null {
    return this.cache.keys().next().value || null;
  }

  /**
   * Estimate size of data
   */
  private estimateSize(data: any): number {
    return JSON.stringify(data).length * 2; // Rough estimate in bytes
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get hit rate
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total === 0 ? 0 : this.stats.hits / total;
  }

  /**
   * Invalidate by tag
   */
  invalidateByTag(tag: string): number {
    let count = 0;
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag)) {
        keysToDelete.push(key);
        count++;
      }
    }

    for (const key of keysToDelete) {
      this.delete(key);
    }

    return count;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * LocalStorage-based cache
 */
export class LocalStorageCache<T = any> {
  private prefix: string;
  private defaultTTL: number;

  constructor(prefix: string = 'cache_', defaultTTL: number = 5 * 60 * 1000) {
    this.prefix = prefix;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Set cache entry
   */
  set(key: string, data: T, ttl: number = this.defaultTTL): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  /**
   * Get cache entry
   */
  get(key: string): T | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);

      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Error deleting cache:', error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

/**
 * IndexedDB-based cache
 */
export class IndexedDBCache<T = any> {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = 'user-portal-cache', storeName: string = 'cache') {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<boolean> {
    if (typeof indexedDB === 'undefined') {
      return false;
    }

    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        console.error('IndexedDB open error');
        resolve(false);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Set cache entry
   */
  async set(key: string, data: T, ttl: number = 5 * 60 * 1000): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return;
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const entry: CacheEntry<T> & { key: string } = {
        key,
        data,
        timestamp: Date.now(),
        ttl,
      };

      store.put(entry);
      transaction.oncomplete = () => resolve();
    });
  }

  /**
   * Get cache entry
   */
  async get(key: string): Promise<T | null> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return null;
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;

        if (!entry) {
          resolve(null);
          return;
        }

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };

      request.onerror = () => resolve(null);
    });
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return;
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.delete(key);
      transaction.oncomplete = () => resolve();
    });
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      return;
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.clear();
      transaction.oncomplete = () => resolve();
    });
  }
}

/**
 * Cache invalidation strategies
 */
export const CACHE_INVALIDATION_STRATEGIES = {
  TIME_BASED: (ttl: number) => ({
    type: 'time-based',
    ttl,
  }),
  TAG_BASED: (tags: string[]) => ({
    type: 'tag-based',
    tags,
  }),
  EVENT_BASED: (events: string[]) => ({
    type: 'event-based',
    events,
  }),
  MANUAL: () => ({
    type: 'manual',
  }),
};

/**
 * Cache configuration presets
 */
export const CACHE_PRESETS = {
  USER_DATA: {
    ttl: 10 * 60 * 1000, // 10 minutes
    tags: ['user'],
  },
  ORDER_DATA: {
    ttl: 5 * 60 * 1000, // 5 minutes
    tags: ['orders'],
  },
  PRODUCT_DATA: {
    ttl: 30 * 60 * 1000, // 30 minutes
    tags: ['products'],
  },
  STATIC_DATA: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    tags: ['static'],
  },
};

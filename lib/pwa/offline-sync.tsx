'use client';

/**
 * Offline Sync
 * 离线数据同步
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// IndexedDB 数据库名称
const DB_NAME = 'creative-journey-offline';
const DB_VERSION = 1;

// 存储名称
const STORES = {
  PENDING_REQUESTS: 'pending-requests',
  CACHED_DATA: 'cached-data',
  DRAFTS: 'drafts',
};

// 待同步请求
interface PendingRequest {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retries: number;
}

// 缓存数据
interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}

// 草稿
interface Draft {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

// 同步状态
interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt?: Date;
}

// Context
interface OfflineSyncContextValue {
  state: SyncState;
  queueRequest: (request: Omit<PendingRequest, 'id' | 'timestamp' | 'retries'>) => Promise<void>;
  syncNow: () => Promise<void>;
  getCachedData: <T>(key: string) => Promise<T | null>;
  setCachedData: <T>(key: string, data: T, ttl?: number) => Promise<void>;
  saveDraft: (id: string, type: string, data: any) => Promise<void>;
  getDraft: <T>(id: string) => Promise<Draft | null>;
  deleteDraft: (id: string) => Promise<void>;
  getAllDrafts: (type?: string) => Promise<Draft[]>;
}

const OfflineSyncContext = createContext<OfflineSyncContextValue | null>(null);

/**
 * 打开 IndexedDB
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 待同步请求存储
      if (!db.objectStoreNames.contains(STORES.PENDING_REQUESTS)) {
        db.createObjectStore(STORES.PENDING_REQUESTS, { keyPath: 'id', autoIncrement: true });
      }

      // 缓存数据存储
      if (!db.objectStoreNames.contains(STORES.CACHED_DATA)) {
        db.createObjectStore(STORES.CACHED_DATA, { keyPath: 'key' });
      }

      // 草稿存储
      if (!db.objectStoreNames.contains(STORES.DRAFTS)) {
        const store = db.createObjectStore(STORES.DRAFTS, { keyPath: 'id' });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

/**
 * 离线同步 Provider
 */
export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SyncState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
  });

  // 监听在线状态
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      syncNow();
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 更新待同步数量
  const updatePendingCount = useCallback(async () => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction([STORES.PENDING_REQUESTS], 'readonly');
      const store = transaction.objectStore(STORES.PENDING_REQUESTS);
      const request = store.count();

      request.onsuccess = () => {
        setState((prev) => ({ ...prev, pendingCount: request.result }));
      };
    } catch (error) {
      console.error('[OfflineSync] Failed to update pending count:', error);
    }
  }, []);

  // 初始化
  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  // 添加待同步请求
  const queueRequest = useCallback(
    async (request: Omit<PendingRequest, 'id' | 'timestamp' | 'retries'>) => {
      try {
        const db = await openDatabase();
        const transaction = db.transaction([STORES.PENDING_REQUESTS], 'readwrite');
        const store = transaction.objectStore(STORES.PENDING_REQUESTS);

        const pendingRequest: PendingRequest = {
          ...request,
          timestamp: Date.now(),
          retries: 0,
        };

        await new Promise<void>((resolve, reject) => {
          const req = store.add(pendingRequest);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });

        await updatePendingCount();
        console.log('[OfflineSync] Request queued:', request.url);
      } catch (error) {
        console.error('[OfflineSync] Failed to queue request:', error);
        throw error;
      }
    },
    [updatePendingCount]
  );

  // 立即同步
  const syncNow = useCallback(async () => {
    if (!state.isOnline || state.isSyncing) return;

    setState((prev) => ({ ...prev, isSyncing: true }));

    try {
      const db = await openDatabase();
      const transaction = db.transaction([STORES.PENDING_REQUESTS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_REQUESTS);

      const requests: PendingRequest[] = await new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      for (const pendingRequest of requests) {
        try {
          const response = await fetch(pendingRequest.url, {
            method: pendingRequest.method,
            headers: pendingRequest.headers,
            body: pendingRequest.body,
          });

          if (response.ok) {
            // 删除成功的请求
            await new Promise<void>((resolve, reject) => {
              const deleteReq = store.delete(pendingRequest.id!);
              deleteReq.onsuccess = () => resolve();
              deleteReq.onerror = () => reject(deleteReq.error);
            });
            console.log('[OfflineSync] Request synced:', pendingRequest.url);
          } else if (pendingRequest.retries < 3) {
            // 重试
            pendingRequest.retries++;
            await new Promise<void>((resolve, reject) => {
              const updateReq = store.put(pendingRequest);
              updateReq.onsuccess = () => resolve();
              updateReq.onerror = () => reject(updateReq.error);
            });
          } else {
            // 超过重试次数，删除
            await new Promise<void>((resolve, reject) => {
              const deleteReq = store.delete(pendingRequest.id!);
              deleteReq.onsuccess = () => resolve();
              deleteReq.onerror = () => reject(deleteReq.error);
            });
            console.error('[OfflineSync] Request failed after retries:', pendingRequest.url);
          }
        } catch (error) {
          console.error('[OfflineSync] Sync error:', error);
        }
      }

      await updatePendingCount();
      setState((prev) => ({ ...prev, lastSyncAt: new Date() }));
    } catch (error) {
      console.error('[OfflineSync] Sync failed:', error);
    } finally {
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [state.isOnline, state.isSyncing, updatePendingCount]);

  // 获取缓存数据
  const getCachedData = useCallback(async <T,>(key: string): Promise<T | null> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction([STORES.CACHED_DATA], 'readonly');
      const store = transaction.objectStore(STORES.CACHED_DATA);

      const cached: CachedData | undefined = await new Promise((resolve, reject) => {
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (!cached) return null;

      // 检查过期
      if (cached.expiresAt && cached.expiresAt < Date.now()) {
        // 删除过期数据
        const deleteTransaction = db.transaction([STORES.CACHED_DATA], 'readwrite');
        deleteTransaction.objectStore(STORES.CACHED_DATA).delete(key);
        return null;
      }

      return cached.data as T;
    } catch (error) {
      console.error('[OfflineSync] Failed to get cached data:', error);
      return null;
    }
  }, []);

  // 设置缓存数据
  const setCachedData = useCallback(async <T,>(key: string, data: T, ttl?: number) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction([STORES.CACHED_DATA], 'readwrite');
      const store = transaction.objectStore(STORES.CACHED_DATA);

      const cached: CachedData = {
        key,
        data,
        timestamp: Date.now(),
        expiresAt: ttl ? Date.now() + ttl : undefined,
      };

      await new Promise<void>((resolve, reject) => {
        const req = store.put(cached);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.error('[OfflineSync] Failed to set cached data:', error);
    }
  }, []);

  // 保存草稿
  const saveDraft = useCallback(async (id: string, type: string, data: any) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction([STORES.DRAFTS], 'readwrite');
      const store = transaction.objectStore(STORES.DRAFTS);

      const draft: Draft = {
        id,
        type,
        data,
        timestamp: Date.now(),
      };

      await new Promise<void>((resolve, reject) => {
        const req = store.put(draft);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });

      console.log('[OfflineSync] Draft saved:', id);
    } catch (error) {
      console.error('[OfflineSync] Failed to save draft:', error);
    }
  }, []);

  // 获取草稿
  const getDraft = useCallback(async <T,>(id: string): Promise<Draft | null> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction([STORES.DRAFTS], 'readonly');
      const store = transaction.objectStore(STORES.DRAFTS);

      return await new Promise((resolve, reject) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.error('[OfflineSync] Failed to get draft:', error);
      return null;
    }
  }, []);

  // 删除草稿
  const deleteDraft = useCallback(async (id: string) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction([STORES.DRAFTS], 'readwrite');
      const store = transaction.objectStore(STORES.DRAFTS);

      await new Promise<void>((resolve, reject) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });

      console.log('[OfflineSync] Draft deleted:', id);
    } catch (error) {
      console.error('[OfflineSync] Failed to delete draft:', error);
    }
  }, []);

  // 获取所有草稿
  const getAllDrafts = useCallback(async (type?: string): Promise<Draft[]> => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction([STORES.DRAFTS], 'readonly');
      const store = transaction.objectStore(STORES.DRAFTS);

      let drafts: Draft[];

      if (type) {
        const index = store.index('type');
        drafts = await new Promise((resolve, reject) => {
          const req = index.getAll(type);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      } else {
        drafts = await new Promise((resolve, reject) => {
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      }

      return drafts.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('[OfflineSync] Failed to get drafts:', error);
      return [];
    }
  }, []);

  const value: OfflineSyncContextValue = {
    state,
    queueRequest,
    syncNow,
    getCachedData,
    setCachedData,
    saveDraft,
    getDraft,
    deleteDraft,
    getAllDrafts,
  };

  return (
    <OfflineSyncContext.Provider value={value}>
      {children}
    </OfflineSyncContext.Provider>
  );
}

/**
 * 使用离线同步 Hook
 */
export function useOfflineSync() {
  const context = useContext(OfflineSyncContext);
  
  if (!context) {
    throw new Error('useOfflineSync must be used within OfflineSyncProvider');
  }
  
  return context;
}

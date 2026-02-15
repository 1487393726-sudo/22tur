/**
 * Index Sync Service
 * 索引同步服务 - 实现文档创建/更新/删除时自动同步到搜索引擎
 */

import {
  SearchableDocument,
  DocumentType,
  IndexSyncRecord,
  SyncStatus,
} from './types';
import { getSearchService } from './search-service';

// 同步配置
export interface IndexSyncConfig {
  // 批量同步大小
  batchSize: number;
  // 重试次数
  maxRetries: number;
  // 重试间隔（毫秒）
  retryInterval: number;
  // 是否启用实时同步
  realtimeSync: boolean;
  // 同步队列最大长度
  maxQueueSize: number;
}

// 默认配置
const DEFAULT_SYNC_CONFIG: IndexSyncConfig = {
  batchSize: 100,
  maxRetries: 3,
  retryInterval: 5000,
  realtimeSync: true,
  maxQueueSize: 10000,
};

// 同步事件类型
export type SyncEventType = 'create' | 'update' | 'delete';

// 同步事件
export interface SyncEvent {
  id: string;
  type: SyncEventType;
  documentType: DocumentType;
  document?: SearchableDocument;
  timestamp: Date;
  retryCount: number;
}

// 同步结果
export interface SyncResult {
  success: boolean;
  documentId: string;
  documentType: DocumentType;
  eventType: SyncEventType;
  error?: string;
  syncedAt?: Date;
}

// 批量同步结果
export interface BatchSyncResult {
  total: number;
  success: number;
  failed: number;
  results: SyncResult[];
}

// 同步状态统计
export interface SyncStats {
  pendingCount: number;
  syncedCount: number;
  failedCount: number;
  lastSyncAt?: Date;
  queueSize: number;
}

/**
 * 索引同步服务
 */
export class IndexSyncService {
  private config: IndexSyncConfig;
  private syncQueue: SyncEvent[] = [];
  private syncRecords: Map<string, IndexSyncRecord> = new Map();
  private isProcessing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Map<string, ((event: SyncEvent, result: SyncResult) => void)[]> = new Map();

  constructor(config?: Partial<IndexSyncConfig>) {
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
  }

  /**
   * 启动同步服务
   */
  start(intervalMs: number = 5000): void {
    if (this.syncInterval) {
      return;
    }

    this.syncInterval = setInterval(() => {
      this.processQueue();
    }, intervalMs);

    console.log('[IndexSync] 同步服务已启动');
  }

  /**
   * 停止同步服务
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('[IndexSync] 同步服务已停止');
  }

  /**
   * 文档创建时同步
   */
  async onCreate(document: SearchableDocument): Promise<SyncResult> {
    const event: SyncEvent = {
      id: document.id,
      type: 'create',
      documentType: document.type,
      document,
      timestamp: new Date(),
      retryCount: 0,
    };

    if (this.config.realtimeSync) {
      return this.syncDocument(event);
    } else {
      this.enqueue(event);
      return {
        success: true,
        documentId: document.id,
        documentType: document.type,
        eventType: 'create',
      };
    }
  }

  /**
   * 文档更新时同步
   */
  async onUpdate(document: SearchableDocument): Promise<SyncResult> {
    const event: SyncEvent = {
      id: document.id,
      type: 'update',
      documentType: document.type,
      document,
      timestamp: new Date(),
      retryCount: 0,
    };

    if (this.config.realtimeSync) {
      return this.syncDocument(event);
    } else {
      this.enqueue(event);
      return {
        success: true,
        documentId: document.id,
        documentType: document.type,
        eventType: 'update',
      };
    }
  }

  /**
   * 文档删除时同步
   */
  async onDelete(documentId: string, documentType: DocumentType): Promise<SyncResult> {
    const event: SyncEvent = {
      id: documentId,
      type: 'delete',
      documentType,
      timestamp: new Date(),
      retryCount: 0,
    };

    if (this.config.realtimeSync) {
      return this.syncDocument(event);
    } else {
      this.enqueue(event);
      return {
        success: true,
        documentId,
        documentType,
        eventType: 'delete',
      };
    }
  }

  /**
   * 批量同步文档
   */
  async bulkSync(documents: SearchableDocument[]): Promise<BatchSyncResult> {
    const searchService = getSearchService();
    const results: SyncResult[] = [];
    let success = 0;
    let failed = 0;

    // 分批处理
    for (let i = 0; i < documents.length; i += this.config.batchSize) {
      const batch = documents.slice(i, i + this.config.batchSize);
      
      try {
        const bulkResult = await searchService.bulkIndex(batch);
        success += bulkResult.success;
        failed += bulkResult.failed;

        // 更新同步记录
        for (const doc of batch) {
          const record: IndexSyncRecord = {
            documentId: doc.id,
            documentType: doc.type,
            status: 'synced',
            lastSyncedAt: new Date(),
            retryCount: 0,
          };
          this.syncRecords.set(doc.id, record);

          results.push({
            success: true,
            documentId: doc.id,
            documentType: doc.type,
            eventType: 'create',
            syncedAt: new Date(),
          });
        }
      } catch (error) {
        failed += batch.length;
        
        for (const doc of batch) {
          const record: IndexSyncRecord = {
            documentId: doc.id,
            documentType: doc.type,
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
            retryCount: 1,
          };
          this.syncRecords.set(doc.id, record);

          results.push({
            success: false,
            documentId: doc.id,
            documentType: doc.type,
            eventType: 'create',
            error: record.error,
          });
        }
      }
    }

    return {
      total: documents.length,
      success,
      failed,
      results,
    };
  }

  /**
   * 重新同步失败的文档
   */
  async retryFailed(): Promise<BatchSyncResult> {
    const failedRecords = Array.from(this.syncRecords.values())
      .filter(r => r.status === 'failed' && r.retryCount < this.config.maxRetries);

    const results: SyncResult[] = [];
    let success = 0;
    let failed = 0;

    for (const record of failedRecords) {
      // 需要重新获取文档数据进行同步
      // 这里假设文档已经在队列中或需要从数据库重新获取
      const event: SyncEvent = {
        id: record.documentId,
        type: 'update',
        documentType: record.documentType,
        timestamp: new Date(),
        retryCount: record.retryCount,
      };

      const result = await this.syncDocument(event);
      results.push(result);

      if (result.success) {
        success++;
      } else {
        failed++;
      }
    }

    return {
      total: failedRecords.length,
      success,
      failed,
      results,
    };
  }

  /**
   * 获取同步状态
   */
  getSyncStatus(documentId: string): IndexSyncRecord | null {
    return this.syncRecords.get(documentId) || null;
  }

  /**
   * 获取同步统计
   */
  getStats(): SyncStats {
    const records = Array.from(this.syncRecords.values());
    const pendingCount = records.filter(r => r.status === 'pending').length;
    const syncedCount = records.filter(r => r.status === 'synced').length;
    const failedCount = records.filter(r => r.status === 'failed').length;

    const syncedRecords = records.filter(r => r.lastSyncedAt);
    const lastSyncAt = syncedRecords.length > 0
      ? new Date(Math.max(...syncedRecords.map(r => r.lastSyncedAt!.getTime())))
      : undefined;

    return {
      pendingCount,
      syncedCount,
      failedCount,
      lastSyncAt,
      queueSize: this.syncQueue.length,
    };
  }

  /**
   * 添加同步事件监听器
   */
  addListener(eventType: SyncEventType, callback: (event: SyncEvent, result: SyncResult) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  /**
   * 移除同步事件监听器
   */
  removeListener(eventType: SyncEventType, callback: (event: SyncEvent, result: SyncResult) => void): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 清空同步队列
   */
  clearQueue(): void {
    this.syncQueue = [];
  }

  /**
   * 清空同步记录
   */
  clearRecords(): void {
    this.syncRecords.clear();
  }

  // 私有方法

  /**
   * 添加事件到队列
   */
  private enqueue(event: SyncEvent): void {
    if (this.syncQueue.length >= this.config.maxQueueSize) {
      console.warn('[IndexSync] 同步队列已满，丢弃最旧的事件');
      this.syncQueue.shift();
    }

    // 检查是否已有相同文档的事件，如果有则替换
    const existingIndex = this.syncQueue.findIndex(e => e.id === event.id);
    if (existingIndex > -1) {
      this.syncQueue[existingIndex] = event;
    } else {
      this.syncQueue.push(event);
    }

    // 更新同步记录状态
    this.syncRecords.set(event.id, {
      documentId: event.id,
      documentType: event.documentType,
      status: 'pending',
      retryCount: event.retryCount,
    });
  }

  /**
   * 处理同步队列
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const batch = this.syncQueue.splice(0, this.config.batchSize);

      for (const event of batch) {
        await this.syncDocument(event);
      }
    } catch (error) {
      console.error('[IndexSync] 处理队列时出错:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 同步单个文档
   */
  private async syncDocument(event: SyncEvent): Promise<SyncResult> {
    const searchService = getSearchService();
    let success = false;
    let error: string | undefined;

    try {
      switch (event.type) {
        case 'create':
        case 'update':
          if (event.document) {
            if (event.type === 'create') {
              success = await searchService.index(event.document);
            } else {
              success = await searchService.update(event.id, event.document);
            }
          } else {
            error = '文档数据缺失';
          }
          break;

        case 'delete':
          success = await searchService.delete(event.id, event.documentType);
          break;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      success = false;
    }

    // 更新同步记录
    const status: SyncStatus = success ? 'synced' : (event.type === 'delete' ? 'deleted' : 'failed');
    const record: IndexSyncRecord = {
      documentId: event.id,
      documentType: event.documentType,
      status,
      lastSyncedAt: success ? new Date() : undefined,
      error,
      retryCount: event.retryCount + (success ? 0 : 1),
    };
    this.syncRecords.set(event.id, record);

    // 如果失败且未超过重试次数，重新加入队列
    if (!success && record.retryCount < this.config.maxRetries) {
      setTimeout(() => {
        this.enqueue({
          ...event,
          retryCount: record.retryCount,
        });
      }, this.config.retryInterval * Math.pow(2, record.retryCount - 1));
    }

    const result: SyncResult = {
      success,
      documentId: event.id,
      documentType: event.documentType,
      eventType: event.type,
      error,
      syncedAt: success ? new Date() : undefined,
    };

    // 触发监听器
    this.notifyListeners(event, result);

    return result;
  }

  /**
   * 通知监听器
   */
  private notifyListeners(event: SyncEvent, result: SyncResult): void {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(event, result);
        } catch (err) {
          console.error('[IndexSync] 监听器执行出错:', err);
        }
      }
    }
  }
}

// 单例
let indexSyncServiceInstance: IndexSyncService | null = null;

/**
 * 获取索引同步服务实例
 */
export function getIndexSyncService(config?: Partial<IndexSyncConfig>): IndexSyncService {
  if (!indexSyncServiceInstance) {
    indexSyncServiceInstance = new IndexSyncService(config);
  }
  return indexSyncServiceInstance;
}

/**
 * 重置索引同步服务
 */
export function resetIndexSyncService(): void {
  if (indexSyncServiceInstance) {
    indexSyncServiceInstance.stop();
    indexSyncServiceInstance.clearQueue();
    indexSyncServiceInstance.clearRecords();
  }
  indexSyncServiceInstance = null;
}

/**
 * 便捷函数：同步文档创建
 */
export async function syncDocumentCreate(document: SearchableDocument): Promise<SyncResult> {
  return getIndexSyncService().onCreate(document);
}

/**
 * 便捷函数：同步文档更新
 */
export async function syncDocumentUpdate(document: SearchableDocument): Promise<SyncResult> {
  return getIndexSyncService().onUpdate(document);
}

/**
 * 便捷函数：同步文档删除
 */
export async function syncDocumentDelete(documentId: string, documentType: DocumentType): Promise<SyncResult> {
  return getIndexSyncService().onDelete(documentId, documentType);
}

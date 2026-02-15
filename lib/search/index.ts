/**
 * Search Service Module
 * 搜索服务模块导出
 */

// 类型导出
export * from './types';

// 服务导出
export {
  SearchService,
  getSearchService,
  initSearchService,
  resetSearchService,
} from './search-service';

// 适配器导出
export { ElasticsearchAdapter, createElasticsearchAdapter } from './providers/elasticsearch';
export { MeiliSearchAdapter, createMeiliSearchAdapter } from './providers/meilisearch';

// 索引同步服务导出
export {
  IndexSyncService,
  getIndexSyncService,
  resetIndexSyncService,
  syncDocumentCreate,
  syncDocumentUpdate,
  syncDocumentDelete,
} from './index-sync';

export type {
  IndexSyncConfig,
  SyncEventType,
  SyncEvent,
  SyncResult,
  BatchSyncResult,
  SyncStats,
} from './index-sync';

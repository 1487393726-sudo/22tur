/**
 * Search Service Types
 * 搜索服务类型定义
 */

// 搜索提供商
export type SearchProvider = 'elasticsearch' | 'meilisearch' | 'memory';

// 搜索配置
export interface SearchConfig {
  provider: SearchProvider;
  host: string;
  port?: number;
  apiKey?: string;
  username?: string;
  password?: string;
  indexPrefix?: string;
  ssl?: boolean;
}

// Elasticsearch 配置
export interface ElasticsearchConfig extends SearchConfig {
  provider: 'elasticsearch';
  cloud?: {
    id: string;
  };
  maxRetries?: number;
  requestTimeout?: number;
}

// MeiliSearch 配置
export interface MeiliSearchConfig extends SearchConfig {
  provider: 'meilisearch';
  masterKey?: string;
}

// 可搜索文档类型
export type DocumentType = 
  | 'project'
  | 'document'
  | 'user'
  | 'investment'
  | 'product'
  | 'article'
  | 'page';

// 可搜索文档
export interface SearchableDocument {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  description?: string;
  author?: string;
  authorId?: string;
  tags?: string[];
  category?: string;
  status?: string;
  createdAt: Date;
  updatedAt?: Date;
  metadata?: Record<string, unknown>;
}

// 索引文档（内部使用）
export interface IndexedDocument extends SearchableDocument {
  _index: string;
  _score?: number;
}

// 搜索查询
export interface SearchQuery {
  // 搜索关键词
  query: string;
  
  // 过滤条件
  filters?: SearchFilters;
  
  // 分页
  page?: number;
  pageSize?: number;
  
  // 排序
  sort?: SearchSort[];
  
  // 高亮
  highlight?: boolean;
  highlightFields?: string[];
  
  // 聚合
  aggregations?: string[];
  
  // 搜索建议
  suggest?: boolean;
}

// 搜索过滤器
export interface SearchFilters {
  type?: DocumentType[];
  status?: string[];
  author?: string;
  authorId?: string;
  category?: string[];
  tags?: string[];
  dateRange?: {
    field?: string;
    start?: Date;
    end?: Date;
  };
  custom?: Record<string, unknown>;
}

// 搜索排序
export interface SearchSort {
  field: string;
  order: 'asc' | 'desc';
}

// 搜索结果
export interface SearchResult {
  hits: SearchHit[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  took: number; // 耗时（毫秒）
  suggestions?: string[];
  aggregations?: SearchAggregations;
}

// 搜索命中
export interface SearchHit {
  document: SearchableDocument;
  score: number;
  highlights?: Record<string, string[]>;
}

// 搜索聚合
export interface SearchAggregations {
  [key: string]: {
    buckets: Array<{
      key: string;
      count: number;
    }>;
  };
}

// 搜索建议
export interface SearchSuggestion {
  text: string;
  score: number;
  highlighted?: string;
}

// 索引设置
export interface IndexSettings {
  name: string;
  mappings?: Record<string, unknown>;
  settings?: {
    numberOfShards?: number;
    numberOfReplicas?: number;
    analysis?: Record<string, unknown>;
  };
}

// 中文分词器配置
export const CHINESE_ANALYZER_CONFIG = {
  analysis: {
    analyzer: {
      chinese_analyzer: {
        type: 'custom',
        tokenizer: 'ik_max_word',
        filter: ['lowercase', 'chinese_stop'],
      },
      chinese_search_analyzer: {
        type: 'custom',
        tokenizer: 'ik_smart',
        filter: ['lowercase', 'chinese_stop'],
      },
    },
    filter: {
      chinese_stop: {
        type: 'stop',
        stopwords: '_chinese_',
      },
    },
  },
};

// 默认索引映射
export const DEFAULT_INDEX_MAPPINGS = {
  properties: {
    id: { type: 'keyword' },
    type: { type: 'keyword' },
    title: {
      type: 'text',
      analyzer: 'chinese_analyzer',
      search_analyzer: 'chinese_search_analyzer',
      fields: {
        keyword: { type: 'keyword' },
      },
    },
    content: {
      type: 'text',
      analyzer: 'chinese_analyzer',
      search_analyzer: 'chinese_search_analyzer',
    },
    description: {
      type: 'text',
      analyzer: 'chinese_analyzer',
      search_analyzer: 'chinese_search_analyzer',
    },
    author: { type: 'keyword' },
    authorId: { type: 'keyword' },
    tags: { type: 'keyword' },
    category: { type: 'keyword' },
    status: { type: 'keyword' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
    metadata: { type: 'object', enabled: false },
  },
};

// 搜索服务接口
export interface ISearchService {
  // 索引管理
  createIndex(settings: IndexSettings): Promise<boolean>;
  deleteIndex(indexName: string): Promise<boolean>;
  indexExists(indexName: string): Promise<boolean>;
  
  // 文档操作
  index(document: SearchableDocument): Promise<boolean>;
  bulkIndex(documents: SearchableDocument[]): Promise<{ success: number; failed: number }>;
  update(id: string, document: Partial<SearchableDocument>): Promise<boolean>;
  delete(id: string, type?: DocumentType): Promise<boolean>;
  get(id: string, type?: DocumentType): Promise<SearchableDocument | null>;
  
  // 搜索
  search(query: SearchQuery): Promise<SearchResult>;
  
  // 搜索建议
  suggest(prefix: string, options?: { size?: number; types?: DocumentType[] }): Promise<SearchSuggestion[]>;
  
  // 统计
  count(filters?: SearchFilters): Promise<number>;
  getStats(): Promise<SearchStats>;
}

// 搜索适配器接口
export interface ISearchAdapter {
  // 连接管理
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  ping(): Promise<boolean>;
  
  // 索引管理
  createIndex(settings: IndexSettings): Promise<boolean>;
  deleteIndex(indexName: string): Promise<boolean>;
  indexExists(indexName: string): Promise<boolean>;
  
  // 文档操作
  indexDocument(indexName: string, document: SearchableDocument): Promise<boolean>;
  bulkIndexDocuments(indexName: string, documents: SearchableDocument[]): Promise<{ success: number; failed: number }>;
  updateDocument(indexName: string, id: string, document: Partial<SearchableDocument>): Promise<boolean>;
  deleteDocument(indexName: string, id: string): Promise<boolean>;
  getDocument(indexName: string, id: string): Promise<SearchableDocument | null>;
  
  // 搜索
  search(indexName: string, query: SearchQuery): Promise<SearchResult>;
  
  // 搜索建议
  suggest(indexName: string, prefix: string, options?: { size?: number }): Promise<SearchSuggestion[]>;
  
  // 统计
  count(indexName: string, filters?: SearchFilters): Promise<number>;
}

// 搜索统计
export interface SearchStats {
  totalDocuments: number;
  indexSize: string;
  documentsByType: Record<DocumentType, number>;
  lastIndexedAt?: Date;
}

// 同步状态
export type SyncStatus = 'pending' | 'synced' | 'failed' | 'deleted';

// 索引同步记录
export interface IndexSyncRecord {
  documentId: string;
  documentType: DocumentType;
  status: SyncStatus;
  lastSyncedAt?: Date;
  error?: string;
  retryCount: number;
}

// 高亮配置
export interface HighlightConfig {
  preTags?: string[];
  postTags?: string[];
  fragmentSize?: number;
  numberOfFragments?: number;
  fields?: string[];
}

// 默认高亮配置
export const DEFAULT_HIGHLIGHT_CONFIG: HighlightConfig = {
  preTags: ['<mark>'],
  postTags: ['</mark>'],
  fragmentSize: 150,
  numberOfFragments: 3,
  fields: ['title', 'content', 'description'],
};

// 搜索错误
export class SearchError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SearchError';
  }
}

// 搜索错误码
export const SEARCH_ERROR_CODES = {
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  INDEX_NOT_FOUND: 'INDEX_NOT_FOUND',
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  INVALID_QUERY: 'INVALID_QUERY',
  INDEX_FAILED: 'INDEX_FAILED',
  SEARCH_FAILED: 'SEARCH_FAILED',
  TIMEOUT: 'TIMEOUT',
} as const;

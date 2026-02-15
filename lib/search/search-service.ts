/**
 * Search Service
 * 搜索服务统一接口
 */

import {
  SearchConfig,
  ElasticsearchConfig,
  MeiliSearchConfig,
  SearchableDocument,
  SearchQuery,
  SearchResult,
  SearchSuggestion,
  SearchFilters,
  IndexSettings,
  ISearchService,
  ISearchAdapter,
  SearchStats,
  DocumentType,
  DEFAULT_INDEX_MAPPINGS,
  CHINESE_ANALYZER_CONFIG,
} from './types';
import { ElasticsearchAdapter } from './providers/elasticsearch';
import { MeiliSearchAdapter } from './providers/meilisearch';

// 默认索引名
const DEFAULT_INDEX = 'documents';

/**
 * 内存搜索适配器（用于开发和测试）
 */
class MemorySearchAdapter implements ISearchAdapter {
  private documents: Map<string, SearchableDocument> = new Map();
  private connected: boolean = false;

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async ping(): Promise<boolean> {
    return this.connected;
  }

  async createIndex(): Promise<boolean> {
    return true;
  }

  async deleteIndex(): Promise<boolean> {
    this.documents.clear();
    return true;
  }

  async indexExists(): Promise<boolean> {
    return true;
  }

  async indexDocument(_indexName: string, document: SearchableDocument): Promise<boolean> {
    this.documents.set(document.id, document);
    return true;
  }

  async bulkIndexDocuments(_indexName: string, documents: SearchableDocument[]): Promise<{ success: number; failed: number }> {
    for (const doc of documents) {
      this.documents.set(doc.id, doc);
    }
    return { success: documents.length, failed: 0 };
  }

  async updateDocument(_indexName: string, id: string, document: Partial<SearchableDocument>): Promise<boolean> {
    const existing = this.documents.get(id);
    if (existing) {
      this.documents.set(id, { ...existing, ...document });
      return true;
    }
    return false;
  }

  async deleteDocument(_indexName: string, id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  async getDocument(_indexName: string, id: string): Promise<SearchableDocument | null> {
    return this.documents.get(id) || null;
  }

  async search(_indexName: string, query: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    let results = Array.from(this.documents.values());

    // 全文搜索
    if (query.query && query.query.trim()) {
      const searchTerm = query.query.toLowerCase();
      results = results.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.content.toLowerCase().includes(searchTerm) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm))
      );
    }

    // 过滤
    if (query.filters) {
      results = this.applyFilters(results, query.filters);
    }

    // 排序
    if (query.sort && query.sort.length > 0) {
      const sort = query.sort[0];
      results.sort((a, b) => {
        const aVal = (a as any)[sort.field];
        const bVal = (b as any)[sort.field];
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sort.order === 'asc' ? cmp : -cmp;
      });
    }

    const total = results.length;
    const start = (page - 1) * pageSize;
    const hits = results.slice(start, start + pageSize).map(doc => ({
      document: doc,
      score: 1,
      highlights: query.highlight !== false ? this.generateHighlights(doc, query.query || '') : undefined,
    }));

    return {
      hits,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      took: Date.now() - startTime,
    };
  }

  async suggest(_indexName: string, prefix: string, options?: { size?: number }): Promise<SearchSuggestion[]> {
    const size = options?.size || 5;
    const prefixLower = prefix.toLowerCase();

    const suggestions = Array.from(this.documents.values())
      .filter(doc => doc.title.toLowerCase().startsWith(prefixLower))
      .slice(0, size)
      .map(doc => ({
        text: doc.title,
        score: 1,
      }));

    return suggestions;
  }

  async count(_indexName: string, filters?: SearchFilters): Promise<number> {
    let results = Array.from(this.documents.values());
    if (filters) {
      results = this.applyFilters(results, filters);
    }
    return results.length;
  }

  private applyFilters(docs: SearchableDocument[], filters: SearchFilters): SearchableDocument[] {
    return docs.filter(doc => {
      if (filters.type && filters.type.length > 0 && !filters.type.includes(doc.type)) {
        return false;
      }
      if (filters.status && filters.status.length > 0 && doc.status && !filters.status.includes(doc.status)) {
        return false;
      }
      if (filters.author && doc.author !== filters.author) {
        return false;
      }
      if (filters.authorId && doc.authorId !== filters.authorId) {
        return false;
      }
      if (filters.category && filters.category.length > 0 && doc.category && !filters.category.includes(doc.category)) {
        return false;
      }
      if (filters.tags && filters.tags.length > 0 && doc.tags) {
        const hasTag = filters.tags.some(tag => doc.tags?.includes(tag));
        if (!hasTag) return false;
      }
      if (filters.dateRange) {
        const docDate = doc.createdAt;
        if (filters.dateRange.start && docDate < filters.dateRange.start) return false;
        if (filters.dateRange.end && docDate > filters.dateRange.end) return false;
      }
      return true;
    });
  }

  private generateHighlights(doc: SearchableDocument, query: string): Record<string, string[]> {
    if (!query) return {};
    
    const highlights: Record<string, string[]> = {};
    const searchTerm = query.toLowerCase();

    if (doc.title.toLowerCase().includes(searchTerm)) {
      highlights.title = [doc.title.replace(new RegExp(query, 'gi'), '<mark>$&</mark>')];
    }
    if (doc.content.toLowerCase().includes(searchTerm)) {
      const snippet = this.extractSnippet(doc.content, query);
      highlights.content = [snippet];
    }

    return highlights;
  }

  private extractSnippet(content: string, query: string, length: number = 150): string {
    const index = content.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return content.substring(0, length);

    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 100);
    let snippet = content.substring(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet.replace(new RegExp(query, 'gi'), '<mark>$&</mark>');
  }
}

/**
 * 搜索服务
 */
export class SearchService implements ISearchService {
  private adapter: ISearchAdapter;
  private config: SearchConfig;
  private indexName: string;

  constructor(config: SearchConfig, indexName?: string) {
    this.config = config;
    this.indexName = indexName || DEFAULT_INDEX;
    this.adapter = this.createAdapter(config);
  }

  /**
   * 创建适配器
   */
  private createAdapter(config: SearchConfig): ISearchAdapter {
    switch (config.provider) {
      case 'elasticsearch':
        return new ElasticsearchAdapter(config as ElasticsearchConfig);
      case 'meilisearch':
        return new MeiliSearchAdapter(config as MeiliSearchConfig);
      case 'memory':
      default:
        return new MemorySearchAdapter();
    }
  }

  /**
   * 初始化（连接并创建索引）
   */
  async initialize(): Promise<void> {
    await this.adapter.connect();
    
    // 创建默认索引
    if (!(await this.adapter.indexExists(this.indexName))) {
      await this.createIndex({
        name: this.indexName,
        mappings: DEFAULT_INDEX_MAPPINGS,
        settings: {
          numberOfShards: 1,
          numberOfReplicas: 0,
          analysis: CHINESE_ANALYZER_CONFIG.analysis,
        },
      });
    }
  }

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    await this.adapter.disconnect();
  }

  // 索引管理

  async createIndex(settings: IndexSettings): Promise<boolean> {
    return this.adapter.createIndex(settings);
  }

  async deleteIndex(indexName: string): Promise<boolean> {
    return this.adapter.deleteIndex(indexName);
  }

  async indexExists(indexName: string): Promise<boolean> {
    return this.adapter.indexExists(indexName);
  }

  // 文档操作

  async index(document: SearchableDocument): Promise<boolean> {
    return this.adapter.indexDocument(this.indexName, document);
  }

  async bulkIndex(documents: SearchableDocument[]): Promise<{ success: number; failed: number }> {
    return this.adapter.bulkIndexDocuments(this.indexName, documents);
  }

  async update(id: string, document: Partial<SearchableDocument>): Promise<boolean> {
    return this.adapter.updateDocument(this.indexName, id, document);
  }

  async delete(id: string, type?: DocumentType): Promise<boolean> {
    return this.adapter.deleteDocument(this.indexName, id);
  }

  async get(id: string, type?: DocumentType): Promise<SearchableDocument | null> {
    return this.adapter.getDocument(this.indexName, id);
  }

  // 搜索

  async search(query: SearchQuery): Promise<SearchResult> {
    return this.adapter.search(this.indexName, query);
  }

  // 搜索建议

  async suggest(prefix: string, options?: { size?: number; types?: DocumentType[] }): Promise<SearchSuggestion[]> {
    return this.adapter.suggest(this.indexName, prefix, options);
  }

  // 统计

  async count(filters?: SearchFilters): Promise<number> {
    return this.adapter.count(this.indexName, filters);
  }

  async getStats(): Promise<SearchStats> {
    const total = await this.count();
    
    // 按类型统计
    const types: DocumentType[] = ['project', 'document', 'user', 'investment', 'product', 'article', 'page'];
    const documentsByType: Record<DocumentType, number> = {} as Record<DocumentType, number>;
    
    for (const type of types) {
      documentsByType[type] = await this.count({ type: [type] });
    }

    return {
      totalDocuments: total,
      indexSize: 'N/A',
      documentsByType,
    };
  }

  /**
   * 获取适配器（用于高级操作）
   */
  getAdapter(): ISearchAdapter {
    return this.adapter;
  }
}

// 单例
let searchServiceInstance: SearchService | null = null;

/**
 * 获取搜索服务实例
 */
export function getSearchService(config?: SearchConfig): SearchService {
  if (!searchServiceInstance && config) {
    searchServiceInstance = new SearchService(config);
  }
  if (!searchServiceInstance) {
    // 默认使用内存适配器
    searchServiceInstance = new SearchService({ provider: 'memory', host: '' });
  }
  return searchServiceInstance;
}

/**
 * 初始化搜索服务
 */
export async function initSearchService(config: SearchConfig): Promise<SearchService> {
  if (searchServiceInstance) {
    await searchServiceInstance.close();
  }
  searchServiceInstance = new SearchService(config);
  await searchServiceInstance.initialize();
  return searchServiceInstance;
}

/**
 * 重置搜索服务
 */
export async function resetSearchService(): Promise<void> {
  if (searchServiceInstance) {
    await searchServiceInstance.close();
  }
  searchServiceInstance = null;
}

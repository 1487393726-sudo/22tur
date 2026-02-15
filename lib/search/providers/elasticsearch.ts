/**
 * Elasticsearch Adapter
 * Elasticsearch 搜索适配器
 */

import {
  ElasticsearchConfig,
  SearchableDocument,
  SearchQuery,
  SearchResult,
  SearchHit,
  SearchSuggestion,
  SearchFilters,
  IndexSettings,
  ISearchAdapter,
  DEFAULT_INDEX_MAPPINGS,
  CHINESE_ANALYZER_CONFIG,
  DEFAULT_HIGHLIGHT_CONFIG,
  SearchError,
  SEARCH_ERROR_CODES,
} from '../types';

/**
 * Elasticsearch 适配器
 */
export class ElasticsearchAdapter implements ISearchAdapter {
  private config: ElasticsearchConfig;
  private baseUrl: string;
  private connected: boolean = false;
  private headers: Record<string, string>;

  constructor(config: ElasticsearchConfig) {
    this.config = config;
    const protocol = config.ssl ? 'https' : 'http';
    const port = config.port || 9200;
    this.baseUrl = `${protocol}://${config.host}:${port}`;
    
    this.headers = {
      'Content-Type': 'application/json',
    };

    // 基本认证
    if (config.username && config.password) {
      const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');
      this.headers['Authorization'] = `Basic ${auth}`;
    }

    // API Key 认证
    if (config.apiKey) {
      this.headers['Authorization'] = `ApiKey ${config.apiKey}`;
    }
  }

  /**
   * 连接到 Elasticsearch
   */
  async connect(): Promise<void> {
    try {
      const healthy = await this.ping();
      if (healthy) {
        this.connected = true;
        console.log('Connected to Elasticsearch');
      } else {
        throw new SearchError(
          'Failed to connect to Elasticsearch',
          SEARCH_ERROR_CODES.CONNECTION_FAILED
        );
      }
    } catch (error) {
      this.connected = false;
      throw error;
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('Disconnected from Elasticsearch');
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * 健康检查
   */
  async ping(): Promise<boolean> {
    try {
      const response = await this.request('GET', '/_cluster/health');
      return response.status === 'green' || response.status === 'yellow';
    } catch {
      return false;
    }
  }

  /**
   * 创建索引
   */
  async createIndex(settings: IndexSettings): Promise<boolean> {
    try {
      const indexName = this.getIndexName(settings.name);
      
      // 检查索引是否存在
      if (await this.indexExists(settings.name)) {
        console.log(`Index ${indexName} already exists`);
        return true;
      }

      const body = {
        settings: {
          number_of_shards: settings.settings?.numberOfShards || 1,
          number_of_replicas: settings.settings?.numberOfReplicas || 0,
          ...CHINESE_ANALYZER_CONFIG,
          ...settings.settings,
        },
        mappings: settings.mappings || DEFAULT_INDEX_MAPPINGS,
      };

      await this.request('PUT', `/${indexName}`, body);
      console.log(`Index ${indexName} created`);
      return true;
    } catch (error) {
      console.error('Failed to create index:', error);
      return false;
    }
  }

  /**
   * 删除索引
   */
  async deleteIndex(indexName: string): Promise<boolean> {
    try {
      const fullIndexName = this.getIndexName(indexName);
      await this.request('DELETE', `/${fullIndexName}`);
      console.log(`Index ${fullIndexName} deleted`);
      return true;
    } catch (error) {
      console.error('Failed to delete index:', error);
      return false;
    }
  }

  /**
   * 检查索引是否存在
   */
  async indexExists(indexName: string): Promise<boolean> {
    try {
      const fullIndexName = this.getIndexName(indexName);
      const response = await fetch(`${this.baseUrl}/${fullIndexName}`, {
        method: 'HEAD',
        headers: this.headers,
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 索引文档
   */
  async indexDocument(indexName: string, document: SearchableDocument): Promise<boolean> {
    try {
      const fullIndexName = this.getIndexName(indexName);
      const body = this.prepareDocument(document);
      
      await this.request('PUT', `/${fullIndexName}/_doc/${document.id}`, body);
      return true;
    } catch (error) {
      console.error('Failed to index document:', error);
      return false;
    }
  }

  /**
   * 批量索引文档
   */
  async bulkIndexDocuments(
    indexName: string,
    documents: SearchableDocument[]
  ): Promise<{ success: number; failed: number }> {
    try {
      const fullIndexName = this.getIndexName(indexName);
      
      // 构建批量请求体
      const bulkBody = documents.flatMap(doc => [
        { index: { _index: fullIndexName, _id: doc.id } },
        this.prepareDocument(doc),
      ]);

      const response = await this.request('POST', '/_bulk', bulkBody, true);
      
      let success = 0;
      let failed = 0;
      
      if (response.items) {
        for (const item of response.items) {
          if (item.index?.error) {
            failed++;
          } else {
            success++;
          }
        }
      }

      return { success, failed };
    } catch (error) {
      console.error('Failed to bulk index documents:', error);
      return { success: 0, failed: documents.length };
    }
  }

  /**
   * 更新文档
   */
  async updateDocument(
    indexName: string,
    id: string,
    document: Partial<SearchableDocument>
  ): Promise<boolean> {
    try {
      const fullIndexName = this.getIndexName(indexName);
      const body = { doc: this.prepareDocument(document as SearchableDocument) };
      
      await this.request('POST', `/${fullIndexName}/_update/${id}`, body);
      return true;
    } catch (error) {
      console.error('Failed to update document:', error);
      return false;
    }
  }

  /**
   * 删除文档
   */
  async deleteDocument(indexName: string, id: string): Promise<boolean> {
    try {
      const fullIndexName = this.getIndexName(indexName);
      await this.request('DELETE', `/${fullIndexName}/_doc/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete document:', error);
      return false;
    }
  }

  /**
   * 获取文档
   */
  async getDocument(indexName: string, id: string): Promise<SearchableDocument | null> {
    try {
      const fullIndexName = this.getIndexName(indexName);
      const response = await this.request('GET', `/${fullIndexName}/_doc/${id}`);
      
      if (response.found) {
        return this.parseDocument(response._source);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 搜索
   */
  async search(indexName: string, query: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      const fullIndexName = this.getIndexName(indexName);
      const page = query.page || 1;
      const pageSize = query.pageSize || 10;
      const from = (page - 1) * pageSize;

      // 构建查询
      const esQuery = this.buildQuery(query);
      
      // 构建请求体
      const body: Record<string, unknown> = {
        query: esQuery,
        from,
        size: pageSize,
        track_total_hits: true,
      };

      // 排序
      if (query.sort && query.sort.length > 0) {
        body.sort = query.sort.map(s => ({ [s.field]: s.order }));
      } else {
        body.sort = [{ _score: 'desc' }, { createdAt: 'desc' }];
      }

      // 高亮
      if (query.highlight !== false) {
        body.highlight = {
          pre_tags: DEFAULT_HIGHLIGHT_CONFIG.preTags,
          post_tags: DEFAULT_HIGHLIGHT_CONFIG.postTags,
          fragment_size: DEFAULT_HIGHLIGHT_CONFIG.fragmentSize,
          number_of_fragments: DEFAULT_HIGHLIGHT_CONFIG.numberOfFragments,
          fields: {
            title: {},
            content: {},
            description: {},
          },
        };
      }

      // 聚合
      if (query.aggregations && query.aggregations.length > 0) {
        body.aggs = {};
        for (const field of query.aggregations) {
          (body.aggs as Record<string, unknown>)[field] = {
            terms: { field, size: 20 },
          };
        }
      }

      // 搜索建议
      if (query.suggest) {
        body.suggest = {
          text: query.query,
          title_suggest: {
            term: { field: 'title.keyword' },
          },
        };
      }

      const response = await this.request('POST', `/${fullIndexName}/_search`, body);
      const took = Date.now() - startTime;

      // 解析结果
      const total = typeof response.hits.total === 'number' 
        ? response.hits.total 
        : response.hits.total?.value || 0;

      const hits: SearchHit[] = response.hits.hits.map((hit: any) => ({
        document: this.parseDocument(hit._source),
        score: hit._score || 0,
        highlights: hit.highlight,
      }));

      // 解析聚合
      let aggregations;
      if (response.aggregations) {
        aggregations = {};
        for (const [key, value] of Object.entries(response.aggregations)) {
          (aggregations as Record<string, unknown>)[key] = {
            buckets: (value as any).buckets.map((b: any) => ({
              key: b.key,
              count: b.doc_count,
            })),
          };
        }
      }

      // 解析建议
      let suggestions;
      if (response.suggest?.title_suggest) {
        suggestions = response.suggest.title_suggest
          .flatMap((s: any) => s.options)
          .map((o: any) => o.text);
      }

      return {
        hits,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        took,
        suggestions,
        aggregations,
      };
    } catch (error) {
      console.error('Search failed:', error);
      throw new SearchError(
        'Search failed',
        SEARCH_ERROR_CODES.SEARCH_FAILED,
        error
      );
    }
  }

  /**
   * 搜索建议
   */
  async suggest(
    indexName: string,
    prefix: string,
    options?: { size?: number }
  ): Promise<SearchSuggestion[]> {
    try {
      const fullIndexName = this.getIndexName(indexName);
      const size = options?.size || 5;

      const body = {
        suggest: {
          title_suggest: {
            prefix,
            completion: {
              field: 'title.keyword',
              size,
              skip_duplicates: true,
            },
          },
        },
      };

      const response = await this.request('POST', `/${fullIndexName}/_search`, body);

      if (response.suggest?.title_suggest) {
        return response.suggest.title_suggest
          .flatMap((s: any) => s.options)
          .map((o: any) => ({
            text: o.text,
            score: o._score || 0,
          }));
      }

      return [];
    } catch (error) {
      console.error('Suggest failed:', error);
      return [];
    }
  }

  /**
   * 统计文档数量
   */
  async count(indexName: string, filters?: SearchFilters): Promise<number> {
    try {
      const fullIndexName = this.getIndexName(indexName);
      
      const body: Record<string, unknown> = {};
      if (filters) {
        body.query = this.buildFilters(filters);
      }

      const response = await this.request('POST', `/${fullIndexName}/_count`, body);
      return response.count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * 构建查询
   */
  private buildQuery(query: SearchQuery): Record<string, unknown> {
    const must: unknown[] = [];
    const filter: unknown[] = [];

    // 全文搜索
    if (query.query && query.query.trim()) {
      must.push({
        multi_match: {
          query: query.query,
          fields: ['title^3', 'content', 'description^2', 'tags^2'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // 过滤条件
    if (query.filters) {
      const filterQuery = this.buildFilters(query.filters) as { bool?: { filter?: unknown[] } };
      if (filterQuery.bool?.filter) {
        filter.push(...filterQuery.bool.filter);
      }
    }

    // 构建最终查询
    if (must.length === 0 && filter.length === 0) {
      return { match_all: {} };
    }

    return {
      bool: {
        must: must.length > 0 ? must : [{ match_all: {} }],
        filter: filter.length > 0 ? filter : undefined,
      },
    };
  }

  /**
   * 构建过滤条件
   */
  private buildFilters(filters: SearchFilters): Record<string, unknown> {
    const filterClauses: unknown[] = [];

    // 类型过滤
    if (filters.type && filters.type.length > 0) {
      filterClauses.push({ terms: { type: filters.type } });
    }

    // 状态过滤
    if (filters.status && filters.status.length > 0) {
      filterClauses.push({ terms: { status: filters.status } });
    }

    // 作者过滤
    if (filters.author) {
      filterClauses.push({ term: { author: filters.author } });
    }

    if (filters.authorId) {
      filterClauses.push({ term: { authorId: filters.authorId } });
    }

    // 分类过滤
    if (filters.category && filters.category.length > 0) {
      filterClauses.push({ terms: { category: filters.category } });
    }

    // 标签过滤
    if (filters.tags && filters.tags.length > 0) {
      filterClauses.push({ terms: { tags: filters.tags } });
    }

    // 日期范围过滤
    if (filters.dateRange) {
      const field = filters.dateRange.field || 'createdAt';
      const range: Record<string, unknown> = {};
      
      if (filters.dateRange.start) {
        range.gte = filters.dateRange.start.toISOString();
      }
      if (filters.dateRange.end) {
        range.lte = filters.dateRange.end.toISOString();
      }
      
      if (Object.keys(range).length > 0) {
        filterClauses.push({ range: { [field]: range } });
      }
    }

    return {
      bool: {
        filter: filterClauses,
      },
    };
  }

  /**
   * 发送请求
   */
  private async request(
    method: string,
    path: string,
    body?: unknown,
    ndjson: boolean = false
  ): Promise<any> {
    const url = `${this.baseUrl}${path}`;
    
    const options: RequestInit = {
      method,
      headers: { ...this.headers },
    };

    if (body) {
      if (ndjson && Array.isArray(body)) {
        // NDJSON 格式（用于批量操作）
        options.body = body.map(item => JSON.stringify(item)).join('\n') + '\n';
        (options.headers as Record<string, string>)['Content-Type'] = 'application/x-ndjson';
      } else {
        options.body = JSON.stringify(body);
      }
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new SearchError(
        error.error?.reason || `HTTP ${response.status}`,
        SEARCH_ERROR_CODES.SEARCH_FAILED,
        error
      );
    }

    return response.json();
  }

  /**
   * 获取完整索引名
   */
  private getIndexName(name: string): string {
    const prefix = this.config.indexPrefix || '';
    return prefix ? `${prefix}_${name}` : name;
  }

  /**
   * 准备文档（转换日期等）
   */
  private prepareDocument(document: SearchableDocument): Record<string, unknown> {
    return {
      ...document,
      createdAt: document.createdAt instanceof Date 
        ? document.createdAt.toISOString() 
        : document.createdAt,
      updatedAt: document.updatedAt instanceof Date 
        ? document.updatedAt.toISOString() 
        : document.updatedAt,
    };
  }

  /**
   * 解析文档（转换日期等）
   */
  private parseDocument(source: Record<string, unknown>): SearchableDocument {
    return {
      ...source,
      createdAt: source.createdAt ? new Date(source.createdAt as string) : new Date(),
      updatedAt: source.updatedAt ? new Date(source.updatedAt as string) : undefined,
    } as SearchableDocument;
  }
}

/**
 * 创建 Elasticsearch 适配器
 */
export function createElasticsearchAdapter(config: ElasticsearchConfig): ElasticsearchAdapter {
  return new ElasticsearchAdapter(config);
}

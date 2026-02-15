/**
 * MeiliSearch Adapter
 * MeiliSearch 搜索适配器
 */

import {
  MeiliSearchConfig,
  SearchableDocument,
  SearchQuery,
  SearchResult,
  SearchHit,
  SearchSuggestion,
  SearchFilters,
  IndexSettings,
  ISearchAdapter,
  SearchError,
  SEARCH_ERROR_CODES,
} from '../types';

/**
 * MeiliSearch 适配器
 */
export class MeiliSearchAdapter implements ISearchAdapter {
  private config: MeiliSearchConfig;
  private baseUrl: string;
  private connected: boolean = false;
  private headers: Record<string, string>;

  constructor(config: MeiliSearchConfig) {
    this.config = config;
    const protocol = config.ssl ? 'https' : 'http';
    const port = config.port || 7700;
    this.baseUrl = `${protocol}://${config.host}:${port}`;
    
    this.headers = {
      'Content-Type': 'application/json',
    };

    // API Key 认证
    if (config.masterKey || config.apiKey) {
      this.headers['Authorization'] = `Bearer ${config.masterKey || config.apiKey}`;
    }
  }

  /**
   * 连接到 MeiliSearch
   */
  async connect(): Promise<void> {
    try {
      const healthy = await this.ping();
      if (healthy) {
        this.connected = true;
        console.log('Connected to MeiliSearch');
      } else {
        throw new SearchError(
          'Failed to connect to MeiliSearch',
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
    console.log('Disconnected from MeiliSearch');
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
      const response = await this.request('GET', '/health');
      return response.status === 'available';
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
      
      // 创建索引
      await this.request('POST', '/indexes', {
        uid: indexName,
        primaryKey: 'id',
      });

      // 配置可搜索属性
      await this.request('PUT', `/indexes/${indexName}/settings/searchable-attributes`, [
        'title',
        'content',
        'description',
        'tags',
      ]);

      // 配置可过滤属性
      await this.request('PUT', `/indexes/${indexName}/settings/filterable-attributes`, [
        'type',
        'status',
        'author',
        'authorId',
        'category',
        'tags',
        'createdAt',
      ]);

      // 配置可排序属性
      await this.request('PUT', `/indexes/${indexName}/settings/sortable-attributes`, [
        'createdAt',
        'updatedAt',
      ]);

      // 配置中文分词
      await this.request('PUT', `/indexes/${indexName}/settings/typo-tolerance`, {
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 4,
          twoTypos: 8,
        },
      });

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
      await this.request('DELETE', `/indexes/${fullIndexName}`);
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
      await this.request('GET', `/indexes/${fullIndexName}`);
      return true;
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
      const doc = this.prepareDocument(document);
      
      await this.request('POST', `/indexes/${fullIndexName}/documents`, [doc]);
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
      const docs = documents.map(doc => this.prepareDocument(doc));
      
      const response = await this.request('POST', `/indexes/${fullIndexName}/documents`, docs);
      
      // MeiliSearch 返回任务 ID，需要等待任务完成
      if (response.taskUid) {
        await this.waitForTask(response.taskUid);
      }

      return { success: documents.length, failed: 0 };
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
      const doc = { id, ...this.prepareDocument(document as SearchableDocument) };
      
      await this.request('PUT', `/indexes/${fullIndexName}/documents`, [doc]);
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
      await this.request('DELETE', `/indexes/${fullIndexName}/documents/${id}`);
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
      const response = await this.request('GET', `/indexes/${fullIndexName}/documents/${id}`);
      return this.parseDocument(response);
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

      // 构建搜索请求
      const searchParams: Record<string, unknown> = {
        q: query.query || '',
        limit: pageSize,
        offset: (page - 1) * pageSize,
        attributesToHighlight: query.highlight !== false ? ['title', 'content', 'description'] : [],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      };

      // 过滤条件
      if (query.filters) {
        const filterStr = this.buildFilters(query.filters);
        if (filterStr) {
          searchParams.filter = filterStr;
        }
      }

      // 排序
      if (query.sort && query.sort.length > 0) {
        searchParams.sort = query.sort.map(s => `${s.field}:${s.order}`);
      }

      // 聚合（MeiliSearch 使用 facets）
      if (query.aggregations && query.aggregations.length > 0) {
        searchParams.facets = query.aggregations;
      }

      const response = await this.request('POST', `/indexes/${fullIndexName}/search`, searchParams);
      const took = Date.now() - startTime;

      // 解析结果
      const hits: SearchHit[] = (response.hits || []).map((hit: any) => ({
        document: this.parseDocument(hit),
        score: hit._rankingScore || 0,
        highlights: hit._formatted ? {
          title: hit._formatted.title ? [hit._formatted.title] : undefined,
          content: hit._formatted.content ? [hit._formatted.content] : undefined,
          description: hit._formatted.description ? [hit._formatted.description] : undefined,
        } : undefined,
      }));

      // 解析聚合
      let aggregations;
      if (response.facetDistribution) {
        aggregations = {};
        for (const [key, value] of Object.entries(response.facetDistribution)) {
          (aggregations as Record<string, unknown>)[key] = {
            buckets: Object.entries(value as Record<string, number>).map(([k, count]) => ({
              key: k,
              count,
            })),
          };
        }
      }

      const total = response.estimatedTotalHits || response.totalHits || hits.length;

      return {
        hits,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        took,
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

      const response = await this.request('POST', `/indexes/${fullIndexName}/search`, {
        q: prefix,
        limit: size,
        attributesToRetrieve: ['title'],
      });

      return (response.hits || []).map((hit: any) => ({
        text: hit.title,
        score: hit._rankingScore || 0,
      }));
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
      
      const searchParams: Record<string, unknown> = {
        q: '',
        limit: 0,
      };

      if (filters) {
        const filterStr = this.buildFilters(filters);
        if (filterStr) {
          searchParams.filter = filterStr;
        }
      }

      const response = await this.request('POST', `/indexes/${fullIndexName}/search`, searchParams);
      return response.estimatedTotalHits || response.totalHits || 0;
    } catch {
      return 0;
    }
  }

  /**
   * 构建过滤条件
   */
  private buildFilters(filters: SearchFilters): string {
    const conditions: string[] = [];

    // 类型过滤
    if (filters.type && filters.type.length > 0) {
      conditions.push(`type IN [${filters.type.map(t => `"${t}"`).join(', ')}]`);
    }

    // 状态过滤
    if (filters.status && filters.status.length > 0) {
      conditions.push(`status IN [${filters.status.map(s => `"${s}"`).join(', ')}]`);
    }

    // 作者过滤
    if (filters.author) {
      conditions.push(`author = "${filters.author}"`);
    }

    if (filters.authorId) {
      conditions.push(`authorId = "${filters.authorId}"`);
    }

    // 分类过滤
    if (filters.category && filters.category.length > 0) {
      conditions.push(`category IN [${filters.category.map(c => `"${c}"`).join(', ')}]`);
    }

    // 标签过滤
    if (filters.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags.map(tag => `tags = "${tag}"`);
      conditions.push(`(${tagConditions.join(' OR ')})`);
    }

    // 日期范围过滤
    if (filters.dateRange) {
      const field = filters.dateRange.field || 'createdAt';
      
      if (filters.dateRange.start) {
        conditions.push(`${field} >= ${filters.dateRange.start.getTime()}`);
      }
      if (filters.dateRange.end) {
        conditions.push(`${field} <= ${filters.dateRange.end.getTime()}`);
      }
    }

    return conditions.join(' AND ');
  }

  /**
   * 等待任务完成
   */
  private async waitForTask(taskUid: number, timeout: number = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const task = await this.request('GET', `/tasks/${taskUid}`);
      
      if (task.status === 'succeeded') {
        return;
      }
      
      if (task.status === 'failed') {
        throw new SearchError(
          task.error?.message || 'Task failed',
          SEARCH_ERROR_CODES.INDEX_FAILED,
          task.error
        );
      }
      
      // 等待 100ms 后重试
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new SearchError('Task timeout', SEARCH_ERROR_CODES.TIMEOUT);
  }

  /**
   * 发送请求
   */
  private async request(method: string, path: string, body?: unknown): Promise<any> {
    const url = `${this.baseUrl}${path}`;
    
    const options: RequestInit = {
      method,
      headers: this.headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new SearchError(
        error.message || `HTTP ${response.status}`,
        SEARCH_ERROR_CODES.SEARCH_FAILED,
        error
      );
    }

    // 某些请求可能返回空响应
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  /**
   * 获取完整索引名
   */
  private getIndexName(name: string): string {
    const prefix = this.config.indexPrefix || '';
    return prefix ? `${prefix}_${name}` : name;
  }

  /**
   * 准备文档（转换日期为时间戳）
   */
  private prepareDocument(document: SearchableDocument): Record<string, unknown> {
    return {
      ...document,
      createdAt: document.createdAt instanceof Date 
        ? document.createdAt.getTime() 
        : document.createdAt,
      updatedAt: document.updatedAt instanceof Date 
        ? document.updatedAt.getTime() 
        : document.updatedAt,
    };
  }

  /**
   * 解析文档（转换时间戳为日期）
   */
  private parseDocument(source: Record<string, unknown>): SearchableDocument {
    // 移除 MeiliSearch 特有字段
    const { _formatted, _rankingScore, ...rest } = source;
    
    return {
      ...rest,
      createdAt: source.createdAt ? new Date(source.createdAt as number) : new Date(),
      updatedAt: source.updatedAt ? new Date(source.updatedAt as number) : undefined,
    } as SearchableDocument;
  }
}

/**
 * 创建 MeiliSearch 适配器
 */
export function createMeiliSearchAdapter(config: MeiliSearchConfig): MeiliSearchAdapter {
  return new MeiliSearchAdapter(config);
}

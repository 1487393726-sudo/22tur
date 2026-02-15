/**
 * Search API
 * 全局搜索 API 端点
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getSearchService,
  SearchQuery,
  SearchFilters,
  DocumentType,
} from '@/lib/search';

/**
 * GET /api/search
 * 全局搜索
 * 
 * Query Parameters:
 * - q: 搜索关键词 (必填)
 * - type: 文档类型过滤 (可选，逗号分隔)
 * - status: 状态过滤 (可选，逗号分隔)
 * - category: 分类过滤 (可选，逗号分隔)
 * - tags: 标签过滤 (可选，逗号分隔)
 * - author: 作者过滤 (可选)
 * - startDate: 开始日期 (可选)
 * - endDate: 结束日期 (可选)
 * - page: 页码 (可选，默认 1)
 * - pageSize: 每页数量 (可选，默认 10)
 * - sort: 排序字段 (可选)
 * - order: 排序方向 (可选，asc/desc)
 * - highlight: 是否高亮 (可选，默认 true)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // 获取搜索关键词
    const query = searchParams.get('q') || '';
    if (!query.trim()) {
      return NextResponse.json(
        { error: '搜索关键词不能为空' },
        { status: 400 }
      );
    }

    // 构建过滤器
    const filters: SearchFilters = {};

    // 文档类型过滤
    const typeParam = searchParams.get('type');
    if (typeParam) {
      filters.type = typeParam.split(',') as DocumentType[];
    }

    // 状态过滤
    const statusParam = searchParams.get('status');
    if (statusParam) {
      filters.status = statusParam.split(',');
    }

    // 分类过滤
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      filters.category = categoryParam.split(',');
    }

    // 标签过滤
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      filters.tags = tagsParam.split(',');
    }

    // 作者过滤
    const author = searchParams.get('author');
    if (author) {
      filters.author = author;
    }

    // 日期范围过滤
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      filters.dateRange = {
        field: 'createdAt',
        start: startDate ? new Date(startDate) : undefined,
        end: endDate ? new Date(endDate) : undefined,
      };
    }

    // 分页参数
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10', 10), 100);

    // 排序参数
    const sortField = searchParams.get('sort');
    const sortOrder = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    // 高亮参数
    const highlight = searchParams.get('highlight') !== 'false';

    // 构建搜索查询
    const searchQuery: SearchQuery = {
      query,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      page,
      pageSize,
      sort: sortField ? [{ field: sortField, order: sortOrder }] : undefined,
      highlight,
      suggest: true,
    };

    // 执行搜索
    const searchService = getSearchService();
    const result = await searchService.search(searchQuery);

    return NextResponse.json({
      success: true,
      data: {
        hits: result.hits,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        took: result.took,
        suggestions: result.suggestions,
        aggregations: result.aggregations,
      },
    });
  } catch (error) {
    console.error('[Search API] 搜索失败:', error);
    return NextResponse.json(
      { error: '搜索失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/search
 * 高级搜索（支持复杂查询）
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { query, filters, page, pageSize, sort, highlight, aggregations } = body;

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: '搜索关键词不能为空' },
        { status: 400 }
      );
    }

    // 构建搜索查询
    const searchQuery: SearchQuery = {
      query,
      filters,
      page: page || 1,
      pageSize: Math.min(pageSize || 10, 100),
      sort,
      highlight: highlight !== false,
      aggregations,
      suggest: true,
    };

    // 执行搜索
    const searchService = getSearchService();
    const result = await searchService.search(searchQuery);

    return NextResponse.json({
      success: true,
      data: {
        hits: result.hits,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        took: result.took,
        suggestions: result.suggestions,
        aggregations: result.aggregations,
      },
    });
  } catch (error) {
    console.error('[Search API] 高级搜索失败:', error);
    return NextResponse.json(
      { error: '搜索失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

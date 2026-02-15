/**
 * Search Suggest API
 * 搜索建议 API 端点
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSearchService, DocumentType } from '@/lib/search';

/**
 * GET /api/search/suggest
 * 获取搜索建议
 * 
 * Query Parameters:
 * - q: 搜索前缀 (必填)
 * - size: 建议数量 (可选，默认 5)
 * - type: 文档类型过滤 (可选，逗号分隔)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // 获取搜索前缀
    const prefix = searchParams.get('q') || '';
    if (!prefix.trim()) {
      return NextResponse.json({
        success: true,
        data: { suggestions: [] },
      });
    }

    // 获取建议数量
    const size = Math.min(parseInt(searchParams.get('size') || '5', 10), 20);

    // 获取文档类型过滤
    const typeParam = searchParams.get('type');
    const types = typeParam ? typeParam.split(',') as DocumentType[] : undefined;

    // 获取搜索建议
    const searchService = getSearchService();
    const suggestions = await searchService.suggest(prefix, { size, types });

    return NextResponse.json({
      success: true,
      data: { suggestions },
    });
  } catch (error) {
    console.error('[Search Suggest API] 获取建议失败:', error);
    return NextResponse.json(
      { error: '获取建议失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

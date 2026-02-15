/**
 * Search Stats API
 * 搜索统计 API 端点
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSearchService, getIndexSyncService } from '@/lib/search';

/**
 * GET /api/search/stats
 * 获取搜索统计信息
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取搜索服务统计
    const searchService = getSearchService();
    const searchStats = await searchService.getStats();

    // 获取同步服务统计
    const syncService = getIndexSyncService();
    const syncStats = syncService.getStats();

    return NextResponse.json({
      success: true,
      data: {
        search: searchStats,
        sync: syncStats,
      },
    });
  } catch (error) {
    console.error('[Search Stats API] 获取统计失败:', error);
    return NextResponse.json(
      { error: '获取统计失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

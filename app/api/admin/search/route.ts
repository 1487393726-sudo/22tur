/**
 * Admin Search API
 * 管理员搜索管理 API 端点
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getSearchService,
  getIndexSyncService,
  SearchableDocument,
  DocumentType,
} from '@/lib/search';

/**
 * GET /api/admin/search
 * 获取搜索服务状态和统计
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const searchService = getSearchService();
    const syncService = getIndexSyncService();

    const [searchStats, syncStats] = await Promise.all([
      searchService.getStats(),
      Promise.resolve(syncService.getStats()),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        search: searchStats,
        sync: syncStats,
      },
    });
  } catch (error) {
    console.error('[Admin Search API] 获取状态失败:', error);
    return NextResponse.json(
      { error: '获取状态失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/search
 * 管理搜索索引
 * 
 * Actions:
 * - index: 索引单个文档
 * - bulkIndex: 批量索引文档
 * - delete: 删除文档
 * - reindex: 重建索引
 * - retryFailed: 重试失败的同步
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const body = await request.json();
    const { action, document, documents, documentId, documentType } = body;

    const searchService = getSearchService();
    const syncService = getIndexSyncService();

    switch (action) {
      case 'index': {
        if (!document) {
          return NextResponse.json({ error: '缺少文档数据' }, { status: 400 });
        }
        const result = await syncService.onCreate(document as SearchableDocument);
        return NextResponse.json({ success: true, data: result });
      }

      case 'bulkIndex': {
        if (!documents || !Array.isArray(documents)) {
          return NextResponse.json({ error: '缺少文档数组' }, { status: 400 });
        }
        const result = await syncService.bulkSync(documents as SearchableDocument[]);
        return NextResponse.json({ success: true, data: result });
      }

      case 'delete': {
        if (!documentId || !documentType) {
          return NextResponse.json({ error: '缺少文档 ID 或类型' }, { status: 400 });
        }
        const result = await syncService.onDelete(documentId, documentType as DocumentType);
        return NextResponse.json({ success: true, data: result });
      }

      case 'retryFailed': {
        const result = await syncService.retryFailed();
        return NextResponse.json({ success: true, data: result });
      }

      case 'clearQueue': {
        syncService.clearQueue();
        return NextResponse.json({ success: true, message: '同步队列已清空' });
      }

      case 'getStats': {
        const stats = await searchService.getStats();
        return NextResponse.json({ success: true, data: stats });
      }

      default:
        return NextResponse.json({ error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Admin Search API] 操作失败:', error);
    return NextResponse.json(
      { error: '操作失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/search
 * 删除索引中的文档
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');
    const documentType = searchParams.get('type') as DocumentType;

    if (!documentId) {
      return NextResponse.json({ error: '缺少文档 ID' }, { status: 400 });
    }

    const syncService = getIndexSyncService();
    const result = await syncService.onDelete(documentId, documentType || 'document');

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[Admin Search API] 删除失败:', error);
    return NextResponse.json(
      { error: '删除失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

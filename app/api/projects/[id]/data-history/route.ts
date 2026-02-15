/**
 * 数据修改历史 API 端点
 * Data Modification History API Endpoint
 * 
 * GET: 获取数据修改历史
 * 
 * 需求: 10.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  dataEntryManager,
  DataEntryError
} from '@/lib/investor-operations-monitoring/data-entry-manager';

/**
 * GET /api/projects/[id]/data-history
 * 获取数据修改历史
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    
    const tableName = searchParams.get('tableName') || undefined;
    const recordId = searchParams.get('recordId') || undefined;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const history = await dataEntryManager.getModificationHistory(
      projectId,
      {
        tableName,
        recordId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit,
        offset
      }
    );

    return NextResponse.json({
      success: true,
      data: history
    });
  } catch (error) {
    if (error instanceof DataEntryError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 400 }
      );
    }
    console.error('获取修改历史失败:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '获取修改历史失败' } },
      { status: 500 }
    );
  }
}

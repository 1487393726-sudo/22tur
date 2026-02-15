/**
 * 收入明细 API
 * Revenue API
 * 
 * GET /api/projects/[id]/operations/revenue - 获取收入明细
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { operationsDataManager, OperationsErrorCodes } from '@/lib/investor-operations-monitoring/operations-data-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    // 默认获取最近30天的数据
    const endDate = endDateStr ? new Date(endDateStr) : new Date();
    const startDate = startDateStr 
      ? new Date(startDateStr) 
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { success: false, error: '无效的日期格式' },
        { status: 400 }
      );
    }

    const revenueBreakdown = await operationsDataManager.getRevenueBreakdown(
      projectId,
      { startDate, endDate }
    );

    return NextResponse.json({
      success: true,
      data: revenueBreakdown
    });
  } catch (error) {
    console.error('获取收入明细失败:', error);
    
    if (error instanceof Error && 'code' in error) {
      const typedError = error as { code: string; message: string };
      if (typedError.code === OperationsErrorCodes.PROJECT_NOT_FOUND) {
        return NextResponse.json(
          { success: false, error: typedError.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '获取收入明细失败' 
      },
      { status: 500 }
    );
  }
}

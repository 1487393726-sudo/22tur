/**
 * 项目对比 API
 * Project Comparison API
 * 
 * POST /api/projects/compare - 对比多个项目的盈亏情况
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { profitLossAnalyzer, ProfitLossErrorCodes } from '@/lib/investor-operations-monitoring/profit-loss-analyzer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const body = await request.json();
    const { projectIds, startDate, endDate } = body;

    // 验证参数
    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供要对比的项目ID列表' },
        { status: 400 }
      );
    }

    if (projectIds.length > 10) {
      return NextResponse.json(
        { success: false, error: '最多支持对比10个项目' },
        { status: 400 }
      );
    }

    // 默认获取最近30天的数据
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate 
      ? new Date(startDate) 
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, error: '无效的日期格式' },
        { status: 400 }
      );
    }

    const comparison = await profitLossAnalyzer.compareProjects(
      projectIds,
      { startDate: start, endDate: end }
    );

    return NextResponse.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('项目对比失败:', error);
    
    if (error instanceof Error && 'code' in error) {
      const typedError = error as { code: string; message: string };
      if (typedError.code === ProfitLossErrorCodes.INVALID_DATE_RANGE) {
        return NextResponse.json(
          { success: false, error: typedError.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '项目对比失败' 
      },
      { status: 500 }
    );
  }
}

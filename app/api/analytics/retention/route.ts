/**
 * Retention Analytics API
 * 留存分析 API 端点
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getRetentionAnalyzer, RetentionType, EventType } from '@/lib/analytics';

/**
 * GET /api/analytics/retention
 * 获取留存分析数据
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'analyze';

    const analyzer = getRetentionAnalyzer();

    switch (action) {
      case 'analyze': {
        // 解析参数
        const type = (searchParams.get('type') || 'daily') as RetentionType;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const cohortEvent = searchParams.get('cohortEvent') as EventType | undefined;
        const returnEvent = searchParams.get('returnEvent') as EventType | undefined;

        const result = await analyzer.analyze({
          type,
          startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: endDate ? new Date(endDate) : new Date(),
          cohortEvent,
          returnEvent,
        });

        return NextResponse.json({
          success: true,
          data: { result },
        });
      }

      case 'trend': {
        const type = (searchParams.get('type') || 'daily') as RetentionType;
        const periods = parseInt(searchParams.get('periods') || '12', 10);

        const trend = await analyzer.getRetentionTrend(type, periods);

        return NextResponse.json({
          success: true,
          data: { trend },
        });
      }

      default:
        return NextResponse.json({ error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Retention API] 获取数据失败:', error);
    return NextResponse.json(
      { error: '获取数据失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/retention
 * 执行留存分析
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { type, startDate, endDate, cohortEvent, returnEvent, segments } = body;

    if (!type || !startDate || !endDate) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const analyzer = getRetentionAnalyzer();

    const result = await analyzer.analyze({
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      cohortEvent,
      returnEvent,
      segments,
    });

    return NextResponse.json({
      success: true,
      data: { result },
    });
  } catch (error) {
    console.error('[Retention API] 分析失败:', error);
    return NextResponse.json(
      { error: '分析失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

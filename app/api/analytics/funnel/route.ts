/**
 * Funnel Analytics API
 * 漏斗分析 API 端点
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFunnelAnalyzer, FunnelStep } from '@/lib/analytics';

/**
 * GET /api/analytics/funnel
 * 获取漏斗列表或分析结果
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const funnelId = searchParams.get('id');

    const analyzer = getFunnelAnalyzer();

    switch (action) {
      case 'list': {
        const funnels = await analyzer.listFunnels();
        return NextResponse.json({
          success: true,
          data: { funnels },
        });
      }

      case 'get': {
        if (!funnelId) {
          return NextResponse.json({ error: '缺少漏斗 ID' }, { status: 400 });
        }
        const funnel = await analyzer.getFunnel(funnelId);
        if (!funnel) {
          return NextResponse.json({ error: '漏斗不存在' }, { status: 404 });
        }
        return NextResponse.json({
          success: true,
          data: { funnel },
        });
      }

      case 'analyze': {
        if (!funnelId) {
          return NextResponse.json({ error: '缺少漏斗 ID' }, { status: 400 });
        }

        // 解析时间范围
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const timeRange = {
          start: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: endDate ? new Date(endDate) : new Date(),
        };

        const result = await analyzer.analyze(funnelId, timeRange);
        return NextResponse.json({
          success: true,
          data: { result },
        });
      }

      default:
        return NextResponse.json({ error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Funnel API] 获取数据失败:', error);
    return NextResponse.json(
      { error: '获取数据失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/funnel
 * 创建或更新漏斗
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const body = await request.json();
    const { action, id, name, description, steps, timeWindow } = body;

    const analyzer = getFunnelAnalyzer();

    switch (action) {
      case 'create': {
        if (!name || !steps || !Array.isArray(steps)) {
          return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
        }

        const funnel = await analyzer.createFunnel({
          name,
          description,
          steps: steps as FunnelStep[],
          timeWindow,
        });

        return NextResponse.json({
          success: true,
          data: { funnel },
        });
      }

      case 'update': {
        if (!id) {
          return NextResponse.json({ error: '缺少漏斗 ID' }, { status: 400 });
        }

        const funnel = await analyzer.updateFunnel(id, {
          name,
          description,
          steps,
          timeWindow,
        });

        return NextResponse.json({
          success: true,
          data: { funnel },
        });
      }

      case 'initPredefined': {
        await analyzer.createPredefinedFunnels();
        const funnels = await analyzer.listFunnels();
        return NextResponse.json({
          success: true,
          data: { funnels },
          message: '预定义漏斗已创建',
        });
      }

      default:
        return NextResponse.json({ error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Funnel API] 操作失败:', error);
    return NextResponse.json(
      { error: '操作失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/analytics/funnel
 * 删除漏斗
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const funnelId = searchParams.get('id');

    if (!funnelId) {
      return NextResponse.json({ error: '缺少漏斗 ID' }, { status: 400 });
    }

    const analyzer = getFunnelAnalyzer();
    const deleted = await analyzer.deleteFunnel(funnelId);

    if (!deleted) {
      return NextResponse.json({ error: '漏斗不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: '漏斗已删除',
    });
  } catch (error) {
    console.error('[Funnel API] 删除失败:', error);
    return NextResponse.json(
      { error: '删除失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

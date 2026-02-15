/**
 * Segments Analytics API
 * 用户分群 API 端点
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSegmentService, SegmentRule } from '@/lib/analytics';

/**
 * GET /api/analytics/segments
 * 获取分群列表或评估结果
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const segmentId = searchParams.get('id');
    const userId = searchParams.get('userId');

    const service = getSegmentService();

    switch (action) {
      case 'list': {
        const segments = await service.listSegments();
        return NextResponse.json({
          success: true,
          data: { segments },
        });
      }

      case 'get': {
        if (!segmentId) {
          return NextResponse.json({ error: '缺少分群 ID' }, { status: 400 });
        }
        const segment = await service.getSegment(segmentId);
        if (!segment) {
          return NextResponse.json({ error: '分群不存在' }, { status: 404 });
        }
        return NextResponse.json({
          success: true,
          data: { segment },
        });
      }

      case 'evaluate': {
        if (!segmentId) {
          return NextResponse.json({ error: '缺少分群 ID' }, { status: 400 });
        }
        const result = await service.evaluateSegment(segmentId);
        return NextResponse.json({
          success: true,
          data: { result },
        });
      }

      case 'userSegments': {
        if (!userId) {
          return NextResponse.json({ error: '缺少用户 ID' }, { status: 400 });
        }
        const segments = await service.getUserSegments(userId);
        return NextResponse.json({
          success: true,
          data: { segments },
        });
      }

      default:
        return NextResponse.json({ error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Segments API] 获取数据失败:', error);
    return NextResponse.json(
      { error: '获取数据失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/segments
 * 创建或更新分群
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const body = await request.json();
    const { action, id, name, description, rules, ruleLogic } = body;

    const service = getSegmentService();

    switch (action) {
      case 'create': {
        if (!name || !rules || !Array.isArray(rules)) {
          return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
        }

        const segment = await service.createSegment({
          name,
          description,
          rules: rules as SegmentRule[],
          ruleLogic: ruleLogic || 'and',
        });

        return NextResponse.json({
          success: true,
          data: { segment },
        });
      }

      case 'update': {
        if (!id) {
          return NextResponse.json({ error: '缺少分群 ID' }, { status: 400 });
        }

        const segment = await service.updateSegment(id, {
          name,
          description,
          rules,
          ruleLogic,
        });

        return NextResponse.json({
          success: true,
          data: { segment },
        });
      }

      case 'initPredefined': {
        await service.createPredefinedSegments();
        const segments = await service.listSegments();
        return NextResponse.json({
          success: true,
          data: { segments },
          message: '预定义分群已创建',
        });
      }

      default:
        return NextResponse.json({ error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Segments API] 操作失败:', error);
    return NextResponse.json(
      { error: '操作失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/analytics/segments
 * 删除分群
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const segmentId = searchParams.get('id');

    if (!segmentId) {
      return NextResponse.json({ error: '缺少分群 ID' }, { status: 400 });
    }

    const service = getSegmentService();
    const deleted = await service.deleteSegment(segmentId);

    if (!deleted) {
      return NextResponse.json({ error: '分群不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: '分群已删除',
    });
  } catch (error) {
    console.error('[Segments API] 删除失败:', error);
    return NextResponse.json(
      { error: '删除失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

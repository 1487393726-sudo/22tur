/**
 * A/B Test Assignment API
 * A/B 测试变体分配 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { abTestService } from '@/lib/ab-test';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/ab-tests/[id]/assign
 * 为用户分配变体
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: '缺少用户 ID' }, { status: 400 });
    }

    const variant = await abTestService.assignVariant(id, userId);

    if (!variant) {
      return NextResponse.json({
        success: true,
        data: null,
        message: '用户不在测试范围内或测试未运行',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        variantId: variant.id,
        variantName: variant.name,
        config: variant.config,
      },
    });
  } catch (error) {
    console.error('[AB Tests API] Assign error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '分配变体失败' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ab-tests/[id]/assign
 * 获取用户当前分配的变体
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '缺少用户 ID' }, { status: 400 });
    }

    const variant = await abTestService.getUserVariant(id, userId);

    return NextResponse.json({
      success: true,
      data: variant
        ? {
            variantId: variant.id,
            variantName: variant.name,
            config: variant.config,
          }
        : null,
    });
  } catch (error) {
    console.error('[AB Tests API] Get assignment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取分配失败' },
      { status: 500 }
    );
  }
}

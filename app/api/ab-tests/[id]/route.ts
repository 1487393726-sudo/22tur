/**
 * A/B Test Detail API
 * A/B 测试详情 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { abTestService } from '@/lib/ab-test';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/ab-tests/[id]
 * 获取测试详情
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const test = await abTestService.getTest(id);

    if (!test) {
      return NextResponse.json({ error: '测试不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error('[AB Tests API] GET detail error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取测试详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ab-tests/[id]
 * 更新测试
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, targetAudience, endDate } = body;

    const test = await abTestService.updateTest(id, {
      name,
      description,
      targetAudience,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error('[AB Tests API] PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新测试失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ab-tests/[id]
 * 删除测试
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const success = await abTestService.deleteTest(id);

    if (!success) {
      return NextResponse.json({ error: '删除测试失败' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '测试已删除',
    });
  } catch (error) {
    console.error('[AB Tests API] DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除测试失败' },
      { status: 500 }
    );
  }
}

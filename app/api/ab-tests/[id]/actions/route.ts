/**
 * A/B Test Actions API
 * A/B 测试操作 API (启动/暂停/结束)
 */

import { NextRequest, NextResponse } from 'next/server';
import { abTestService } from '@/lib/ab-test';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/ab-tests/[id]/actions
 * 执行测试操作
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    let test;

    switch (action) {
      case 'start':
        test = await abTestService.startTest(id);
        break;
      case 'pause':
        test = await abTestService.pauseTest(id);
        break;
      case 'end':
        test = await abTestService.endTest(id);
        break;
      default:
        return NextResponse.json({ error: '无效的操作' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: test,
      message: `测试已${action === 'start' ? '启动' : action === 'pause' ? '暂停' : '结束'}`,
    });
  } catch (error) {
    console.error('[AB Tests API] Action error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '操作失败' },
      { status: 500 }
    );
  }
}

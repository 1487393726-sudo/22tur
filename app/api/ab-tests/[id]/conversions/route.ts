/**
 * A/B Test Conversions API
 * A/B 测试转化记录 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { abTestService } from '@/lib/ab-test';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/ab-tests/[id]/conversions
 * 记录转化事件
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, eventType, value, metadata } = body;

    if (!userId) {
      return NextResponse.json({ error: '缺少用户 ID' }, { status: 400 });
    }

    if (!eventType) {
      return NextResponse.json({ error: '缺少事件类型' }, { status: 400 });
    }

    const success = await abTestService.recordConversion(id, userId, eventType, value, metadata);

    if (!success) {
      return NextResponse.json({
        success: false,
        message: '用户未参与此测试',
      });
    }

    return NextResponse.json({
      success: true,
      message: '转化事件已记录',
    });
  } catch (error) {
    console.error('[AB Tests API] Conversion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '记录转化失败' },
      { status: 500 }
    );
  }
}

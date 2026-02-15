/**
 * A/B Test Results API
 * A/B 测试结果 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { abTestService } from '@/lib/ab-test';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/ab-tests/[id]/results
 * 获取测试结果
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const results = await abTestService.getTestResults(id);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('[AB Tests API] Results error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取测试结果失败' },
      { status: 500 }
    );
  }
}

/**
 * A/B Tests API
 * A/B 测试 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { abTestService } from '@/lib/ab-test';
import type { CreateABTestParams, ABTestStatus } from '@/lib/ab-test/types';

/**
 * GET /api/ab-tests
 * 获取 A/B 测试列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as ABTestStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const result = await abTestService.getAllTests({
      status: status || undefined,
      page,
      pageSize,
    });

    return NextResponse.json({
      success: true,
      data: result.tests,
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize),
      },
    });
  } catch (error) {
    console.error('[AB Tests API] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取测试列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ab-tests
 * 创建 A/B 测试
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, variants, targetAudience, startDate, endDate, createdBy } =
      body as CreateABTestParams;

    // 验证必填字段
    if (!name) {
      return NextResponse.json({ error: '测试名称不能为空' }, { status: 400 });
    }

    if (!variants || variants.length < 2) {
      return NextResponse.json({ error: '至少需要两个变体' }, { status: 400 });
    }

    if (!createdBy) {
      return NextResponse.json({ error: '缺少创建者信息' }, { status: 400 });
    }

    // 验证变体分配
    const totalAllocation = variants.reduce((sum, v) => sum + (v.allocation || 0), 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
      return NextResponse.json(
        { error: `变体分配总和必须为 100%，当前为 ${totalAllocation}%` },
        { status: 400 }
      );
    }

    const test = await abTestService.createTest({
      name,
      description,
      variants,
      targetAudience,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      createdBy,
    });

    return NextResponse.json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error('[AB Tests API] POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建测试失败' },
      { status: 500 }
    );
  }
}

/**
 * 人力成本汇总 API
 * GET /api/projects/[id]/salary/summary
 * 
 * 需求 6.1: 人力成本汇总
 */

import { NextRequest, NextResponse } from 'next/server';
import { salaryTransparencyManager, SalaryTransparencyError } from '@/lib/investor-operations-monitoring/salary-transparency-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: '项目ID不能为空' },
        { status: 400 }
      );
    }

    const summary = await salaryTransparencyManager.getLaborCostSummary(projectId);

    return NextResponse.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('获取人力成本汇总失败:', error);

    if (error instanceof SalaryTransparencyError) {
      const statusCode = error.code === 'PROJECT_NOT_FOUND' ? 404 : 400;
      return NextResponse.json(
        { 
          success: false,
          error: error.message,
          code: error.code 
        },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: '获取人力成本汇总失败' 
      },
      { status: 500 }
    );
  }
}

/**
 * 五险一金明细 API
 * GET /api/projects/[id]/salary/social-insurance
 * 
 * 需求 6.4: 五险一金明细
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

    const detail = await salaryTransparencyManager.getSocialInsuranceDetail(projectId);

    return NextResponse.json({
      success: true,
      data: detail
    });
  } catch (error) {
    console.error('获取五险一金明细失败:', error);

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
        error: '获取五险一金明细失败' 
      },
      { status: 500 }
    );
  }
}

/**
 * 薪资构成分析 API
 * GET /api/projects/[id]/salary/composition
 * 
 * 需求 6.3: 薪资构成分析
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

    const composition = await salaryTransparencyManager.getSalaryComposition(projectId);

    return NextResponse.json({
      success: true,
      data: composition
    });
  } catch (error) {
    console.error('获取薪资构成失败:', error);

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
        error: '获取薪资构成失败' 
      },
      { status: 500 }
    );
  }
}

/**
 * 员工评估趋势 API
 * GET /api/projects/[id]/employees/[employeeId]/assessments/trend
 * 
 * 需求 7.4: 评估历史趋势分析
 */

import { NextRequest, NextResponse } from 'next/server';
import { performanceAssessmentManager, PerformanceAssessmentError } from '@/lib/investor-operations-monitoring/performance-assessment-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; employeeId: string }> }
) {
  try {
    const { employeeId } = await params;

    if (!employeeId) {
      return NextResponse.json(
        { error: '员工ID不能为空' },
        { status: 400 }
      );
    }

    const trend = await performanceAssessmentManager.getAssessmentTrend(employeeId);

    return NextResponse.json({
      success: true,
      data: trend
    });
  } catch (error) {
    console.error('获取评估趋势失败:', error);

    if (error instanceof PerformanceAssessmentError) {
      const statusCode = error.code === 'EMPLOYEE_NOT_FOUND' ? 404 : 400;
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
        error: '获取评估趋势失败' 
      },
      { status: 500 }
    );
  }
}

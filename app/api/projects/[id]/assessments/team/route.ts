/**
 * 团队能力评估 API
 * GET /api/projects/[id]/assessments/team
 * 
 * 需求 7.1: 团队能力评估
 */

import { NextRequest, NextResponse } from 'next/server';
import { performanceAssessmentManager, PerformanceAssessmentError } from '@/lib/investor-operations-monitoring/performance-assessment-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const assessmentPeriod = searchParams.get('period') || undefined;

    if (!projectId) {
      return NextResponse.json(
        { error: '项目ID不能为空' },
        { status: 400 }
      );
    }

    const teamAssessment = await performanceAssessmentManager.getTeamAssessment(
      projectId,
      assessmentPeriod
    );

    return NextResponse.json({
      success: true,
      data: teamAssessment
    });
  } catch (error) {
    console.error('获取团队能力评估失败:', error);

    if (error instanceof PerformanceAssessmentError) {
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
        error: '获取团队能力评估失败' 
      },
      { status: 500 }
    );
  }
}

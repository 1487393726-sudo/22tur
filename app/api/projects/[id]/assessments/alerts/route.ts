/**
 * 能力预警 API
 * GET /api/projects/[id]/assessments/alerts
 * 
 * 需求 7.5: 能力预警机制
 */

import { NextRequest, NextResponse } from 'next/server';
import { performanceAssessmentManager, PerformanceAssessmentError } from '@/lib/investor-operations-monitoring/performance-assessment-manager';

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

    const alerts = await performanceAssessmentManager.checkCapabilityAlert(projectId);

    return NextResponse.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('获取能力预警失败:', error);

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
        error: '获取能力预警失败' 
      },
      { status: 500 }
    );
  }
}

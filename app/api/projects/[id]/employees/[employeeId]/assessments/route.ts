/**
 * 员工能力评估 API
 * GET /api/projects/[id]/employees/[employeeId]/assessments - 获取员工评估列表
 * POST /api/projects/[id]/employees/[employeeId]/assessments - 提交新评估
 * 
 * 需求 7.2: 个人能力评估
 */

import { NextRequest, NextResponse } from 'next/server';
import { performanceAssessmentManager, PerformanceAssessmentError } from '@/lib/investor-operations-monitoring/performance-assessment-manager';
import { getServerSession } from 'next-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    if (!employeeId) {
      return NextResponse.json(
        { error: '员工ID不能为空' },
        { status: 400 }
      );
    }

    const result = await performanceAssessmentManager.getEmployeeAssessments(
      employeeId,
      { page, pageSize }
    );

    return NextResponse.json({
      success: true,
      data: result.assessments,
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize)
      }
    });
  } catch (error) {
    console.error('获取员工评估列表失败:', error);

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
        error: '获取员工评估列表失败' 
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    const body = await request.json();

    if (!employeeId) {
      return NextResponse.json(
        { error: '员工ID不能为空' },
        { status: 400 }
      );
    }

    // 获取当前用户作为评估人
    const session = await getServerSession();
    const assessedBy = session?.user?.id || 'system';

    const assessment = await performanceAssessmentManager.submitAssessment(
      {
        employeeId,
        assessmentPeriod: body.assessmentPeriod,
        professionalSkills: body.professionalSkills,
        workAttitude: body.workAttitude,
        teamwork: body.teamwork,
        communication: body.communication,
        problemSolving: body.problemSolving,
        comments: body.comments
      },
      assessedBy
    );

    return NextResponse.json({
      success: true,
      data: assessment
    }, { status: 201 });
  } catch (error) {
    console.error('提交能力评估失败:', error);

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
        error: '提交能力评估失败' 
      },
      { status: 500 }
    );
  }
}

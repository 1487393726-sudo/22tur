/**
 * 改进计划 API 端点
 * Improvement Plan API Endpoint
 * 
 * GET: 获取项目改进计划列表
 * POST: 创建新的改进计划
 * PATCH: 更新改进计划状态
 * 
 * 需求: 9.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  lossAnalysisReportGenerator,
  LossAnalysisError
} from '@/lib/investor-operations-monitoring/loss-analysis-report-generator';

/**
 * GET /api/projects/[id]/improvement-plan
 * 获取项目改进计划列表
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;

    const plans = await lossAnalysisReportGenerator.getImprovementPlans(projectId);

    return NextResponse.json({
      success: true,
      data: plans
    });
  } catch (error) {
    if (error instanceof LossAnalysisError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.code === 'PROJECT_NOT_FOUND' ? 404 : 400 }
      );
    }
    console.error('获取改进计划失败:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '获取改进计划失败' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/improvement-plan
 * 创建新的改进计划
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;
    const body = await request.json();

    // 验证必填字段
    if (!body.title || !body.description || !body.expectedOutcome || !body.timeline || !body.responsiblePerson) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_INPUT', 
            message: '缺少必填字段: title, description, expectedOutcome, timeline, responsiblePerson' 
          } 
        },
        { status: 400 }
      );
    }

    // 验证状态值
    const validStatuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    const status = body.status || 'PLANNED';
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_INPUT', 
            message: `无效的状态值，有效值: ${validStatuses.join(', ')}` 
          } 
        },
        { status: 400 }
      );
    }

    const plan = await lossAnalysisReportGenerator.createImprovementPlan(
      projectId,
      {
        title: body.title,
        description: body.description,
        expectedOutcome: body.expectedOutcome,
        timeline: body.timeline,
        responsiblePerson: body.responsiblePerson,
        status
      }
    );

    return NextResponse.json({
      success: true,
      data: plan
    });
  } catch (error) {
    if (error instanceof LossAnalysisError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.code === 'PROJECT_NOT_FOUND' ? 404 : 400 }
      );
    }
    console.error('创建改进计划失败:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '创建改进计划失败' } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[id]/improvement-plan
 * 更新改进计划状态
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 验证必填字段
    if (!body.planId || !body.status) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_INPUT', 
            message: '缺少必填字段: planId, status' 
          } 
        },
        { status: 400 }
      );
    }

    // 验证状态值
    const validStatuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_INPUT', 
            message: `无效的状态值，有效值: ${validStatuses.join(', ')}` 
          } 
        },
        { status: 400 }
      );
    }

    const plan = await lossAnalysisReportGenerator.updateImprovementPlanStatus(
      body.planId,
      body.status
    );

    return NextResponse.json({
      success: true,
      data: plan
    });
  } catch (error) {
    if (error instanceof LossAnalysisError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.code === 'PLAN_NOT_FOUND' ? 404 : 400 }
      );
    }
    console.error('更新改进计划状态失败:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '更新改进计划状态失败' } },
      { status: 500 }
    );
  }
}

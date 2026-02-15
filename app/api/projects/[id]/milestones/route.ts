/**
 * 项目里程碑 API
 * GET /api/projects/:id/milestones - 获取项目所有里程碑
 * POST /api/projects/:id/milestones - 创建里程碑
 */

import { NextRequest, NextResponse } from 'next/server';
import { projectLifecycleManager, ProjectLifecycleError, LifecycleErrorCodes } from '@/lib/investor-operations-monitoring/project-lifecycle-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: '项目ID不能为空', code: 'MISSING_PROJECT_ID' },
        { status: 400 }
      );
    }

    const timeline = await projectLifecycleManager.getTimeline(projectId);

    // 提取所有里程碑
    const milestones = timeline.phases.flatMap(phase => 
      phase.milestones.map(m => ({
        ...m,
        phase: phase.phase,
        phaseId: phase.id
      }))
    );

    return NextResponse.json({
      success: true,
      data: {
        milestones,
        summary: {
          total: milestones.length,
          pending: milestones.filter(m => m.status === 'PENDING').length,
          completed: milestones.filter(m => m.status === 'COMPLETED').length,
          delayed: milestones.filter(m => m.status === 'DELAYED').length
        }
      }
    });
  } catch (error) {
    if (error instanceof ProjectLifecycleError) {
      const statusCode = error.code === LifecycleErrorCodes.PROJECT_NOT_FOUND ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusCode }
      );
    }

    console.error('获取项目里程碑失败:', error);
    return NextResponse.json(
      { error: '获取项目里程碑失败', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { phaseRecordId, name, description, expectedDate } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: '项目ID不能为空', code: 'MISSING_PROJECT_ID' },
        { status: 400 }
      );
    }

    if (!phaseRecordId) {
      return NextResponse.json(
        { error: '阶段记录ID不能为空', code: 'MISSING_PHASE_RECORD_ID' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: '里程碑名称不能为空', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!expectedDate) {
      return NextResponse.json(
        { error: '预期日期不能为空', code: 'MISSING_EXPECTED_DATE' },
        { status: 400 }
      );
    }

    const milestone = await projectLifecycleManager.createMilestone({
      phaseRecordId,
      name,
      description,
      expectedDate: new Date(expectedDate)
    });

    return NextResponse.json({
      success: true,
      data: milestone
    }, { status: 201 });
  } catch (error) {
    if (error instanceof ProjectLifecycleError) {
      const statusCode = error.code === LifecycleErrorCodes.PHASE_RECORD_NOT_FOUND ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusCode }
      );
    }

    console.error('创建里程碑失败:', error);
    return NextResponse.json(
      { error: '创建里程碑失败', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/:id/milestones - 完成里程碑
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { milestoneId, action } = body;

    if (!milestoneId) {
      return NextResponse.json(
        { error: '里程碑ID不能为空', code: 'MISSING_MILESTONE_ID' },
        { status: 400 }
      );
    }

    if (action === 'complete') {
      await projectLifecycleManager.completeMilestone(milestoneId);
      return NextResponse.json({
        success: true,
        message: '里程碑已完成'
      });
    }

    return NextResponse.json(
      { error: '无效的操作', code: 'INVALID_ACTION' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof ProjectLifecycleError) {
      const statusCode = error.code === LifecycleErrorCodes.MILESTONE_NOT_FOUND ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusCode }
      );
    }

    console.error('更新里程碑失败:', error);
    return NextResponse.json(
      { error: '更新里程碑失败', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

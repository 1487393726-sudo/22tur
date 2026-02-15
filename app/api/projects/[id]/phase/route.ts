/**
 * 项目阶段 API
 * GET /api/projects/:id/phase - 获取项目当前阶段
 * PUT /api/projects/:id/phase - 更新项目阶段
 */

import { NextRequest, NextResponse } from 'next/server';
import { projectLifecycleManager, ProjectLifecycleError, LifecycleErrorCodes } from '@/lib/investor-operations-monitoring/project-lifecycle-manager';
import { isValidProjectPhase, ProjectPhase } from '@/types/investor-operations-monitoring';

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

    const currentPhase = await projectLifecycleManager.getCurrentPhase(projectId);

    return NextResponse.json({
      success: true,
      data: { currentPhase }
    });
  } catch (error) {
    if (error instanceof ProjectLifecycleError) {
      const statusCode = error.code === LifecycleErrorCodes.PROJECT_NOT_FOUND ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusCode }
      );
    }

    console.error('获取项目阶段失败:', error);
    return NextResponse.json(
      { error: '获取项目阶段失败', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { phase, reason } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: '项目ID不能为空', code: 'MISSING_PROJECT_ID' },
        { status: 400 }
      );
    }

    if (!phase) {
      return NextResponse.json(
        { error: '阶段不能为空', code: 'MISSING_PHASE' },
        { status: 400 }
      );
    }

    if (!isValidProjectPhase(phase)) {
      return NextResponse.json(
        { 
          error: `无效的阶段值: ${phase}，有效值为: ${Object.values(ProjectPhase).join(', ')}`,
          code: 'INVALID_PHASE'
        },
        { status: 400 }
      );
    }

    // TODO: 从认证中获取用户ID
    const userId = 'system';

    await projectLifecycleManager.updatePhase({ projectId, phase, reason }, userId);

    return NextResponse.json({
      success: true,
      message: '项目阶段更新成功'
    });
  } catch (error) {
    if (error instanceof ProjectLifecycleError) {
      const statusCode = error.code === LifecycleErrorCodes.PROJECT_NOT_FOUND ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusCode }
      );
    }

    console.error('更新项目阶段失败:', error);
    return NextResponse.json(
      { error: '更新项目阶段失败', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

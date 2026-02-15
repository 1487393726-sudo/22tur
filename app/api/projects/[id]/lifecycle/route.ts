/**
 * 项目生命周期 API
 * GET /api/projects/:id/lifecycle - 获取项目生命周期信息
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

    return NextResponse.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    if (error instanceof ProjectLifecycleError) {
      const statusCode = error.code === LifecycleErrorCodes.PROJECT_NOT_FOUND ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusCode }
      );
    }

    console.error('获取项目生命周期失败:', error);
    return NextResponse.json(
      { error: '获取项目生命周期失败', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/:id/lifecycle - 初始化项目生命周期
 */
export async function POST(
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

    const phaseRecord = await projectLifecycleManager.initializeLifecycle(projectId);

    return NextResponse.json({
      success: true,
      data: phaseRecord
    }, { status: 201 });
  } catch (error) {
    if (error instanceof ProjectLifecycleError) {
      const statusCode = error.code === LifecycleErrorCodes.PROJECT_NOT_FOUND ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusCode }
      );
    }

    console.error('初始化项目生命周期失败:', error);
    return NextResponse.json(
      { error: '初始化项目生命周期失败', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

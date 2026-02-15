/**
 * 项目时间线 API
 * GET /api/projects/:id/timeline - 获取项目时间线
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

    // 格式化时间线数据用于前端展示
    const formattedTimeline = {
      projectId: timeline.projectId,
      currentPhase: timeline.currentPhase,
      overallProgress: timeline.overallProgress,
      estimatedCompletionDate: timeline.estimatedCompletionDate?.toISOString(),
      phases: timeline.phases.map(phase => ({
        id: phase.id,
        phase: phase.phase,
        startDate: phase.startDate.toISOString(),
        expectedEndDate: phase.expectedEndDate.toISOString(),
        actualEndDate: phase.actualEndDate?.toISOString(),
        progress: phase.progress,
        notes: phase.notes,
        milestoneCount: phase.milestones.length,
        completedMilestones: phase.milestones.filter(m => m.status === 'COMPLETED').length,
        delayCount: phase.delays.length,
        totalDelayDays: phase.delays.reduce((sum, d) => sum + d.delayDays, 0),
        milestones: phase.milestones.map(m => ({
          id: m.id,
          name: m.name,
          description: m.description,
          expectedDate: m.expectedDate.toISOString(),
          completedDate: m.completedDate?.toISOString(),
          status: m.status
        })),
        delays: phase.delays.map(d => ({
          id: d.id,
          delayDays: d.delayDays,
          reason: d.reason,
          newExpectedDate: d.newExpectedDate.toISOString(),
          recordedAt: d.recordedAt.toISOString()
        }))
      }))
    };

    return NextResponse.json({
      success: true,
      data: formattedTimeline
    });
  } catch (error) {
    if (error instanceof ProjectLifecycleError) {
      const statusCode = error.code === LifecycleErrorCodes.PROJECT_NOT_FOUND ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: statusCode }
      );
    }

    console.error('获取项目时间线失败:', error);
    return NextResponse.json(
      { error: '获取项目时间线失败', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

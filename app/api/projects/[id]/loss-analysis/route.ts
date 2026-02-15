/**
 * 亏损分析 API 端点
 * Loss Analysis API Endpoint
 * 
 * GET: 获取项目亏损分析报告
 * POST: 生成新的亏损分析报告
 * 
 * 需求: 9.1, 9.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  lossAnalysisReportGenerator,
  LossAnalysisError
} from '@/lib/investor-operations-monitoring/loss-analysis-report-generator';

/**
 * GET /api/projects/[id]/loss-analysis
 * 获取项目亏损分析报告
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

    const report = await lossAnalysisReportGenerator.getLossAnalysisReport(projectId);

    return NextResponse.json({
      success: true,
      data: report
    });
  } catch (error) {
    if (error instanceof LossAnalysisError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.code === 'PROJECT_NOT_FOUND' ? 404 : 400 }
      );
    }
    console.error('获取亏损分析报告失败:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '获取亏损分析报告失败' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/loss-analysis
 * 生成新的亏损分析报告
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

    const report = await lossAnalysisReportGenerator.generateLossAnalysisReport(
      projectId,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: report
    });
  } catch (error) {
    if (error instanceof LossAnalysisError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.code === 'PROJECT_NOT_FOUND' ? 404 : 400 }
      );
    }
    console.error('生成亏损分析报告失败:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '生成亏损分析报告失败' } },
      { status: 500 }
    );
  }
}

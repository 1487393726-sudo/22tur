/**
 * 决策历史 API 端点
 * Decision History API Endpoint
 * 
 * GET: 获取项目决策历史
 * POST: 添加决策记录
 * 
 * 需求: 9.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  lossAnalysisReportGenerator,
  LossAnalysisError
} from '@/lib/investor-operations-monitoring/loss-analysis-report-generator';

/**
 * GET /api/projects/[id]/decisions
 * 获取项目决策历史
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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const decisions = await lossAnalysisReportGenerator.getDecisionHistory(
      projectId,
      { limit, offset }
    );

    return NextResponse.json({
      success: true,
      data: decisions
    });
  } catch (error) {
    if (error instanceof LossAnalysisError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.code === 'PROJECT_NOT_FOUND' ? 404 : 400 }
      );
    }
    console.error('获取决策历史失败:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '获取决策历史失败' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/decisions
 * 添加决策记录
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
    if (!body.decisionType || !body.title || !body.description) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_INPUT', 
            message: '缺少必填字段: decisionType, title, description' 
          } 
        },
        { status: 400 }
      );
    }

    const decision = await lossAnalysisReportGenerator.addDecisionRecord(
      projectId,
      {
        decisionType: body.decisionType,
        title: body.title,
        description: body.description,
        rationale: body.rationale,
        impact: body.impact,
        decisionDate: body.decisionDate ? new Date(body.decisionDate) : new Date(),
        decidedBy: session.user.id
      }
    );

    return NextResponse.json({
      success: true,
      data: decision
    });
  } catch (error) {
    if (error instanceof LossAnalysisError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.code === 'PROJECT_NOT_FOUND' ? 404 : 400 }
      );
    }
    console.error('添加决策记录失败:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '添加决策记录失败' } },
      { status: 500 }
    );
  }
}

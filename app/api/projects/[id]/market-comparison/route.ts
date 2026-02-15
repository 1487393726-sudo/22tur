/**
 * 市场对比 API 端点
 * Market Comparison API Endpoint
 * 
 * GET: 获取项目市场对比数据
 * 
 * 需求: 9.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  lossAnalysisReportGenerator,
  LossAnalysisError
} from '@/lib/investor-operations-monitoring/loss-analysis-report-generator';
import { IndustryType, isValidIndustryType } from '@/types/investor-operations-monitoring';

/**
 * GET /api/projects/[id]/market-comparison
 * 获取项目市场对比数据
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
    const industryTypeParam = searchParams.get('industryType');

    let industryType: IndustryType | undefined;
    if (industryTypeParam && isValidIndustryType(industryTypeParam)) {
      industryType = industryTypeParam as IndustryType;
    }

    const comparison = await lossAnalysisReportGenerator.getMarketComparison(
      projectId,
      industryType
    );

    if (!comparison) {
      return NextResponse.json({
        success: true,
        data: null,
        message: '暂无同行业对比数据'
      });
    }

    return NextResponse.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    if (error instanceof LossAnalysisError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.code === 'PROJECT_NOT_FOUND' ? 404 : 400 }
      );
    }
    console.error('获取市场对比数据失败:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '获取市场对比数据失败' } },
      { status: 500 }
    );
  }
}

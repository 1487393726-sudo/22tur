/**
 * 投资回报分析 API
 * ROI Analysis API
 * 
 * GET /api/investors/[id]/roi - 获取投资者的投资回报分析
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { profitLossAnalyzer, ProfitLossErrorCodes } from '@/lib/investor-operations-monitoring/profit-loss-analyzer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id: investorId } = await params;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (projectId) {
      // 获取特定项目的 ROI
      const roiAnalysis = await profitLossAnalyzer.getROIAnalysis(investorId, projectId);
      
      return NextResponse.json({
        success: true,
        data: roiAnalysis
      });
    } else {
      // 获取投资者所有项目的汇总
      const startDateStr = searchParams.get('startDate');
      const endDateStr = searchParams.get('endDate');

      const endDate = endDateStr ? new Date(endDateStr) : new Date();
      const startDate = startDateStr 
        ? new Date(startDateStr) 
        : new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000); // 默认一年

      const summary = await profitLossAnalyzer.getInvestorProfitLossSummary(
        investorId,
        { startDate, endDate }
      );

      return NextResponse.json({
        success: true,
        data: summary
      });
    }
  } catch (error) {
    console.error('获取投资回报分析失败:', error);
    
    if (error instanceof Error && 'code' in error) {
      const typedError = error as { code: string; message: string };
      if (typedError.code === ProfitLossErrorCodes.INVESTOR_NOT_FOUND) {
        return NextResponse.json(
          { success: false, error: typedError.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '获取投资回报分析失败' 
      },
      { status: 500 }
    );
  }
}

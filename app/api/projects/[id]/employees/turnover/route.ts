/**
 * 人员流动分析 API
 * Employee Turnover Analysis API
 * 
 * GET /api/projects/[id]/employees/turnover - 获取人员流动分析
 */

import { NextRequest, NextResponse } from 'next/server';
import { employeeTransparencyManager } from '@/lib/investor-operations-monitoring/employee-transparency-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const { searchParams } = new URL(request.url);

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: '项目ID不能为空' },
        { status: 400 }
      );
    }

    // 解析日期范围参数
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    // 默认为最近12个月
    const endDate = endDateStr ? new Date(endDateStr) : new Date();
    const startDate = startDateStr 
      ? new Date(startDateStr) 
      : new Date(endDate.getFullYear(), endDate.getMonth() - 11, 1);

    if (startDate > endDate) {
      return NextResponse.json(
        { success: false, error: '开始日期不能晚于结束日期' },
        { status: 400 }
      );
    }

    const analysis = await employeeTransparencyManager.getTurnoverAnalysis(
      projectId,
      { startDate, endDate }
    );

    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('获取人员流动分析失败:', error);
    
    if (error instanceof Error && error.message.includes('项目不存在')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: '获取人员流动分析失败',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

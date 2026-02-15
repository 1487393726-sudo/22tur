/**
 * 项目员工统计 API
 * Project Employee Stats API
 * 
 * GET /api/projects/[id]/employees/stats - 获取员工统计数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { employeeTransparencyManager } from '@/lib/investor-operations-monitoring/employee-transparency-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: '项目ID不能为空' },
        { status: 400 }
      );
    }

    const stats = await employeeTransparencyManager.getEmployeeStats(projectId);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('获取员工统计失败:', error);
    
    if (error instanceof Error && error.message.includes('项目不存在')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: '获取员工统计失败',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

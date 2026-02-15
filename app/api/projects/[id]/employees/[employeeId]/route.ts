/**
 * 员工详情 API
 * Employee Detail API
 * 
 * GET /api/projects/[id]/employees/[employeeId] - 获取员工详情
 * PATCH /api/projects/[id]/employees/[employeeId] - 更新员工状态
 */

import { NextRequest, NextResponse } from 'next/server';
import { employeeTransparencyManager } from '@/lib/investor-operations-monitoring/employee-transparency-manager';
import { EmployeeStatus, isValidEmployeeStatus } from '@/types/investor-operations-monitoring';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; employeeId: string } }
) {
  try {
    const { id: projectId, employeeId } = params;

    if (!projectId || !employeeId) {
      return NextResponse.json(
        { success: false, error: '项目ID和员工ID不能为空' },
        { status: 400 }
      );
    }

    const employee = await employeeTransparencyManager.getEmployeeDetail(
      projectId,
      employeeId
    );

    return NextResponse.json({
      success: true,
      data: employee
    });

  } catch (error) {
    console.error('获取员工详情失败:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('项目不存在')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('员工不存在')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: '获取员工详情失败',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; employeeId: string } }
) {
  try {
    const { id: projectId, employeeId } = params;
    const body = await request.json();

    if (!projectId || !employeeId) {
      return NextResponse.json(
        { success: false, error: '项目ID和员工ID不能为空' },
        { status: 400 }
      );
    }

    // 验证状态
    if (body.status && !isValidEmployeeStatus(body.status)) {
      return NextResponse.json(
        { success: false, error: '无效的员工状态' },
        { status: 400 }
      );
    }

    const employee = await employeeTransparencyManager.updateEmployeeStatus(
      projectId,
      employeeId,
      body.status as EmployeeStatus
    );

    return NextResponse.json({
      success: true,
      data: employee
    });

  } catch (error) {
    console.error('更新员工状态失败:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('员工不存在')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: '更新员工状态失败',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

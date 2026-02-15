/**
 * 项目员工列表 API
 * Project Employee List API
 * 
 * GET /api/projects/[id]/employees - 获取员工列表
 * POST /api/projects/[id]/employees - 创建新员工
 */

import { NextRequest, NextResponse } from 'next/server';
import { employeeTransparencyManager } from '@/lib/investor-operations-monitoring/employee-transparency-manager';
import { EmployeeStatus, TenureCategory } from '@/types/investor-operations-monitoring';

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

    // 解析查询参数
    const status = searchParams.get('status') as EmployeeStatus | null;
    const position = searchParams.get('position');
    const department = searchParams.get('department');
    const tenure = searchParams.get('tenure') as TenureCategory | null;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const result = await employeeTransparencyManager.getEmployeeList(projectId, {
      status: status || undefined,
      position: position || undefined,
      department: department || undefined,
      tenure: tenure || undefined,
      page,
      pageSize
    });

    return NextResponse.json({
      success: true,
      data: {
        employees: result.employees,
        pagination: {
          total: result.total,
          page,
          pageSize,
          totalPages: Math.ceil(result.total / pageSize)
        }
      }
    });

  } catch (error) {
    console.error('获取员工列表失败:', error);
    
    if (error instanceof Error && error.message.includes('项目不存在')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: '获取员工列表失败',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: '项目ID不能为空' },
        { status: 400 }
      );
    }

    // 验证必填字段
    if (!body.name || !body.position || !body.hireDate) {
      return NextResponse.json(
        { success: false, error: '姓名、岗位和入职日期为必填项' },
        { status: 400 }
      );
    }

    const employee = await employeeTransparencyManager.createEmployee({
      projectId,
      name: body.name,
      position: body.position,
      department: body.department,
      hireDate: new Date(body.hireDate),
      recruitmentChannel: body.recruitmentChannel
    });

    return NextResponse.json({
      success: true,
      data: employee
    }, { status: 201 });

  } catch (error) {
    console.error('创建员工失败:', error);
    
    if (error instanceof Error && error.message.includes('项目不存在')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: '创建员工失败',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

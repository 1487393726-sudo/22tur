/**
 * 项目类型信息 API
 * Project Type Info API
 * 
 * GET /api/projects/[id]/type-info - 获取项目类型特定信息
 * PUT /api/projects/[id]/type-info - 更新项目类型
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { projectTypeManager, TypeErrorCodes } from '@/lib/investor-operations-monitoring/project-type-manager';
import { ProjectType, IndustryType, isValidProjectType, isValidIndustryType } from '@/types/investor-operations-monitoring';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id } = await params;
    const typeInfo = await projectTypeManager.getProjectTypeInfo(id);

    return NextResponse.json({
      success: true,
      data: typeInfo
    });
  } catch (error) {
    console.error('获取项目类型信息失败:', error);
    
    if (error instanceof Error && 'code' in error) {
      const typedError = error as { code: string; message: string };
      if (typedError.code === TypeErrorCodes.PROJECT_NOT_FOUND) {
        return NextResponse.json(
          { success: false, error: typedError.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '获取项目类型信息失败' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { projectType, industryType } = body;

    // 验证输入
    if (!projectType || !isValidProjectType(projectType)) {
      return NextResponse.json(
        { success: false, error: '无效的项目类型' },
        { status: 400 }
      );
    }

    if (!industryType || !isValidIndustryType(industryType)) {
      return NextResponse.json(
        { success: false, error: '无效的行业类型' },
        { status: 400 }
      );
    }

    await projectTypeManager.updateProjectType(
      id,
      projectType as ProjectType,
      industryType as IndustryType
    );

    return NextResponse.json({
      success: true,
      message: '项目类型已更新'
    });
  } catch (error) {
    console.error('更新项目类型失败:', error);
    
    if (error instanceof Error && 'code' in error) {
      const typedError = error as { code: string; message: string };
      if (typedError.code === TypeErrorCodes.PROJECT_NOT_FOUND) {
        return NextResponse.json(
          { success: false, error: typedError.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '更新项目类型失败' 
      },
      { status: 500 }
    );
  }
}

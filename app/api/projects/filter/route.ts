/**
 * 项目筛选 API
 * Project Filter API
 * 
 * GET /api/projects/filter - 多条件筛选项目
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { projectTypeManager, ProjectFilterParams } from '@/lib/investor-operations-monitoring/project-type-manager';
import { ProjectType, IndustryType, ProjectPhase } from '@/types/investor-operations-monitoring';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // 解析筛选参数
    const params: ProjectFilterParams = {
      projectType: searchParams.get('projectType') as ProjectType | undefined,
      industryType: searchParams.get('industryType') as IndustryType | undefined,
      currentPhase: searchParams.get('currentPhase') as ProjectPhase | undefined,
      investorId: searchParams.get('investorId') || undefined,
      minInvestment: searchParams.get('minInvestment') 
        ? parseFloat(searchParams.get('minInvestment')!) 
        : undefined,
      maxInvestment: searchParams.get('maxInvestment') 
        ? parseFloat(searchParams.get('maxInvestment')!) 
        : undefined,
      searchTerm: searchParams.get('searchTerm') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 10,
      sortBy: (searchParams.get('sortBy') as 'name' | 'createdAt' | 'targetAmount' | 'currentPhase') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    };

    const result = await projectTypeManager.filterProjects(params);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('项目筛选失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '项目筛选失败' 
      },
      { status: 500 }
    );
  }
}

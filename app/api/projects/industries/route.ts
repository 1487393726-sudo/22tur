/**
 * 行业列表 API
 * Industries API
 * 
 * GET /api/projects/industries - 获取行业列表及统计
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { projectTypeManager } from '@/lib/investor-operations-monitoring/project-type-manager';
import { IndustryType } from '@/types/investor-operations-monitoring';

// 行业类型中文名称映射
const industryTypeNames: Record<IndustryType, string> = {
  [IndustryType.CATERING]: '餐饮',
  [IndustryType.RETAIL]: '零售',
  [IndustryType.SERVICE]: '服务',
  [IndustryType.TECHNOLOGY]: '科技',
  [IndustryType.EDUCATION]: '教育',
  [IndustryType.HEALTHCARE]: '医疗健康',
  [IndustryType.OTHER]: '其他'
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 获取行业统计
    const stats = await projectTypeManager.getIndustryStats();

    // 获取所有行业类型（包括没有项目的）
    const allIndustries = Object.values(IndustryType).map(type => {
      const stat = stats.find(s => s.industryType === type);
      return {
        type,
        name: industryTypeNames[type],
        projectCount: stat?.projectCount || 0,
        totalInvestment: stat?.totalInvestment || 0,
        averageInvestment: stat?.averageInvestment || 0
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        industries: allIndustries,
        activeIndustries: stats.map(s => ({
          ...s,
          name: industryTypeNames[s.industryType]
        }))
      }
    });
  } catch (error) {
    console.error('获取行业列表失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '获取行业列表失败' 
      },
      { status: 500 }
    );
  }
}

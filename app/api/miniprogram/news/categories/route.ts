import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/miniprogram/news/categories - 获取资讯分类
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.newsCategory.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        icon: true,
        sort: true
      },
      orderBy: {
        sort: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('获取资讯分类失败:', error);
    
    // 返回默认分类
    return NextResponse.json({
      success: true,
      categories: [
        { id: 'company', name: '公司动态', icon: '📢', sort: 1 },
        { id: 'industry', name: '行业资讯', icon: '📰', sort: 2 },
        { id: 'product', name: '产品更新', icon: '🚀', sort: 3 },
        { id: 'activity', name: '活动公告', icon: '🎉', sort: 4 }
      ]
    });
  }
}

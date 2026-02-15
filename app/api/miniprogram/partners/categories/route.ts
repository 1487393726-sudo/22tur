import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/miniprogram/partners/categories - 获取合作伙伴分类
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.partnerCategory.findMany({
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
    console.error('获取合作伙伴分类失败:', error);
    
    // 返回默认分类
    return NextResponse.json({
      success: true,
      categories: [
        { id: 'technology', name: '技术合作', icon: '💻', sort: 1 },
        { id: 'business', name: '商业合作', icon: '🤝', sort: 2 },
        { id: 'media', name: '媒体合作', icon: '📺', sort: 3 },
        { id: 'strategic', name: '战略合作', icon: '🎯', sort: 4 }
      ]
    });
  }
}

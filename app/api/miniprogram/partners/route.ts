import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/miniprogram/partners - 获取合作伙伴列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    // 构建查询条件
    const where: any = {
      isActive: true
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // 查询合作伙伴列表
    const partners = await prisma.partner.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { sort: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    const list = partners.map(item => ({
      id: item.id,
      name: item.name,
      logo: item.logo,
      categoryId: item.categoryId,
      categoryName: item.category?.name || '',
      description: item.description?.substring(0, 50) || '',
      isFeatured: item.isFeatured
    }));

    return NextResponse.json({
      success: true,
      list
    });
  } catch (error) {
    console.error('获取合作伙伴列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取列表失败' },
      { status: 500 }
    );
  }
}

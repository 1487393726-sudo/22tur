import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/miniprogram/news - 获取资讯列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const categoryId = searchParams.get('categoryId');
    const keyword = searchParams.get('keyword');

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {
      status: 'published',
      publishDate: { lte: new Date() }
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { summary: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } }
      ];
    }

    // 查询资讯列表
    const [list, total] = await Promise.all([
      prisma.news.findMany({
        where,
        select: {
          id: true,
          title: true,
          summary: true,
          coverImage: true,
          categoryId: true,
          publishDate: true,
          views: true,
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { isTop: 'desc' },
          { publishDate: 'desc' }
        ],
        skip,
        take: pageSize
      }),
      prisma.news.count({ where })
    ]);

    // 格式化返回数据
    const formattedList = list.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      coverImage: item.coverImage,
      categoryId: item.categoryId,
      categoryName: item.category?.name || '',
      publishDate: item.publishDate?.toISOString(),
      views: item.views || 0
    }));

    return NextResponse.json({
      success: true,
      list: formattedList,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('获取资讯列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取资讯列表失败' },
      { status: 500 }
    );
  }
}

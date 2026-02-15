import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/miniprogram/news/[id]/related - 获取相关资讯
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 获取当前资讯
    const currentNews = await prisma.news.findUnique({
      where: { id },
      select: {
        categoryId: true,
        tags: true
      }
    });

    if (!currentNews) {
      return NextResponse.json({
        success: true,
        list: []
      });
    }

    // 查询相关资讯（同分类或相同标签）
    const relatedNews = await prisma.news.findMany({
      where: {
        id: { not: id },
        status: 'published',
        publishDate: { lte: new Date() },
        OR: [
          { categoryId: currentNews.categoryId },
          ...(currentNews.tags && currentNews.tags.length > 0
            ? [{ tags: { hasSome: currentNews.tags } }]
            : [])
        ]
      },
      select: {
        id: true,
        title: true,
        coverImage: true,
        publishDate: true
      },
      orderBy: {
        publishDate: 'desc'
      },
      take: 5
    });

    const list = relatedNews.map(item => ({
      id: item.id,
      title: item.title,
      coverImage: item.coverImage,
      publishDate: item.publishDate?.toISOString()
    }));

    return NextResponse.json({
      success: true,
      list
    });
  } catch (error) {
    console.error('获取相关资讯失败:', error);
    return NextResponse.json({
      success: true,
      list: []
    });
  }
}

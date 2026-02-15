import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// GET /api/miniprogram/news/[id] - 获取资讯详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getMiniprogramUser(request);

    // 查询资讯详情
    const news = await prisma.news.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!news) {
      return NextResponse.json(
        { success: false, error: '资讯不存在' },
        { status: 404 }
      );
    }

    if (news.status !== 'published') {
      return NextResponse.json(
        { success: false, error: '资讯未发布' },
        { status: 404 }
      );
    }

    // 检查是否已收藏
    let isCollected = false;
    if (user) {
      const collection = await prisma.newsCollection.findUnique({
        where: {
          userId_newsId: {
            userId: user.id,
            newsId: id
          }
        }
      });
      isCollected = !!collection;
    }

    return NextResponse.json({
      success: true,
      id: news.id,
      title: news.title,
      summary: news.summary,
      content: news.content,
      coverImage: news.coverImage,
      categoryId: news.categoryId,
      categoryName: news.category?.name || '',
      author: news.author,
      publishDate: news.publishDate?.toISOString(),
      views: news.views || 0,
      tags: news.tags || [],
      isCollected
    });
  } catch (error) {
    console.error('获取资讯详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取资讯详情失败' },
      { status: 500 }
    );
  }
}

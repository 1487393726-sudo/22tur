import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// POST /api/miniprogram/news/[id]/collect - 收藏资讯
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getMiniprogramUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    // 检查资讯是否存在
    const news = await prisma.news.findUnique({
      where: { id }
    });

    if (!news) {
      return NextResponse.json(
        { success: false, error: '资讯不存在' },
        { status: 404 }
      );
    }

    // 创建收藏记录（如果已存在则忽略）
    await prisma.newsCollection.upsert({
      where: {
        userId_newsId: {
          userId: user.id,
          newsId: id
        }
      },
      create: {
        userId: user.id,
        newsId: id
      },
      update: {}
    });

    return NextResponse.json({
      success: true,
      message: '收藏成功'
    });
  } catch (error) {
    console.error('收藏资讯失败:', error);
    return NextResponse.json(
      { success: false, error: '收藏失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/miniprogram/news/[id]/collect - 取消收藏
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getMiniprogramUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    // 删除收藏记录
    await prisma.newsCollection.deleteMany({
      where: {
        userId: user.id,
        newsId: id
      }
    });

    return NextResponse.json({
      success: true,
      message: '已取消收藏'
    });
  } catch (error) {
    console.error('取消收藏失败:', error);
    return NextResponse.json(
      { success: false, error: '操作失败' },
      { status: 500 }
    );
  }
}

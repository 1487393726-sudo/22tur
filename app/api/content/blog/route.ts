import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - 获取已发布的博客文章（公开API）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    const where: Record<string, unknown> = { isPublished: true };
    if (category) where.category = category;

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      select: {
        id: true,
        title: true,
        titleEn: true,
        slug: true,
        excerpt: true,
        excerptEn: true,
        image: true,
        category: true,
        author: true,
        readTime: true,
        publishedAt: true,
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('获取博客文章失败:', error);
    return NextResponse.json({ error: '获取博客文章失败' }, { status: 500 });
  }
}

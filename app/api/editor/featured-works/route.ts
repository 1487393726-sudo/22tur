import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - 获取活跃的精选作品（公开API）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const where: Record<string, unknown> = {
      isActive: true,
    };
    if (category && category !== 'all') {
      where.category = category;
    }
    if (featured === 'true') {
      where.featured = true;
    }

    const items = await prisma.featuredWork.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
      ],
      select: {
        id: true,
        title: true,
        titleEn: true,
        slug: true,
        description: true,
        descriptionEn: true,
        image: true,
        images: true,
        author: true,
        teamName: true,
        category: true,
        tags: true,
        viewCount: true,
        likeCount: true,
        featured: true,
        order: true,
      },
    });

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error('获取精选作品失败:', error);
    return NextResponse.json({ error: '获取精选作品失败' }, { status: 500 });
  }
}

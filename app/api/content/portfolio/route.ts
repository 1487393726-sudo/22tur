import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - 获取活跃的作品集（公开API）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;

    const items = await prisma.portfolioItem.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
      select: {
        id: true,
        title: true,
        titleEn: true,
        slug: true,
        description: true,
        descriptionEn: true,
        image: true,
        category: true,
        tags: true,
        client: true,
        link: true,
        featured: true,
      },
    });

    // 解析 tags JSON
    const parsedItems = items.map(item => ({
      ...item,
      tags: JSON.parse(item.tags || '[]'),
    }));

    return NextResponse.json({ items: parsedItems });
  } catch (error) {
    console.error('获取作品集失败:', error);
    return NextResponse.json({ error: '获取作品集失败' }, { status: 500 });
  }
}

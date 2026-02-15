import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - 获取活跃的服务市场项目（公开API）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: Record<string, unknown> = {
      isActive: true,
    };
    if (category && category !== 'all') {
      where.category = category;
    }

    const items = await prisma.serviceMarketItem.findMany({
      where,
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        nameEn: true,
        description: true,
        descriptionEn: true,
        price: true,
        category: true,
        iconType: true,
        order: true,
      },
    });

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error('获取服务市场项目失败:', error);
    return NextResponse.json({ error: '获取服务市场项目失败' }, { status: 500 });
  }
}

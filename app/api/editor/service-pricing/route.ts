import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - 获取活跃的服务定价（公开API）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const recommended = searchParams.get('recommended');

    const where: Record<string, unknown> = {
      isActive: true,
    };
    if (category && category !== 'all') {
      where.category = category;
    }
    if (recommended === 'true') {
      where.recommended = true;
    }

    const items = await prisma.servicePricing.findMany({
      where,
      orderBy: [
        { recommended: 'desc' },
        { order: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        nameEn: true,
        description: true,
        descriptionEn: true,
        price: true,
        originalPrice: true,
        discountPercent: true,
        features: true,
        featuresEn: true,
        category: true,
        recommended: true,
        order: true,
      },
    });

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error('获取服务定价失败:', error);
    return NextResponse.json({ error: '获取服务定价失败' }, { status: 500 });
  }
}

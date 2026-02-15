import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseBundle, parseEquipment } from '@/types/marketplace';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const segment = searchParams.get('segment');
    const featured = searchParams.get('featured');

    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    };

    if (segment) {
      where.targetSegment = segment;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const bundles = await prisma.equipmentBundle.findMany({
      where,
      include: {
        items: {
          include: {
            equipment: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const parsedBundles = bundles.map((bundle) => {
      const parsed = parseBundle(bundle as never);
      return {
        ...parsed,
        items: bundle.items.map((item) => ({
          ...item,
          equipment: parseEquipment(item.equipment as never),
        })),
      };
    });

    return NextResponse.json(parsedBundles);
  } catch (error) {
    console.error('获取套餐列表失败:', error);
    return NextResponse.json(
      { error: '获取套餐列表失败' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseBundle, parseEquipment, MarketplaceErrorCodes } from '@/types/marketplace';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const bundle = await prisma.equipmentBundle.findUnique({
      where: { id },
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
    });

    if (!bundle) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.BUNDLE_NOT_FOUND, message: '套餐不存在' },
        { status: 404 }
      );
    }

    if (bundle.status === 'INACTIVE') {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.PRODUCT_INACTIVE, message: '套餐已下架' },
        { status: 404 }
      );
    }

    const parsedBundle = parseBundle(bundle as never);
    const result = {
      ...parsedBundle,
      items: bundle.items.map((item) => ({
        ...item,
        equipment: parseEquipment(item.equipment as never),
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('获取套餐详情失败:', error);
    return NextResponse.json(
      { error: '获取套餐详情失败' },
      { status: 500 }
    );
  }
}

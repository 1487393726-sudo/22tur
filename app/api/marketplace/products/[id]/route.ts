import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseEquipment, MarketplaceErrorCodes } from '@/types/marketplace';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.equipment.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.PRODUCT_NOT_FOUND, message: '产品不存在' },
        { status: 404 }
      );
    }

    if (product.status === 'INACTIVE') {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.PRODUCT_INACTIVE, message: '产品已下架' },
        { status: 404 }
      );
    }

    const parsedProduct = parseEquipment(product as never);

    return NextResponse.json(parsedProduct);
  } catch (error) {
    console.error('获取产品详情失败:', error);
    return NextResponse.json(
      { error: '获取产品详情失败' },
      { status: 500 }
    );
  }
}

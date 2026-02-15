import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketplaceErrorCodes } from '@/types/marketplace';

// GET - 获取订单详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.marketplaceOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            equipment: { include: { category: true } },
            bundle: { include: { items: { include: { equipment: true } } } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.ORDER_NOT_FOUND, message: '订单不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...order,
      shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    return NextResponse.json({ error: '获取订单详情失败' }, { status: 500 });
  }
}

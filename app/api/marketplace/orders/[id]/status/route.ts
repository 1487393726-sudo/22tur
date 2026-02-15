import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketplaceErrorCodes, type OrderStatus } from '@/types/marketplace';

// 有效的状态转换
const validTransitions: Record<string, string[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

// PUT - 更新订单状态
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentId } = body;

    if (!status) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.VALIDATION_ERROR, message: '缺少状态参数' },
        { status: 400 }
      );
    }

    const order = await prisma.marketplaceOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.ORDER_NOT_FOUND, message: '订单不存在' },
        { status: 404 }
      );
    }

    // 检查状态转换是否有效
    const allowedStatuses = validTransitions[order.status] || [];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: MarketplaceErrorCodes.INVALID_ORDER_STATUS,
          message: `无法从 ${order.status} 转换到 ${status}`,
        },
        { status: 400 }
      );
    }

    // 构建更新数据
    const updateData: Record<string, unknown> = { status };

    if (status === 'PAID') {
      updateData.paidAt = new Date();
      if (paymentId) {
        updateData.paymentId = paymentId;
      }
    } else if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      
      // 恢复库存
      const orderWithItems = await prisma.marketplaceOrder.findUnique({
        where: { id },
        include: { items: true },
      });
      
      if (orderWithItems) {
        for (const item of orderWithItems.items) {
          if (item.equipmentId) {
            await prisma.equipment.update({
              where: { id: item.equipmentId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }
    }

    const updatedOrder = await prisma.marketplaceOrder.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    return NextResponse.json({ error: '更新订单状态失败' }, { status: 500 });
  }
}

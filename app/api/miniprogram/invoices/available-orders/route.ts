import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

// GET - 获取可开票订单
export async function GET(request: NextRequest) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取已开票的订单ID
    const invoicedOrders = await prisma.invoice.findMany({
      where: {
        userId: user.id,
        status: { not: 'rejected' }
      },
      select: { orderId: true }
    });

    const invoicedOrderIds = invoicedOrders.map(i => i.orderId);

    // 获取可开票订单（已完成且未开票）
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
        status: 'completed',
        id: { notIn: invoicedOrderIds }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const items = orders.map(order => ({
      id: order.id,
      orderNo: order.orderNo,
      amount: order.totalAmount,
      createTime: order.createdAt.toISOString()
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('获取可开票订单失败:', error);
    return NextResponse.json({ error: '获取可开票订单失败' }, { status: 500 });
  }
}

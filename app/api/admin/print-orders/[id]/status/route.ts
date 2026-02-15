/**
 * Admin Update Order Status API
 * PUT /api/admin/print-orders/[id]/status - Update order status
 * Requirements: 4.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, trackingNumber, productionStatus } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // 检查订单是否存在
    const order = await prisma.printOrder.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 更新订单
    const updated = await prisma.printOrder.update({
      where: { id: params.id },
      data: {
        status,
        trackingNumber: trackingNumber || order.trackingNumber,
        productionStatus: productionStatus || order.productionStatus,
        // 根据状态自动更新时间戳
        ...(status === 'shipped' && !order.shippedAt && { shippedAt: new Date() }),
        ...(status === 'delivered' && !order.deliveredAt && { deliveredAt: new Date() }),
      },
      include: {
        customer: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // TODO: 发送通知给客户
    // await notificationService.sendOrderStatusNotification(updated.customerId, updated);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating order status:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

/**
 * 印刷订单详情 API 路由
 * Requirements: 2.2, 4.1, 4.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/print-orders/[id]
 * 获取订单详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    const order = await prisma.printOrder.findFirst({
      where: {
        id: params.id,
        customerId: session.user.id,
      },
      include: {
        quote: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: '订单不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { message: '获取订单详情失败' },
      { status: 500 }
    );
  }
}

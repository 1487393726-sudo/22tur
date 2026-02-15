/**
 * 订单支付 API 路由
 * Requirements: 2.2, 4.1, 4.2, 6.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/print-orders/[id]/pay
 * 创建支付
 */
export async function POST(
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

    const { paymentMethod } = await request.json();

    if (!paymentMethod || !['wechat', 'alipay'].includes(paymentMethod)) {
      return NextResponse.json(
        { message: '无效的支付方式' },
        { status: 400 }
      );
    }

    // 获取订单
    const order = await prisma.printOrder.findFirst({
      where: {
        id: params.id,
        customerId: session.user.id,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: '订单不存在' },
        { status: 404 }
      );
    }

    if (order.status !== 'pending_payment') {
      return NextResponse.json(
        { message: '订单状态不允许支付' },
        { status: 400 }
      );
    }

    // 创建支付记录
    const payment = await prisma.printPayment.create({
      data: {
        orderId: params.id,
        amount: order.totalPrice,
        currency: 'CNY',
        paymentMethod,
        status: 'pending',
      },
    });

    // 根据支付方式生成支付信息
    if (paymentMethod === 'wechat') {
      // 调用微信支付 API
      // 这里应该调用实际的微信支付接口
      // 返回预支付信息
      return NextResponse.json({
        timeStamp: Math.floor(Date.now() / 1000).toString(),
        nonceStr: Math.random().toString(36).substring(7),
        package: `prepay_id=${payment.id}`,
        signType: 'RSA',
        paySign: 'mock_signature',
      });
    } else {
      // 调用支付宝 API
      // 这里应该调用实际的支付宝接口
      // 返回支付链接
      return NextResponse.json({
        paymentUrl: `https://mock-alipay.example.com/pay?orderId=${payment.id}`,
      });
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { message: '创建支付失败' },
      { status: 500 }
    );
  }
}

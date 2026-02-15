/**
 * Alipay Callback Handler
 * 支付宝支付回调处理
 * 
 * Requirements: 4.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaymentService } from '@/lib/payment/payment-service';
import { updateOrderPayment } from '@/lib/printing/order-service';

/**
 * 处理支付宝支付回调
 * POST /api/payment/alipay/callback
 */
export async function POST(request: NextRequest) {
  try {
    // 获取请求体
    const formData = await request.formData();
    const data: Record<string, unknown> = {};

    // 转换 FormData 为对象
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    // 获取签名
    const signature = data.sign as string;

    // 验证签名
    const paymentService = getPaymentService();
    const verifyResult = await paymentService.verifyCallback('alipay', data, signature);

    if (!verifyResult.valid) {
      console.error('Alipay callback signature verification failed');
      return NextResponse.json('FAIL');
    }

    // 解析回调数据
    const callbackData = await paymentService.handlePaymentCallback('alipay', data);

    // 获取订单
    const order = await prisma.printOrder.findUnique({
      where: { orderNumber: callbackData.orderId },
    });

    if (!order) {
      console.error(`Order not found: ${callbackData.orderId}`);
      return NextResponse.json('FAIL');
    }

    // 如果支付成功，更新订单状态
    if (callbackData.status === 'PAID') {
      // 更新订单支付状态
      await updateOrderPayment(
        order.id,
        'alipay',
        callbackData.tradeNo
      );

      // 更新订单状态为生产中
      await prisma.printOrder.update({
        where: { id: order.id },
        data: {
          status: 'in_production',
          paymentStatus: 'paid',
          paidAt: callbackData.paidAt,
        },
      });

      // 创建支付成功通知
      await prisma.printNotification.create({
        data: {
          recipientId: order.customerId,
          type: 'order_paid',
          title: '订单已支付',
          message: `订单 ${order.orderNumber} 已支付成功，开始生产。`,
          orderId: order.id,
          channels: JSON.stringify(['system', 'email']),
        },
      });

      // 创建管理员通知
      const adminUsers = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { id: true },
      });

      for (const admin of adminUsers) {
        await prisma.printNotification.create({
          data: {
            recipientId: admin.id,
            type: 'order_paid',
            title: '新订单已支付',
            message: `订单 ${order.orderNumber} 已支付，金额：¥${(order.totalPrice / 100).toFixed(2)}`,
            orderId: order.id,
            channels: JSON.stringify(['system']),
          },
        });
      }

      console.log(`Order ${order.orderNumber} payment confirmed via Alipay`);
    }

    // 返回成功响应（支付宝要求返回 success）
    return NextResponse.json('success');
  } catch (error) {
    console.error('Alipay callback error:', error);
    return NextResponse.json('FAIL');
  }
}

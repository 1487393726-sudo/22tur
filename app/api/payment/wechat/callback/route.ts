/**
 * WeChat Pay Callback Handler
 * 微信支付回调处理
 * 
 * Requirements: 4.2, 6.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaymentService } from '@/lib/payment/payment-service';
import { updateOrderPayment } from '@/lib/printing/order-service';

/**
 * 处理微信支付回调
 * POST /api/payment/wechat/callback
 */
export async function POST(request: NextRequest) {
  try {
    // 获取请求头
    const timestamp = request.headers.get('Wechatpay-Timestamp') || '';
    const nonce = request.headers.get('Wechatpay-Nonce') || '';
    const signature = request.headers.get('Wechatpay-Signature') || '';
    const serial = request.headers.get('Wechatpay-Serial') || '';

    // 获取请求体
    const body = await request.text();

    // 验证签名
    const paymentService = getPaymentService();
    const verifyResult = await paymentService.verifyCallback('wechat', {
      'Wechatpay-Timestamp': timestamp,
      'Wechatpay-Nonce': nonce,
      'Wechatpay-Serial': serial,
      body,
    }, signature);

    if (!verifyResult.valid) {
      console.error('WeChat Pay callback signature verification failed');
      return NextResponse.json(
        { code: 'INVALID_SIGNATURE', message: 'Signature verification failed' },
        { status: 401 }
      );
    }

    // 解析回调数据
    const data = JSON.parse(body);
    const callbackData = await paymentService.handlePaymentCallback('wechat', data);

    // 获取订单
    const order = await prisma.printOrder.findUnique({
      where: { orderNumber: callbackData.orderId },
    });

    if (!order) {
      console.error(`Order not found: ${callbackData.orderId}`);
      return NextResponse.json(
        { code: 'ORDER_NOT_FOUND', message: 'Order not found' },
        { status: 404 }
      );
    }

    // 如果支付成功，更新订单状态
    if (callbackData.status === 'PAID') {
      // 更新订单支付状态
      await updateOrderPayment(
        order.id,
        'wechat',
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

      console.log(`Order ${order.orderNumber} payment confirmed`);
    }

    // 返回成功响应
    return NextResponse.json({
      code: 'SUCCESS',
      message: 'Callback processed successfully',
    });
  } catch (error) {
    console.error('WeChat Pay callback error:', error);
    return NextResponse.json(
      { code: 'ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

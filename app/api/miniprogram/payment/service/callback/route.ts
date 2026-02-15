import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { notifyOrderStatusChange } from '@/lib/services/service-notification';

const WECHAT_API_KEY = process.env.WECHAT_API_KEY || '';

// 验证签名
function verifySign(params: Record<string, string>, apiKey: string): boolean {
  const sign = params.sign;
  const paramsWithoutSign = { ...params };
  delete paramsWithoutSign.sign;
  
  const sortedKeys = Object.keys(paramsWithoutSign).sort();
  const stringA = sortedKeys
    .filter(key => paramsWithoutSign[key] !== '' && paramsWithoutSign[key] !== undefined && paramsWithoutSign[key] !== null)
    .map(key => `${key}=${paramsWithoutSign[key]}`)
    .join('&');
  const stringSignTemp = `${stringA}&key=${apiKey}`;
  const calculatedSign = crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
  
  return sign === calculatedSign;
}

// XML 转对象
function xmlToObject(xml: string): Record<string, string> {
  const result: Record<string, string> = {};
  const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\1>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    result[match[1]] = match[2];
  }
  const regex2 = /<(\w+)>([^<]*)<\/\1>/g;
  while ((match = regex2.exec(xml)) !== null) {
    if (!result[match[1]]) {
      result[match[1]] = match[2];
    }
  }
  return result;
}

// 生成响应 XML
function generateResponseXml(returnCode: string, returnMsg: string): string {
  return `<xml><return_code><![CDATA[${returnCode}]]></return_code><return_msg><![CDATA[${returnMsg}]]></return_msg></xml>`;
}

// POST /api/miniprogram/payment/service/callback - 微信支付回调
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = xmlToObject(body);

    // 验证签名
    if (!verifySign({ ...params }, WECHAT_API_KEY)) {
      console.error('支付回调签名验证失败');
      return new NextResponse(generateResponseXml('FAIL', '签名验证失败'), {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // 检查支付结果
    if (params.return_code !== 'SUCCESS' || params.result_code !== 'SUCCESS') {
      console.error('支付失败:', params);
      return new NextResponse(generateResponseXml('SUCCESS', 'OK'), {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    const orderNo = params.out_trade_no;
    const transactionId = params.transaction_id;
    const totalFee = parseInt(params.total_fee, 10) / 100; // 转换为元

    // 查找订单
    const order = await prisma.serviceOrder.findFirst({
      where: { orderNumber: orderNo },
    });

    if (!order) {
      console.error('订单不存在:', orderNo);
      return new NextResponse(generateResponseXml('SUCCESS', 'OK'), {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // 检查订单是否已处理
    if (order.status !== 'PENDING') {
      return new NextResponse(generateResponseXml('SUCCESS', 'OK'), {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // 更新订单状态
    await prisma.serviceOrder.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        internalNote: JSON.stringify({
          ...JSON.parse(order.internalNote || '{}'),
          transactionId,
          paidAt: new Date().toISOString(),
          paidAmount: totalFee,
        }),
      },
    });

    // 创建初始里程碑
    await prisma.orderMilestone.create({
      data: {
        orderId: order.id,
        name: '订单确认',
        description: '订单已支付，等待服务开始',
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // 发送订单确认通知
    try {
      await notifyOrderStatusChange(order.id, 'CONFIRMED', 'PENDING');
    } catch (error) {
      console.error('发送通知失败:', error);
    }

    return new NextResponse(generateResponseXml('SUCCESS', 'OK'), {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('处理支付回调失败:', error);
    return new NextResponse(generateResponseXml('FAIL', '处理失败'), {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const WECHAT_APPID = process.env.WECHAT_MINIPROGRAM_APPID || '';
const WECHAT_MCH_ID = process.env.WECHAT_MCH_ID || '';
const WECHAT_API_KEY = process.env.WECHAT_API_KEY || '';
const WECHAT_NOTIFY_URL = process.env.WECHAT_MINIPROGRAM_SERVICE_NOTIFY_URL || '';

// 验证 token
function verifyToken(request: NextRequest): { userId: string } | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

// 生成随机字符串
function generateNonceStr(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 生成订单号
function generateOrderNo(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SV${timestamp}${random}`;
}

// 生成签名
function generateSign(params: Record<string, string | number>, apiKey: string): string {
  const sortedKeys = Object.keys(params).sort();
  const stringA = sortedKeys
    .filter(key => params[key] !== '' && params[key] !== undefined && params[key] !== null)
    .map(key => `${key}=${params[key]}`)
    .join('&');
  const stringSignTemp = `${stringA}&key=${apiKey}`;
  return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
}

// 对象转 XML
function objectToXml(obj: Record<string, string | number>): string {
  let xml = '<xml>';
  for (const key of Object.keys(obj)) {
    xml += `<${key}><![CDATA[${obj[key]}]]></${key}>`;
  }
  xml += '</xml>';
  return xml;
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

// POST /api/miniprogram/payment/service/create - 创建服务套餐支付订单
export async function POST(request: NextRequest) {
  try {
    const auth = verifyToken(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { packageId, packageName, amount, requirements } = body;

    if (!packageId || !amount) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取用户信息 - 使用 wechatMiniOpenId 字段
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, wechatMiniOpenId: true },
    });

    if (!user?.wechatMiniOpenId) {
      return NextResponse.json(
        { success: false, error: '用户未绑定微信' },
        { status: 400 }
      );
    }

    // 验证套餐是否存在
    const servicePackage = await prisma.servicePackage.findUnique({
      where: { id: packageId },
      select: { id: true, name: true },
    });

    if (!servicePackage) {
      return NextResponse.json(
        { success: false, error: '套餐不存在' },
        { status: 404 }
      );
    }

    // 生成订单号
    const orderNo = generateOrderNo();
    const nonceStr = generateNonceStr();
    const totalFee = Math.round(amount * 100); // 转换为分

    // 创建服务订单
    const serviceOrder = await prisma.serviceOrder.create({
      data: {
        orderNumber: orderNo,
        clientId: auth.userId,
        packageId: packageId,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        subtotal: amount,
        total: amount,
        clientNote: requirements || '',
      },
    });

    // 构建统一下单参数
    const unifiedOrderParams: Record<string, string | number> = {
      appid: WECHAT_APPID,
      mch_id: WECHAT_MCH_ID,
      nonce_str: nonceStr,
      body: `创意之旅-${packageName || servicePackage.name}`,
      out_trade_no: orderNo,
      total_fee: totalFee,
      spbill_create_ip: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      notify_url: WECHAT_NOTIFY_URL || `${process.env.NEXT_PUBLIC_API_URL}/api/miniprogram/payment/service/callback`,
      trade_type: 'JSAPI',
      openid: user.wechatMiniOpenId,
    };

    // 生成签名
    unifiedOrderParams.sign = generateSign(unifiedOrderParams, WECHAT_API_KEY);

    // 调用微信统一下单 API
    const xmlData = objectToXml(unifiedOrderParams);
    const response = await fetch('https://api.mch.weixin.qq.com/pay/unifiedorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: xmlData,
    });

    const responseText = await response.text();
    const result = xmlToObject(responseText);

    if (result.return_code !== 'SUCCESS' || result.result_code !== 'SUCCESS') {
      console.error('微信统一下单失败:', result);
      // 更新订单状态为失败
      await prisma.serviceOrder.update({
        where: { id: serviceOrder.id },
        data: { status: 'CANCELLED' },
      });
      return NextResponse.json(
        { success: false, error: result.return_msg || result.err_code_des || '创建订单失败' },
        { status: 400 }
      );
    }

    // 更新订单的预支付ID (存储在 internalNote 中)
    await prisma.serviceOrder.update({
      where: { id: serviceOrder.id },
      data: {
        internalNote: JSON.stringify({ prepayId: result.prepay_id }),
      },
    });

    // 生成小程序支付参数
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payParams: Record<string, string> = {
      appId: WECHAT_APPID,
      timeStamp: timestamp,
      nonceStr: generateNonceStr(),
      package: `prepay_id=${result.prepay_id}`,
      signType: 'MD5',
    };
    payParams.paySign = generateSign(payParams, WECHAT_API_KEY);

    return NextResponse.json({
      success: true,
      data: {
        orderId: orderNo,
        serviceOrderId: serviceOrder.id,
        payParams: {
          timeStamp: payParams.timeStamp,
          nonceStr: payParams.nonceStr,
          package: payParams.package,
          signType: payParams.signType,
          paySign: payParams.paySign,
        },
      },
    });
  } catch (error) {
    console.error('创建服务支付订单失败:', error);
    return NextResponse.json(
      { success: false, error: '创建订单失败' },
      { status: 500 }
    );
  }
}

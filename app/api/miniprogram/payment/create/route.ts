import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const WECHAT_APPID = process.env.WECHAT_MINIPROGRAM_APPID || '';
const WECHAT_MCH_ID = process.env.WECHAT_MCH_ID || '';
const WECHAT_API_KEY = process.env.WECHAT_API_KEY || '';
const WECHAT_NOTIFY_URL = process.env.WECHAT_MINIPROGRAM_NOTIFY_URL || '';

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
  return `MP${timestamp}${random}`;
}

// 生成签名
function generateSign(params: Record<string, any>, apiKey: string): string {
  const sortedKeys = Object.keys(params).sort();
  const stringA = sortedKeys
    .filter(key => params[key] !== '' && params[key] !== undefined && params[key] !== null)
    .map(key => `${key}=${params[key]}`)
    .join('&');
  const stringSignTemp = `${stringA}&key=${apiKey}`;
  return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
}

// 对象转 XML
function objectToXml(obj: Record<string, any>): string {
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
  // 也处理没有 CDATA 的情况
  const regex2 = /<(\w+)>([^<]*)<\/\1>/g;
  while ((match = regex2.exec(xml)) !== null) {
    if (!result[match[1]]) {
      result[match[1]] = match[2];
    }
  }
  return result;
}

// POST /api/miniprogram/payment/create - 创建支付订单
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
    const { investmentId, amount, description } = body;

    if (!investmentId || !amount) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, wechatOpenId: true },
    });

    if (!user?.wechatOpenId) {
      return NextResponse.json(
        { success: false, error: '用户未绑定微信' },
        { status: 400 }
      );
    }

    // 生成订单号
    const orderNo = generateOrderNo();
    const nonceStr = generateNonceStr();
    const totalFee = Math.round(amount * 100); // 转换为分

    // 构建统一下单参数
    const unifiedOrderParams: Record<string, any> = {
      appid: WECHAT_APPID,
      mch_id: WECHAT_MCH_ID,
      nonce_str: nonceStr,
      body: description || '创意之旅-投资支付',
      out_trade_no: orderNo,
      total_fee: totalFee,
      spbill_create_ip: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      notify_url: WECHAT_NOTIFY_URL,
      trade_type: 'JSAPI',
      openid: user.wechatOpenId,
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
      return NextResponse.json(
        { success: false, error: result.return_msg || result.err_code_des || '创建订单失败' },
        { status: 400 }
      );
    }

    // 保存支付记录
    await prisma.paymentRecord?.create({
      data: {
        orderId: orderNo,
        userId: auth.userId,
        provider: 'wechat',
        amount,
        currency: 'CNY',
        status: 'PENDING',
        metadata: JSON.stringify({ investmentId, prepayId: result.prepay_id }),
      },
    }).catch(() => {});

    // 生成小程序支付参数
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payParams: Record<string, any> = {
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
    console.error('创建支付订单失败:', error);
    return NextResponse.json(
      { success: false, error: '创建订单失败' },
      { status: 500 }
    );
  }
}

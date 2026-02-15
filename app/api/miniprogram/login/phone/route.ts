import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sign } from 'jsonwebtoken';

const WECHAT_APPID = process.env.WECHAT_MINIPROGRAM_APPID || '';
const WECHAT_SECRET = process.env.WECHAT_MINIPROGRAM_SECRET || '';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

interface WechatSessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

// 微信登录 - 获取 openid
async function getWechatSession(code: string): Promise<WechatSessionResponse> {
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.errcode) {
    throw new Error(data.errmsg || '微信登录失败');
  }
  
  return data;
}

// POST /api/miniprogram/login/phone - 手机号验证码登录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wxCode, phone, smsCode } = body;

    if (!wxCode || !phone || !smsCode) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 验证短信验证码
    const verificationRecord = await prisma.verificationCode?.findFirst({
      where: {
        phone,
        code: smsCode,
        type: 'LOGIN',
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { success: false, error: '验证码错误或已过期' },
        { status: 400 }
      );
    }

    // 标记验证码已使用
    await prisma.verificationCode?.update({
      where: { id: verificationRecord.id },
      data: { used: true },
    }).catch(() => {});

    // 获取微信 session
    const wxSession = await getWechatSession(wxCode);
    const { openid, unionid } = wxSession;

    // 查找用户（优先通过手机号，其次通过 openid）
    let user = await prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      // 尝试通过 openid 查找
      user = await prisma.user.findFirst({
        where: { wechatOpenId: openid },
      });

      if (user) {
        // 绑定手机号
        user = await prisma.user.update({
          where: { id: user.id },
          data: { phone },
        });
      } else {
        // 创建新用户
        user = await prisma.user.create({
          data: {
            email: `phone_${phone}@miniprogram.local`,
            name: `用户${phone.slice(-4)}`,
            phone,
            wechatOpenId: openid,
            wechatUnionId: unionid,
            role: 'USER',
            status: 'ACTIVE',
          },
        });
      }
    } else if (!user.wechatOpenId) {
      // 绑定微信
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          wechatOpenId: openid,
          wechatUnionId: unionid,
        },
      });
    }

    // 生成 JWT token
    const token = sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role,
        source: 'miniprogram'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 记录登录
    await prisma.loginHistory?.create({
      data: {
        userId: user.id,
        loginType: 'PHONE_SMS',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'miniprogram',
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('手机号登录失败:', error);
    return NextResponse.json(
      { success: false, error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}

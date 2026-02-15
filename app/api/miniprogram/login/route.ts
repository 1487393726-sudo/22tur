import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sign } from 'jsonwebtoken';
import crypto from 'crypto';

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

// 解密微信加密数据
function decryptWechatData(encryptedData: string, iv: string, sessionKey: string): any {
  const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
  const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
  const ivBuffer = Buffer.from(iv, 'base64');
  
  const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
  decipher.setAutoPadding(true);
  
  let decoded = decipher.update(encryptedDataBuffer, undefined, 'utf8');
  decoded += decipher.final('utf8');
  
  return JSON.parse(decoded);
}

// POST /api/miniprogram/login - 微信登录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: '缺少登录凭证' },
        { status: 400 }
      );
    }

    // 获取微信 session
    const wxSession = await getWechatSession(code);
    const { openid, session_key, unionid } = wxSession;

    // 查找或创建用户
    let user = await prisma.user.findFirst({
      where: { wechatOpenId: openid },
    });

    if (!user) {
      // 创建新用户
      user = await prisma.user.create({
        data: {
          email: `wx_${openid}@miniprogram.local`,
          name: `微信用户${openid.slice(-6)}`,
          wechatOpenId: openid,
          wechatUnionId: unionid,
          role: 'USER',
          status: 'ACTIVE',
        },
      });
    } else if (unionid && !user.wechatUnionId) {
      // 更新 unionid
      user = await prisma.user.update({
        where: { id: user.id },
        data: { wechatUnionId: unionid },
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
        loginType: 'WECHAT_MINIPROGRAM',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'miniprogram',
      },
    }).catch(() => {
      // 如果 LoginHistory 表不存在，忽略错误
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        sessionKey: session_key,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('微信登录失败:', error);
    return NextResponse.json(
      { success: false, error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}

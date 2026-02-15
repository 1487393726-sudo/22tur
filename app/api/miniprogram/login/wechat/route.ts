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

// POST /api/miniprogram/login/wechat - 微信一键登录（获取手机号）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, encryptedData, iv } = body;

    if (!code || !encryptedData || !iv) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取微信 session
    const wxSession = await getWechatSession(code);
    const { openid, session_key, unionid } = wxSession;

    // 解密手机号
    let phoneNumber: string;
    try {
      const phoneData = decryptWechatData(encryptedData, iv, session_key);
      phoneNumber = phoneData.phoneNumber || phoneData.purePhoneNumber;
      
      if (!phoneNumber) {
        throw new Error('无法获取手机号');
      }
    } catch (decryptError) {
      console.error('解密手机号失败:', decryptError);
      return NextResponse.json(
        { success: false, error: '获取手机号失败' },
        { status: 400 }
      );
    }

    // 查找用户（优先通过 openid，其次通过手机号）
    let user = await prisma.user.findFirst({
      where: { wechatOpenId: openid },
    });

    if (!user) {
      // 尝试通过手机号查找
      user = await prisma.user.findFirst({
        where: { phone: phoneNumber },
      });

      if (user) {
        // 绑定微信
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            wechatOpenId: openid,
            wechatUnionId: unionid,
          },
        });
      } else {
        // 创建新用户
        user = await prisma.user.create({
          data: {
            email: `wx_${openid}@miniprogram.local`,
            name: `用户${phoneNumber.slice(-4)}`,
            phone: phoneNumber,
            wechatOpenId: openid,
            wechatUnionId: unionid,
            role: 'USER',
            status: 'ACTIVE',
          },
        });
      }
    } else if (!user.phone) {
      // 更新手机号
      user = await prisma.user.update({
        where: { id: user.id },
        data: { phone: phoneNumber },
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
        loginType: 'WECHAT_PHONE',
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
    console.error('微信一键登录失败:', error);
    return NextResponse.json(
      { success: false, error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}

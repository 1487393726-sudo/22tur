// app/api/auth/verify-phone/route.ts
// 手机号验证 API - 发送验证码（无需登录）

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// 验证码有效期（分钟）
const CODE_EXPIRY_MINUTES = 5;
// 发送间隔（秒）
const SEND_INTERVAL_SECONDS = 60;
// 每小时最大发送次数
const MAX_SENDS_PER_HOUR = 5;

/**
 * 生成6位数字验证码
 */
function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * POST /api/auth/verify-phone
 * 发送手机验证码
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, purpose = 'REGISTER' } = body;

    // 验证手机号格式
    if (!phone) {
      return NextResponse.json(
        { error: '请输入手机号' },
        { status: 400 }
      );
    }

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 验证目的
    const validPurposes = ['REGISTER', 'RESET_PASSWORD', 'BIND_PHONE'];
    if (!validPurposes.includes(purpose)) {
      return NextResponse.json(
        { error: '无效的验证目的' },
        { status: 400 }
      );
    }

    // 如果是注册，检查手机号是否已被使用
    if (purpose === 'REGISTER') {
      const existingUser = await prisma.user.findFirst({
        where: { phone },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: '该手机号已被注册' },
          { status: 409 }
        );
      }
    }

    // 检查发送频率限制
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCodes = await prisma.sMSVerificationCode.findMany({
      where: {
        phone,
        createdAt: { gte: oneHourAgo },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 检查每小时发送次数
    if (recentCodes.length >= MAX_SENDS_PER_HOUR) {
      return NextResponse.json(
        { error: '发送次数过多，请稍后再试' },
        { status: 429 }
      );
    }

    // 检查发送间隔
    if (recentCodes.length > 0) {
      const lastCode = recentCodes[0];
      const timeSinceLastSend = Date.now() - lastCode.createdAt.getTime();
      if (timeSinceLastSend < SEND_INTERVAL_SECONDS * 1000) {
        const waitSeconds = Math.ceil((SEND_INTERVAL_SECONDS * 1000 - timeSinceLastSend) / 1000);
        return NextResponse.json(
          { 
            error: `请${waitSeconds}秒后再试`,
            waitSeconds,
          },
          { status: 429 }
        );
      }
    }

    // 生成验证码
    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    // 保存验证码到数据库
    await prisma.sMSVerificationCode.create({
      data: {
        phone,
        code,
        purpose,
        expiresAt,
      },
    });

    // TODO: 实际发送短信
    // 这里应该调用短信服务商的 API 发送验证码
    // 例如：await sendSMS(phone, `您的验证码是：${code}，${CODE_EXPIRY_MINUTES}分钟内有效。`);
    
    // 开发环境下，在控制台打印验证码
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] 手机验证码: ${phone} -> ${code}`);
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送',
      expiresInMinutes: CODE_EXPIRY_MINUTES,
      // 开发环境返回验证码（生产环境不要返回！）
      ...(process.env.NODE_ENV === 'development' && { code }),
    });
  } catch (error) {
    console.error('发送验证码错误:', error);
    return NextResponse.json(
      { error: '发送验证码失败，请稍后重试' },
      { status: 500 }
    );
  }
}

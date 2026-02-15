// app/api/auth/confirm-phone/route.ts
// 确认手机验证码 API

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * POST /api/auth/confirm-phone
 * 验证手机验证码
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, purpose = 'REGISTER' } = body;

    // 验证参数
    if (!phone || !code) {
      return NextResponse.json(
        { error: '请输入手机号和验证码' },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 验证码格式
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: '验证码格式不正确' },
        { status: 400 }
      );
    }

    // 查找验证码记录
    const verificationCode = await prisma.sMSVerificationCode.findFirst({
      where: {
        phone,
        code,
        purpose,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: '验证码无效或已过期' },
        { status: 400 }
      );
    }

    // 标记验证码为已使用
    await prisma.sMSVerificationCode.update({
      where: { id: verificationCode.id },
      data: { 
        used: true,
        usedAt: new Date(),
      },
    });

    // 如果是绑定手机号，更新用户信息
    if (purpose === 'BIND_PHONE') {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: '请先登录' },
          { status: 401 }
        );
      }

      // 检查手机号是否已被其他用户使用
      const existingUser = await prisma.user.findFirst({
        where: { 
          phone,
          id: { not: session.user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: '该手机号已被其他用户绑定' },
          { status: 409 }
        );
      }

      // 更新用户手机号
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          phone,
          phoneVerified: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: '手机号绑定成功',
        verified: true,
      });
    }

    // 对于注册和重置密码，只返回验证成功
    return NextResponse.json({
      success: true,
      message: '验证码验证成功',
      verified: true,
      // 返回一个临时令牌，用于后续操作
      token: Buffer.from(`${phone}:${Date.now()}`).toString('base64'),
    });
  } catch (error) {
    console.error('验证码验证错误:', error);
    return NextResponse.json(
      { error: '验证失败，请稍后重试' },
      { status: 500 }
    );
  }
}

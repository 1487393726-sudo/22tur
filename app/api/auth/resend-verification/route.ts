import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { z } from 'zod';
import { sendEmailVerification } from '@/lib/email';

// 验证请求体
const resendVerificationSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址').optional(),
  token: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证输入
    const validation = resendVerificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: validation.error.errors[0].message 
        },
        { status: 400 }
      );
    }

    const { email, token } = validation.data;

    // 根据邮箱或令牌查找用户
    let user;
    if (email) {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } else if (token) {
      user = await prisma.user.findFirst({
        where: { resetToken: token },
      });
    }

    if (!user) {
      // 为了安全，即使用户不存在也返回成功
      return NextResponse.json({
        success: true,
        message: '如果该邮箱已注册，您将收到验证邮件',
      });
    }

    // 如果邮箱已验证，返回提示
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: '该邮箱已经验证过了',
      });
    }

    // 生成新的验证令牌
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期

    // 保存令牌到数据库
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: verificationToken,
        resetTokenExpires: tokenExpires,
      },
    });

    // 发送验证邮件
    await sendEmailVerification(user.email, verificationToken);

    return NextResponse.json({
      success: true,
      message: '验证邮件已发送，请查收邮箱',
    });
  } catch (error) {
    console.error('重新发送验证邮件错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '服务器错误，请稍后重试' 
      },
      { status: 500 }
    );
  }
}

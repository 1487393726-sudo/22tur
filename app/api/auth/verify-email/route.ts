import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { applyRateLimit, emailVerificationRateLimiter } from '@/lib/rate-limit';

// 验证请求体
const verifyEmailSchema = z.object({
  token: z.string().min(1, '验证令牌不能为空'),
});

export async function POST(request: NextRequest) {
  // 应用速率限制
  const rateLimitResponse = await applyRateLimit(request, emailVerificationRateLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    
    // 验证输入
    const validation = verifyEmailSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: validation.error.errors[0].message 
        },
        { status: 400 }
      );
    }

    const { token } = validation.data;

    // 查找用户（使用 emailVerified 字段作为令牌存储）
    // 注意：在实际生产环境中，应该使用单独的 EmailVerificationToken 表
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token, // 临时使用 resetToken 字段存储验证令牌
        emailVerified: null, // 邮箱未验证
      },
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: '验证令牌无效或已过期' 
        },
        { status: 400 }
      );
    }

    // 检查令牌是否过期（24小时有效期）
    if (user.resetTokenExpires && user.resetTokenExpires < new Date()) {
      return NextResponse.json(
        { 
          success: false, 
          message: '验证链接已过期，请重新发送验证邮件' 
        },
        { status: 400 }
      );
    }

    // 更新用户邮箱验证状态
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: '邮箱验证成功！您现在可以登录了',
    });
  } catch (error) {
    console.error('邮箱验证错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '服务器错误，请稍后重试' 
      },
      { status: 500 }
    );
  }
}

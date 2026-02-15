import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { applyRateLimit, passwordResetRateLimiter, getClientIp } from "@/lib/rate-limit";

/**
 * 重置密码
 * POST /api/auth/reset-password
 * 
 * 速率限制：每小时最多 3 次请求（防止暴力破解令牌）
 */
export async function POST(request: NextRequest) {
  // 应用速率限制
  const rateLimitResponse = await applyRateLimit(request, passwordResetRateLimiter);
  if (rateLimitResponse) {
    // 记录速率限制触发到审计日志
    const clientIp = getClientIp(request);
    try {
      await prisma.auditLog.create({
        data: {
          action: 'RATE_LIMIT_EXCEEDED',
          resource: 'reset-password',
          details: JSON.stringify({
            ip: clientIp,
            endpoint: '/api/auth/reset-password',
            message: '密码重置请求速率限制触发',
          }),
          ipAddress: clientIp,
          status: 'BLOCKED',
          risk: 'MEDIUM',
        },
      });
    } catch (logError) {
      console.error('审计日志记录失败:', logError);
    }
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6 || password.length > 50) {
      return NextResponse.json(
        { error: "密码长度必须在6-50个字符之间" },
        { status: 400 }
      );
    }

    // 查找具有有效重置令牌的用户
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(), // 令牌未过期
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "重置链接无效或已过期" },
        { status: 400 }
      );
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 更新密码并清除重置令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return NextResponse.json(
      {
        message: "密码重置成功",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("重置密码错误:", error);
    return NextResponse.json(
      { error: "重置密码失败，请稍后重试" },
      { status: 500 }
    );
  }
}

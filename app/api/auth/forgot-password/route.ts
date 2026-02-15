import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findUserByIdentifier, identifyLoginType, IdentifierType } from "@/lib/auth-utils";
import crypto from "crypto";
import { applyRateLimit, passwordResetRateLimiter, getClientIp } from "@/lib/rate-limit";

/**
 * 忘记密码 - 发送重置令牌
 * POST /api/auth/forgot-password
 * 
 * 速率限制：每小时最多 3 次请求（防止滥用）
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
          resource: 'forgot-password',
          details: JSON.stringify({
            ip: clientIp,
            endpoint: '/api/auth/forgot-password',
            message: '忘记密码请求速率限制触发',
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
    const { identifier } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: "请输入邮箱、手机号或用户ID" },
        { status: 400 }
      );
    }

    // 使用增强的标识符识别功能查找用户
    const user = await findUserByIdentifier(identifier);

    if (!user) {
      // 为了安全，不透露用户是否存在
      return NextResponse.json(
        { 
          message: "如果该账号存在，重置链接已发送",
          identifierType: identifyLoginType(identifier)
        },
        { status: 200 }
      );
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1小时后过期

    // 保存重置令牌到数据库
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    // 确定发送方式
    const type = identifyLoginType(identifier);
    let sendMethod = "";
    let sendTo = "";

    switch (type) {
      case IdentifierType.EMAIL:
        sendMethod = "email";
        sendTo = user.email;
        break;
      case IdentifierType.PHONE:
        sendMethod = "sms";
        sendTo = user.phone || "";
        break;
      case IdentifierType.CUSTOM_USER_ID:
        // 如果是用户ID，优先使用邮箱，其次手机号
        if (user.email) {
          sendMethod = "email";
          sendTo = user.email;
        } else if (user.phone) {
          sendMethod = "sms";
          sendTo = user.phone;
        }
        break;
    }

    // TODO: 实际发送邮件或短信
    // 这里只是模拟，实际应该调用邮件服务或短信服务
    console.log(`[密码重置] 发送重置令牌到 ${sendMethod}: ${sendTo}`);
    console.log(`[密码重置] 重置令牌: ${resetToken}`);
    console.log(`[密码重置] 重置链接: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`);

    return NextResponse.json(
      {
        message: "重置链接已发送",
        sendMethod,
        // 开发环境下返回令牌，生产环境不应返回
        ...(process.env.NODE_ENV === "development" && { 
          resetToken,
          resetLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
        }),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("忘记密码错误:", error);
    return NextResponse.json(
      { error: "处理请求失败，请稍后重试" },
      { status: 500 }
    );
  }
}

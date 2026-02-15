// 邮件退订 API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * POST /api/user/unsubscribe
 * 处理邮件退订请求
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, unsubscribeAll, preferences } = body;

    if (!token) {
      return NextResponse.json({ error: '缺少退订令牌' }, { status: 400 });
    }

    // 验证令牌并获取用户
    const user = await prisma.user.findFirst({
      where: {
        unsubscribeToken: token,
      },
      include: {
        notificationPreference: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '无效的退订令牌' }, { status: 400 });
    }

    // 如果是退订所有邮件
    if (unsubscribeAll) {
      // 更新或创建通知偏好
      await prisma.notificationPreference.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          emailEnabled: false,
          pushEnabled: false,
          taskNotifications: false,
          approvalNotifications: false,
          messageNotifications: false,
          systemNotifications: false,
          reminderNotifications: false,
        },
        update: {
          emailEnabled: false,
          taskNotifications: false,
          approvalNotifications: false,
          messageNotifications: false,
          systemNotifications: false,
          reminderNotifications: false,
        },
      });

      // 记录审计日志
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'UNSUBSCRIBE_ALL',
          resource: 'EmailNotification',
          details: JSON.stringify({
            method: 'unsubscribe_link',
          }),
          status: 'SUCCESS',
          risk: 'LOW',
        },
      });

      return NextResponse.json({
        message: '已成功退订所有邮件通知',
      });
    }

    // 如果是更新偏好设置
    if (preferences) {
      await prisma.notificationPreference.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          ...preferences,
        },
        update: preferences,
      });

      // 记录审计日志
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'UPDATE_EMAIL_PREFERENCES',
          resource: 'EmailNotification',
          details: JSON.stringify({
            method: 'unsubscribe_link',
            preferences,
          }),
          status: 'SUCCESS',
          risk: 'LOW',
        },
      });

      return NextResponse.json({
        message: '邮件偏好已更新',
      });
    }

    return NextResponse.json({ error: '无效的请求' }, { status: 400 });
  } catch (error) {
    console.error('处理退订请求失败:', error);
    return NextResponse.json(
      { error: '处理退订请求失败' },
      { status: 500 }
    );
  }
}

/**
 * 生成退订令牌
 * @param userId 用户ID
 * @returns Promise<string> 退订令牌
 */
export async function generateUnsubscribeToken(userId: string): Promise<string> {
  // 生成随机令牌
  const token = crypto.randomBytes(32).toString('hex');

  // 保存到用户记录
  await prisma.user.update({
    where: { id: userId },
    data: { unsubscribeToken: token },
  });

  return token;
}

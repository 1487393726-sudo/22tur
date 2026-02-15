// 验证退订令牌 API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/unsubscribe/verify?token=xxx
 * 验证退订令牌并返回用户信息和当前偏好
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: '缺少退订令牌' }, { status: 400 });
    }

    // 查找用户
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

    // 返回用户邮箱和当前偏好
    const preferences = user.notificationPreference || {
      emailEnabled: true,
      taskNotifications: true,
      approvalNotifications: true,
      messageNotifications: true,
      systemNotifications: true,
      reminderNotifications: true,
    };

    return NextResponse.json({
      email: user.email,
      preferences: {
        emailEnabled: preferences.emailEnabled,
        taskNotifications: preferences.taskNotifications,
        approvalNotifications: preferences.approvalNotifications,
        messageNotifications: preferences.messageNotifications,
        systemNotifications: preferences.systemNotifications,
        reminderNotifications: preferences.reminderNotifications,
      },
    });
  } catch (error) {
    console.error('验证退订令牌失败:', error);
    return NextResponse.json(
      { error: '验证失败' },
      { status: 500 }
    );
  }
}

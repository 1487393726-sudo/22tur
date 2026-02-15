import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取通知偏好
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 查找或创建通知偏好
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: user.id },
    });

    if (!preferences) {
      // 创建默认偏好
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: user.id,
          emailEnabled: true,
          pushEnabled: true,
          taskEnabled: true,
          eventEnabled: true,
          reminderEnabled: true,
          reportEnabled: true,
          frequency: 'IMMEDIATE',
        },
      });
    }

    return NextResponse.json({
      preferences: {
        emailEnabled: preferences.emailEnabled,
        pushEnabled: preferences.pushEnabled,
        taskEnabled: preferences.taskEnabled,
        eventEnabled: preferences.eventEnabled,
        reminderEnabled: preferences.reminderEnabled,
        reportEnabled: preferences.reportEnabled,
        frequency: preferences.frequency,
      },
    });
  } catch (error) {
    console.error('获取通知偏好错误:', error);
    return NextResponse.json(
      { error: '获取通知偏好失败' },
      { status: 500 }
    );
  }
}

// 更新通知偏好
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const {
      emailEnabled,
      pushEnabled,
      taskEnabled,
      eventEnabled,
      reminderEnabled,
      reportEnabled,
      frequency,
    } = await request.json();

    // 更新或创建通知偏好
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: {
        emailEnabled: emailEnabled ?? true,
        pushEnabled: pushEnabled ?? true,
        taskEnabled: taskEnabled ?? true,
        eventEnabled: eventEnabled ?? true,
        reminderEnabled: reminderEnabled ?? true,
        reportEnabled: reportEnabled ?? true,
        frequency: frequency || 'IMMEDIATE',
      },
      create: {
        userId: user.id,
        emailEnabled: emailEnabled ?? true,
        pushEnabled: pushEnabled ?? true,
        taskEnabled: taskEnabled ?? true,
        eventEnabled: eventEnabled ?? true,
        reminderEnabled: reminderEnabled ?? true,
        reportEnabled: reportEnabled ?? true,
        frequency: frequency || 'IMMEDIATE',
      },
    });

    return NextResponse.json({
      message: '通知偏好已更新',
      preferences: {
        emailEnabled: preferences.emailEnabled,
        pushEnabled: preferences.pushEnabled,
        taskEnabled: preferences.taskEnabled,
        eventEnabled: preferences.eventEnabled,
        reminderEnabled: preferences.reminderEnabled,
        reportEnabled: preferences.reportEnabled,
        frequency: preferences.frequency,
      },
    });
  } catch (error) {
    console.error('更新通知偏好错误:', error);
    return NextResponse.json(
      { error: '更新通知偏好失败' },
      { status: 500 }
    );
  }
}

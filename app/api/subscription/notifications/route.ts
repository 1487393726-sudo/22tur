import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 发送订阅到期提醒
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { type, days, manualTrigger } = data;

    // 获取即将到期的订阅
    const expiringSubscriptions = await prisma.userSubscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            userType: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            category: true,
            type: true
          }
        }
      }
    });

    const notifications = [];

    for (const subscription of expiringSubscriptions) {
      const now = new Date();
      const endDate = new Date(subscription.endDate);
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // 检查是否已经发送过类似的提醒
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: subscription.userId,
          type: 'REMINDER',
          metadata: {
            contains: subscription.id
          }
        }
      });

      // 如果今天已经发送过提醒，跳过
      if (existingNotification) {
        const notificationDate = new Date(existingNotification.createdAt);
        const today = new Date();
        if (notificationDate.toDateString() === today.toDateString()) {
          continue;
        }
      }

      let title = '';
      let message = '';
      let priority = 'MEDIUM';

      if (daysRemaining <= 0) {
        title = '订阅已过期提醒';
        message = `您的"${subscription.service.title}"订阅已过期，请立即续费以继续使用服务。`;
        priority = 'HIGH';
      } else if (daysRemaining <= 3) {
        title = '订阅即将过期';
        message = `您的"${subscription.service.title}"订阅将在${daysRemaining}天后过期，请及时续费。`;
        priority = 'HIGH';
      } else if (daysRemaining <= 7) {
        title = '订阅续费提醒';
        message = `您的"${subscription.service.title}"订阅将在${daysRemaining}天后过期。`;
        priority = 'MEDIUM';
      }

      if (title && message) {
        // 创建通知记录
        const notification = await prisma.notification.create({
          data: {
            userId: subscription.userId,
            title,
            message,
            type: 'REMINDER',
            priority,
            actionUrl: `/user/services?tab=subscriptions&subscriptionId=${subscription.id}`,
            metadata: JSON.stringify({
              subscriptionId: subscription.id,
              serviceId: subscription.serviceId,
              daysRemaining,
              expiryDate: subscription.endDate
            }),
            expiresAt: new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 过期后7天提醒失效
          }
        });

        notifications.push({
          notification,
          user: subscription.user,
          subscription
        });
      }
    }

    // 这里可以添加发送邮件或推送通知的逻辑
    // await sendEmailNotifications(notifications);
    // await sendPushNotifications(notifications);

    return NextResponse.json({
      success: true,
      count: notifications.length,
      notifications: notifications.map(n => ({
        id: n.notification.id,
        title: n.notification.title,
        message: n.notification.message,
        userId: n.user.id,
        userEmail: n.user.email,
        userName: `${n.user.firstName} ${n.user.lastName}`,
        serviceName: n.subscription.service.title,
        daysRemaining: JSON.parse(n.notification.metadata || '{}').daysRemaining
      }))
    });
  } catch (error) {
    console.error('发送订阅提醒失败:', error);
    return NextResponse.json(
      { error: '发送订阅提醒失败' },
      { status: 500 }
    );
  }
}

// 获取通知列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const isRead = searchParams.get('isRead');

    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (isRead !== null) where.isRead = isRead === 'true';

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // 限制返回数量
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('获取通知列表失败:', error);
    return NextResponse.json(
      { error: '获取通知列表失败' },
      { status: 500 }
    );
  }
}
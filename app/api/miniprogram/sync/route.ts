import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

// 验证 token
function verifyToken(request: NextRequest): { userId: string } | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

// GET /api/miniprogram/sync - 同步数据
export async function GET(request: NextRequest) {
  try {
    const auth = verifyToken(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    const sinceDate = since ? new Date(parseInt(since)) : new Date(0);

    // 获取更新的投资数据
    const investments = await prisma.investment?.findMany({
      where: {
        userId: auth.userId,
        updatedAt: { gt: sinceDate },
      },
      select: {
        id: true,
        projectId: true,
        amount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            targetAmount: true,
            currentAmount: true,
            status: true,
            coverImage: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    }).catch(() => []);

    // 获取更新的通知数据
    const notifications = await prisma.notification?.findMany({
      where: {
        userId: auth.userId,
        updatedAt: { gt: sinceDate },
      },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        isRead: true,
        data: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }).catch(() => []);

    // 获取用户信息更新
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        updatedAt: true,
      },
    });

    const syncTime = Date.now();

    return NextResponse.json({
      success: true,
      data: {
        investments: investments || [],
        notifications: notifications || [],
        user: user?.updatedAt && user.updatedAt > sinceDate ? user : null,
        syncTime,
      },
    });
  } catch (error) {
    console.error('数据同步失败:', error);
    return NextResponse.json(
      { success: false, error: '同步失败' },
      { status: 500 }
    );
  }
}

// POST /api/miniprogram/sync - 上传本地数据
export async function POST(request: NextRequest) {
  try {
    const auth = verifyToken(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { readNotifications, behaviorEvents } = body;

    // 批量标记通知已读
    if (readNotifications && readNotifications.length > 0) {
      await prisma.notification?.updateMany({
        where: {
          id: { in: readNotifications },
          userId: auth.userId,
        },
        data: { isRead: true },
      }).catch(() => {});
    }

    // 记录行为事件
    if (behaviorEvents && behaviorEvents.length > 0) {
      const events = behaviorEvents.map((event: any) => ({
        userId: auth.userId,
        sessionId: event.sessionId || 'miniprogram',
        eventType: event.type,
        eventData: JSON.stringify(event.data || {}),
        pageUrl: event.page,
        createdAt: new Date(event.timestamp || Date.now()),
      }));

      await prisma.userBehaviorEvent?.createMany({
        data: events,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: { syncTime: Date.now() },
    });
  } catch (error) {
    console.error('数据上传失败:', error);
    return NextResponse.json(
      { success: false, error: '上传失败' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// PUT - 批量标记所有通知为已读
export async function PUT(request: NextRequest) {
  try {
    // 从 cookie 获取会话令牌
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 验证会话
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: '会话已过期，请重新登录' },
        { status: 401 }
      );
    }

    // 批量更新所有未读通知
    const result = await prisma.notification.updateMany({
      where: {
        userId: session.userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      message: '所有通知已标记为已读',
      count: result.count,
    });
  } catch (error) {
    console.error('批量标记已读失败:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// DELETE - 删除单个通知
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const notificationId = params.id;

    // 验证通知是否属于当前用户
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json(
        { error: '通知不存在' },
        { status: 404 }
      );
    }

    if (notification.userId !== session.userId) {
      return NextResponse.json(
        { error: '无权删除此通知' },
        { status: 403 }
      );
    }

    // 删除通知
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({
      message: '通知已删除',
    });
  } catch (error) {
    console.error('删除通知失败:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

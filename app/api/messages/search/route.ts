import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 获取会话令牌
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 验证会话并获取用户
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: '会话已过期' }, { status: 401 });
    }

    const userId = session.userId;

    // 获取搜索关键词
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    // 搜索消息（包含关键词的消息）
    // 注意：这里假设消息表中有 senderId, receiverId, content 字段
    // 实际实现需要根据你的数据库模型调整
    const messages = await prisma.message.findMany({
      where: {
        AND: [
          {
            OR: [
              { senderId: userId },
              { receiverId: userId },
            ],
          },
          {
            content: {
              contains: query,
              mode: 'insensitive', // 不区分大小写
            },
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // 限制返回结果数量
    });

    // 格式化搜索结果
    const results = messages.map((message) => {
      const senderName = message.sender
        ? `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim() || '未知用户'
        : '未知用户';

      // 确定会话ID（与发送者或接收者的会话）
      const conversationId = message.senderId === userId ? message.receiverId : message.senderId;

      return {
        id: message.id,
        conversationId,
        senderId: message.senderId,
        senderName,
        senderAvatar: message.sender?.avatar || undefined,
        content: message.content,
        timestamp: message.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('搜索消息失败:', error);
    return NextResponse.json(
      { error: '搜索消息失败' },
      { status: 500 }
    );
  }
}

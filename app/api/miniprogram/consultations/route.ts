import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

// GET - 获取咨询历史
export async function GET(request: NextRequest) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const [sessions, total] = await Promise.all([
      prisma.chatSession.findMany({
        where: { userId: user.id },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          rating: true
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.chatSession.count({ where: { userId: user.id } })
    ]);

    const items = sessions.map(session => ({
      id: session.id,
      status: session.status,
      serviceName: session.serviceName,
      avatar: session.serviceAvatar,
      lastMessage: session.messages[0]?.content || '',
      lastMessageTime: session.messages[0]?.createdAt.toISOString() || session.createdAt.toISOString(),
      unreadCount: session.unreadCount,
      rated: !!session.rating,
      createdAt: session.createdAt.toISOString()
    }));

    return NextResponse.json({
      items,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('获取咨询历史失败:', error);
    return NextResponse.json({ error: '获取咨询历史失败' }, { status: 500 });
  }
}

// POST - 创建咨询会话
export async function POST(request: NextRequest) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { initialMessage } = body;

    // 创建会话
    const session = await prisma.chatSession.create({
      data: {
        userId: user.id,
        status: 'active',
        serviceName: '在线客服',
        serviceAvatar: '/images/service-avatar.png'
      }
    });

    // 如果有初始消息，创建消息
    if (initialMessage) {
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          senderId: user.id,
          senderType: 'user',
          type: 'text',
          content: initialMessage
        }
      });

      // 添加系统欢迎消息
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          senderId: 'system',
          senderType: 'system',
          type: 'text',
          content: '您好！欢迎咨询，请问有什么可以帮助您的？'
        }
      });
    }

    return NextResponse.json({
      id: session.id,
      status: session.status,
      serviceName: session.serviceName,
      serviceAvatar: session.serviceAvatar
    });
  } catch (error) {
    console.error('创建咨询会话失败:', error);
    return NextResponse.json({ error: '创建咨询会话失败' }, { status: 500 });
  }
}

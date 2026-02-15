import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - 获取消息列表
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const before = searchParams.get('before');
    const after = searchParams.get('after');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 验证会话属于当前用户
    const session = await prisma.chatSession.findFirst({
      where: { id, userId: user.id }
    });

    if (!session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 });
    }

    // 构建查询条件
    const where: any = { sessionId: id };
    if (before) {
      where.id = { lt: before };
    }
    if (after) {
      where.id = { gt: after };
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: after ? 'asc' : 'desc' },
      take: limit
    });

    // 如果是向前查询，需要反转顺序
    if (!after) {
      messages.reverse();
    }

    // 标记消息为已读
    await prisma.chatMessage.updateMany({
      where: {
        sessionId: id,
        senderType: { not: 'user' },
        readAt: null
      },
      data: { readAt: new Date() }
    });

    // 更新未读数
    await prisma.chatSession.update({
      where: { id },
      data: { unreadCount: 0 }
    });

    const items = messages.map(msg => ({
      id: msg.id,
      sessionId: msg.sessionId,
      type: msg.type,
      content: msg.content,
      fileName: msg.fileName,
      fileSize: msg.fileSize,
      isSelf: msg.senderId === user.id,
      createdAt: msg.createdAt.toISOString(),
      status: msg.readAt ? 'read' : 'sent'
    }));

    return NextResponse.json({
      messages: items,
      hasMore: messages.length === limit
    });
  } catch (error) {
    console.error('获取消息列表失败:', error);
    return NextResponse.json({ error: '获取消息列表失败' }, { status: 500 });
  }
}

// POST - 发送消息
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { type, content, fileName, fileSize } = body;

    // 验证会话属于当前用户
    const session = await prisma.chatSession.findFirst({
      where: { id, userId: user.id }
    });

    if (!session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 });
    }

    if (session.status === 'closed') {
      return NextResponse.json({ error: '会话已关闭' }, { status: 400 });
    }

    // 创建消息
    const message = await prisma.chatMessage.create({
      data: {
        sessionId: id,
        senderId: user.id,
        senderType: 'user',
        type: type || 'text',
        content,
        fileName,
        fileSize
      }
    });

    // 更新会话时间
    await prisma.chatSession.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({
      id: message.id,
      sessionId: message.sessionId,
      type: message.type,
      content: message.content,
      fileName: message.fileName,
      fileSize: message.fileSize,
      isSelf: true,
      createdAt: message.createdAt.toISOString(),
      status: 'sent'
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 });
  }
}

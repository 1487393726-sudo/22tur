import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - 关闭咨询并提交评价
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { score, comment } = body;

    // 验证会话属于当前用户
    const session = await prisma.chatSession.findFirst({
      where: { id, userId: user.id },
      include: { rating: true }
    });

    if (!session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 });
    }

    // 关闭会话
    await prisma.chatSession.update({
      where: { id },
      data: { status: 'closed' }
    });

    // 添加系统消息
    await prisma.chatMessage.create({
      data: {
        sessionId: id,
        senderId: 'system',
        senderType: 'system',
        type: 'system',
        content: '咨询已结束，感谢您的使用'
      }
    });

    // 如果有评分，创建评价
    if (score && !session.rating) {
      await prisma.chatRating.create({
        data: {
          sessionId: id,
          userId: user.id,
          score,
          comment: comment || ''
        }
      });
    }

    return NextResponse.json({
      message: '咨询已关闭'
    });
  } catch (error) {
    console.error('关闭咨询失败:', error);
    return NextResponse.json({ error: '关闭咨询失败' }, { status: 500 });
  }
}

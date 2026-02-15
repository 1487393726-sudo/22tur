import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// POST /api/miniprogram/tickets/[id]/replies - 添加回复
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { content, attachments } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { success: false, error: '回复内容不能为空' },
        { status: 400 }
      );
    }

    // 查询工单
    const ticket = await prisma.supportTicket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: '工单不存在' },
        { status: 404 }
      );
    }

    // 验证权限
    if (ticket.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: '无权操作' },
        { status: 403 }
      );
    }

    // 检查工单状态
    if (ticket.status === 'closed') {
      return NextResponse.json(
        { success: false, error: '工单已关闭，无法回复' },
        { status: 400 }
      );
    }

    // 创建回复
    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: id,
        userId: user.id,
        content,
        attachments: attachments || [],
        isStaff: false
      }
    });

    return NextResponse.json({
      success: true,
      id: reply.id,
      message: '回复成功'
    });
  } catch (error) {
    console.error('添加回复失败:', error);
    return NextResponse.json(
      { success: false, error: '回复失败' },
      { status: 500 }
    );
  }
}

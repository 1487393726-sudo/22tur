import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// GET /api/miniprogram/tickets/[id] - 获取工单详情
export async function GET(
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

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
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
        { success: false, error: '无权访问' },
        { status: 403 }
      );
    }

    const typeNameMap: Record<string, string> = {
      product: '产品问题',
      service: '服务咨询',
      payment: '支付问题',
      account: '账户问题',
      suggestion: '建议反馈',
      other: '其他问题'
    };

    return NextResponse.json({
      success: true,
      id: ticket.id,
      ticketNo: ticket.ticketNo,
      title: ticket.title,
      content: ticket.content,
      type: ticket.type,
      typeName: typeNameMap[ticket.type] || ticket.type,
      status: ticket.status,
      attachments: ticket.attachments,
      createdAt: ticket.createdAt.toISOString(),
      rated: !!ticket.rating,
      rating: ticket.rating,
      ratingComment: ticket.ratingComment,
      replies: ticket.replies.map(r => ({
        id: r.id,
        content: r.content,
        isStaff: r.isStaff,
        name: r.isStaff ? '客服' : (r.user?.name || '我'),
        avatar: r.user?.avatar,
        createdAt: r.createdAt.toISOString(),
        attachments: r.attachments
      }))
    });
  } catch (error) {
    console.error('获取工单详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/miniprogram/tickets/[id] - 更新工单状态
export async function PUT(
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
    const { status } = body;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: '工单不存在' },
        { status: 404 }
      );
    }

    if (ticket.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: '无权操作' },
        { status: 403 }
      );
    }

    // 用户只能关闭工单
    if (status !== 'closed') {
      return NextResponse.json(
        { success: false, error: '无效操作' },
        { status: 400 }
      );
    }

    await prisma.supportTicket.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      message: '工单已关闭'
    });
  } catch (error) {
    console.error('更新工单失败:', error);
    return NextResponse.json(
      { success: false, error: '操作失败' },
      { status: 500 }
    );
  }
}

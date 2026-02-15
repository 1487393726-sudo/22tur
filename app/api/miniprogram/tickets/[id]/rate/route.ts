import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// POST /api/miniprogram/tickets/[id]/rate - 评价工单
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
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: '请选择有效评分' },
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

    // 检查是否已评价
    if (ticket.rating) {
      return NextResponse.json(
        { success: false, error: '已评价过' },
        { status: 400 }
      );
    }

    // 检查工单状态
    if (ticket.status !== 'resolved') {
      return NextResponse.json(
        { success: false, error: '工单未解决，暂不能评价' },
        { status: 400 }
      );
    }

    // 更新评价
    await prisma.supportTicket.update({
      where: { id },
      data: {
        rating,
        ratingComment: comment,
        status: 'closed'
      }
    });

    return NextResponse.json({
      success: true,
      message: '评价成功'
    });
  } catch (error) {
    console.error('评价工单失败:', error);
    return NextResponse.json(
      { success: false, error: '评价失败' },
      { status: 500 }
    );
  }
}

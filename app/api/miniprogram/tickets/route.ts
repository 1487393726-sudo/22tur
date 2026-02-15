import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';
import { nanoid } from 'nanoid';

// GET /api/miniprogram/tickets - 获取工单列表
export async function GET(request: NextRequest) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {
      userId: user.id
    };

    if (status) {
      where.status = status;
    }

    // 查询工单列表
    const [list, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          replies: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.supportTicket.count({ where })
    ]);

    const typeNameMap: Record<string, string> = {
      product: '产品问题',
      service: '服务咨询',
      payment: '支付问题',
      account: '账户问题',
      suggestion: '建议反馈',
      other: '其他问题'
    };

    const formattedList = list.map(item => ({
      id: item.id,
      ticketNo: item.ticketNo,
      title: item.title,
      content: item.content,
      type: item.type,
      typeName: typeNameMap[item.type] || item.type,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      lastReply: item.replies[0]?.content?.substring(0, 30)
    }));

    return NextResponse.json({
      success: true,
      list: formattedList,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('获取工单列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/miniprogram/tickets - 创建工单
export async function POST(request: NextRequest) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, title, content, contact, attachments } = body;

    if (!type || !title || !content) {
      return NextResponse.json(
        { success: false, error: '请填写完整信息' },
        { status: 400 }
      );
    }

    // 生成工单号
    const ticketNo = `TK${Date.now().toString(36).toUpperCase()}${nanoid(4).toUpperCase()}`;

    // 创建工单
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNo,
        userId: user.id,
        type,
        title,
        content,
        contact,
        attachments: attachments || [],
        status: 'pending'
      }
    });

    return NextResponse.json({
      success: true,
      id: ticket.id,
      ticketNo: ticket.ticketNo,
      message: '工单创建成功'
    });
  } catch (error) {
    console.error('创建工单失败:', error);
    return NextResponse.json(
      { success: false, error: '创建失败' },
      { status: 500 }
    );
  }
}

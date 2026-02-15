/**
 * 请求修改报价 API 路由
 * Requirements: 3.2, 3.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { reviseQuote } from '@/lib/printing/quote-service';
import { prisma } from '@/lib/prisma';

/**
 * PUT /api/print-quotes/[id]/revise
 * 请求修改报价
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    const { comment } = await request.json();

    if (!comment || comment.trim() === '') {
      return NextResponse.json(
        { message: '修改意见不能为空' },
        { status: 400 }
      );
    }

    // 请求修改报价
    const quote = await reviseQuote(params.id, session.user.id, comment);

    // 创建通知（通知管理员）
    await prisma.printNotification.create({
      data: {
        recipientId: 'admin',
        type: 'quote_revision_requested',
        title: '报价修改请求',
        message: `客户请求修改报价 ${quote.quoteNumber}`,
        quoteId: params.id,
        channels: JSON.stringify(['system']),
      },
    });

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error revising quote:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '请求修改失败' },
      { status: 500 }
    );
  }
}

/**
 * 印刷询价 API 路由
 * Requirements: 1.1, 1.3, 2.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createQuote } from '@/lib/printing/quote-service';
import { validateQuoteRequest } from '@/lib/printing/quote-service';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/print-quotes
 * 创建新的询价
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // 验证请求数据
    const validation = validateQuoteRequest(data);
    if (!validation.valid) {
      return NextResponse.json(
        {
          message: '验证失败',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // 创建询价
    const quote = await createQuote(session.user.id, data);

    // 添加文件到询价
    if (data.fileIds && Array.isArray(data.fileIds)) {
      for (const fileId of data.fileIds) {
        const file = await prisma.printQuoteFile.findUnique({
          where: { id: fileId },
        });
        if (file && file.quoteId === null) {
          await prisma.printQuoteFile.update({
            where: { id: fileId },
            data: { quoteId: quote.id },
          });
        }
      }
    }

    // 创建系统通知（通知管理员）
    await prisma.printNotification.create({
      data: {
        recipientId: 'admin', // 这里应该是实际的管理员ID
        type: 'quote_submitted',
        title: '新的询价提交',
        message: `客户 ${session.user.username || session.user.email} 提交了新的询价 ${quote.quoteNumber}`,
        quoteId: quote.id,
        channels: JSON.stringify(['system']),
      },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '创建询价失败' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/print-quotes
 * 获取询价列表
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const where: any = {
      customerId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    const [quotes, total] = await Promise.all([
      prisma.printQuote.findMany({
        where,
        include: {
          files: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.printQuote.count({ where }),
    ]);

    return NextResponse.json({
      items: quotes,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { message: '获取询价列表失败' },
      { status: 500 }
    );
  }
}

/**
 * Admin Submit Quote API
 * PUT /api/admin/print-quotes/[id]/quote - Submit a quote
 * Requirements: 2.2, 2.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { submitQuote } from '@/lib/printing/quote-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { unitPrice, totalPrice, priceBreakdown, validUntil, adminNote } = body;

    // 调用服务提交报价
    const quote = await submitQuote(params.id, {
      unitPrice,
      totalPrice,
      priceBreakdown,
      validUntil,
      adminNote,
    });

    // TODO: 发送通知给客户
    // await notificationService.sendQuoteNotification(quote.customerId, quote);

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error submitting quote:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

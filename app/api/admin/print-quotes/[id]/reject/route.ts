/**
 * Admin Reject Quote API
 * PUT /api/admin/print-quotes/[id]/reject - Reject a quote
 * Requirements: 2.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rejectQuote } from '@/lib/printing/quote-service';

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
    const { reason } = body;

    if (!reason || reason.trim() === '') {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // 调用服务拒绝询价
    const quote = await rejectQuote(params.id, reason);

    // TODO: 发送通知给客户
    // await notificationService.sendRejectionNotification(quote.customerId, quote);

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error rejecting quote:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

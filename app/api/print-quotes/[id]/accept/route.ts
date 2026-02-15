/**
 * 接受报价 API 路由
 * Requirements: 3.2, 3.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { acceptQuote, markQuoteOrdered } from '@/lib/printing/quote-service';
import { prisma } from '@/lib/prisma';

/**
 * PUT /api/print-quotes/[id]/accept
 * 接受报价并创建订单
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

    // 接受报价
    const quote = await acceptQuote(params.id, session.user.id);

    // 生成订单号
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `PO${year}${month}${day}${random}`;

    // 创建订单
    const order = await prisma.printOrder.create({
      data: {
        orderNumber,
        quoteId: params.id,
        customerId: session.user.id,
        status: 'pending_payment',
        productType: quote.productType,
        quantity: quote.quantity,
        specifications: JSON.stringify({
          size: quote.size,
          material: quote.material,
          finishing: quote.finishing,
          colorMode: quote.colorMode,
          sides: quote.sides,
        }),
        unitPrice: quote.unitPrice || 0,
        totalPrice: quote.totalPrice || 0,
        paymentStatus: 'unpaid',
      },
    });

    // 标记询价已下单
    await markQuoteOrdered(params.id);

    // 创建通知
    await prisma.printNotification.create({
      data: {
        recipientId: session.user.id,
        type: 'quote_accepted',
        title: '报价已接受',
        message: `您已接受报价 ${quote.quoteNumber}，订单号为 ${orderNumber}`,
        quoteId: params.id,
        orderId: order.id,
        channels: JSON.stringify(['system']),
      },
    });

    return NextResponse.json({
      ...quote,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Error accepting quote:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '接受报价失败' },
      { status: 500 }
    );
  }
}

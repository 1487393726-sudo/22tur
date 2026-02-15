import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

// 验证 token
function verifyToken(request: NextRequest): { userId: string } | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

// GET /api/miniprogram/payment/[orderId]/status - 查询支付状态
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const auth = verifyToken(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const { orderId } = params;

    // 查询支付记录
    const payment = await prisma.paymentRecord?.findFirst({
      where: {
        orderId,
        userId: auth.userId,
      },
      select: {
        id: true,
        orderId: true,
        amount: true,
        status: true,
        paidAt: true,
        createdAt: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    console.error('查询支付状态失败:', error);
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    );
  }
}

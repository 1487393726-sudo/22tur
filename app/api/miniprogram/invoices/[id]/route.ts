import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - 获取发票详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId: user.id },
      include: {
        order: true
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: '发票不存在' }, { status: 404 });
    }

    const typeNames: Record<string, string> = {
      electronic: '电子普通发票',
      special: '增值税专用发票'
    };

    return NextResponse.json({
      id: invoice.id,
      orderNo: invoice.orderNo,
      title: invoice.title,
      taxNo: invoice.taxNo,
      amount: invoice.amount,
      orderAmount: invoice.order?.totalAmount,
      type: invoice.type,
      typeName: typeNames[invoice.type] || invoice.type,
      status: invoice.status,
      invoiceNo: invoice.invoiceNo,
      invoiceCode: invoice.invoiceCode,
      pdfUrl: invoice.pdfUrl,
      email: invoice.email,
      remark: invoice.remark,
      rejectReason: invoice.rejectReason,
      applyTime: invoice.createdAt.toISOString(),
      completeTime: invoice.completedAt?.toISOString(),
      orderTime: invoice.order?.createdAt.toISOString()
    });
  } catch (error) {
    console.error('获取发票详情失败:', error);
    return NextResponse.json({ error: '获取发票详情失败' }, { status: 500 });
  }
}

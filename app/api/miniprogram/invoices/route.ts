import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

// GET - 获取发票列表
export async function GET(request: NextRequest) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const where: any = { userId: user.id };
    if (status && status !== 'all') {
      where.status = status;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.invoice.count({ where })
    ]);

    const typeNames: Record<string, string> = {
      electronic: '电子普通发票',
      special: '增值税专用发票'
    };

    const items = invoices.map(inv => ({
      id: inv.id,
      orderNo: inv.orderNo,
      title: inv.title,
      amount: inv.amount,
      type: inv.type,
      typeName: typeNames[inv.type] || inv.type,
      status: inv.status,
      invoiceNo: inv.invoiceNo,
      pdfUrl: inv.pdfUrl,
      applyTime: inv.createdAt.toISOString()
    }));

    return NextResponse.json({
      items,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('获取发票列表失败:', error);
    return NextResponse.json({ error: '获取发票列表失败' }, { status: 500 });
  }
}

// POST - 申请开票
export async function POST(request: NextRequest) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const {
      orderId, type, headerType, title, taxNo,
      bankName, bankAccount, companyAddress, companyPhone,
      email, remark
    } = body;

    if (!orderId || !type || !title || !email) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 获取订单信息
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id }
    });

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    // 检查是否已申请过发票
    const existingInvoice = await prisma.invoice.findFirst({
      where: { orderId, status: { not: 'rejected' } }
    });

    if (existingInvoice) {
      return NextResponse.json({ error: '该订单已申请过发票' }, { status: 400 });
    }

    // 创建发票申请
    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        orderId,
        orderNo: order.orderNo,
        type,
        headerType,
        title,
        taxNo,
        bankName,
        bankAccount,
        companyAddress,
        companyPhone,
        email,
        remark,
        amount: order.totalAmount,
        status: 'pending'
      }
    });

    return NextResponse.json({
      id: invoice.id,
      message: '申请成功'
    });
  } catch (error) {
    console.error('申请开票失败:', error);
    return NextResponse.json({ error: '申请开票失败' }, { status: 500 });
  }
}

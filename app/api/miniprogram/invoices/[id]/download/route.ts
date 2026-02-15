import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - 获取发票下载链接
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId: user.id }
    });

    if (!invoice) {
      return NextResponse.json({ error: '发票不存在' }, { status: 404 });
    }

    if (invoice.status !== 'completed' || !invoice.pdfUrl) {
      return NextResponse.json({ error: '发票尚未开具' }, { status: 400 });
    }

    return NextResponse.json({
      url: invoice.pdfUrl,
      fileName: `发票_${invoice.invoiceNo || invoice.id}.pdf`
    });
  } catch (error) {
    console.error('获取下载链接失败:', error);
    return NextResponse.json({ error: '获取下载链接失败' }, { status: 500 });
  }
}

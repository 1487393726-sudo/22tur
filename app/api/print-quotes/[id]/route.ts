/**
 * 印刷询价详情 API 路由
 * Requirements: 1.3, 3.1, 3.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getQuoteById } from '@/lib/printing/quote-service';

/**
 * GET /api/print-quotes/[id]
 * 获取询价详情
 */
export async function GET(
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

    const quote = await getQuoteById(params.id, session.user.id);
    if (!quote) {
      return NextResponse.json(
        { message: '询价不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { message: '获取询价详情失败' },
      { status: 500 }
    );
  }
}

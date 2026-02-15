/**
 * 凭证上传 API 端点
 * Receipt Upload API Endpoint
 * 
 * POST: 上传凭证
 * 
 * 需求: 10.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  dataEntryManager,
  DataEntryError
} from '@/lib/investor-operations-monitoring/data-entry-manager';

/**
 * POST /api/projects/[id]/receipts
 * 上传凭证
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 验证必填字段
    if (!body.expenseId || !body.receiptUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_INPUT', 
            message: '缺少必填字段: expenseId, receiptUrl' 
          } 
        },
        { status: 400 }
      );
    }

    const result = await dataEntryManager.uploadReceipt(
      body.expenseId,
      body.receiptUrl,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error instanceof DataEntryError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 400 }
      );
    }
    console.error('上传凭证失败:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '上传凭证失败' } },
      { status: 500 }
    );
  }
}

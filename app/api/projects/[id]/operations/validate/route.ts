/**
 * 数据验证 API 端点
 * Data Validation API Endpoint
 * 
 * POST: 验证运营数据
 * 
 * 需求: 10.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  dataEntryManager,
  DataEntryError
} from '@/lib/investor-operations-monitoring/data-entry-manager';

/**
 * POST /api/projects/[id]/operations/validate
 * 验证运营数据
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

    const { id: projectId } = await params;
    const body = await request.json();

    // 验证必填字段
    if (!body.date || body.revenue === undefined || !body.expenses) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_INPUT', 
            message: '缺少必填字段: date, revenue, expenses' 
          } 
        },
        { status: 400 }
      );
    }

    const validationResult = await dataEntryManager.validateOperationsData(
      projectId,
      {
        projectId,
        date: new Date(body.date),
        revenue: body.revenue,
        expenses: body.expenses,
        customerCount: body.customerCount,
        notes: body.notes
      }
    );

    return NextResponse.json({
      success: true,
      data: validationResult
    });
  } catch (error) {
    if (error instanceof DataEntryError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 400 }
      );
    }
    console.error('验证数据失败:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '验证数据失败' } },
      { status: 500 }
    );
  }
}

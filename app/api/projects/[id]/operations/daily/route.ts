/**
 * 每日运营数据 API
 * Daily Operations API
 * 
 * GET /api/projects/[id]/operations/daily - 获取每日运营数据
 * POST /api/projects/[id]/operations/daily - 录入每日运营数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { operationsDataManager, OperationsErrorCodes } from '@/lib/investor-operations-monitoring/operations-data-manager';
import { ExpenseCategory } from '@/types/investor-operations-monitoring';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json(
        { success: false, error: '请提供日期参数' },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { success: false, error: '无效的日期格式' },
        { status: 400 }
      );
    }

    const operations = await operationsDataManager.getDailyOperations(projectId, date);

    return NextResponse.json({
      success: true,
      data: operations
    });
  } catch (error) {
    console.error('获取每日运营数据失败:', error);
    
    if (error instanceof Error && 'code' in error) {
      const typedError = error as { code: string; message: string };
      if (typedError.code === OperationsErrorCodes.PROJECT_NOT_FOUND) {
        return NextResponse.json(
          { success: false, error: typedError.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '获取每日运营数据失败' 
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();

    // 验证必填字段
    if (!body.date || body.revenue === undefined || !body.expenses) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段: date, revenue, expenses' },
        { status: 400 }
      );
    }

    // 构建输入数据
    const input = {
      projectId,
      date: new Date(body.date),
      revenue: parseFloat(body.revenue),
      expenses: body.expenses.map((e: { category: string; amount: number; description?: string; receiptUrl?: string }) => ({
        category: e.category as ExpenseCategory,
        amount: parseFloat(String(e.amount)),
        description: e.description,
        receiptUrl: e.receiptUrl
      })),
      customerCount: body.customerCount ? parseInt(body.customerCount) : undefined,
      notes: body.notes
    };

    const operations = await operationsDataManager.createDailyOperations(
      input,
      session.user.id || 'unknown'
    );

    return NextResponse.json({
      success: true,
      data: operations
    }, { status: 201 });
  } catch (error) {
    console.error('录入每日运营数据失败:', error);
    
    if (error instanceof Error && 'code' in error) {
      const typedError = error as { code: string; message: string };
      if (typedError.code === OperationsErrorCodes.PROJECT_NOT_FOUND) {
        return NextResponse.json(
          { success: false, error: typedError.message },
          { status: 404 }
        );
      }
      if (typedError.code === OperationsErrorCodes.VALIDATION_FAILED) {
        return NextResponse.json(
          { success: false, error: typedError.message },
          { status: 400 }
        );
      }
      if (typedError.code === OperationsErrorCodes.DUPLICATE_ENTRY) {
        return NextResponse.json(
          { success: false, error: typedError.message },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '录入每日运营数据失败' 
      },
      { status: 500 }
    );
  }
}

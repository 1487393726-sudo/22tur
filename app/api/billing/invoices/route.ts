import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: 从数据库获取用户的账单历史
    // 这里返回示例数据
    const invoices = [
      {
        id: 'inv_001',
        number: 'INV-2024-001',
        amount: 99,
        status: 'PAID',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'inv_002',
        number: 'INV-2024-002',
        amount: 99,
        status: 'PAID',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

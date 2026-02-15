import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: 从数据库获取用户的定制订单
    // 这里返回示例数据
    const orders = [
      {
        id: 'order_001',
        title: '企业宣传册设计与印刷',
        category: '纸类制品',
        description: '需要设计并印刷500份企业宣传册，A4尺寸，彩色印刷',
        status: 'IN_PRODUCTION',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        budget: 5000,
      },
      {
        id: 'order_002',
        title: '定制T恤印刷',
        category: '服装制作',
        description: '100件定制T恤，前胸和后背印刷公司logo',
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        budget: 3000,
      },
    ];

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch custom orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom orders' },
      { status: 500 }
    );
  }
}

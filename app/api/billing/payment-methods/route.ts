import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: 从数据库获取用户的支付方式
    // 这里返回示例数据
    const paymentMethods = [
      {
        id: 'pm_123',
        type: '信用卡',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
      },
    ];

    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error('Failed to fetch payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: 从数据库获取用户的订阅信息
    // 这里返回示例数据
    const subscription = {
      id: 'sub_123',
      planName: '免费版',
      planType: 'FREE',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 0,
      autoRenew: false,
    };

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: 更新数据库中的默认支付方式
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to set default payment method:', error);
    return NextResponse.json(
      { error: 'Failed to set default payment method' },
      { status: 500 }
    );
  }
}

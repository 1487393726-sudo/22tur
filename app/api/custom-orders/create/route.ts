import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: 验证用户身份
    // TODO: 保存订单到数据库
    // TODO: 处理文件上传

    const {
      title,
      category,
      description,
      quantity,
      budget,
      dueDate,
      specifications,
      additionalNotes,
      files,
    } = body;

    // 验证必填字段
    if (!title || !category || !description || !quantity || !budget) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 这里应该保存到数据库
    const order = {
      id: Date.now().toString(),
      title,
      category,
      description,
      quantity,
      budget,
      dueDate,
      specifications,
      additionalNotes,
      files,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      order,
      message: '订单提交成功',
    });
  } catch (error) {
    console.error('Failed to create custom order:', error);
    return NextResponse.json(
      { error: '提交订单失败' },
      { status: 500 }
    );
  }
}

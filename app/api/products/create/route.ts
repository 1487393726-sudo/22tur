import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: 验证用户身份
    // TODO: 保存产品到数据库
    // TODO: 处理图片上传到云存储

    const {
      name,
      description,
      category,
      price,
      stock,
      sku,
      images,
      specifications,
    } = body;

    // 验证必填字段
    if (!name || !category || !price) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 这里应该保存到数据库
    const product = {
      id: Date.now().toString(),
      name,
      description,
      category,
      price,
      stock,
      sku,
      images,
      specifications,
      createdAt: new Date().toISOString(),
      status: 'DRAFT',
    };

    return NextResponse.json({
      success: true,
      product,
      message: '产品创建成功',
    });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: '创建产品失败' },
      { status: 500 }
    );
  }
}

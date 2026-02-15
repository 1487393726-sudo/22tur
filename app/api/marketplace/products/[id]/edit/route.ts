import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * 更新产品信息
 * PUT /api/marketplace/products/[id]/edit
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // 验证产品是否存在
    const equipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // 验证必填字段
    if (!body.name || !body.brand || !body.model) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 更新产品
    const updatedEquipment = await prisma.equipment.update({
      where: { id },
      data: {
        name: body.name,
        brand: body.brand,
        model: body.model,
        description: body.description || equipment.description,
        price: body.price || equipment.price,
        stock: body.stock !== undefined ? body.stock : equipment.stock,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedEquipment,
    });
  } catch (error) {
    console.error('Failed to update product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update product: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * 获取产品详情
 * GET /api/marketplace/products/[id]/edit
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    console.error('Failed to get product:', error);
    return NextResponse.json(
      { error: 'Failed to get product' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketplaceErrorCodes, parseEquipment } from '@/types/marketplace';

// GET - 获取产品详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.equipment.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.PRODUCT_NOT_FOUND, message: '产品不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(parseEquipment(product as never));
  } catch (error) {
    console.error('获取产品详情失败:', error);
    return NextResponse.json({ error: '获取产品详情失败' }, { status: 500 });
  }
}

// PUT - 更新产品
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.equipment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.PRODUCT_NOT_FOUND, message: '产品不存在' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.nameEn !== undefined) updateData.nameEn = body.nameEn;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.descriptionEn !== undefined) updateData.descriptionEn = body.descriptionEn;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.targetSegments !== undefined) updateData.targetSegments = JSON.stringify(body.targetSegments);
    if (body.priceTier !== undefined) updateData.priceTier = body.priceTier;
    if (body.specifications !== undefined) updateData.specifications = JSON.stringify(body.specifications);
    if (body.images !== undefined) updateData.images = JSON.stringify(body.images);
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.model !== undefined) updateData.model = body.model;
    if (body.featured !== undefined) updateData.featured = body.featured;

    const product = await prisma.equipment.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json({
      success: true,
      product: parseEquipment(product as never),
    });
  } catch (error) {
    console.error('更新产品失败:', error);
    return NextResponse.json({ error: '更新产品失败' }, { status: 500 });
  }
}

// DELETE - 删除产品
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.equipment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.PRODUCT_NOT_FOUND, message: '产品不存在' },
        { status: 404 }
      );
    }

    // 检查是否有关联的购物车项或订单项
    const [cartItems, orderItems] = await Promise.all([
      prisma.marketplaceCartItem.count({ where: { equipmentId: id } }),
      prisma.marketplaceOrderItem.count({ where: { equipmentId: id } }),
    ]);

    if (orderItems > 0) {
      // 如果有订单关联，只设置为下架而不删除
      await prisma.equipment.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });
      return NextResponse.json({
        success: true,
        message: '产品已下架（存在关联订单，无法删除）',
      });
    }

    // 删除购物车中的关联项
    if (cartItems > 0) {
      await prisma.marketplaceCartItem.deleteMany({ where: { equipmentId: id } });
    }

    // 删除套餐中的关联项
    await prisma.equipmentBundleItem.deleteMany({ where: { equipmentId: id } });

    // 删除产品
    await prisma.equipment.delete({ where: { id } });

    return NextResponse.json({ success: true, message: '产品已删除' });
  } catch (error) {
    console.error('删除产品失败:', error);
    return NextResponse.json({ error: '删除产品失败' }, { status: 500 });
  }
}

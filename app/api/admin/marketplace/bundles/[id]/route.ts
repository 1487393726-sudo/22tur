import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketplaceErrorCodes, parseBundle, parseEquipment } from '@/types/marketplace';

// GET - 获取套餐详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const bundle = await prisma.equipmentBundle.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            equipment: { include: { category: true } },
          },
        },
      },
    });

    if (!bundle) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.BUNDLE_NOT_FOUND, message: '套餐不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...parseBundle(bundle as never),
      items: bundle.items.map((item) => ({
        ...item,
        equipment: parseEquipment(item.equipment as never),
      })),
    });
  } catch (error) {
    console.error('获取套餐详情失败:', error);
    return NextResponse.json({ error: '获取套餐详情失败' }, { status: 500 });
  }
}

// PUT - 更新套餐
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.equipmentBundle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.BUNDLE_NOT_FOUND, message: '套餐不存在' },
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
    if (body.targetSegment !== undefined) updateData.targetSegment = body.targetSegment;
    if (body.images !== undefined) updateData.images = JSON.stringify(body.images);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.featured !== undefined) updateData.featured = body.featured;

    // 如果更新了套餐项
    if (body.items && Array.isArray(body.items)) {
      // 删除旧的套餐项
      await prisma.equipmentBundleItem.deleteMany({ where: { bundleId: id } });

      // 创建新的套餐项
      await prisma.equipmentBundleItem.createMany({
        data: body.items.map((item: { equipmentId: string; quantity: number }) => ({
          bundleId: id,
          equipmentId: item.equipmentId,
          quantity: item.quantity || 1,
        })),
      });
    }

    const bundle = await prisma.equipmentBundle.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            equipment: { include: { category: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      bundle: {
        ...parseBundle(bundle as never),
        items: bundle.items.map((item) => ({
          ...item,
          equipment: parseEquipment(item.equipment as never),
        })),
      },
    });
  } catch (error) {
    console.error('更新套餐失败:', error);
    return NextResponse.json({ error: '更新套餐失败' }, { status: 500 });
  }
}

// DELETE - 删除套餐
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.equipmentBundle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.BUNDLE_NOT_FOUND, message: '套餐不存在' },
        { status: 404 }
      );
    }

    // 检查是否有关联订单
    const orderItems = await prisma.marketplaceOrderItem.count({ where: { bundleId: id } });
    if (orderItems > 0) {
      await prisma.equipmentBundle.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });
      return NextResponse.json({
        success: true,
        message: '套餐已下架（存在关联订单，无法删除）',
      });
    }

    // 删除购物车中的关联项
    await prisma.marketplaceCartItem.deleteMany({ where: { bundleId: id } });

    // 删除套餐项
    await prisma.equipmentBundleItem.deleteMany({ where: { bundleId: id } });

    // 删除套餐
    await prisma.equipmentBundle.delete({ where: { id } });

    return NextResponse.json({ success: true, message: '套餐已删除' });
  } catch (error) {
    console.error('删除套餐失败:', error);
    return NextResponse.json({ error: '删除套餐失败' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketplaceErrorCodes } from '@/types/marketplace';

// GET - 获取分类详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.equipmentCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { equipment: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.CATEGORY_NOT_FOUND, message: '分类不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('获取分类详情失败:', error);
    return NextResponse.json({ error: '获取分类详情失败' }, { status: 500 });
  }
}

// PUT - 更新分类
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.equipmentCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.CATEGORY_NOT_FOUND, message: '分类不存在' },
        { status: 404 }
      );
    }

    // 如果更新 slug，检查是否已存在
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.equipmentCategory.findUnique({ where: { slug: body.slug } });
      if (slugExists) {
        return NextResponse.json(
          { error: MarketplaceErrorCodes.CATEGORY_SLUG_EXISTS, message: '分类标识已存在' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.nameEn !== undefined) updateData.nameEn = body.nameEn;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const category = await prisma.equipmentCategory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('更新分类失败:', error);
    return NextResponse.json({ error: '更新分类失败' }, { status: 500 });
  }
}

// DELETE - 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.equipmentCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { equipment: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.CATEGORY_NOT_FOUND, message: '分类不存在' },
        { status: 404 }
      );
    }

    // 检查是否有关联产品
    if (existing._count.equipment > 0) {
      return NextResponse.json(
        {
          error: MarketplaceErrorCodes.CATEGORY_HAS_PRODUCTS,
          message: `无法删除：该分类下有 ${existing._count.equipment} 个产品`,
        },
        { status: 400 }
      );
    }

    await prisma.equipmentCategory.delete({ where: { id } });

    return NextResponse.json({ success: true, message: '分类已删除' });
  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json({ error: '删除分类失败' }, { status: 500 });
  }
}

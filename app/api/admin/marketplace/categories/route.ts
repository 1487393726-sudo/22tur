import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketplaceErrorCodes } from '@/types/marketplace';

// GET - 获取分类列表（管理后台）
export async function GET() {
  try {
    const categories = await prisma.equipmentCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { equipment: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return NextResponse.json({ error: '获取分类列表失败' }, { status: 500 });
  }
}

// POST - 创建分类
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameEn, slug, description, icon, order, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.MISSING_REQUIRED_FIELD, message: '名称和标识不能为空' },
        { status: 400 }
      );
    }

    // 检查 slug 是否已存在
    const existing = await prisma.equipmentCategory.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.CATEGORY_SLUG_EXISTS, message: '分类标识已存在' },
        { status: 400 }
      );
    }

    const category = await prisma.equipmentCategory.create({
      data: {
        name,
        nameEn,
        slug,
        description,
        icon,
        order: order || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json({ error: '创建分类失败' }, { status: 500 });
  }
}

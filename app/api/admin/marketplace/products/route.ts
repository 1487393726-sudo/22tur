import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketplaceErrorCodes, parseEquipment } from '@/types/marketplace';

// GET - 获取产品列表（管理后台）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.categoryId = category;

    const [products, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.equipment.count({ where }),
    ]);

    return NextResponse.json({
      data: products.map((p) => parseEquipment(p as never)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('获取产品列表失败:', error);
    return NextResponse.json({ error: '获取产品列表失败' }, { status: 500 });
  }
}

// POST - 创建产品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      nameEn,
      description,
      descriptionEn,
      price,
      originalPrice,
      categoryId,
      targetSegments,
      priceTier,
      specifications,
      images,
      stock,
      status,
      brand,
      model,
      featured,
    } = body;

    // 验证必填字段
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.MISSING_REQUIRED_FIELD, message: '产品名称不能为空' },
        { status: 400 }
      );
    }

    if (price === undefined || price === null || typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.MISSING_REQUIRED_FIELD, message: '价格必须是有效的数字' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.MISSING_REQUIRED_FIELD, message: '请选择产品分类' },
        { status: 400 }
      );
    }

    if (!targetSegments || !Array.isArray(targetSegments) || targetSegments.length === 0) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.MISSING_REQUIRED_FIELD, message: '请选择目标用户群体' },
        { status: 400 }
      );
    }

    // 验证分类是否存在
    const category = await prisma.equipmentCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.CATEGORY_NOT_FOUND, message: '分类不存在' },
        { status: 404 }
      );
    }

    const product = await prisma.equipment.create({
      data: {
        name,
        nameEn,
        description,
        descriptionEn,
        price,
        originalPrice,
        categoryId,
        targetSegments: JSON.stringify(targetSegments),
        priceTier: priceTier || 'MID',
        specifications: specifications ? JSON.stringify(specifications) : null,
        images: images ? JSON.stringify(images) : null,
        stock: stock || 0,
        status: status || 'ACTIVE',
        brand,
        model,
        featured: featured || false,
      },
      include: { category: true },
    });

    return NextResponse.json({
      success: true,
      product: parseEquipment(product as never),
    });
  } catch (error) {
    console.error('创建产品失败:', error);
    return NextResponse.json({ error: '创建产品失败' }, { status: 500 });
  }
}

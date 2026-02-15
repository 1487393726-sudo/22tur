import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketplaceErrorCodes, parseBundle, parseEquipment } from '@/types/marketplace';

// GET - 获取套餐列表（管理后台）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const segment = searchParams.get('segment');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (segment) where.targetSegment = segment;

    const bundles = await prisma.equipmentBundle.findMany({
      where,
      include: {
        items: {
          include: {
            equipment: { include: { category: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsedBundles = bundles.map((bundle) => ({
      ...parseBundle(bundle as never),
      items: bundle.items.map((item) => ({
        ...item,
        equipment: parseEquipment(item.equipment as never),
      })),
    }));

    return NextResponse.json(parsedBundles);
  } catch (error) {
    console.error('获取套餐列表失败:', error);
    return NextResponse.json({ error: '获取套餐列表失败' }, { status: 500 });
  }
}

// POST - 创建套餐
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
      targetSegment,
      images,
      status,
      featured,
      items,
    } = body;

    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.MISSING_REQUIRED_FIELD, message: '套餐名称不能为空' },
        { status: 400 }
      );
    }

    if (price === undefined || price === null) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.MISSING_REQUIRED_FIELD, message: '套餐价格不能为空' },
        { status: 400 }
      );
    }

    if (!targetSegment) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.MISSING_REQUIRED_FIELD, message: '请选择目标用户群体' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.MISSING_REQUIRED_FIELD, message: '套餐必须包含至少一个设备' },
        { status: 400 }
      );
    }

    // 计算原价（如果未提供）
    let calculatedOriginalPrice = originalPrice;
    if (!calculatedOriginalPrice) {
      const equipmentIds = items.map((item: { equipmentId: string }) => item.equipmentId);
      const equipments = await prisma.equipment.findMany({
        where: { id: { in: equipmentIds } },
      });

      calculatedOriginalPrice = items.reduce((sum: number, item: { equipmentId: string; quantity: number }) => {
        const equipment = equipments.find((e) => e.id === item.equipmentId);
        return sum + (equipment?.price || 0) * (item.quantity || 1);
      }, 0);
    }

    const bundle = await prisma.equipmentBundle.create({
      data: {
        name,
        nameEn,
        description,
        descriptionEn,
        price,
        originalPrice: calculatedOriginalPrice,
        targetSegment,
        images: images ? JSON.stringify(images) : null,
        status: status || 'ACTIVE',
        featured: featured || false,
        items: {
          create: items.map((item: { equipmentId: string; quantity: number }) => ({
            equipmentId: item.equipmentId,
            quantity: item.quantity || 1,
          })),
        },
      },
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
    console.error('创建套餐失败:', error);
    return NextResponse.json({ error: '创建套餐失败' }, { status: 500 });
  }
}

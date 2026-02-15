import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseEquipment, type PaginatedResponse, type Equipment } from '@/types/marketplace';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析筛选参数
    const segment = searchParams.get('segment');
    const category = searchParams.get('category');
    const priceTier = searchParams.get('priceTier');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);

    // 构建查询条件
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    };

    // 分类筛选
    if (category) {
      where.category = {
        slug: category,
      };
    }

    // 价格档次筛选
    if (priceTier) {
      where.priceTier = priceTier;
    }

    // 精选筛选
    if (featured === 'true') {
      where.featured = true;
    }

    // 获取总数
    const total = await prisma.equipment.count({ where });

    // 获取产品列表
    const products = await prisma.equipment.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 解析并筛选用户群体
    let parsedProducts = products.map((p) => parseEquipment(p as never));

    // 用户群体筛选（需要在内存中进行，因为是JSON字段）
    if (segment) {
      parsedProducts = parsedProducts.filter((p) =>
        p.targetSegments.includes(segment as never)
      );
    }

    const response: PaginatedResponse<Equipment> = {
      data: parsedProducts,
      total: segment ? parsedProducts.length : total,
      page,
      pageSize,
      totalPages: Math.ceil((segment ? parsedProducts.length : total) / pageSize),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取产品列表失败:', error);
    return NextResponse.json(
      { error: '获取产品列表失败' },
      { status: 500 }
    );
  }
}

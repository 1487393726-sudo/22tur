import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseEquipment, type SearchSuggestion } from '@/types/marketplace';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const suggestions = searchParams.get('suggestions') === 'true';

    if (!query.trim()) {
      return NextResponse.json(suggestions ? [] : { data: [], total: 0 });
    }

    const searchTerm = query.toLowerCase();

    // 搜索产品
    const products = await prisma.equipment.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { name: { contains: searchTerm } },
          { nameEn: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { descriptionEn: { contains: searchTerm } },
          { brand: { contains: searchTerm } },
          { model: { contains: searchTerm } },
        ],
      },
      include: {
        category: true,
      },
      take: limit,
    });

    // 如果是自动补全建议请求
    if (suggestions) {
      // 搜索分类
      const categories = await prisma.equipmentCategory.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: searchTerm } },
            { nameEn: { contains: searchTerm } },
          ],
        },
        take: 3,
      });

      // 搜索套餐
      const bundles = await prisma.equipmentBundle.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: searchTerm } },
            { nameEn: { contains: searchTerm } },
            { description: { contains: searchTerm } },
          ],
        },
        take: 3,
      });

      const suggestionResults: SearchSuggestion[] = [
        ...categories.map((cat) => ({
          type: 'category' as const,
          id: cat.id,
          name: cat.name,
          image: cat.icon || undefined,
        })),
        ...products.slice(0, 5).map((p) => {
          const images = p.images ? JSON.parse(p.images) : [];
          return {
            type: 'product' as const,
            id: p.id,
            name: p.name,
            image: images[0] || undefined,
          };
        }),
        ...bundles.map((b) => {
          const images = b.images ? JSON.parse(b.images) : [];
          return {
            type: 'bundle' as const,
            id: b.id,
            name: b.name,
            image: images[0] || undefined,
          };
        }),
      ];

      return NextResponse.json(suggestionResults);
    }

    // 解析产品数据
    const parsedProducts = products.map((p) => parseEquipment(p as never));

    // 在规格参数中搜索（内存中过滤）
    const filteredProducts = parsedProducts.filter((p) => {
      // 已经通过数据库查询匹配的
      if (
        p.name.toLowerCase().includes(searchTerm) ||
        p.nameEn?.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm) ||
        p.brand?.toLowerCase().includes(searchTerm)
      ) {
        return true;
      }

      // 检查规格参数
      if (p.specifications) {
        const specValues = Object.values(p.specifications);
        return specValues.some((v) => v.toLowerCase().includes(searchTerm));
      }

      return false;
    });

    return NextResponse.json({
      data: filteredProducts,
      total: filteredProducts.length,
      query,
    });
  } catch (error) {
    console.error('搜索产品失败:', error);
    return NextResponse.json({ error: '搜索产品失败' }, { status: 500 });
  }
}

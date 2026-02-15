import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/miniprogram/partners/[id] - 获取合作伙伴详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        cases: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            description: true,
            image: true
          },
          orderBy: { sort: 'asc' }
        }
      }
    });

    if (!partner) {
      return NextResponse.json(
        { success: false, error: '合作伙伴不存在' },
        { status: 404 }
      );
    }

    if (!partner.isActive) {
      return NextResponse.json(
        { success: false, error: '合作伙伴已下架' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      id: partner.id,
      name: partner.name,
      logo: partner.logo,
      categoryId: partner.categoryId,
      categoryName: partner.category?.name || '',
      description: partner.description,
      cooperation: partner.cooperation,
      website: partner.website,
      phone: partner.phone,
      email: partner.email,
      address: partner.address,
      cases: partner.cases
    });
  } catch (error) {
    console.error('获取合作伙伴详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取详情失败' },
      { status: 500 }
    );
  }
}

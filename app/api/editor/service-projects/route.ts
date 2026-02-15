import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - 获取活跃的服务项目（公开API）
export async function GET() {
  try {
    const items = await prisma.serviceProject.findMany({
      where: {
        isActive: true,
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        nameEn: true,
        description: true,
        descriptionEn: true,
        startingPrice: true,
        iconName: true,
        categoryTag: true,
        order: true,
      },
    });

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error('获取服务项目失败:', error);
    return NextResponse.json({ error: '获取服务项目失败' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - 获取相关案例
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;

    // 获取当前案例
    const currentCase = await prisma.case.findUnique({
      where: { id }
    });

    if (!currentCase) {
      return NextResponse.json({ items: [] });
    }

    // 获取同分类的其他案例
    const relatedCases = await prisma.case.findMany({
      where: {
        categoryId: currentCase.categoryId,
        id: { not: id },
        status: 'published',
        deletedAt: null
      },
      orderBy: { viewCount: 'desc' },
      take: 6
    });

    const items = relatedCases.map(c => ({
      id: c.id,
      title: c.title,
      coverImage: c.coverImage
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('获取相关案例失败:', error);
    return NextResponse.json({ error: '获取相关案例失败' }, { status: 500 });
  }
}

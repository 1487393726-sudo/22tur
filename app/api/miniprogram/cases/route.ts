import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

// GET - 获取案例列表
export async function GET(request: NextRequest) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const keyword = searchParams.get('keyword');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const where: any = { 
      status: 'published',
      deletedAt: null
    };
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } }
      ];
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          category: true
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.case.count({ where })
    ]);

    const items = cases.map(c => ({
      id: c.id,
      title: c.title,
      coverImage: c.coverImage,
      categoryId: c.categoryId,
      categoryName: c.category?.name || '',
      viewCount: c.viewCount,
      likeCount: c.likeCount
    }));

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('获取案例列表失败:', error);
    return NextResponse.json({ error: '获取案例列表失败' }, { status: 500 });
  }
}

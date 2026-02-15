// 项目列表 API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取项目列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (status && status !== '') {
      where.status = status;
    }

    if (priority && priority !== '') {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { client: { name: { contains: search } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          client: true,
          department: true,
          _count: {
            select: { members: true, tasks: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

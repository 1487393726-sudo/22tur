import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { featuredWorkSchema } from '@/lib/editor/validation';
import { z } from 'zod';

// GET - 获取精选作品列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const where: Record<string, unknown> = {};
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    if (category && category !== 'all') {
      where.category = category;
    }
    if (featured !== null) {
      where.featured = featured === 'true';
    }

    const items = await prisma.featuredWork.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
      ],
    });

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error('获取精选作品失败:', error);
    return NextResponse.json({ error: '获取精选作品失败' }, { status: 500 });
  }
}

// POST - 创建精选作品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = featuredWorkSchema.parse(body);

    // 检查 slug 是否已存在
    const existing = await prisma.featuredWork.findUnique({
      where: { slug: validatedData.slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'slug已存在，请使用其他slug' },
        { status: 409 }
      );
    }

    const item = await prisma.featuredWork.create({
      data: validatedData,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    console.error('创建精选作品失败:', error);
    return NextResponse.json({ error: '创建精选作品失败' }, { status: 500 });
  }
}

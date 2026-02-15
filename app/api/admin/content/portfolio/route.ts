import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 作品集验证 Schema
const portfolioItemSchema = z.object({
  title: z.string().min(1, '中文标题不能为空'),
  titleEn: z.string().min(1, '英文标题不能为空'),
  slug: z.string().min(1, 'URL slug不能为空'),
  description: z.string().min(1, '中文描述不能为空'),
  descriptionEn: z.string().min(1, '英文描述不能为空'),
  image: z.string().min(1, '封面图片不能为空'),
  category: z.string().min(1, '分类不能为空'),
  tags: z.string().min(1, '标签不能为空'), // JSON string
  client: z.string().optional(),
  link: z.string().optional(),
  featured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  order: z.number().optional().default(0),
});

// GET - 获取作品集列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (featured !== null) where.featured = featured === 'true';
    if (isActive !== null) where.isActive = isActive === 'true';

    const items = await prisma.portfolioItem.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    });

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error('获取作品集失败:', error);
    return NextResponse.json({ error: '获取作品集失败' }, { status: 500 });
  }
}

// POST - 创建作品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = portfolioItemSchema.parse(body);

    const item = await prisma.portfolioItem.create({
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
    console.error('创建作品失败:', error);
    return NextResponse.json({ error: '创建作品失败' }, { status: 500 });
  }
}

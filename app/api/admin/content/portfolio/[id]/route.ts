import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const portfolioItemUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  titleEn: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  descriptionEn: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  tags: z.string().optional(),
  client: z.string().optional(),
  link: z.string().optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});

// GET - 获取单个作品
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.portfolioItem.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: '作品不存在' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('获取作品失败:', error);
    return NextResponse.json({ error: '获取作品失败' }, { status: 500 });
  }
}

// PUT - 更新作品
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = portfolioItemUpdateSchema.parse(body);

    const item = await prisma.portfolioItem.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    console.error('更新作品失败:', error);
    return NextResponse.json({ error: '更新作品失败' }, { status: 500 });
  }
}

// DELETE - 删除作品
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.portfolioItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除作品失败:', error);
    return NextResponse.json({ error: '删除作品失败' }, { status: 500 });
  }
}

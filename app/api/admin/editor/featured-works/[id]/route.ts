import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const featuredWorkUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  titleEn: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().min(1).optional(),
  descriptionEn: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  images: z.string().optional(),
  author: z.string().min(1).optional(),
  teamName: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  tags: z.string().optional(),
  viewCount: z.number().int().min(0).optional(),
  likeCount: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

// GET - 获取单个精选作品
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.featuredWork.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: '精选作品不存在' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('获取精选作品失败:', error);
    return NextResponse.json({ error: '获取精选作品失败' }, { status: 500 });
  }
}

// PUT - 更新精选作品
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = featuredWorkUpdateSchema.parse(body);

    // 如果更新 slug，检查是否与其他记录冲突
    if (validatedData.slug) {
      const existing = await prisma.featuredWork.findFirst({
        where: {
          slug: validatedData.slug,
          NOT: { id },
        },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'slug已存在，请使用其他slug' },
          { status: 409 }
        );
      }
    }

    const item = await prisma.featuredWork.update({
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
    console.error('更新精选作品失败:', error);
    return NextResponse.json({ error: '更新精选作品失败' }, { status: 500 });
  }
}

// DELETE - 删除精选作品
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.featuredWork.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除精选作品失败:', error);
    return NextResponse.json({ error: '删除精选作品失败' }, { status: 500 });
  }
}

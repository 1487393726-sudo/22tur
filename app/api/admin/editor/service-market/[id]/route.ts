import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const serviceMarketItemUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  descriptionEn: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  category: z.string().min(1).optional(),
  iconType: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// GET - 获取单个服务市场项目
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.serviceMarketItem.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: '服务市场项目不存在' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('获取服务市场项目失败:', error);
    return NextResponse.json({ error: '获取服务市场项目失败' }, { status: 500 });
  }
}

// PUT - 更新服务市场项目
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = serviceMarketItemUpdateSchema.parse(body);

    const item = await prisma.serviceMarketItem.update({
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
    console.error('更新服务市场项目失败:', error);
    return NextResponse.json({ error: '更新服务市场项目失败' }, { status: 500 });
  }
}

// DELETE - 删除服务市场项目
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.serviceMarketItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除服务市场项目失败:', error);
    return NextResponse.json({ error: '删除服务市场项目失败' }, { status: 500 });
  }
}

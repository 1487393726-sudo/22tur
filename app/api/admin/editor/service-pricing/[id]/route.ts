import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const servicePricingUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  descriptionEn: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  originalPrice: z.number().min(0).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  features: z.string().optional(),
  featuresEn: z.string().optional(),
  category: z.string().min(1).optional(),
  recommended: z.boolean().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

// GET - 获取单个服务定价
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.servicePricing.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: '服务定价不存在' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('获取服务定价失败:', error);
    return NextResponse.json({ error: '获取服务定价失败' }, { status: 500 });
  }
}

// PUT - 更新服务定价
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = servicePricingUpdateSchema.parse(body);

    const item = await prisma.servicePricing.update({
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
    console.error('更新服务定价失败:', error);
    return NextResponse.json({ error: '更新服务定价失败' }, { status: 500 });
  }
}

// DELETE - 删除服务定价
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.servicePricing.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除服务定价失败:', error);
    return NextResponse.json({ error: '删除服务定价失败' }, { status: 500 });
  }
}

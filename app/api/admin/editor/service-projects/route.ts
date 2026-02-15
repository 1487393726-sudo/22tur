import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serviceProjectSchema } from '@/lib/editor/validation';
import { z } from 'zod';

// GET - 获取服务项目列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const items = await prisma.serviceProject.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error('获取服务项目失败:', error);
    return NextResponse.json({ error: '获取服务项目失败' }, { status: 500 });
  }
}

// POST - 创建服务项目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = serviceProjectSchema.parse(body);

    const item = await prisma.serviceProject.create({
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
    console.error('创建服务项目失败:', error);
    return NextResponse.json({ error: '创建服务项目失败' }, { status: 500 });
  }
}

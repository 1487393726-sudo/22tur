import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reorderSchema, handleValidationError } from '@/lib/content/validation';
import { z } from 'zod';

// PATCH - 批量更新作品集排序
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = reorderSchema.parse(body);

    // 使用事务批量更新排序
    await prisma.$transaction(
      validatedData.items.map(item =>
        prisma.portfolioItem.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    // 返回更新后的列表
    const items = await prisma.portfolioItem.findMany({
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    });

    return NextResponse.json({ 
      success: true, 
      items,
      message: '排序已更新' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: handleValidationError(error) },
        { status: 400 }
      );
    }
    console.error('更新作品集排序失败:', error);
    return NextResponse.json({ error: '更新排序失败' }, { status: 500 });
  }
}

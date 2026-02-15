import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    order: z.number().int().min(0),
  })),
});

// PATCH - 批量更新服务项目排序
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = reorderSchema.parse(body);

    // 使用事务批量更新
    await prisma.$transaction(
      items.map(item =>
        prisma.serviceProject.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    console.error('更新排序失败:', error);
    return NextResponse.json({ error: '更新排序失败' }, { status: 500 });
  }
}

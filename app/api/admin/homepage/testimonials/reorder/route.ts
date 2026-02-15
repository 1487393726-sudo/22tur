import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reorderSchema, formatValidationErrors } from '@/lib/homepage/validation';
import type { HomepageApiResponse, Testimonial } from '@/types/homepage';

// PATCH - 批量更新排序
export async function PATCH(request: NextRequest): Promise<NextResponse<HomepageApiResponse<Testimonial[]>>> {
  try {
    const body = await request.json();
    
    // 验证输入
    const validation = reorderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: '验证失败', ...formatValidationErrors(validation.error) },
        { status: 400 }
      );
    }

    const { items } = validation.data;

    // 使用事务批量更新
    await prisma.$transaction(
      items.map(item =>
        prisma.homepageTestimonial.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    // 返回更新后的列表
    const testimonials = await prisma.homepageTestimonial.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    console.error('Failed to reorder testimonials:', error);
    return NextResponse.json(
      { success: false, error: '更新排序失败' },
      { status: 500 }
    );
  }
}

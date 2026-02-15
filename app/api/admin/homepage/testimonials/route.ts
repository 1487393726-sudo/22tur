import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { testimonialSchema, formatValidationErrors } from '@/lib/homepage/validation';
import { getNextOrder } from '@/lib/homepage/utils';
import type { HomepageApiResponse, Testimonial } from '@/types/homepage';

// GET - 获取所有客户评价
export async function GET(): Promise<NextResponse<HomepageApiResponse<Testimonial[]>>> {
  try {
    const testimonials = await prisma.homepageTestimonial.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    return NextResponse.json(
      { success: false, error: '获取客户评价失败' },
      { status: 500 }
    );
  }
}

// POST - 创建新客户评价
export async function POST(request: NextRequest): Promise<NextResponse<HomepageApiResponse<Testimonial>>> {
  try {
    const body = await request.json();
    
    // 验证输入
    const validation = testimonialSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: '验证失败', ...formatValidationErrors(validation.error) },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 获取下一个order值
    const existingItems = await prisma.homepageTestimonial.findMany({
      select: { order: true },
    });
    const nextOrder = getNextOrder(existingItems);

    const testimonial = await prisma.homepageTestimonial.create({
      data: {
        name: data.name,
        nameEn: data.nameEn ?? null,
        avatar: data.avatar ?? null,
        company: data.company ?? null,
        companyEn: data.companyEn ?? null,
        position: data.position ?? null,
        positionEn: data.positionEn ?? null,
        content: data.content,
        contentEn: data.contentEn,
        rating: data.rating ?? 5,
        order: data.order ?? nextOrder,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    console.error('Failed to create testimonial:', error);
    return NextResponse.json(
      { success: false, error: '创建客户评价失败' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { testimonialSchema, formatValidationErrors } from '@/lib/homepage/validation';
import type { HomepageApiResponse, Testimonial } from '@/types/homepage';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - 获取单个客户评价
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<HomepageApiResponse<Testimonial | null>>> {
  try {
    const { id } = await params;
    
    const testimonial = await prisma.homepageTestimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return NextResponse.json(
        { success: false, error: '客户评价不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    console.error('Failed to fetch testimonial:', error);
    return NextResponse.json(
      { success: false, error: '获取客户评价失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新客户评价
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<HomepageApiResponse<Testimonial>>> {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // 验证输入
    const validation = testimonialSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: '验证失败', ...formatValidationErrors(validation.error) },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 检查记录是否存在
    const existing = await prisma.homepageTestimonial.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '客户评价不存在' },
        { status: 404 }
      );
    }

    const testimonial = await prisma.homepageTestimonial.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.companyEn !== undefined && { companyEn: data.companyEn }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.positionEn !== undefined && { positionEn: data.positionEn }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.contentEn !== undefined && { contentEn: data.contentEn }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    console.error('Failed to update testimonial:', error);
    return NextResponse.json(
      { success: false, error: '更新客户评价失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除客户评价
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<HomepageApiResponse<{ deleted: boolean }>>> {
  try {
    const { id } = await params;

    // 检查记录是否存在
    const existing = await prisma.homepageTestimonial.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '客户评价不存在' },
        { status: 404 }
      );
    }

    await prisma.homepageTestimonial.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Failed to delete testimonial:', error);
    return NextResponse.json(
      { success: false, error: '删除客户评价失败' },
      { status: 500 }
    );
  }
}

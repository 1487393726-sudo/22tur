import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ctaSchema, formatValidationErrors } from '@/lib/homepage/validation';
import type { HomepageApiResponse, CTASection } from '@/types/homepage';

// GET - 获取CTA区块内容
export async function GET(): Promise<NextResponse<HomepageApiResponse<CTASection | null>>> {
  try {
    const cta = await prisma.homepageCTA.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: cta,
    });
  } catch (error) {
    console.error('Failed to fetch CTA section:', error);
    return NextResponse.json(
      { success: false, error: '获取CTA区块失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新CTA区块内容
export async function PUT(request: NextRequest): Promise<NextResponse<HomepageApiResponse<CTASection>>> {
  try {
    const body = await request.json();
    
    // 验证输入
    const validation = ctaSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: '验证失败', ...formatValidationErrors(validation.error) },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 查找现有记录
    const existing = await prisma.homepageCTA.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let cta;
    if (existing) {
      cta = await prisma.homepageCTA.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          titleEn: data.titleEn,
          description: data.description ?? null,
          descriptionEn: data.descriptionEn ?? null,
          primaryBtnText: data.primaryBtnText,
          primaryBtnTextEn: data.primaryBtnTextEn,
          primaryBtnLink: data.primaryBtnLink,
          primaryBtnVariant: data.primaryBtnVariant ?? 'primary',
          secondaryBtnText: data.secondaryBtnText ?? null,
          secondaryBtnTextEn: data.secondaryBtnTextEn ?? null,
          secondaryBtnLink: data.secondaryBtnLink ?? null,
          secondaryBtnVariant: data.secondaryBtnVariant ?? null,
          isActive: data.isActive ?? true,
        },
      });
    } else {
      cta = await prisma.homepageCTA.create({
        data: {
          title: data.title,
          titleEn: data.titleEn,
          description: data.description ?? null,
          descriptionEn: data.descriptionEn ?? null,
          primaryBtnText: data.primaryBtnText,
          primaryBtnTextEn: data.primaryBtnTextEn,
          primaryBtnLink: data.primaryBtnLink,
          primaryBtnVariant: data.primaryBtnVariant ?? 'primary',
          secondaryBtnText: data.secondaryBtnText ?? null,
          secondaryBtnTextEn: data.secondaryBtnTextEn ?? null,
          secondaryBtnLink: data.secondaryBtnLink ?? null,
          secondaryBtnVariant: data.secondaryBtnVariant ?? null,
          isActive: data.isActive ?? true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: cta,
    });
  } catch (error) {
    console.error('Failed to update CTA section:', error);
    return NextResponse.json(
      { success: false, error: '更新CTA区块失败' },
      { status: 500 }
    );
  }
}

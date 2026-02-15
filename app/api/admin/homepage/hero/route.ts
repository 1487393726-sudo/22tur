import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { heroSchema, formatValidationErrors } from '@/lib/homepage/validation';
import type { HomepageApiResponse, HeroSection } from '@/types/homepage';

// GET - 获取Hero区块内容
export async function GET(): Promise<NextResponse<HomepageApiResponse<HeroSection | null>>> {
  try {
    const hero = await prisma.homepageHero.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: hero,
    });
  } catch (error) {
    console.error('Failed to fetch hero section:', error);
    return NextResponse.json(
      { success: false, error: '获取Hero区块失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新Hero区块内容
export async function PUT(request: NextRequest): Promise<NextResponse<HomepageApiResponse<HeroSection>>> {
  try {
    const body = await request.json();
    
    // 验证输入
    const validation = heroSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: '验证失败', ...formatValidationErrors(validation.error) },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 查找现有记录
    const existing = await prisma.homepageHero.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let hero;
    if (existing) {
      // 更新现有记录
      hero = await prisma.homepageHero.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          titleEn: data.titleEn,
          subtitle: data.subtitle,
          subtitleEn: data.subtitleEn,
          backgroundImage: data.backgroundImage ?? null,
          ctaText: data.ctaText,
          ctaTextEn: data.ctaTextEn,
          ctaLink: data.ctaLink,
          ctaSecondaryText: data.ctaSecondaryText ?? null,
          ctaSecondaryTextEn: data.ctaSecondaryTextEn ?? null,
          ctaSecondaryLink: data.ctaSecondaryLink ?? null,
          isActive: data.isActive ?? true,
        },
      });
    } else {
      // 创建新记录
      hero = await prisma.homepageHero.create({
        data: {
          title: data.title,
          titleEn: data.titleEn,
          subtitle: data.subtitle,
          subtitleEn: data.subtitleEn,
          backgroundImage: data.backgroundImage ?? null,
          ctaText: data.ctaText,
          ctaTextEn: data.ctaTextEn,
          ctaLink: data.ctaLink,
          ctaSecondaryText: data.ctaSecondaryText ?? null,
          ctaSecondaryTextEn: data.ctaSecondaryTextEn ?? null,
          ctaSecondaryLink: data.ctaSecondaryLink ?? null,
          isActive: data.isActive ?? true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: hero,
    });
  } catch (error) {
    console.error('Failed to update hero section:', error);
    return NextResponse.json(
      { success: false, error: '更新Hero区块失败' },
      { status: 500 }
    );
  }
}

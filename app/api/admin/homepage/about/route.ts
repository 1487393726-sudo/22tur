import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aboutSchema, formatValidationErrors } from '@/lib/homepage/validation';
import type { HomepageApiResponse, AboutSection } from '@/types/homepage';

// GET - 获取关于我们区块内容
export async function GET(): Promise<NextResponse<HomepageApiResponse<AboutSection | null>>> {
  try {
    const about = await prisma.homepageAbout.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        stats: { orderBy: { order: 'asc' } },
        features: { orderBy: { order: 'asc' } },
      },
    });

    return NextResponse.json({
      success: true,
      data: about,
    });
  } catch (error) {
    console.error('Failed to fetch about section:', error);
    return NextResponse.json(
      { success: false, error: '获取关于我们区块失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新关于我们区块内容
export async function PUT(request: NextRequest): Promise<NextResponse<HomepageApiResponse<AboutSection>>> {
  try {
    const body = await request.json();
    
    // 验证输入
    const validation = aboutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: '验证失败', ...formatValidationErrors(validation.error) },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 查找现有记录
    const existing = await prisma.homepageAbout.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let about;
    if (existing) {
      // 使用事务更新
      about = await prisma.$transaction(async (tx) => {
        // 删除旧的stats和features
        await tx.homepageAboutStat.deleteMany({ where: { aboutId: existing.id } });
        await tx.homepageAboutFeature.deleteMany({ where: { aboutId: existing.id } });

        // 更新主记录并创建新的子记录
        return tx.homepageAbout.update({
          where: { id: existing.id },
          data: {
            title: data.title,
            titleEn: data.titleEn,
            description: data.description,
            descriptionEn: data.descriptionEn,
            image: data.image ?? null,
            isActive: data.isActive ?? true,
            stats: data.stats ? {
              create: data.stats.map((stat, index) => ({
                label: stat.label,
                labelEn: stat.labelEn,
                value: stat.value,
                icon: stat.icon ?? null,
                order: stat.order ?? index,
              })),
            } : undefined,
            features: data.features ? {
              create: data.features.map((feature, index) => ({
                title: feature.title,
                titleEn: feature.titleEn,
                description: feature.description ?? null,
                descriptionEn: feature.descriptionEn ?? null,
                icon: feature.icon ?? null,
                order: feature.order ?? index,
              })),
            } : undefined,
          },
          include: {
            stats: { orderBy: { order: 'asc' } },
            features: { orderBy: { order: 'asc' } },
          },
        });
      });
    } else {
      // 创建新记录
      about = await prisma.homepageAbout.create({
        data: {
          title: data.title,
          titleEn: data.titleEn,
          description: data.description,
          descriptionEn: data.descriptionEn,
          image: data.image ?? null,
          isActive: data.isActive ?? true,
          stats: data.stats ? {
            create: data.stats.map((stat, index) => ({
              label: stat.label,
              labelEn: stat.labelEn,
              value: stat.value,
              icon: stat.icon ?? null,
              order: stat.order ?? index,
            })),
          } : undefined,
          features: data.features ? {
            create: data.features.map((feature, index) => ({
              title: feature.title,
              titleEn: feature.titleEn,
              description: feature.description ?? null,
              descriptionEn: feature.descriptionEn ?? null,
              icon: feature.icon ?? null,
              order: feature.order ?? index,
            })),
          } : undefined,
        },
        include: {
          stats: { orderBy: { order: 'asc' } },
          features: { orderBy: { order: 'asc' } },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: about,
    });
  } catch (error) {
    console.error('Failed to update about section:', error);
    return NextResponse.json(
      { success: false, error: '更新关于我们区块失败' },
      { status: 500 }
    );
  }
}

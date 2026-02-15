import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { footerSchema, formatValidationErrors } from '@/lib/homepage/validation';
import type { HomepageApiResponse, FooterConfig } from '@/types/homepage';

// GET - 获取页脚配置
export async function GET(): Promise<NextResponse<HomepageApiResponse<FooterConfig | null>>> {
  try {
    const footer = await prisma.homepageFooter.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            links: { orderBy: { order: 'asc' } },
          },
        },
        socialLinks: { orderBy: { order: 'asc' } },
      },
    });

    return NextResponse.json({
      success: true,
      data: footer,
    });
  } catch (error) {
    console.error('Failed to fetch footer config:', error);
    return NextResponse.json(
      { success: false, error: '获取页脚配置失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新页脚配置
export async function PUT(request: NextRequest): Promise<NextResponse<HomepageApiResponse<FooterConfig>>> {
  try {
    const body = await request.json();
    
    // 验证输入
    const validation = footerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: '验证失败', ...formatValidationErrors(validation.error) },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 查找现有记录
    const existing = await prisma.homepageFooter.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let footer;
    if (existing) {
      // 使用事务更新
      footer = await prisma.$transaction(async (tx) => {
        // 删除旧的sections和socialLinks
        await tx.homepageFooterLink.deleteMany({
          where: { section: { footerId: existing.id } },
        });
        await tx.homepageFooterSection.deleteMany({ where: { footerId: existing.id } });
        await tx.homepageFooterSocial.deleteMany({ where: { footerId: existing.id } });

        // 更新主记录
        const updatedFooter = await tx.homepageFooter.update({
          where: { id: existing.id },
          data: {
            copyrightText: data.copyrightText ?? null,
            copyrightTextEn: data.copyrightTextEn ?? null,
            isActive: data.isActive ?? true,
          },
        });

        // 创建新的sections和links
        if (data.sections) {
          for (let i = 0; i < data.sections.length; i++) {
            const section = data.sections[i];
            await tx.homepageFooterSection.create({
              data: {
                footerId: existing.id,
                title: section.title,
                titleEn: section.titleEn,
                order: section.order ?? i,
                links: section.links ? {
                  create: section.links.map((link, j) => ({
                    label: link.label,
                    labelEn: link.labelEn,
                    url: link.url,
                    order: link.order ?? j,
                  })),
                } : undefined,
              },
            });
          }
        }

        // 创建新的socialLinks
        if (data.socialLinks) {
          await tx.homepageFooterSocial.createMany({
            data: data.socialLinks.map((link, index) => ({
              footerId: existing.id,
              platform: link.platform,
              url: link.url,
              icon: link.icon ?? null,
              order: link.order ?? index,
            })),
          });
        }

        // 返回完整数据
        return tx.homepageFooter.findUnique({
          where: { id: existing.id },
          include: {
            sections: {
              orderBy: { order: 'asc' },
              include: {
                links: { orderBy: { order: 'asc' } },
              },
            },
            socialLinks: { orderBy: { order: 'asc' } },
          },
        });
      });
    } else {
      // 创建新记录
      footer = await prisma.homepageFooter.create({
        data: {
          copyrightText: data.copyrightText ?? null,
          copyrightTextEn: data.copyrightTextEn ?? null,
          isActive: data.isActive ?? true,
        },
      });

      // 创建sections和links
      if (data.sections) {
        for (let i = 0; i < data.sections.length; i++) {
          const section = data.sections[i];
          await prisma.homepageFooterSection.create({
            data: {
              footerId: footer.id,
              title: section.title,
              titleEn: section.titleEn,
              order: section.order ?? i,
              links: section.links ? {
                create: section.links.map((link, j) => ({
                  label: link.label,
                  labelEn: link.labelEn,
                  url: link.url,
                  order: link.order ?? j,
                })),
              } : undefined,
            },
          });
        }
      }

      // 创建socialLinks
      if (data.socialLinks) {
        await prisma.homepageFooterSocial.createMany({
          data: data.socialLinks.map((link, index) => ({
            footerId: footer.id,
            platform: link.platform,
            url: link.url,
            icon: link.icon ?? null,
            order: link.order ?? index,
          })),
        });
      }

      // 重新获取完整数据
      footer = await prisma.homepageFooter.findUnique({
        where: { id: footer.id },
        include: {
          sections: {
            orderBy: { order: 'asc' },
            include: {
              links: { orderBy: { order: 'asc' } },
            },
          },
          socialLinks: { orderBy: { order: 'asc' } },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: footer,
    });
  } catch (error) {
    console.error('Failed to update footer config:', error);
    return NextResponse.json(
      { success: false, error: '更新页脚配置失败' },
      { status: 500 }
    );
  }
}

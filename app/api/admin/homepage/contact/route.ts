import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contactSchema, formatValidationErrors } from '@/lib/homepage/validation';
import type { HomepageApiResponse, ContactSection } from '@/types/homepage';

// GET - 获取联系方式区块内容
export async function GET(): Promise<NextResponse<HomepageApiResponse<ContactSection | null>>> {
  try {
    const contact = await prisma.homepageContact.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        socialLinks: { orderBy: { order: 'asc' } },
      },
    });

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Failed to fetch contact section:', error);
    return NextResponse.json(
      { success: false, error: '获取联系方式区块失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新联系方式区块内容
export async function PUT(request: NextRequest): Promise<NextResponse<HomepageApiResponse<ContactSection>>> {
  try {
    const body = await request.json();
    
    // 验证输入
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: '验证失败', ...formatValidationErrors(validation.error) },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 查找现有记录
    const existing = await prisma.homepageContact.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let contact;
    if (existing) {
      // 使用事务更新
      contact = await prisma.$transaction(async (tx) => {
        // 删除旧的社交链接
        await tx.homepageContactSocial.deleteMany({ where: { contactId: existing.id } });

        // 更新主记录并创建新的社交链接
        return tx.homepageContact.update({
          where: { id: existing.id },
          data: {
            address: data.address ?? null,
            addressEn: data.addressEn ?? null,
            phone: data.phone ?? null,
            email: data.email ?? null,
            mapEmbedUrl: data.mapEmbedUrl ?? null,
            workingHours: data.workingHours ?? null,
            workingHoursEn: data.workingHoursEn ?? null,
            isActive: data.isActive ?? true,
            socialLinks: data.socialLinks ? {
              create: data.socialLinks.map((link, index) => ({
                platform: link.platform,
                url: link.url,
                icon: link.icon ?? null,
                order: link.order ?? index,
              })),
            } : undefined,
          },
          include: {
            socialLinks: { orderBy: { order: 'asc' } },
          },
        });
      });
    } else {
      // 创建新记录
      contact = await prisma.homepageContact.create({
        data: {
          address: data.address ?? null,
          addressEn: data.addressEn ?? null,
          phone: data.phone ?? null,
          email: data.email ?? null,
          mapEmbedUrl: data.mapEmbedUrl ?? null,
          workingHours: data.workingHours ?? null,
          workingHoursEn: data.workingHoursEn ?? null,
          isActive: data.isActive ?? true,
          socialLinks: data.socialLinks ? {
            create: data.socialLinks.map((link, index) => ({
              platform: link.platform,
              url: link.url,
              icon: link.icon ?? null,
              order: link.order ?? index,
            })),
          } : undefined,
        },
        include: {
          socialLinks: { orderBy: { order: 'asc' } },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Failed to update contact section:', error);
    return NextResponse.json(
      { success: false, error: '更新联系方式区块失败' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { navbarSchema, formatValidationErrors } from '@/lib/homepage/validation';
import type { HomepageApiResponse, NavbarConfig } from '@/types/homepage';

// GET - 获取导航栏配置
export async function GET(): Promise<NextResponse<HomepageApiResponse<NavbarConfig | null>>> {
  try {
    const navbar = await prisma.homepageNavbar.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        menuItems: { orderBy: { order: 'asc' } },
        socialLinks: { orderBy: { order: 'asc' } },
      },
    });

    return NextResponse.json({
      success: true,
      data: navbar,
    });
  } catch (error) {
    console.error('Failed to fetch navbar config:', error);
    return NextResponse.json(
      { success: false, error: '获取导航栏配置失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新导航栏配置
export async function PUT(request: NextRequest): Promise<NextResponse<HomepageApiResponse<NavbarConfig>>> {
  try {
    const body = await request.json();
    
    // 验证输入
    const validation = navbarSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: '验证失败', ...formatValidationErrors(validation.error) },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 查找现有记录
    const existing = await prisma.homepageNavbar.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let navbar;
    if (existing) {
      // 使用事务更新
      navbar = await prisma.$transaction(async (tx) => {
        // 删除旧的菜单项和社交链接
        await tx.homepageNavbarItem.deleteMany({ where: { navbarId: existing.id } });
        await tx.homepageNavbarSocial.deleteMany({ where: { navbarId: existing.id } });

        // 更新主记录并创建新的菜单项和社交链接
        return tx.homepageNavbar.update({
          where: { id: existing.id },
          data: {
            logoUrl: data.logoUrl ?? null,
            logoAlt: data.logoAlt ?? null,
            logoAltEn: data.logoAltEn ?? null,
            loginText: data.loginText ?? null,
            loginTextEn: data.loginTextEn ?? null,
            loginLink: data.loginLink ?? null,
            registerText: data.registerText ?? null,
            registerTextEn: data.registerTextEn ?? null,
            registerLink: data.registerLink ?? null,
            isActive: data.isActive ?? true,
            menuItems: data.menuItems ? {
              create: data.menuItems.map((item, index) => ({
                label: item.label,
                labelEn: item.labelEn,
                link: item.link,
                order: item.order ?? index,
                isActive: item.isActive ?? true,
              })),
            } : undefined,
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
            menuItems: { orderBy: { order: 'asc' } },
            socialLinks: { orderBy: { order: 'asc' } },
          },
        });
      });
    } else {
      // 创建新记录
      navbar = await prisma.homepageNavbar.create({
        data: {
          logoUrl: data.logoUrl ?? null,
          logoAlt: data.logoAlt ?? null,
          logoAltEn: data.logoAltEn ?? null,
          loginText: data.loginText ?? null,
          loginTextEn: data.loginTextEn ?? null,
          loginLink: data.loginLink ?? null,
          registerText: data.registerText ?? null,
          registerTextEn: data.registerTextEn ?? null,
          registerLink: data.registerLink ?? null,
          isActive: data.isActive ?? true,
          menuItems: data.menuItems ? {
            create: data.menuItems.map((item, index) => ({
              label: item.label,
              labelEn: item.labelEn,
              link: item.link,
              order: item.order ?? index,
              isActive: item.isActive ?? true,
            })),
          } : undefined,
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
          menuItems: { orderBy: { order: 'asc' } },
          socialLinks: { orderBy: { order: 'asc' } },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: navbar,
    });
  } catch (error) {
    console.error('Failed to update navbar config:', error);
    return NextResponse.json(
      { success: false, error: '更新导航栏配置失败' },
      { status: 500 }
    );
  }
}

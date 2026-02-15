import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const navbar = await prisma.homepageNavbar.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { 
        menuItems: { where: { isActive: true }, orderBy: { order: 'asc' } },
        socialLinks: { orderBy: { order: 'asc' } },
      },
    });
    return NextResponse.json({ success: true, data: navbar });
  } catch (error) {
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 });
  }
}

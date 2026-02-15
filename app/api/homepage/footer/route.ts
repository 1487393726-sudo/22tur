import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const footer = await prisma.homepageFooter.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        sections: { orderBy: { order: 'asc' }, include: { links: { orderBy: { order: 'asc' } } } },
        socialLinks: { orderBy: { order: 'asc' } },
      },
    });
    return NextResponse.json({ success: true, data: footer });
  } catch (error) {
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 });
  }
}

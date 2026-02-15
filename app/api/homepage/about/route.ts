import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const about = await prisma.homepageAbout.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        stats: { orderBy: { order: 'asc' } },
        features: { orderBy: { order: 'asc' } },
      },
    });
    return NextResponse.json({ success: true, data: about });
  } catch (error) {
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 });
  }
}

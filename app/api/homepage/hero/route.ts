import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const hero = await prisma.homepageHero.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: hero });
  } catch (error) {
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 });
  }
}

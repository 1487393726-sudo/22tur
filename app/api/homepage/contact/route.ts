import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const contact = await prisma.homepageContact.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { socialLinks: { orderBy: { order: 'asc' } } },
    });
    return NextResponse.json({ success: true, data: contact });
  } catch (error) {
    return NextResponse.json({ success: false, error: '获取失败' }, { status: 500 });
  }
}

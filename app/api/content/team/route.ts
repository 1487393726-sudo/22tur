import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - 获取活跃的团队成员（公开API）
export async function GET(request: NextRequest) {
  try {
    const members = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        nameEn: true,
        role: true,
        roleEn: true,
        bio: true,
        bioEn: true,
        avatar: true,
      },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('获取团队成员失败:', error);
    return NextResponse.json({ error: '获取团队成员失败' }, { status: 500 });
  }
}

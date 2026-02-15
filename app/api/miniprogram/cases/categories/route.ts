import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

// GET - 获取案例分类
export async function GET(request: NextRequest) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const categories = await prisma.caseCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' }
    });

    const items = categories.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('获取案例分类失败:', error);
    return NextResponse.json({ error: '获取案例分类失败' }, { status: 500 });
  }
}

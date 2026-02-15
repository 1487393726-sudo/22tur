import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - 获取用户对案例的状态（是否喜欢、收藏）
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;

    const [like, collect] = await Promise.all([
      prisma.caseLike.findFirst({
        where: { caseId: id, userId: user.id }
      }),
      prisma.caseCollect.findFirst({
        where: { caseId: id, userId: user.id }
      })
    ]);

    return NextResponse.json({
      isLiked: !!like,
      isCollected: !!collect
    });
  } catch (error) {
    console.error('获取案例状态失败:', error);
    return NextResponse.json({ error: '获取案例状态失败' }, { status: 500 });
  }
}

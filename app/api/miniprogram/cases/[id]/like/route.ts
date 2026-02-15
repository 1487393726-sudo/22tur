import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - 喜欢/取消喜欢案例
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body; // 'like' or 'unlike'

    // 检查案例是否存在
    const caseItem = await prisma.case.findFirst({
      where: { id, status: 'published' }
    });

    if (!caseItem) {
      return NextResponse.json({ error: '案例不存在' }, { status: 404 });
    }

    if (action === 'like') {
      // 添加喜欢（幂等操作）
      await prisma.caseLike.upsert({
        where: {
          caseId_userId: { caseId: id, oderId: user.id }
        },
        create: { caseId: id, userId: user.id },
        update: {}
      });

      // 更新喜欢数
      await prisma.case.update({
        where: { id },
        data: { likeCount: { increment: 1 } }
      });
    } else {
      // 取消喜欢
      const deleted = await prisma.caseLike.deleteMany({
        where: { caseId: id, userId: user.id }
      });

      if (deleted.count > 0) {
        await prisma.case.update({
          where: { id },
          data: { likeCount: { decrement: 1 } }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('操作失败:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}

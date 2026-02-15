import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - 获取案例详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;

    const caseItem = await prisma.case.findFirst({
      where: {
        id,
        status: 'published',
        deletedAt: null
      },
      include: {
        category: true
      }
    });

    if (!caseItem) {
      return NextResponse.json({ error: '案例不存在' }, { status: 404 });
    }

    // 增加浏览量
    await prisma.case.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    return NextResponse.json({
      id: caseItem.id,
      title: caseItem.title,
      images: caseItem.images || [caseItem.coverImage],
      categoryName: caseItem.category?.name || '',
      description: caseItem.description,
      viewCount: caseItem.viewCount + 1,
      likeCount: caseItem.likeCount,
      collectCount: caseItem.collectCount,
      projectInfo: caseItem.projectInfo
    });
  } catch (error) {
    console.error('获取案例详情失败:', error);
    return NextResponse.json({ error: '获取案例详情失败' }, { status: 500 });
  }
}

// 项目详情 API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// 获取项目详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.investmentProject.findUnique({
      where: { id: params.id },
      include: {
        documents: {
          where: { isPublic: true },
          select: {
            id: true,
            name: true,
            type: true,
            fileUrl: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            investments: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: '项目不存在' },
        { status: 404 }
      );
    }

    // 检查用户是否已收藏
    let isFavorited = false;
    const session = await getServerSession();
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (user) {
        const favorite = await prisma.favorite.findFirst({
          where: { userId: user.id, projectId: params.id },
        });
        isFavorited = !!favorite;
      }
    }

    // 计算进度
    const progress = project.targetAmount > 0
      ? Math.round((project.currentAmount / project.targetAmount) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        progress,
        isFavorited,
        investorCount: project._count.investments,
      },
    });
  } catch (error) {
    console.error('Get project detail error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/miniprogram/share/[type]/[id] - 获取分享信息
export async function GET(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const { type, id } = params;

    let shareInfo: { title: string; path: string; imageUrl: string } | null = null;

    switch (type) {
      case 'investment':
        const investment = await prisma.investment?.findUnique({
          where: { id },
          include: {
            project: {
              select: {
                name: true,
                coverImage: true,
              },
            },
          },
        });

        if (investment) {
          shareInfo = {
            title: `我投资了「${investment.project?.name || '优质项目'}」`,
            path: `/pages/investment-detail/investment-detail?id=${id}`,
            imageUrl: investment.project?.coverImage || '/assets/images/share-investment.png',
          };
        }
        break;

      case 'project':
        const project = await prisma.investmentProject?.findUnique({
          where: { id },
          select: {
            name: true,
            description: true,
            coverImage: true,
            targetAmount: true,
            currentAmount: true,
          },
        });

        if (project) {
          const progress = project.targetAmount > 0 
            ? Math.round((project.currentAmount / project.targetAmount) * 100) 
            : 0;
          shareInfo = {
            title: `「${project.name}」已完成${progress}%，快来参与！`,
            path: `/pages/investment-detail/investment-detail?projectId=${id}`,
            imageUrl: project.coverImage || '/assets/images/share-project.png',
          };
        }
        break;

      case 'document':
        const document = await prisma.document?.findUnique({
          where: { id },
          select: {
            title: true,
            type: true,
          },
        });

        if (document) {
          shareInfo = {
            title: `查看文档：${document.title}`,
            path: `/pages/documents/documents?id=${id}`,
            imageUrl: '/assets/images/share-document.png',
          };
        }
        break;

      case 'profile':
        shareInfo = {
          title: '加入创意之旅，开启投资之旅',
          path: '/pages/index/index',
          imageUrl: '/assets/images/share-invite.png',
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: '不支持的分享类型' },
          { status: 400 }
        );
    }

    if (!shareInfo) {
      return NextResponse.json(
        { success: false, error: '内容不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: shareInfo,
    });
  } catch (error) {
    console.error('获取分享信息失败:', error);
    return NextResponse.json(
      { success: false, error: '获取分享信息失败' },
      { status: 500 }
    );
  }
}

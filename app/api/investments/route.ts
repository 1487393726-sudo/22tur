// 投资列表 API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// 获取投资列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    const where: any = { userId: user.id };
    if (status && status !== 'all') {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.investment.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              coverImage: true,
              expectedReturn: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.investment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Get investments error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 创建投资
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { projectId, amount } = await request.json();

    if (!projectId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: '参数错误' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: '项目不存在' },
        { status: 404 }
      );
    }

    // 创建投资记录
    const investment = await prisma.investment.create({
      data: {
        userId: user.id,
        projectId,
        amount,
        status: 'PENDING',
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: investment,
    });
  } catch (error) {
    console.error('Create investment error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

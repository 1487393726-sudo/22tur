// 投资详情 API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// 获取投资详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
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

    const investment = await prisma.investment.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            coverImage: true,
            expectedReturn: true,
            duration: true,
            minInvestment: true,
            maxInvestment: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!investment) {
      return NextResponse.json(
        { success: false, message: '投资记录不存在' },
        { status: 404 }
      );
    }

    // 计算收益
    const earnings = calculateEarnings(investment);

    return NextResponse.json({
      success: true,
      data: {
        ...investment,
        earnings,
      },
    });
  } catch (error) {
    console.error('Get investment detail error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 计算收益
function calculateEarnings(investment: any) {
  const { amount, project, createdAt } = investment;
  const expectedReturn = project?.expectedReturn || 0;
  
  // 计算投资天数
  const investDays = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // 年化收益计算
  const dailyReturn = expectedReturn / 365 / 100;
  const totalEarnings = amount * dailyReturn * investDays;
  
  return {
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    dailyEarnings: Math.round(amount * dailyReturn * 100) / 100,
    investDays,
    expectedReturn,
  };
}

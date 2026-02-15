// 收益统计 API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// 获取收益统计
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
    const period = searchParams.get('period') || 'all'; // all, month, year

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取用户所有投资
    const investments = await prisma.investment.findMany({
      where: { 
        userId: user.id,
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
      include: {
        project: {
          select: {
            name: true,
            expectedReturn: true,
          },
        },
      },
    });

    // 计算收益
    let totalInvested = 0;
    let totalEarnings = 0;
    let todayEarnings = 0;
    let monthEarnings = 0;
    const earningsHistory: any[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    investments.forEach(inv => {
      const amount = inv.amount;
      const expectedReturn = inv.project?.expectedReturn || 0;
      const dailyRate = expectedReturn / 365 / 100;
      
      const investDate = new Date(inv.createdAt);
      const investDays = Math.floor((now.getTime() - investDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const earnings = amount * dailyRate * investDays;
      const dailyEarnings = amount * dailyRate;

      totalInvested += amount;
      totalEarnings += earnings;
      todayEarnings += dailyEarnings;

      // 本月收益
      const monthDays = Math.min(investDays, Math.floor((now.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)));
      monthEarnings += amount * dailyRate * monthDays;

      earningsHistory.push({
        investmentId: inv.id,
        projectName: inv.project?.name,
        amount,
        expectedReturn,
        investDays,
        totalEarnings: Math.round(earnings * 100) / 100,
        dailyEarnings: Math.round(dailyEarnings * 100) / 100,
      });
    });

    // 生成最近30天收益趋势
    const trend: { date: string; earnings: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // 简化计算：假设每天收益相同
      trend.push({
        date: dateStr,
        earnings: Math.round(todayEarnings * 100) / 100,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalInvested: Math.round(totalInvested * 100) / 100,
          totalEarnings: Math.round(totalEarnings * 100) / 100,
          todayEarnings: Math.round(todayEarnings * 100) / 100,
          monthEarnings: Math.round(monthEarnings * 100) / 100,
          investmentCount: investments.length,
        },
        history: earningsHistory,
        trend,
      },
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

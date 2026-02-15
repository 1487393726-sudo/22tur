import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * 检查用户投资状态 API
 * Check user investment status API
 * 
 * 返回用户是否有活跃投资，以及投资统计信息
 */
export async function GET(request: NextRequest) {
  try {
    // 在 Next.js App Router 中，getServerSession 需要从请求中获取
    const session = await getServerSession(authOptions);
    
    console.log('[Investment Status API] Session:', session ? 'exists' : 'null');
    console.log('[Investment Status API] User:', JSON.stringify(session?.user, null, 2));
    
    if (!session?.user) {
      console.log('[Investment Status API] No session user');
      return NextResponse.json(
        { error: 'Unauthorized', hasInvestments: false, totalAmount: 0 },
        { status: 401 }
      );
    }

    if (!session.user.id) {
      console.log('[Investment Status API] No user ID in session');
      console.log('[Investment Status API] Session user keys:', Object.keys(session.user));
      return NextResponse.json(
        { error: 'Unauthorized - No user ID', hasInvestments: false, totalAmount: 0 },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('[Investment Status API] User ID:', userId);

    // 查询用户的投资记录
    const investments = await prisma.investment.findMany({
      where: {
        userId,
        status: { in: ['ACTIVE', 'PENDING', 'COMPLETED'] }
      },
      select: {
        id: true,
        amount: true,
        status: true,
        investmentDate: true,
        service: {
          select: {
            title: true,
            category: true
          }
        }
      }
    }).catch((err) => {
      console.error('Error fetching investments:', err);
      return [];
    });

    // 查询项目投资记录
    const projectInvestments = await prisma.projectInvestment.findMany({
      where: {
        userId,
        status: { in: ['ACTIVE', 'PENDING', 'APPROVED', 'COMPLETED'] }
      },
      select: {
        id: true,
        amount: true,
        status: true,
        investedAt: true,
        project: {
          select: {
            title: true,
            industryType: true
          }
        }
      }
    }).catch((err) => {
      console.error('Error fetching projectInvestments:', err);
      return [];
    });

    console.log('[Investment Status API] Investments count:', investments.length);
    console.log('[Investment Status API] ProjectInvestments count:', projectInvestments.length);
    console.log('[Investment Status API] ProjectInvestments:', projectInvestments.map(p => ({ id: p.id, amount: p.amount, status: p.status })));

    const totalInvestments = investments.length + projectInvestments.length;
    const totalAmount = [
      ...investments.map((i) => Number(i.amount) || 0),
      ...projectInvestments.map((p) => Number(p.amount) || 0),
    ].reduce((sum, amount) => sum + amount, 0);

    // 解锁条件：累计投资金额 >= 100000 才视为已解锁投资者功能
    const hasInvestments = totalAmount >= 100000;

    console.log('[Investment Status API] Total amount:', totalAmount, 'Has investments:', hasInvestments);
    console.log('[Investment Status API] Response data:', {
      hasInvestments,
      totalInvestments,
      totalAmount,
      investmentsCount: investments.length,
      projectInvestmentsCount: projectInvestments.length,
    });

    return NextResponse.json({
      hasInvestments,
      totalInvestments,
      totalAmount,
      investments: investments.slice(0, 5),
      projectInvestments: projectInvestments.slice(0, 5),
    });
  } catch (error) {
    console.error('Error checking investment status:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        hasInvestments: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

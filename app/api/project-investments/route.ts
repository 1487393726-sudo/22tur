import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || session.user.id;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Verify user can access this data
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Build where clause
    const where: any = {
      userId: userId,
    };
    
    if (status) {
      where.status = status;
    }

    // Fetch ProjectInvestments with project details
    const investments = await prisma.projectInvestment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            expectedReturn: true,
            duration: true,
          },
        },
      },
      orderBy: {
        investedAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      investments: investments.map((inv) => ({
        id: inv.id,
        amount: inv.amount,
        status: inv.status,
        paymentMethod: inv.paymentMethod,
        investedAt: inv.investedAt,
        completedAt: inv.completedAt,
        user: inv.user,
        project: inv.project,
      })),
      total: investments.length,
    });
  } catch (error) {
    console.error('Failed to fetch investments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch investments: ${errorMessage}` },
      { status: 500 }
    );
  }
}

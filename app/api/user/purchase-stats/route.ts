import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 并行获取统计数据
    const [purchases, investments] = await Promise.all([
      // 购买记录统计
      prisma.purchase.aggregate({
        where: { userId: user.id },
        _count: { id: true },
        _sum: { amount: true }
      }),
      // 投资记录统计
      prisma.investment.aggregate({
        where: { userId: user.id },
        _count: { id: true },
        _sum: { amount: true },
        _sum: { expectedReturn: true }
      })
    ]);

    return NextResponse.json({
      totalPurchases: purchases._count.id,
      totalInvestments: investments._count.id,
      totalSpent: purchases._sum.amount || 0,
      totalReturns: investments._sum.expectedReturn || 0
    });

  } catch (error) {
    console.error("获取购买统计数据失败:", error);
    return NextResponse.json(
      { error: "获取统计数据失败" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
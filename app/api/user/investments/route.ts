import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = { userId: user.id };
    if (status && status !== "all") {
      where.status = status;
    }

    const investments = await prisma.investment.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            duration: true
          }
        }
      },
      orderBy: { investmentDate: "desc" }
    });

    // 为每个投资记录添加收益信息
    const investmentsWithReturns = investments.map(investment => {
      let returns = null;
      
      if (investment.status === "ACTIVE" && investment.maturityDate) {
        const now = new Date();
        const maturity = new Date(investment.maturityDate);
        const totalDays = Math.floor((maturity.getTime() - new Date(investment.investmentDate).getTime()) / (1000 * 60 * 60 * 24));
        const daysPassed = Math.floor((now.getTime() - new Date(investment.investmentDate).getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, totalDays - daysPassed);
        
        const progressPercentage = Math.min(100, (daysPassed / totalDays) * 100);
        
        // 计算当前收益（简单计算，按时间比例）
        const dailyReturn = (investment.expectedReturn! - investment.amount) / totalDays;
        const currentReturn = dailyReturn * daysPassed;
        
        returns = {
          currentReturn,
          daysRemaining,
          progressPercentage,
          isMatured: now >= maturity
        };
      }

      return {
        ...investment,
        investmentDate: investment.investmentDate,
        returns
      };
    });

    return NextResponse.json(investmentsWithReturns);

  } catch (error) {
    console.error("获取投资记录失败:", error);
    return NextResponse.json(
      { error: "获取投资记录失败" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 提取投资本金和收益
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const { investmentId } = await request.json();

    if (!investmentId) {
      return NextResponse.json(
        { error: "缺少投资ID" },
        { status: 400 }
      );
    }

    // 验证投资记录属于当前用户
    const investment = await prisma.investment.findFirst({
      where: { 
        id: investmentId,
        userId: user.id 
      }
    });

    if (!investment) {
      return NextResponse.json({ error: "投资记录不存在" }, { status: 404 });
    }

    if (investment.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "该投资已处理" },
        { status: 400 }
      );
    }

    if (!investment.maturityDate || new Date() < new Date(investment.maturityDate)) {
      return NextResponse.json(
        { error: "投资尚未到期" },
        { status: 400 }
      );
    }

    // 更新投资状态
    const updatedInvestment = await prisma.investment.update({
      where: { id: investmentId },
      data: {
        status: "WITHDRAWN",
        completedAt: new Date()
      }
    });

    // 创建财务记录
    await prisma.financialRecord.create({
      data: {
        userId: user.id,
        type: "RECEIPT",
        title: `投资收益提取`,
        amount: investment.expectedReturn || 0,
        status: "COMPLETED",
        description: `投资本金 ¥${investment.amount.toLocaleString()} + 收益 ¥${((investment.expectedReturn || 0) - investment.amount).toLocaleString()}`,
        metadata: JSON.stringify({
          investmentId: investmentId,
          originalAmount: investment.amount,
          returnAmount: (investment.expectedReturn || 0) - investment.amount
        })
      }
    });

    return NextResponse.json({
      message: "提取成功",
      investment: updatedInvestment,
      amount: investment.expectedReturn
    });

  } catch (error) {
    console.error("提取投资失败:", error);
    return NextResponse.json(
      { error: "提取失败，请稍后重试" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
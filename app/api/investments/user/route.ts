import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 获取用户的投资记录
    const investments = await prisma.projectInvestment.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            expectedReturn: true,
            riskLevel: true
          }
        }
      },
      orderBy: {
        investedAt: 'desc'
      }
    });

    // 计算每个行业的持股比例
    const industryOwnership = await calculateIndustryOwnership(session.user.id);

    return NextResponse.json({
      success: true,
      investments,
      industryOwnership
    });

  } catch (error) {
    console.error("Failed to fetch user investments:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function calculateIndustryOwnership(userId: string) {
  // 这里实现计算用户在各个行业的持股比例
  // 基于投资金额和项目总投资计算
  
  const userInvestments = await prisma.projectInvestment.findMany({
    where: {
      userId: userId,
      status: 'COMPLETED'
    },
    include: {
      project: {
        select: {
          category: true,
          targetAmount: true,
          totalRaised: true
        }
      }
    }
  });

  const industryTotals: Record<string, { userAmount: number; totalAmount: number }> = {};

  userInvestments.forEach(investment => {
    const category = investment.project.category || 'other';
    
    if (!industryTotals[category]) {
      industryTotals[category] = { userAmount: 0, totalAmount: 0 };
    }
    
    industryTotals[category].userAmount += investment.amount;
    industryTotals[category].totalAmount += investment.project.targetAmount || 0;
  });

  // 计算持股比例
  const ownership: Record<string, number> = {};
  Object.keys(industryTotals).forEach(category => {
    const { userAmount, totalAmount } = industryTotals[category];
    ownership[category] = totalAmount > 0 ? (userAmount / totalAmount) * 100 : 0;
  });

  return ownership;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId, amount, paymentMethod } = body;

    // 验证投资项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Investment project not found" },
        { status: 404 }
      );
    }

    // 检查最小投资金额
    if (project.minInvestment && amount < project.minInvestment) {
      return NextResponse.json(
        { success: false, error: "Amount below minimum investment" },
        { status: 400 }
      );
    }

    // 创建投资记录
    const investment = await prisma.projectInvestment.create({
      data: {
        userId: session.user.id,
        projectId: projectId,
        amount: amount,
        paymentMethod: paymentMethod,
        status: 'PENDING',
        transactionId: `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });

    // 更新项目总投资金额
    await prisma.investmentProject.update({
      where: { id: projectId },
      data: {
        totalRaised: {
          increment: amount
        },
        investorCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      investment: {
        id: investment.id,
        amount: investment.amount,
        status: investment.status,
        transactionId: investment.transactionId
      }
    });

  } catch (error) {
    console.error("Failed to create investment:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
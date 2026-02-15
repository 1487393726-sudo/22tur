import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit-logger";

/**
 * 获取投资详情
 * GET /api/project-investments/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 获取当前用户
    const session = await getServerSession(authOptions);

    // 获取投资记录
    const investment = await prisma.projectInvestment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            expectedReturn: true,
            duration: true,
            riskLevel: true,
          },
        },
      },
    });

    if (!investment) {
      return NextResponse.json(
        { error: "投资记录不存在" },
        { status: 404 }
      );
    }

    // 检查权限（只能查看自己的投资或管理员查看所有）
    if (
      session?.user?.id !== investment.userId &&
      session?.user?.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "无权查看此投资记录" },
        { status: 403 }
      );
    }

    // 计算预期收益
    const expectedProfit = (investment.amount * investment.project.expectedReturn) / 100;

    return NextResponse.json({
      investment: {
        ...investment,
        expectedProfit,
      },
    });
  } catch (error) {
    console.error("获取投资详情失败:", error);
    return NextResponse.json(
      { error: "获取投资详情失败" },
      { status: 500 }
    );
  }
}

/**
 * 更新投资记录
 * PUT /api/project-investments/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status, notes } = await request.json();

    // 获取当前用户
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    // 获取投资记录
    const investment = await prisma.projectInvestment.findUnique({
      where: { id },
    });

    if (!investment) {
      return NextResponse.json(
        { error: "投资记录不存在" },
        { status: 404 }
      );
    }

    // 检查权限（只有管理员可以更新投资记录）
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "无权更新此投资记录" },
        { status: 403 }
      );
    }

    // 更新投资记录
    const updated = await prisma.projectInvestment.update({
      where: { id },
      data: {
        status: status || investment.status,
        notes: notes || investment.notes,
        updatedAt: new Date(),
      },
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
          },
        },
      },
    });

    // 记录审计日志
    await logAudit({
      action: "INVESTMENT_UPDATED",
      userId: session.user.id,
      resourceId: id,
      resourceType: "ProjectInvestment",
      details: {
        status,
        notes,
      },
    });

    return NextResponse.json({
      investment: updated,
      message: "投资记录已更新",
    });
  } catch (error) {
    console.error("更新投资记录失败:", error);
    return NextResponse.json(
      { error: "更新投资记录失败" },
      { status: 500 }
    );
  }
}

/**
 * 删除投资记录
 * DELETE /api/project-investments/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 获取当前用户
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    // 获取投资记录
    const investment = await prisma.projectInvestment.findUnique({
      where: { id },
    });

    if (!investment) {
      return NextResponse.json(
        { error: "投资记录不存在" },
        { status: 404 }
      );
    }

    // 检查权限（只有管理员可以删除投资记录）
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "无权删除此投资记录" },
        { status: 403 }
      );
    }

    // 检查投资状态（只能删除待支付的投资）
    if (investment.status !== "PENDING") {
      return NextResponse.json(
        { error: "只能删除待支付的投资记录" },
        { status: 400 }
      );
    }

    // 删除投资记录
    await prisma.projectInvestment.delete({
      where: { id },
    });

    // 更新项目的投资人数和已募集金额
    await prisma.investmentProject.update({
      where: { id: investment.projectId },
      data: {
        investorCount: {
          decrement: 1,
        },
        totalRaised: {
          decrement: investment.amount,
        },
      },
    });

    // 记录审计日志
    await logAudit({
      action: "INVESTMENT_DELETED",
      userId: session.user.id,
      resourceId: id,
      resourceType: "ProjectInvestment",
      details: {
        projectId: investment.projectId,
        amount: investment.amount,
      },
    });

    return NextResponse.json({
      message: "投资记录已删除",
    });
  } catch (error) {
    console.error("删除投资记录失败:", error);
    return NextResponse.json(
      { error: "删除投资记录失败" },
      { status: 500 }
    );
  }
}

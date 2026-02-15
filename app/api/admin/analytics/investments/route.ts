/**
 * 投资数据分析 API
 *
 * GET /api/admin/analytics/investments - 获取投资统计数据
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // 默认30天
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // 计算日期范围
    let dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else {
      const days = parseInt(period);
      dateFilter = {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      };
    }

    // 并行获取各项统计数据
    const [
      totalStats,
      projectStats,
      dailyTrend,
      topInvestors,
      statusDistribution,
      recentInvestments,
    ] = await Promise.all([
      // 1. 总体统计
      getTotalStats(dateFilter),
      // 2. 按项目统计
      getProjectStats(dateFilter),
      // 3. 每日趋势
      getDailyTrend(dateFilter),
      // 4. 投资者排行
      getTopInvestors(dateFilter),
      // 5. 状态分布
      getStatusDistribution(dateFilter),
      // 6. 最近投资
      getRecentInvestments(),
    ]);

    return NextResponse.json({
      totalStats,
      projectStats,
      dailyTrend,
      topInvestors,
      statusDistribution,
      recentInvestments,
    });
  } catch (error) {
    console.error("获取投资统计失败:", error);
    return NextResponse.json({ error: "获取统计数据失败" }, { status: 500 });
  }
}

// 总体统计
async function getTotalStats(dateFilter: { gte?: Date; lte?: Date }) {
  const [totalInvestments, completedInvestments, allTimeStats] = await Promise.all([
    // 期间内所有投资
    prisma.projectInvestment.aggregate({
      where: { investedAt: dateFilter },
      _sum: { amount: true },
      _count: true,
    }),
    // 期间内完成的投资
    prisma.projectInvestment.aggregate({
      where: { investedAt: dateFilter, status: "COMPLETED" },
      _sum: { amount: true },
      _count: true,
    }),
    // 历史总计
    prisma.projectInvestment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  // 计算独立投资者数量
  const uniqueInvestors = await prisma.projectInvestment.groupBy({
    by: ["userId"],
    where: { investedAt: dateFilter, status: "COMPLETED" },
  });

  // 计算平均投资金额
  const avgAmount = completedInvestments._count > 0
    ? (completedInvestments._sum.amount || 0) / completedInvestments._count
    : 0;

  return {
    totalAmount: totalInvestments._sum.amount || 0,
    totalCount: totalInvestments._count,
    completedAmount: completedInvestments._sum.amount || 0,
    completedCount: completedInvestments._count,
    uniqueInvestors: uniqueInvestors.length,
    avgAmount,
    allTimeAmount: allTimeStats._sum.amount || 0,
    allTimeCount: allTimeStats._count,
  };
}

// 按项目统计
async function getProjectStats(dateFilter: { gte?: Date; lte?: Date }) {
  const stats = await prisma.projectInvestment.groupBy({
    by: ["projectId"],
    where: { investedAt: dateFilter, status: "COMPLETED" },
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: "desc" } },
    take: 10,
  });

  // 获取项目详情
  const projectIds = stats.map((s) => s.projectId);
  const projects = await prisma.investmentProject.findMany({
    where: { id: { in: projectIds } },
    select: { id: true, title: true, coverImage: true, status: true },
  });

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return stats.map((s) => ({
    projectId: s.projectId,
    project: projectMap.get(s.projectId),
    totalAmount: s._sum.amount || 0,
    investorCount: s._count,
  }));
}

// 每日趋势
async function getDailyTrend(dateFilter: { gte?: Date; lte?: Date }) {
  const investments = await prisma.projectInvestment.findMany({
    where: { investedAt: dateFilter, status: "COMPLETED" },
    select: { investedAt: true, amount: true },
    orderBy: { investedAt: "asc" },
  });

  // 按日期分组
  const dailyMap = new Map<string, { amount: number; count: number }>();
  
  investments.forEach((inv) => {
    const date = inv.investedAt.toISOString().split("T")[0];
    const existing = dailyMap.get(date) || { amount: 0, count: 0 };
    dailyMap.set(date, {
      amount: existing.amount + inv.amount,
      count: existing.count + 1,
    });
  });

  // 填充缺失的日期
  const result: { date: string; amount: number; count: number }[] = [];
  if (dateFilter.gte) {
    const startDate = new Date(dateFilter.gte);
    const endDate = dateFilter.lte ? new Date(dateFilter.lte) : new Date();
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const data = dailyMap.get(dateStr) || { amount: 0, count: 0 };
      result.push({ date: dateStr, ...data });
    }
  }

  return result;
}

// 投资者排行
async function getTopInvestors(dateFilter: { gte?: Date; lte?: Date }) {
  const stats = await prisma.projectInvestment.groupBy({
    by: ["userId"],
    where: { investedAt: dateFilter, status: "COMPLETED" },
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: "desc" } },
    take: 10,
  });

  // 获取用户详情
  const userIds = stats.map((s) => s.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  return stats.map((s) => ({
    userId: s.userId,
    user: userMap.get(s.userId),
    totalAmount: s._sum.amount || 0,
    investmentCount: s._count,
  }));
}

// 状态分布
async function getStatusDistribution(dateFilter: { gte?: Date; lte?: Date }) {
  const stats = await prisma.projectInvestment.groupBy({
    by: ["status"],
    where: { investedAt: dateFilter },
    _sum: { amount: true },
    _count: true,
  });

  return stats.map((s) => ({
    status: s.status,
    amount: s._sum.amount || 0,
    count: s._count,
  }));
}

// 最近投资
async function getRecentInvestments() {
  return prisma.projectInvestment.findMany({
    take: 10,
    orderBy: { investedAt: "desc" },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
      },
      project: {
        select: { id: true, title: true, coverImage: true },
      },
    },
  });
}

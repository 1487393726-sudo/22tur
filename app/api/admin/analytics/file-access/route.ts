/**
 * 文件访问分析 API
 *
 * GET /api/admin/analytics/file-access - 获取文件访问统计数据
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
    const period = searchParams.get("period") || "30";
    const fileId = searchParams.get("fileId");
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // 计算日期范围
    const days = parseInt(period);
    const dateFilter = {
      gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
    };

    // 并行获取各项统计数据
    const [
      totalStats,
      fileStats,
      userStats,
      actionDistribution,
      hourlyDistribution,
      recentLogs,
      logCount,
    ] = await Promise.all([
      // 1. 总体统计
      getTotalStats(dateFilter),
      // 2. 按文件统计
      getFileStats(dateFilter),
      // 3. 按用户统计
      getUserStats(dateFilter),
      // 4. 操作类型分布
      getActionDistribution(dateFilter),
      // 5. 按小时分布
      getHourlyDistribution(dateFilter),
      // 6. 访问日志列表
      getAccessLogs({ dateFilter, fileId, userId, action, page, limit }),
      // 7. 日志总数
      getLogCount({ dateFilter, fileId, userId, action }),
    ]);

    return NextResponse.json({
      totalStats,
      fileStats,
      userStats,
      actionDistribution,
      hourlyDistribution,
      logs: {
        data: recentLogs,
        total: logCount,
        page,
        limit,
        totalPages: Math.ceil(logCount / limit),
      },
    });
  } catch (error) {
    console.error("获取文件访问统计失败:", error);
    return NextResponse.json({ error: "获取统计数据失败" }, { status: 500 });
  }
}

// 总体统计
async function getTotalStats(dateFilter: { gte: Date }) {
  const [totalAccess, successAccess, viewCount, downloadCount, previewCount] = await Promise.all([
    prisma.fileAccessLog.count({
      where: { accessedAt: dateFilter },
    }),
    prisma.fileAccessLog.count({
      where: { accessedAt: dateFilter, success: true },
    }),
    prisma.fileAccessLog.count({
      where: { accessedAt: dateFilter, action: "VIEW", success: true },
    }),
    prisma.fileAccessLog.count({
      where: { accessedAt: dateFilter, action: "DOWNLOAD", success: true },
    }),
    prisma.fileAccessLog.count({
      where: { accessedAt: dateFilter, action: "PREVIEW", success: true },
    }),
  ]);

  // 独立用户数
  const uniqueUsers = await prisma.fileAccessLog.groupBy({
    by: ["userId"],
    where: { accessedAt: dateFilter },
  });

  // 独立文件数
  const uniqueFiles = await prisma.fileAccessLog.groupBy({
    by: ["fileId"],
    where: { accessedAt: dateFilter },
  });

  return {
    totalAccess,
    successAccess,
    failedAccess: totalAccess - successAccess,
    viewCount,
    downloadCount,
    previewCount,
    uniqueUsers: uniqueUsers.length,
    uniqueFiles: uniqueFiles.length,
    successRate: totalAccess > 0 ? ((successAccess / totalAccess) * 100).toFixed(1) : "0",
  };
}

// 按文件统计（热门文件）
async function getFileStats(dateFilter: { gte: Date }) {
  const stats = await prisma.fileAccessLog.groupBy({
    by: ["fileId"],
    where: { accessedAt: dateFilter, success: true },
    _count: true,
    orderBy: { _count: { fileId: "desc" } },
    take: 10,
  });

  // 获取文件详情
  const fileIds = stats.map((s) => s.fileId);
  const files = await prisma.projectFile.findMany({
    where: { id: { in: fileIds } },
    select: {
      id: true,
      fileName: true,
      originalName: true,
      fileType: true,
      project: { select: { id: true, title: true } },
    },
  });

  const fileMap = new Map(files.map((f) => [f.id, f]));

  return stats.map((s) => ({
    fileId: s.fileId,
    file: fileMap.get(s.fileId),
    accessCount: s._count,
  }));
}

// 按用户统计（活跃用户）
async function getUserStats(dateFilter: { gte: Date }) {
  const stats = await prisma.fileAccessLog.groupBy({
    by: ["userId"],
    where: { accessedAt: dateFilter, success: true },
    _count: true,
    orderBy: { _count: { userId: "desc" } },
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
    accessCount: s._count,
  }));
}

// 操作类型分布
async function getActionDistribution(dateFilter: { gte: Date }) {
  const stats = await prisma.fileAccessLog.groupBy({
    by: ["action"],
    where: { accessedAt: dateFilter },
    _count: true,
  });

  return stats.map((s) => ({
    action: s.action,
    count: s._count,
  }));
}

// 按小时分布
async function getHourlyDistribution(dateFilter: { gte: Date }) {
  const logs = await prisma.fileAccessLog.findMany({
    where: { accessedAt: dateFilter },
    select: { accessedAt: true },
  });

  // 按小时分组
  const hourlyMap = new Map<number, number>();
  for (let i = 0; i < 24; i++) {
    hourlyMap.set(i, 0);
  }

  logs.forEach((log) => {
    const hour = new Date(log.accessedAt).getHours();
    hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
  });

  return Array.from(hourlyMap.entries()).map(([hour, count]) => ({
    hour,
    count,
  }));
}

// 获取访问日志列表
async function getAccessLogs(params: {
  dateFilter: { gte: Date };
  fileId?: string | null;
  userId?: string | null;
  action?: string | null;
  page: number;
  limit: number;
}) {
  const where: any = { accessedAt: params.dateFilter };
  if (params.fileId) where.fileId = params.fileId;
  if (params.userId) where.userId = params.userId;
  if (params.action) where.action = params.action;

  return prisma.fileAccessLog.findMany({
    where,
    orderBy: { accessedAt: "desc" },
    skip: (params.page - 1) * params.limit,
    take: params.limit,
    include: {
      file: {
        select: { id: true, fileName: true, originalName: true, fileType: true },
      },
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
}

// 获取日志总数
async function getLogCount(params: {
  dateFilter: { gte: Date };
  fileId?: string | null;
  userId?: string | null;
  action?: string | null;
}) {
  const where: any = { accessedAt: params.dateFilter };
  if (params.fileId) where.fileId = params.fileId;
  if (params.userId) where.userId = params.userId;
  if (params.action) where.action = params.action;

  return prisma.fileAccessLog.count({ where });
}

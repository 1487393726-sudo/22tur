/**
 * 文件访问权限检查和日志记录工具
 */

import { prisma } from "@/lib/prisma";

export interface FileAccessCheckResult {
  hasAccess: boolean;
  reason?: string;
  accessType?: "owner" | "admin" | "investor" | "public";
}

export interface FileAccessLogData {
  fileId: string;
  userId: string;
  action: "VIEW" | "DOWNLOAD" | "PREVIEW";
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  success: boolean;
  errorMessage?: string;
  duration?: number;
}

/**
 * 检查用户是否有权限访问文件
 * @param fileId 文件ID
 * @param userId 用户ID
 * @returns 访问检查结果
 */
export async function checkFileAccess(
  fileId: string,
  userId: string
): Promise<FileAccessCheckResult> {
  // 获取文件信息
  const file = await prisma.projectFile.findUnique({
    where: { id: fileId },
    include: {
      project: {
        select: {
          id: true,
          createdBy: true,
          status: true,
        },
      },
    },
  });

  if (!file) {
    return { hasAccess: false, reason: "文件不存在" };
  }

  // 如果文件未锁定，允许访问
  if (!file.isLocked) {
    return { hasAccess: true, accessType: "public" };
  }

  // 获取用户信息
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  // 检查用户是否是管理员
  if (user?.role === "ADMIN") {
    return { hasAccess: true, accessType: "admin" };
  }

  // 检查用户是否是项目创建者
  if (file.project.createdBy === userId) {
    return { hasAccess: true, accessType: "owner" };
  }

  // 检查用户是否已投资该项目（状态为 COMPLETED）
  const investment = await prisma.projectInvestment.findFirst({
    where: {
      userId: userId,
      projectId: file.projectId,
      status: "COMPLETED",
    },
  });

  if (investment) {
    return { hasAccess: true, accessType: "investor" };
  }

  return { hasAccess: false, reason: "需要投资后才能访问此文件" };
}

/**
 * 检查用户是否已投资某个项目
 * @param projectId 项目ID
 * @param userId 用户ID
 * @returns 是否已投资
 */
export async function hasInvestedInProject(
  projectId: string,
  userId: string
): Promise<boolean> {
  const investment = await prisma.projectInvestment.findFirst({
    where: {
      userId: userId,
      projectId: projectId,
      status: "COMPLETED",
    },
  });

  return !!investment;
}

/**
 * 获取用户对项目文件的访问状态
 * @param projectId 项目ID
 * @param userId 用户ID（可选）
 * @returns 文件列表及其访问状态
 */
export async function getProjectFilesWithAccessStatus(
  projectId: string,
  userId?: string
) {
  // 获取项目文件
  const files = await prisma.projectFile.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      fileName: true,
      originalName: true,
      fileType: true,
      fileSize: true,
      description: true,
      isLocked: true,
      unlockPrice: true,
      viewCount: true,
      downloadCount: true,
      thumbnail: true,
      createdAt: true,
    },
  });

  // 如果没有用户ID，返回基本信息
  if (!userId) {
    return files.map((file) => ({
      ...file,
      canAccess: !file.isLocked,
      accessReason: file.isLocked ? "需要登录并投资后才能访问" : undefined,
    }));
  }

  // 获取用户信息
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  // 获取项目信息
  const project = await prisma.investmentProject.findUnique({
    where: { id: projectId },
    select: { createdBy: true },
  });

  // 检查用户是否已投资
  const hasInvested = await hasInvestedInProject(projectId, userId);

  // 判断用户是否是管理员或项目创建者
  const isAdmin = user?.role === "ADMIN";
  const isOwner = project?.createdBy === userId;

  return files.map((file) => {
    let canAccess = false;
    let accessReason: string | undefined;

    if (!file.isLocked) {
      canAccess = true;
    } else if (isAdmin) {
      canAccess = true;
    } else if (isOwner) {
      canAccess = true;
    } else if (hasInvested) {
      canAccess = true;
    } else {
      accessReason = "需要投资后才能访问此文件";
    }

    return {
      ...file,
      canAccess,
      accessReason,
    };
  });
}

/**
 * 记录文件访问日志
 * @param data 日志数据
 */
export async function logFileAccess(data: FileAccessLogData): Promise<void> {
  try {
    await prisma.fileAccessLog.create({
      data: {
        fileId: data.fileId,
        userId: data.userId,
        action: data.action,
        ipAddress: data.ipAddress || "unknown",
        userAgent: data.userAgent || "unknown",
        referer: data.referer || null,
        success: data.success,
        errorMessage: data.errorMessage || null,
        duration: data.duration || null,
      },
    });
  } catch (error) {
    console.error("记录文件访问日志失败:", error);
  }
}

/**
 * 获取文件访问统计
 * @param fileId 文件ID
 * @returns 访问统计数据
 */
export async function getFileAccessStats(fileId: string) {
  const [viewCount, downloadCount, recentLogs] = await Promise.all([
    prisma.fileAccessLog.count({
      where: { fileId, action: "VIEW", success: true },
    }),
    prisma.fileAccessLog.count({
      where: { fileId, action: "DOWNLOAD", success: true },
    }),
    prisma.fileAccessLog.findMany({
      where: { fileId },
      orderBy: { accessedAt: "desc" },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
  ]);

  return {
    viewCount,
    downloadCount,
    recentLogs,
  };
}

/**
 * 获取用户的文件访问历史
 * @param userId 用户ID
 * @param limit 限制数量
 * @returns 访问历史
 */
export async function getUserFileAccessHistory(userId: string, limit = 20) {
  return prisma.fileAccessLog.findMany({
    where: { userId },
    orderBy: { accessedAt: "desc" },
    take: limit,
    include: {
      file: {
        select: {
          id: true,
          fileName: true,
          originalName: true,
          fileType: true,
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
}

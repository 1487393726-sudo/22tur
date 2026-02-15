import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit-logger";
import path from "path";
import fs from "fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // 获取文件信息
    const file = await prisma.projectFile.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            createdBy: true,
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: "文件不存在" },
        { status: 404 }
      );
    }

    // 获取当前用户
    const session = await getServerSession(authOptions);

    // 检查访问权限
    let canAccess = false;

    // 方式 1: 使用令牌访问
    if (token) {
      // 验证令牌
      const accessToken = await prisma.fileAccessToken.findUnique({
        where: { token },
      });

      if (
        accessToken &&
        accessToken.fileId === id &&
        accessToken.expiresAt > new Date()
      ) {
        canAccess = true;
      } else {
        return NextResponse.json(
          { error: "访问令牌无效或已过期" },
          { status: 403 }
        );
      }
    } else {
      // 方式 2: 使用用户权限访问
      if (session?.user) {
        const userId = session.user.id;
        const isOwner = userId === file.project.createdBy;
        const isAdmin = session.user.role === "ADMIN";

        if (!file.isLocked) {
          // 文件未锁定，所有人可访问
          canAccess = true;
        } else if (isOwner || isAdmin) {
          // 所有者和管理员可访问
          canAccess = true;
        } else {
          // 检查用户是否已投资
          const investment = await prisma.projectInvestment.findFirst({
            where: {
              userId: userId,
              projectId: file.project.id,
              status: "COMPLETED",
            },
          });
          canAccess = !!investment;
        }
      }

      if (!canAccess) {
        return NextResponse.json(
          { error: "无权访问此文件，请先投资该项目" },
          { status: 403 }
        );
      }
    }

    // 增加下载计数
    await prisma.projectFile.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    // 记录审计日志
    await logAudit({
      action: "FILE_DOWNLOAD",
      userId: session?.user?.id || token || "anonymous",
      resourceId: id,
      resourceType: "ProjectFile",
      details: {
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        projectId: file.project.id,
        method: token ? "token" : "user",
      },
    });

    // 构建文件路径
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "files",
      id,
      file.fileName
    );

    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: "文件不存在" },
        { status: 404 }
      );
    }

    // 读取文件
    const fileBuffer = await fs.readFile(filePath);

    // 返回文件
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("下载文件失败:", error);
    return NextResponse.json(
      { error: "下载文件失败" },
      { status: 500 }
    );
  }
}

/**
 * 生成文件访问令牌
 * 用于临时访问受限文件
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { expiresIn = 3600 } = await request.json();

    // 获取当前用户
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    // 获取文件信息
    const file = await prisma.projectFile.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            createdBy: true,
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: "文件不存在" },
        { status: 404 }
      );
    }

    // 检查权限（只有创建者和管理员可以生成令牌）
    if (
      session.user.id !== file.project.createdBy &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "无权生成访问令牌" },
        { status: 403 }
      );
    }

    // 生成令牌
    const token = Buffer.from(
      `${id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    ).toString("base64");

    // 保存令牌
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const accessToken = await prisma.fileAccessToken.create({
      data: {
        token,
        fileId: id,
        createdBy: session.user.id,
        expiresAt,
      },
    });

    // 记录审计日志
    await logAudit({
      action: "FILE_TOKEN_GENERATED",
      userId: session.user.id,
      resourceId: id,
      resourceType: "ProjectFile",
      details: {
        token: token.substring(0, 10) + "...",
        expiresAt: expiresAt.toISOString(),
        expiresIn,
      },
    });

    return NextResponse.json({
      token,
      fileId: id,
      expiresAt,
      downloadUrl: `/api/files/${id}/download?token=${token}`,
    });
  } catch (error) {
    console.error("生成访问令牌失败:", error);
    return NextResponse.json(
      { error: "生成访问令牌失败" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit-logger";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

    if (!file.isLocked) {
      // 文件未锁定，所有人可访问
      canAccess = true;
    } else if (session?.user) {
      const userId = session.user.id;
      const isOwner = userId === file.project.createdBy;
      const isAdmin = session.user.role === "ADMIN";

      if (isOwner || isAdmin) {
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
      // 记录未授权访问尝试
      await logAudit({
        action: "FILE_PREVIEW_DENIED",
        userId: session?.user?.id || "anonymous",
        resourceId: id,
        resourceType: "ProjectFile",
        details: {
          fileName: file.fileName,
          reason: "文件已锁定，无访问权限或未投资",
        },
      });

      return NextResponse.json(
        { error: "无权访问此文件，请先投资该项目" },
        { status: 403 }
      );
    }

    // 增加预览计数
    await prisma.projectFile.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    // 记录审计日志
    await logAudit({
      action: "FILE_PREVIEW",
      userId: session?.user?.id || "anonymous",
      resourceId: id,
      resourceType: "ProjectFile",
      details: {
        fileName: file.fileName,
        fileType: file.fileType,
        projectId: file.project.id,
      },
    });

    // 返回文件信息和预览 URL
    return NextResponse.json({
      id: file.id,
      fileName: file.fileName,
      fileType: file.fileType,
      fileSize: file.fileSize,
      description: file.description,
      isLocked: file.isLocked,
      unlockPrice: file.unlockPrice,
      viewCount: file.viewCount + 1,
      downloadCount: file.downloadCount,
      previewUrl: `/uploads/files/${file.id}/${file.fileName}`,
      project: {
        id: file.project.id,
        title: file.project.title,
      },
    });
  } catch (error) {
    console.error("预览文件失败:", error);
    return NextResponse.json(
      { error: "预览文件失败" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * 更新文件信息
 * PUT /api/files/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 检查文件是否存在
    const file = await prisma.projectFile.findUnique({
      where: { id: params.id },
      include: {
        project: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    // 验证权限（仅项目创建者或管理员可以更新）
    if (
      file.project.createdBy !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const body = await request.json();
    const { fileName, description, isLocked, unlockPrice } = body;

    // 更新文件信息
    const updatedFile = await prisma.projectFile.update({
      where: { id: params.id },
      data: {
        ...(fileName && { fileName }),
        ...(description !== undefined && { description }),
        ...(isLocked !== undefined && { isLocked }),
        ...(unlockPrice !== undefined && {
          unlockPrice: isLocked ? unlockPrice : null,
        }),
      },
    });

    return NextResponse.json({
      message: "文件更新成功",
      file: updatedFile,
    });
  } catch (error: any) {
    console.error("更新文件错误:", error);
    return NextResponse.json(
      { error: "更新文件失败" },
      { status: 500 }
    );
  }
}

/**
 * 删除文件
 * DELETE /api/files/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 检查文件是否存在
    const file = await prisma.projectFile.findUnique({
      where: { id: params.id },
      include: {
        project: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    // 验证权限（仅项目创建者或管理员可以删除）
    if (
      file.project.createdBy !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    // 删除物理文件
    const uploadDir = join(process.cwd(), "public");
    const filePath = join(uploadDir, file.filePath);

    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    // 删除数据库记录
    await prisma.projectFile.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "文件删除成功",
    });
  } catch (error: any) {
    console.error("删除文件错误:", error);
    return NextResponse.json(
      { error: "删除文件失败" },
      { status: 500 }
    );
  }
}

/**
 * 获取文件详情
 * GET /api/files/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const file = await prisma.projectFile.findUnique({
      where: { id: params.id },
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
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    return NextResponse.json({ file });
  } catch (error: any) {
    console.error("获取文件详情错误:", error);
    return NextResponse.json(
      { error: "获取文件详情失败" },
      { status: 500 }
    );
  }
}

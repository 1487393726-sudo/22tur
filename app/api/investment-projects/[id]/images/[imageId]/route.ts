import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * 删除项目图片
 * DELETE /api/investment-projects/[id]/images/[imageId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 检查项目是否存在
    const project = await prisma.investmentProject.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    // 验证权限（仅创建者或管理员可以删除）
    if (
      project.createdBy !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    // 获取当前图片列表
    const currentGallery = project.gallery ? JSON.parse(project.gallery) as string[] : [];

    // 查找要删除的图片
    const imageToDelete = currentGallery.find((img) =>
      img.includes(params.imageId)
    );

    if (!imageToDelete) {
      return NextResponse.json({ error: "图片不存在" }, { status: 404 });
    }

    // 删除物理文件
    const uploadDir = join(process.cwd(), "public");
    const imagePath = join(uploadDir, imageToDelete);

    // 删除原图
    if (existsSync(imagePath)) {
      await unlink(imagePath);
    }

    // 删除缩略图
    const thumbnailPath = imagePath.replace(/\.([^.]+)$/, "_thumb.$1");
    if (existsSync(thumbnailPath)) {
      await unlink(thumbnailPath);
    }

    // 更新项目记录（从 gallery 数组中移除）
    const updatedGallery = currentGallery.filter((img) => img !== imageToDelete);
    await prisma.investmentProject.update({
      where: { id: params.id },
      data: {
        gallery: JSON.stringify(updatedGallery),
      },
    });

    return NextResponse.json({
      message: "图片删除成功",
    });
  } catch (error: any) {
    console.error("删除图片错误:", error);
    return NextResponse.json(
      { error: "删除图片失败" },
      { status: 500 }
    );
  }
}

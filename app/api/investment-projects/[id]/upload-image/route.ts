import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import sharp from "sharp";

/**
 * 上传项目图片
 * POST /api/investment-projects/[id]/upload-image
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // 验证权限（仅创建者或管理员可以上传）
    if (
      project.createdBy !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    // 获取上传的文件
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "未选择文件" }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "不支持的文件类型，仅支持 JPG、PNG、WebP" },
        { status: 400 }
      );
    }

    // 验证文件大小（5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "文件大小不能超过 5MB" },
        { status: 400 }
      );
    }

    // 创建上传目录
    const uploadDir = join(process.cwd(), "public", "uploads", "projects");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop();
    const fileName = `${params.id}_${timestamp}_${randomStr}.${ext}`;
    const thumbnailFileName = `${params.id}_${timestamp}_${randomStr}_thumb.${ext}`;

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 保存原图
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // 使用 Sharp 生成缩略图（400x400）
    const thumbnailPath = join(uploadDir, thumbnailFileName);
    await sharp(buffer)
      .resize(400, 400, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 85 })
      .toFile(thumbnailPath);

    // 优化原图
    const optimizedBuffer = await sharp(buffer)
      .jpeg({ quality: 90 })
      .toBuffer();
    await writeFile(filePath, optimizedBuffer);

    // 生成 URL
    const imageUrl = `/uploads/projects/${fileName}`;
    const thumbnailUrl = `/uploads/projects/${thumbnailFileName}`;

    // 更新项目记录（添加图片到 gallery 数组）
    const currentGallery = project.gallery ? JSON.parse(project.gallery) as string[] : [];
    await prisma.investmentProject.update({
      where: { id: params.id },
      data: {
        gallery: JSON.stringify([...currentGallery, imageUrl]),
      },
    });

    return NextResponse.json({
      message: "图片上传成功",
      image: {
        id: `${timestamp}_${randomStr}`,
        url: imageUrl,
        thumbnailUrl: thumbnailUrl,
        fileName: fileName,
      },
    });
  } catch (error: any) {
    console.error("上传图片错误:", error);
    return NextResponse.json(
      { error: "上传图片失败" },
      { status: 500 }
    );
  }
}

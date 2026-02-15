import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

/**
 * PPT 转换 API
 * 将 PPT/PPTX 文件转换为图片预览
 * 
 * 注意: 这是一个占位符实现
 * 实际生产环境需要使用 LibreOffice 或其他 PPT 处理库
 */

export async function POST(request: NextRequest) {
  try {
    const { fileUrl } = await request.json();

    if (!fileUrl) {
      return NextResponse.json(
        { error: "缺少文件 URL" },
        { status: 400 }
      );
    }

    // 获取当前用户
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "未授权" },
        { status: 401 }
      );
    }

    // 提取文件 ID 从 URL
    const fileIdMatch = fileUrl.match(/\/files\/([^/]+)\//);
    if (!fileIdMatch) {
      return NextResponse.json(
        { error: "无效的文件 URL" },
        { status: 400 }
      );
    }

    const fileId = fileIdMatch[1];

    // 获取文件信息
    const file = await prisma.projectFile.findUnique({
      where: { id: fileId },
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

    // 检查权限
    const canAccess =
      !file.isLocked ||
      session.user.id === file.project.createdBy ||
      session.user.role === "ADMIN";

    if (!canAccess) {
      return NextResponse.json(
        { error: "无权访问此文件" },
        { status: 403 }
      );
    }

    // 检查文件类型
    const fileType = file.fileType.toLowerCase();
    if (!["ppt", "pptx"].includes(fileType)) {
      return NextResponse.json(
        { error: "不支持的文件类型" },
        { status: 400 }
      );
    }

    // 生成缓存路径
    const cacheDir = path.join(process.cwd(), "public", "cache", "ppt");
    const cacheFile = path.join(cacheDir, `${fileId}.json`);

    // 检查缓存
    try {
      const cached = await fs.readFile(cacheFile, "utf-8");
      const cachedData = JSON.parse(cached);
      return NextResponse.json(cachedData);
    } catch {
      // 缓存不存在，继续处理
    }

    // 这是一个占位符实现
    // 实际生产环境需要使用以下方案之一:
    // 1. LibreOffice: libreoffice --headless --convert-to pdf file.pptx
    // 2. ImageMagick: convert -density 150 file.pptx slide-%d.png
    // 3. Python: python-pptx + Pillow
    // 4. Node.js: pptxjs 或其他库

    // 返回示例数据（实际应该是转换后的图片 URL）
    const slides = [
      `/api/placeholder/slide-1.png`,
      `/api/placeholder/slide-2.png`,
      `/api/placeholder/slide-3.png`,
    ];

    // 缓存结果
    try {
      await fs.mkdir(cacheDir, { recursive: true });
      await fs.writeFile(
        cacheFile,
        JSON.stringify({ slides, fileId, timestamp: Date.now() })
      );
    } catch (err) {
      console.error("缓存 PPT 转换结果失败:", err);
    }

    return NextResponse.json({
      slides,
      fileId,
      totalSlides: slides.length,
    });
  } catch (error) {
    console.error("PPT 转换失败:", error);
    return NextResponse.json(
      { error: "PPT 转换失败" },
      { status: 500 }
    );
  }
}

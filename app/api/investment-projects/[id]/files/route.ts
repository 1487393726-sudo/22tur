import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { validateFileContent, sanitizeHTML } from "@/lib/html-sanitizer";
import crypto from "crypto";

/**
 * 允许的文件类型配置
 */
const ALLOWED_FILE_TYPES: Record<string, { extensions: string[]; maxSize: number; magicBytes?: number[] }> = {
  "application/pdf": {
    extensions: [".pdf"],
    maxSize: 50 * 1024 * 1024, // 50MB
    magicBytes: [0x25, 0x50, 0x44, 0x46], // %PDF
  },
  "text/html": {
    extensions: [".html", ".htm"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  "application/vnd.ms-powerpoint": {
    extensions: [".ppt"],
    maxSize: 100 * 1024 * 1024, // 100MB
    magicBytes: [0xd0, 0xcf, 0x11, 0xe0],
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    extensions: [".pptx"],
    maxSize: 100 * 1024 * 1024, // 100MB
    magicBytes: [0x50, 0x4b, 0x03, 0x04], // ZIP header
  },
};

/**
 * 获取文件类型的简短名称
 */
function getFileTypeShortName(mimeType: string): string {
  const typeMap: Record<string, string> = {
    "application/pdf": "pdf",
    "text/html": "html",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  };
  return typeMap[mimeType] || "unknown";
}

/**
 * 生成安全的文件名
 */
function generateSafeFileName(originalName: string, projectId: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "";
  const timestamp = Date.now();
  const randomStr = crypto.randomBytes(8).toString("hex");
  return `${projectId}_${timestamp}_${randomStr}.${ext}`;
}

/**
 * 清理原始文件名（移除危险字符）
 */
function sanitizeOriginalName(fileName: string): string {
  return fileName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "") // 移除危险字符
    .replace(/\.\./g, "") // 移除路径遍历
    .replace(/^\.+/, "") // 移除开头的点
    .trim()
    .substring(0, 255); // 限制长度
}

/**
 * 验证文件魔数
 */
function validateMagicBytes(buffer: Buffer, expectedMagic: number[]): boolean {
  if (buffer.length < expectedMagic.length) {
    return false;
  }
  for (let i = 0; i < expectedMagic.length; i++) {
    if (buffer[i] !== expectedMagic[i]) {
      return false;
    }
  }
  return true;
}

/**
 * 上传项目文件
 * POST /api/investment-projects/[id]/files
 * 
 * 支持的文件类型：PDF、HTML、PPT、PPTX
 * 最大文件大小：50MB（PDF）、10MB（HTML）、100MB（PPT/PPTX）
 * 
 * 安全特性：
 * - 文件类型验证（MIME类型、扩展名、魔数检查）
 * - 文件名安全处理（路径遍历防护、空字节注入防护）
 * - HTML内容安全验证和清理
 * - 默认锁定状态
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
      return NextResponse.json({ error: "无权限上传文件" }, { status: 403 });
    }

    // 获取上传的文件
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const isLockedParam = formData.get("isLocked");
    const isLocked = isLockedParam === null ? true : isLockedParam === "true"; // 默认锁定
    const unlockPrice = parseFloat(formData.get("unlockPrice") as string) || 0;
    const description = (formData.get("description") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "未选择文件" }, { status: 400 });
    }

    // 验证文件类型
    const fileTypeConfig = ALLOWED_FILE_TYPES[file.type];
    if (!fileTypeConfig) {
      return NextResponse.json(
        { error: "不支持的文件类型，仅支持 PDF、HTML、PPT、PPTX" },
        { status: 400 }
      );
    }

    // 验证文件扩展名
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
    if (!fileTypeConfig.extensions.includes(ext)) {
      return NextResponse.json(
        { error: `文件扩展名 ${ext} 与文件类型 ${file.type} 不匹配` },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (file.size > fileTypeConfig.maxSize) {
      const maxSizeMB = Math.round(fileTypeConfig.maxSize / 1024 / 1024);
      return NextResponse.json(
        { error: `文件大小不能超过 ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 验证文件魔数（如果配置了）
    if (fileTypeConfig.magicBytes) {
      if (!validateMagicBytes(buffer, fileTypeConfig.magicBytes)) {
        return NextResponse.json(
          { error: "文件内容与声明的类型不匹配" },
          { status: 400 }
        );
      }
    }

    // 验证文件内容安全性
    const validation = await validateFileContent(buffer, file.type);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "文件内容验证失败" },
        { status: 400 }
      );
    }

    // 对于 HTML 文件，清理危险内容后保存
    let fileBuffer = buffer;
    let actualFileSize = file.size;
    if (file.type === "text/html") {
      const sanitizedHtml = sanitizeHTML(buffer.toString("utf-8"));
      fileBuffer = Buffer.from(sanitizedHtml, "utf-8");
      actualFileSize = fileBuffer.length;
    }

    // 创建上传目录
    const uploadDir = join(process.cwd(), "public", "uploads", "files");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 生成安全的文件名
    const safeFileName = generateSafeFileName(file.name, params.id);
    const sanitizedOriginalName = sanitizeOriginalName(file.name);

    // 保存文件
    const filePath = join(uploadDir, safeFileName);
    await writeFile(filePath, fileBuffer);

    // 生成 URL
    const fileUrl = `/uploads/files/${safeFileName}`;

    // 获取当前最大 order
    const maxOrderFile = await prisma.projectFile.findFirst({
      where: { projectId: params.id },
      orderBy: { order: "desc" },
    });

    const nextOrder = (maxOrderFile?.order || 0) + 1;

    // 创建文件记录
    const projectFile = await prisma.projectFile.create({
      data: {
        projectId: params.id,
        fileName: safeFileName,
        originalName: sanitizedOriginalName,
        filePath: fileUrl,
        fileType: getFileTypeShortName(file.type),
        mimeType: file.type,
        fileSize: actualFileSize,
        isLocked: isLocked,
        unlockPrice: isLocked ? unlockPrice : null,
        description: description || null,
        order: nextOrder,
      },
    });

    return NextResponse.json({
      message: "文件上传成功",
      file: {
        ...projectFile,
        displayName: sanitizedOriginalName,
      },
    });
  } catch (error: any) {
    console.error("上传文件错误:", error);
    return NextResponse.json(
      { error: "上传文件失败" },
      { status: 500 }
    );
  }
}

/**
 * 获取项目文件列表（包含用户访问状态）
 * GET /api/investment-projects/[id]/files
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 获取当前用户（可选）
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // 获取项目文件
    const files = await prisma.projectFile.findMany({
      where: { projectId: params.id },
      orderBy: { order: "asc" },
      select: {
        id: true,
        fileName: true,
        originalName: true,
        fileType: true,
        fileSize: true,
        filePath: true,
        mimeType: true,
        description: true,
        isLocked: true,
        unlockPrice: true,
        viewCount: true,
        downloadCount: true,
        thumbnail: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 如果没有用户登录，返回基本信息
    if (!userId) {
      const filesWithAccess = files.map((file) => ({
        ...file,
        canAccess: !file.isLocked,
        accessReason: file.isLocked ? "需要登录并投资后才能访问" : undefined,
      }));
      return NextResponse.json({ files: filesWithAccess });
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    // 获取项目信息
    const project = await prisma.investmentProject.findUnique({
      where: { id: params.id },
      select: { createdBy: true },
    });

    // 检查用户是否已投资
    const investment = await prisma.projectInvestment.findFirst({
      where: {
        userId: userId,
        projectId: params.id,
        status: "COMPLETED",
      },
    });

    const isAdmin = user?.role === "ADMIN";
    const isOwner = project?.createdBy === userId;
    const hasInvested = !!investment;

    // 为每个文件添加访问状态
    const filesWithAccess = files.map((file) => {
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

    return NextResponse.json({
      files: filesWithAccess,
      userAccess: {
        isAdmin,
        isOwner,
        hasInvested,
        investmentId: investment?.id,
      },
    });
  } catch (error: any) {
    console.error("获取文件列表错误:", error);
    return NextResponse.json(
      { error: "获取文件列表失败" },
      { status: 500 }
    );
  }
}

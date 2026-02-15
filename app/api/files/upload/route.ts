import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';
import { validateFile } from '@/lib/file-validation';
import { applyRateLimit, fileUploadRateLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // 应用速率限制
  const rateLimitResponse = await applyRateLimit(request, fileUploadRateLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // 获取会话令牌
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 验证会话并获取用户
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: '会话已过期' }, { status: 401 });
    }

    const userId = session.userId;

    // 获取表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '未提供文件' }, { status: 400 });
    }

    // 验证文件
    const validationResult = validateFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'image/*',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
    });

    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    const fileName = `${timestamp}-${randomString}${extension}`;

    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 保存文件
    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 生成文件 URL
    const fileUrl = `/uploads/${fileName}`;

    // 获取可选的版本说明
    const changeLog = formData.get('changeLog') as string | null;

    // 格式化文件大小
    const formatSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // 检查是否存在同名文件（版本管理）
    const existingDocument = await prisma.document.findFirst({
      where: {
        title: file.name,
        authorId: userId,
      },
      orderBy: {
        version: 'desc',
      },
    });

    let document;
    
    if (existingDocument) {
      // 存在同名文件，创建新版本
      const currentVersion = parseFloat(existingDocument.version.replace('v', '')) || 1;
      const newVersion = `v${(currentVersion + 1).toFixed(1)}`;

      // 创建版本记录
      await prisma.documentVersion.create({
        data: {
          documentId: existingDocument.id,
          version: existingDocument.version,
          changeLog: changeLog || `版本 ${existingDocument.version}`,
          filePath: existingDocument.filePath,
          size: existingDocument.size,
          authorId: userId,
        },
      });

      // 更新主文档
      document = await prisma.document.update({
        where: { id: existingDocument.id },
        data: {
          filePath: fileUrl,
          type: file.type.split('/')[1] || 'other',
          size: formatSize(file.size),
          version: newVersion,
          uploadDate: new Date(),
        },
      });
    } else {
      // 新文件，创建文档记录
      document = await prisma.document.create({
        data: {
          title: file.name,
          filePath: fileUrl,
          type: file.type.split('/')[1] || 'other',
          category: 'other',
          size: formatSize(file.size),
          authorId: userId,
          version: 'v1.0',
        },
      });
    }

    // 返回文件信息
    return NextResponse.json({
      success: true,
      file: {
        id: document.id,
        name: file.name,
        url: fileUrl,
        type: file.type,
        size: file.size,
        version: document.version,
        uploadedAt: document.uploadDate,
        isNewVersion: !!existingDocument,
      },
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    );
  }
}

// 获取用户上传的文件列表
export async function GET(request: NextRequest) {
  try {
    // 获取会话令牌
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 验证会话并获取用户
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: '会话已过期' }, { status: 401 });
    }

    const userId = session.userId;

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 查询文件列表
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where: {
          authorId: userId,
        },
        orderBy: {
          uploadDate: 'desc',
        },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.document.count({
        where: {
          authorId: userId,
        },
      }),
    ]);

    return NextResponse.json({
      documents: documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        url: doc.filePath,
        type: doc.type,
        size: doc.size,
        uploadedAt: doc.uploadDate,
        uploadedBy: doc.author
          ? {
              id: doc.author.id,
              name: `${doc.author.firstName || ''} ${doc.author.lastName || ''}`.trim(),
              avatar: doc.author.avatar,
            }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    return NextResponse.json(
      { error: '获取文件列表失败' },
      { status: 500 }
    );
  }
}

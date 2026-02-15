/**
 * 印刷文件上传 API 路由
 * Requirements: 1.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { validateFile } from '@/lib/printing/file-validator';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * POST /api/print-quotes/upload
 * 上传设计文件
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: '未提供文件' },
        { status: 400 }
      );
    }

    // 验证文件
    const validation = validateFile(file.name, file.size);
    if (!validation.valid) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      );
    }

    // 生成文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = file.name.split('.').pop();
    const fileName = `${timestamp}-${random}.${ext}`;

    // 保存文件到本地存储
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'print-quotes');
    
    // 确保目录存在
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, fileName);
    const buffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    // 保存文件记录到数据库
    const fileRecord = await prisma.printQuoteFile.create({
      data: {
        fileName: file.name,
        fileUrl: `/uploads/print-quotes/${fileName}`,
        fileSize: file.size,
        fileType: file.type,
        quoteId: '', // 暂时为空，后续关联到具体的询价
      },
    });

    return NextResponse.json({
      fileId: fileRecord.id,
      fileName: file.name,
      fileUrl: fileRecord.fileUrl,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { message: '文件上传失败' },
      { status: 500 }
    );
  }
}

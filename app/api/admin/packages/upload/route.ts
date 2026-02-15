import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  let uploadDir = '';
  let filePath = '';
  
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 验证文件大小 (10GB)
    const maxSize = 10 * 1024 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is 10GB. Your file is ${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB.` },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-zip-compressed',
      'application/x-rar',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Only ZIP, RAR, and 7Z files are supported.' },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    const fileName = `${timestamp}-${randomString}${extension}`;

    // 确保上传目录存在
    uploadDir = join(process.cwd(), 'public', 'uploads', 'packages');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    filePath = join(uploadDir, fileName);
    
    // 检查文件是否为空
    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      );
    }

    // 转换 File 为 Buffer 并保存
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    writeFileSync(filePath, uint8Array);

    // 验证文件是否成功保存
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Failed to save file to disk' },
        { status: 500 }
      );
    }

    // 生成文件 URL
    const fileUrl = `/uploads/packages/${fileName}`;

    // 创建压缩包记录
    const pkg = await prisma.financialRecord.create({
      data: {
        userId: session.user.id,
        type: 'PACKAGE',
        title,
        description: description || null,
        fileName: file.name,
        filePath: fileUrl,
        fileSize: file.size,
        status: 'SUCCESS',
      },
    });

    return NextResponse.json({
      success: true,
      package: {
        id: pkg.id,
        title: pkg.title,
        description: pkg.description,
        fileName: pkg.fileName,
        fileSize: pkg.fileSize || 0,
        mimeType: file.type,
        downloadUrl: fileUrl,
        downloadCount: 0,
        createdAt: pkg.createdAt,
      },
    });
  } catch (error) {
    console.error('Error uploading package:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.message.includes('ENOSPC')) {
        return NextResponse.json(
          { error: 'Disk space full. Cannot save file.' },
          { status: 507 }
        );
      }
      if (error.message.includes('EACCES')) {
        return NextResponse.json(
          { error: 'Permission denied. Cannot write to upload directory.' },
          { status: 403 }
        );
      }
      if (error.message.includes('ENOENT')) {
        return NextResponse.json(
          { error: 'Upload directory not found.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to upload package. Please try again.' },
      { status: 500 }
    );
  }
}

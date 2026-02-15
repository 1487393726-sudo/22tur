import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { copyFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';

// 恢复指定版本
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
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
    const documentId = resolvedParams.id;

    // 获取请求体
    const body = await request.json();
    const { versionId } = body;

    if (!versionId) {
      return NextResponse.json({ error: '未提供版本ID' }, { status: 400 });
    }

    // 获取文档信息
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 });
    }

    // 验证权限
    if (document.authorId !== userId) {
      return NextResponse.json({ error: '无权限操作此文档' }, { status: 403 });
    }

    // 获取要恢复的版本
    const versionToRestore = await prisma.documentVersion.findUnique({
      where: { id: versionId },
    });

    if (!versionToRestore || versionToRestore.documentId !== documentId) {
      return NextResponse.json({ error: '版本不存在' }, { status: 404 });
    }

    // 保存当前版本到历史
    await prisma.documentVersion.create({
      data: {
        documentId,
        version: document.version,
        changeLog: `版本 ${document.version}（恢复前）`,
        filePath: document.filePath,
        size: document.size,
        authorId: userId,
      },
    });

    // 生成新文件名（复制旧版本文件）
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = versionToRestore.filePath.substring(
      versionToRestore.filePath.lastIndexOf('.')
    );
    const newFileName = `${timestamp}-${randomString}${extension}`;
    const newFileUrl = `/uploads/${newFileName}`;

    // 复制文件
    const oldFilePath = join(process.cwd(), 'public', versionToRestore.filePath);
    const newFilePath = join(process.cwd(), 'public', 'uploads', newFileName);
    
    try {
      await copyFile(oldFilePath, newFilePath);
    } catch (error) {
      console.error('复制文件失败:', error);
      return NextResponse.json(
        { error: '恢复文件失败' },
        { status: 500 }
      );
    }

    // 更新文档为恢复的版本
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        filePath: newFileUrl,
        size: versionToRestore.size,
        version: `v${(parseFloat(document.version.replace('v', '')) + 1).toFixed(1)}`,
        uploadDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `已恢复到版本 ${versionToRestore.version}`,
      document: {
        id: updatedDocument.id,
        title: updatedDocument.title,
        url: updatedDocument.filePath,
        version: updatedDocument.version,
        restoredFromVersion: versionToRestore.version,
      },
    });
  } catch (error) {
    console.error('恢复版本失败:', error);
    return NextResponse.json(
      { error: '恢复版本失败' },
      { status: 500 }
    );
  }
}

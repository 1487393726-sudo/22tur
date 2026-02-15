import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// 获取文档的版本历史
export async function GET(
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

    const documentId = resolvedParams.id;

    // 获取文档信息
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 });
    }

    // 获取版本历史
    const versions = await prisma.documentVersion.findMany({
      where: {
        documentId,
      },
      orderBy: {
        version: 'desc',
      },
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
    });

    // 添加当前版本信息
    const currentVersion = {
      id: document.id,
      version: document.version,
      changeLog: '当前版本',
      filePath: document.filePath,
      size: document.size,
      createdAt: document.uploadDate,
      isCurrent: true,
      author: await prisma.user.findUnique({
        where: { id: document.authorId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      }),
    };

    const allVersions = [
      currentVersion,
      ...versions.map((v) => ({
        id: v.id,
        version: v.version,
        changeLog: v.changeLog,
        filePath: v.filePath,
        size: v.size,
        createdAt: v.createdAt,
        isCurrent: false,
        author: v.author,
      })),
    ];

    return NextResponse.json({
      document: {
        id: document.id,
        title: document.title,
        currentVersion: document.version,
      },
      versions: allVersions,
    });
  } catch (error) {
    console.error('获取版本历史失败:', error);
    return NextResponse.json(
      { error: '获取版本历史失败' },
      { status: 500 }
    );
  }
}

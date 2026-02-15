import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

// 草稿验证 Schema
const draftSchema = z.object({
  entityType: z.enum(['equipment', 'bundle', 'template']),
  entityId: z.string().nullable(),
  data: z.string(),
});

// GET - 获取草稿
export async function GET(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId') || null;

    if (!entityType) {
      return NextResponse.json({ error: '缺少 entityType 参数' }, { status: 400 });
    }

    const draft = await prisma.autoSaveDraft.findUnique({
      where: {
        entityType_entityId_userId: {
          entityType,
          entityId,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('获取草稿失败:', error);
    return NextResponse.json({ error: '获取草稿失败' }, { status: 500 });
  }
}

// POST - 保存草稿
export async function POST(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = draftSchema.parse(body);

    const draft = await prisma.autoSaveDraft.upsert({
      where: {
        entityType_entityId_userId: {
          entityType: validatedData.entityType,
          entityId: validatedData.entityId,
          userId: user.id,
        },
      },
      update: {
        data: validatedData.data,
        updatedAt: new Date(),
      },
      create: {
        entityType: validatedData.entityType,
        entityId: validatedData.entityId,
        data: validatedData.data,
        userId: user.id,
      },
    });

    return NextResponse.json({ draft });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    console.error('保存草稿失败:', error);
    return NextResponse.json({ error: '保存草稿失败' }, { status: 500 });
  }
}

// DELETE - 删除草稿
export async function DELETE(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId') || null;

    if (!entityType) {
      return NextResponse.json({ error: '缺少 entityType 参数' }, { status: 400 });
    }

    await prisma.autoSaveDraft.delete({
      where: {
        entityType_entityId_userId: {
          entityType,
          entityId,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除草稿失败:', error);
    return NextResponse.json({ error: '删除草稿失败' }, { status: 500 });
  }
}

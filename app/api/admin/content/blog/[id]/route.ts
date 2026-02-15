import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { blogPostUpdateSchema, handleValidationError } from '@/lib/content/validation';
import { z } from 'zod';

// GET - 获取单篇博客文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('获取博客文章失败:', error);
    return NextResponse.json({ error: '获取博客文章失败' }, { status: 500 });
  }
}

// PUT - 更新博客文章
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = blogPostUpdateSchema.parse(body);

    // 获取当前文章状态
    const currentPost = await prisma.blogPost.findUnique({ where: { id } });
    if (!currentPost) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 处理发布状态变更：如果从草稿变为发布，自动设置 publishedAt
    const updateData: Record<string, unknown> = { ...validatedData };
    if (validatedData.isPublished === true && !currentPost.isPublished) {
      // 从草稿变为发布状态，设置发布时间为当前时间（如果未指定）
      if (!validatedData.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: handleValidationError(error) },
        { status: 400 }
      );
    }
    console.error('更新博客文章失败:', error);
    return NextResponse.json({ error: '更新博客文章失败' }, { status: 500 });
  }
}

// DELETE - 删除博客文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除博客文章失败:', error);
    return NextResponse.json({ error: '删除博客文章失败' }, { status: 500 });
  }
}

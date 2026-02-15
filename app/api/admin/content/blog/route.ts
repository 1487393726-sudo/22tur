import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 博客文章验证 Schema
const blogPostSchema = z.object({
  title: z.string().min(1, '中文标题不能为空'),
  titleEn: z.string().min(1, '英文标题不能为空'),
  slug: z.string().min(1, 'URL slug不能为空'),
  excerpt: z.string().min(1, '中文摘要不能为空'),
  excerptEn: z.string().min(1, '英文摘要不能为空'),
  content: z.string().min(1, '中文内容不能为空'),
  contentEn: z.string().optional(),
  image: z.string().min(1, '封面图片不能为空'),
  category: z.string().min(1, '分类不能为空'),
  author: z.string().min(1, '作者不能为空'),
  readTime: z.string().min(1, '阅读时间不能为空'),
  publishedAt: z.string().transform((val) => new Date(val)),
  isPublished: z.boolean().optional().default(false),
});

// GET - 获取博客文章列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublished = searchParams.get('isPublished');

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (isPublished !== null) where.isPublished = isPublished === 'true';

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
    });

    return NextResponse.json({ posts, total: posts.length });
  } catch (error) {
    console.error('获取博客文章失败:', error);
    return NextResponse.json({ error: '获取博客文章失败' }, { status: 500 });
  }
}

// POST - 创建博客文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = blogPostSchema.parse(body);

    const post = await prisma.blogPost.create({
      data: validatedData,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    console.error('创建博客文章失败:', error);
    return NextResponse.json({ error: '创建博客文章失败' }, { status: 500 });
  }
}

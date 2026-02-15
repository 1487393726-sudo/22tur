import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 团队成员验证 Schema
const teamMemberSchema = z.object({
  name: z.string().min(1, '中文名不能为空'),
  nameEn: z.string().min(1, '英文名不能为空'),
  role: z.string().min(1, '中文职位不能为空'),
  roleEn: z.string().min(1, '英文职位不能为空'),
  bio: z.string().min(1, '中文简介不能为空'),
  bioEn: z.string().min(1, '英文简介不能为空'),
  avatar: z.string().min(1, '头像URL不能为空'),
  order: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

// GET - 获取团队成员列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const members = await prisma.teamMember.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ members, total: members.length });
  } catch (error) {
    console.error('获取团队成员失败:', error);
    return NextResponse.json({ error: '获取团队成员失败' }, { status: 500 });
  }
}

// POST - 创建团队成员
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = teamMemberSchema.parse(body);

    const member = await prisma.teamMember.create({
      data: validatedData,
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    console.error('创建团队成员失败:', error);
    return NextResponse.json({ error: '创建团队成员失败' }, { status: 500 });
  }
}

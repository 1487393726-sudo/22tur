import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const teamMemberUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  roleEn: z.string().min(1).optional(),
  bio: z.string().min(1).optional(),
  bioEn: z.string().min(1).optional(),
  avatar: z.string().min(1).optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET - 获取单个团队成员
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = await prisma.teamMember.findUnique({ where: { id } });

    if (!member) {
      return NextResponse.json({ error: '团队成员不存在' }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error('获取团队成员失败:', error);
    return NextResponse.json({ error: '获取团队成员失败' }, { status: 500 });
  }
}

// PUT - 更新团队成员
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = teamMemberUpdateSchema.parse(body);

    const member = await prisma.teamMember.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({ member });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      );
    }
    console.error('更新团队成员失败:', error);
    return NextResponse.json({ error: '更新团队成员失败' }, { status: 500 });
  }
}

// DELETE - 删除团队成员
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.teamMember.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除团队成员失败:', error);
    return NextResponse.json({ error: '删除团队成员失败' }, { status: 500 });
  }
}

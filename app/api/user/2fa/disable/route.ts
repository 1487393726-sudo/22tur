import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: '密码不能为空' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 验证密码
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 400 }
      );
    }

    // 禁用 2FA
    await prisma.twoFactorSecret.update({
      where: { userId: user.id },
      data: { enabled: false },
    });

    await prisma.user.update({
      where: { email: session.user.email },
      data: { twoFactorEnabled: false },
    });

    return NextResponse.json({
      message: '2FA 已禁用',
      enabled: false,
    });
  } catch (error) {
    console.error('2FA 禁用错误:', error);
    return NextResponse.json(
      { error: '禁用失败' },
      { status: 500 }
    );
  }
}

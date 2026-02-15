import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 查找用户及其 2FA 状态
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        twoFactorEnabled: true,
        twoFactorSecret: {
          select: {
            enabled: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      enabled: user.twoFactorEnabled || false,
      configured: !!user.twoFactorSecret,
      setupDate: user.twoFactorSecret?.createdAt,
    });
  } catch (error) {
    console.error('获取 2FA 状态错误:', error);
    return NextResponse.json(
      { error: '获取状态失败' },
      { status: 500 }
    );
  }
}

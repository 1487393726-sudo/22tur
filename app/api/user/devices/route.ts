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

    // 获取活跃设备列表
    const devices = await prisma.loginDevice.findMany({
      where: {
        userId: user.id,
        isRevoked: false,
      },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        browser: true,
        os: true,
        ipAddress: true,
        location: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      devices,
      total: devices.length,
    });
  } catch (error) {
    console.error('获取设备列表错误:', error);
    return NextResponse.json(
      { error: '获取设备列表失败' },
      { status: 500 }
    );
  }
}

// app/api/auth/2fa/status/route.ts
// 获取 2FA 状态 API

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 获取 2FA 状态
    const twoFactorSecret = await prisma.twoFactorSecret.findUnique({
      where: { userId: user.id },
      select: { enabled: true, method: true },
    });

    return NextResponse.json({
      enabled: twoFactorSecret?.enabled || false,
      method: twoFactorSecret?.method || null,
    });
  } catch (error) {
    console.error('Failed to get 2FA status:', error);
    return NextResponse.json(
      { error: 'Failed to get 2FA status' },
      { status: 500 }
    );
  }
}

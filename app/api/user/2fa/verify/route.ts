import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import speakeasy from 'speakeasy';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: '验证码不能为空' },
        { status: 400 }
      );
    }

    // 查找用户及其 2FA 密钥
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { twoFactorSecret: true },
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA 未配置' },
        { status: 400 }
      );
    }

    // 验证 TOTP 代码
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret.secret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!verified) {
      return NextResponse.json(
        { error: '验证码错误或已过期' },
        { status: 400 }
      );
    }

    // 启用 2FA
    await prisma.twoFactorSecret.update({
      where: { userId: user.id },
      data: { enabled: true },
    });

    await prisma.user.update({
      where: { email: session.user.email },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({
      message: '2FA 已启用',
      enabled: true,
    });
  } catch (error) {
    console.error('2FA 验证错误:', error);
    return NextResponse.json(
      { error: '验证失败' },
      { status: 500 }
    );
  }
}

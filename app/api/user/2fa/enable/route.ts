import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
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

    // 生成 TOTP 密钥
    const secret = speakeasy.generateSecret({
      name: `App (${user.email})`,
      issuer: 'App Name',
      length: 32,
    });

    // 生成 QR 码
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    // 生成备份码 (10个)
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // 保存到数据库（但不启用）
    await prisma.twoFactorSecret.upsert({
      where: { userId: user.id },
      update: {
        secret: secret.base32,
        backupCodes: JSON.stringify(backupCodes),
        enabled: false,
      },
      create: {
        userId: user.id,
        secret: secret.base32,
        backupCodes: JSON.stringify(backupCodes),
        enabled: false,
      },
    });

    return NextResponse.json({
      qrCode,
      secret: secret.base32,
      backupCodes,
      message: '请扫描二维码或手动输入密钥',
    });
  } catch (error) {
    console.error('2FA 启用错误:', error);
    return NextResponse.json(
      { error: '启用 2FA 失败' },
      { status: 500 }
    );
  }
}

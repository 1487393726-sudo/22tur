import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 验证设备属于该用户
    const device = await prisma.loginDevice.findUnique({
      where: { id: params.id },
    });

    if (!device || device.userId !== user.id) {
      return NextResponse.json(
        { error: '设备不存在' },
        { status: 404 }
      );
    }

    // 撤销设备
    await prisma.loginDevice.update({
      where: { id: params.id },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: '设备已撤销',
    });
  } catch (error) {
    console.error('撤销设备错误:', error);
    return NextResponse.json(
      { error: '撤销设备失败' },
      { status: 500 }
    );
  }
}

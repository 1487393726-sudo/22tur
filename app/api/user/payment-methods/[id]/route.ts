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

    // 验证支付方式属于该用户
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: params.id },
    });

    if (!paymentMethod || paymentMethod.userId !== user.id) {
      return NextResponse.json(
        { error: '支付方式不存在' },
        { status: 404 }
      );
    }

    // 删除支付方式
    await prisma.paymentMethod.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: '支付方式已删除',
    });
  } catch (error) {
    console.error('删除支付方式错误:', error);
    return NextResponse.json(
      { error: '删除支付方式失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const { isDefault } = await request.json();

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

    // 验证支付方式属于该用户
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: params.id },
    });

    if (!paymentMethod || paymentMethod.userId !== user.id) {
      return NextResponse.json(
        { error: '支付方式不存在' },
        { status: 404 }
      );
    }

    // 如果设置为默认，取消其他默认设置
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // 更新支付方式
    const updated = await prisma.paymentMethod.update({
      where: { id: params.id },
      data: { isDefault },
    });

    return NextResponse.json({
      message: '支付方式已更新',
      paymentMethod: updated,
    });
  } catch (error) {
    console.error('更新支付方式错误:', error);
    return NextResponse.json(
      { error: '更新支付方式失败' },
      { status: 500 }
    );
  }
}

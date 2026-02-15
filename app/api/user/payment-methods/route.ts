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

    // 获取支付方式列表
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        cardNumber: true,
        cardHolder: true,
        expiryDate: true,
        isDefault: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      paymentMethods,
      total: paymentMethods.length,
    });
  } catch (error) {
    console.error('获取支付方式列表错误:', error);
    return NextResponse.json(
      { error: '获取支付方式列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { type, cardNumber, cardHolder, expiryDate, isDefault } = await request.json();

    // 验证必填字段
    if (!type || !cardNumber || !cardHolder || !expiryDate) {
      return NextResponse.json(
        { error: '缺少必填字段' },
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

    // 如果设置为默认，取消其他默认设置
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // 创建支付方式
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        type,
        cardNumber: cardNumber.slice(-4), // 只保存最后4位
        cardHolder,
        expiryDate,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({
      message: '支付方式已添加',
      paymentMethod,
    });
  } catch (error) {
    console.error('添加支付方式错误:', error);
    return NextResponse.json(
      { error: '添加支付方式失败' },
      { status: 500 }
    );
  }
}

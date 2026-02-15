// 银行卡管理 API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// 获取银行卡列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    const cards = await prisma.bankCard.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // 隐藏卡号中间部分
    const maskedCards = cards.map(card => ({
      ...card,
      cardNumber: maskCardNumber(card.cardNumber),
    }));

    return NextResponse.json({
      success: true,
      data: maskedCards,
    });
  } catch (error) {
    console.error('Get bank cards error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 添加银行卡
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { cardNumber, bankName, cardHolder, isDefault } = await request.json();

    if (!cardNumber || !bankName || !cardHolder) {
      return NextResponse.json(
        { success: false, message: '请填写完整信息' },
        { status: 400 }
      );
    }

    // 验证卡号格式
    if (!/^\d{16,19}$/.test(cardNumber.replace(/\s/g, ''))) {
      return NextResponse.json(
        { success: false, message: '卡号格式不正确' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查卡号是否已存在
    const existing = await prisma.bankCard.findFirst({
      where: {
        userId: user.id,
        cardNumber: cardNumber.replace(/\s/g, ''),
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: '该银行卡已添加' },
        { status: 400 }
      );
    }

    // 如果设为默认卡，先取消其他默认卡
    if (isDefault) {
      await prisma.bankCard.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const card = await prisma.bankCard.create({
      data: {
        userId: user.id,
        cardNumber: cardNumber.replace(/\s/g, ''),
        bankName,
        cardHolder,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...card,
        cardNumber: maskCardNumber(card.cardNumber),
      },
    });
  } catch (error) {
    console.error('Add bank card error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// 隐藏卡号中间部分
function maskCardNumber(cardNumber: string): string {
  if (cardNumber.length < 8) return cardNumber;
  const first4 = cardNumber.slice(0, 4);
  const last4 = cardNumber.slice(-4);
  const middle = '*'.repeat(cardNumber.length - 8);
  return `${first4}${middle}${last4}`;
}

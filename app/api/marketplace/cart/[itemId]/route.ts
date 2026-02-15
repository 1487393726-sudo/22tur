import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketplaceErrorCodes } from '@/types/marketplace';
import { cookies } from 'next/headers';

// PUT - 更新购物车项数量
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.INVALID_QUANTITY, message: '无效的数量' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.CART_NOT_FOUND, message: '购物车不存在' },
        { status: 404 }
      );
    }

    const cart = await prisma.marketplaceCart.findFirst({
      where: { sessionId },
      include: { items: true },
    });

    if (!cart) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.CART_NOT_FOUND, message: '购物车不存在' },
        { status: 404 }
      );
    }

    const cartItem = cart.items.find((item) => item.id === itemId);

    if (!cartItem) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.CART_ITEM_NOT_FOUND, message: '购物车项不存在' },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      // 删除购物车项
      await prisma.marketplaceCartItem.delete({
        where: { id: itemId },
      });
      return NextResponse.json({ success: true, message: '已从购物车移除' });
    }

    // 检查库存
    if (cartItem.equipmentId) {
      const equipment = await prisma.equipment.findUnique({
        where: { id: cartItem.equipmentId },
      });
      if (equipment && equipment.stock < quantity) {
        return NextResponse.json(
          { error: MarketplaceErrorCodes.PRODUCT_OUT_OF_STOCK, message: '库存不足' },
          { status: 400 }
        );
      }
    }

    // 更新数量
    await prisma.marketplaceCartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({ success: true, message: '数量已更新' });
  } catch (error) {
    console.error('更新购物车项失败:', error);
    return NextResponse.json({ error: '更新购物车项失败' }, { status: 500 });
  }
}

// DELETE - 删除购物车项
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.CART_NOT_FOUND, message: '购物车不存在' },
        { status: 404 }
      );
    }

    const cart = await prisma.marketplaceCart.findFirst({
      where: { sessionId },
      include: { items: true },
    });

    if (!cart) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.CART_NOT_FOUND, message: '购物车不存在' },
        { status: 404 }
      );
    }

    const cartItem = cart.items.find((item) => item.id === itemId);

    if (!cartItem) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.CART_ITEM_NOT_FOUND, message: '购物车项不存在' },
        { status: 404 }
      );
    }

    await prisma.marketplaceCartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true, message: '已从购物车移除' });
  } catch (error) {
    console.error('删除购物车项失败:', error);
    return NextResponse.json({ error: '删除购物车项失败' }, { status: 500 });
  }
}

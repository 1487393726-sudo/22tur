import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseEquipment, parseBundle, MarketplaceErrorCodes } from '@/types/marketplace';
import { cookies } from 'next/headers';

// 获取或创建购物车
async function getOrCreateCart(userId?: string, sessionId?: string) {
  let cart = await prisma.marketplaceCart.findFirst({
    where: userId ? { userId } : { sessionId },
    include: {
      items: {
        include: {
          equipment: { include: { category: true } },
          bundle: { include: { items: { include: { equipment: true } } } },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.marketplaceCart.create({
      data: { userId, sessionId },
      include: {
        items: {
          include: {
            equipment: { include: { category: true } },
            bundle: { include: { items: { include: { equipment: true } } } },
          },
        },
      },
    });
  }

  return cart;
}

// 生成会话ID
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// GET - 获取购物车
export async function GET() {
  try {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('cart_session')?.value;

    if (!sessionId) {
      sessionId = generateSessionId();
    }

    const cart = await getOrCreateCart(undefined, sessionId);

    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.equipmentId || item.bundleId,
      productType: item.equipmentId ? 'EQUIPMENT' : 'BUNDLE',
      quantity: item.quantity,
      product: item.equipment
        ? parseEquipment(item.equipment as never)
        : parseBundle(item.bundle as never),
    }));

    const subtotal = items.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );

    const response = NextResponse.json({
      id: cart.id,
      items,
      subtotal,
      total: subtotal,
    });

    response.cookies.set('cart_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('获取购物车失败:', error);
    return NextResponse.json({ error: '获取购物车失败' }, { status: 500 });
  }
}

// POST - 添加到购物车
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, productType, quantity = 1 } = body;

    if (!productId || !productType) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.VALIDATION_ERROR, message: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.INVALID_QUANTITY, message: '数量必须大于0' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    let sessionId = cookieStore.get('cart_session')?.value;

    if (!sessionId) {
      sessionId = generateSessionId();
    }

    const cart = await getOrCreateCart(undefined, sessionId);

    // 检查产品是否存在
    if (productType === 'EQUIPMENT') {
      const equipment = await prisma.equipment.findUnique({ where: { id: productId } });
      if (!equipment) {
        return NextResponse.json(
          { error: MarketplaceErrorCodes.PRODUCT_NOT_FOUND, message: '产品不存在' },
          { status: 404 }
        );
      }
      if (equipment.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: MarketplaceErrorCodes.PRODUCT_INACTIVE, message: '产品已下架' },
          { status: 400 }
        );
      }
      if (equipment.stock < quantity) {
        return NextResponse.json(
          { error: MarketplaceErrorCodes.PRODUCT_OUT_OF_STOCK, message: '库存不足' },
          { status: 400 }
        );
      }
    } else {
      const bundle = await prisma.equipmentBundle.findUnique({ where: { id: productId } });
      if (!bundle) {
        return NextResponse.json(
          { error: MarketplaceErrorCodes.BUNDLE_NOT_FOUND, message: '套餐不存在' },
          { status: 404 }
        );
      }
      if (bundle.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: MarketplaceErrorCodes.PRODUCT_INACTIVE, message: '套餐已下架' },
          { status: 400 }
        );
      }
    }

    // 检查是否已在购物车中
    const existingItem = cart.items.find(
      (item) =>
        (productType === 'EQUIPMENT' && item.equipmentId === productId) ||
        (productType === 'BUNDLE' && item.bundleId === productId)
    );

    if (existingItem) {
      // 更新数量
      await prisma.marketplaceCartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // 添加新项
      await prisma.marketplaceCartItem.create({
        data: {
          cartId: cart.id,
          equipmentId: productType === 'EQUIPMENT' ? productId : null,
          bundleId: productType === 'BUNDLE' ? productId : null,
          quantity,
        },
      });
    }

    const response = NextResponse.json({ success: true, message: '已添加到购物车' });

    response.cookies.set('cart_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error('添加到购物车失败:', error);
    return NextResponse.json({ error: '添加到购物车失败' }, { status: 500 });
  }
}

// DELETE - 清空购物车
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ success: true });
    }

    const cart = await prisma.marketplaceCart.findFirst({
      where: { sessionId },
    });

    if (cart) {
      await prisma.marketplaceCartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return NextResponse.json({ success: true, message: '购物车已清空' });
  } catch (error) {
    console.error('清空购物车失败:', error);
    return NextResponse.json({ error: '清空购物车失败' }, { status: 500 });
  }
}

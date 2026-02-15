import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MarketplaceErrorCodes } from '@/types/marketplace';
import { cookies } from 'next/headers';

// 生成唯一订单号
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// GET - 获取订单列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    if (!userId) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.UNAUTHORIZED, message: '请先登录' },
        { status: 401 }
      );
    }

    const where: Record<string, unknown> = { userId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.marketplaceOrder.findMany({
        where,
        include: {
          items: {
            include: {
              equipment: true,
              bundle: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.marketplaceOrder.count({ where }),
    ]);

    // 解析地址JSON
    const parsedOrders = orders.map((order) => ({
      ...order,
      shippingAddress: order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
    }));

    return NextResponse.json({
      data: parsedOrders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return NextResponse.json({ error: '获取订单列表失败' }, { status: 500 });
  }
}

// POST - 创建订单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, shippingAddress, paymentMethod, notes } = body;

    if (!userId) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.UNAUTHORIZED, message: '请先登录' },
        { status: 401 }
      );
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.VALIDATION_ERROR, message: '请填写完整的收货地址' },
        { status: 400 }
      );
    }

    // 获取购物车
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart_session')?.value;

    const cart = await prisma.marketplaceCart.findFirst({
      where: sessionId ? { sessionId } : { userId },
      include: {
        items: {
          include: {
            equipment: true,
            bundle: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: MarketplaceErrorCodes.CART_EMPTY, message: '购物车为空' },
        { status: 400 }
      );
    }

    // 验证库存并计算总价
    let subtotal = 0;
    const orderItems: {
      equipmentId?: string;
      bundleId?: string;
      name: string;
      price: number;
      quantity: number;
    }[] = [];

    for (const item of cart.items) {
      if (item.equipment) {
        if (item.equipment.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: MarketplaceErrorCodes.PRODUCT_INACTIVE, message: `产品 ${item.equipment.name} 已下架` },
            { status: 400 }
          );
        }
        if (item.equipment.stock < item.quantity) {
          return NextResponse.json(
            { error: MarketplaceErrorCodes.PRODUCT_OUT_OF_STOCK, message: `产品 ${item.equipment.name} 库存不足` },
            { status: 400 }
          );
        }
        subtotal += item.equipment.price * item.quantity;
        orderItems.push({
          equipmentId: item.equipment.id,
          name: item.equipment.name,
          price: item.equipment.price,
          quantity: item.quantity,
        });
      } else if (item.bundle) {
        if (item.bundle.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: MarketplaceErrorCodes.PRODUCT_INACTIVE, message: `套餐 ${item.bundle.name} 已下架` },
            { status: 400 }
          );
        }
        subtotal += item.bundle.price * item.quantity;
        orderItems.push({
          bundleId: item.bundle.id,
          name: item.bundle.name,
          price: item.bundle.price,
          quantity: item.quantity,
        });
      }
    }

    // 生成唯一订单号
    let orderNumber = generateOrderNumber();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.marketplaceOrder.findUnique({ where: { orderNumber } });
      if (!existing) break;
      orderNumber = generateOrderNumber();
      attempts++;
    }

    // 创建订单
    const order = await prisma.marketplaceOrder.create({
      data: {
        orderNumber,
        userId,
        subtotal,
        shipping: 0,
        total: subtotal,
        status: 'PENDING',
        shippingAddress: JSON.stringify(shippingAddress),
        paymentMethod,
        notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    // 扣减库存
    for (const item of cart.items) {
      if (item.equipment) {
        await prisma.equipment.update({
          where: { id: item.equipment.id },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    // 清空购物车
    await prisma.marketplaceCartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        shippingAddress,
      },
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 });
  }
}

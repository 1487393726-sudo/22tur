import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// GET /api/miniprogram/points/exchange - 获取可兑换商品
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // 获取分类列表
    if (type === 'categories') {
      const categories = await prisma.pointsExchangeCategory.findMany({
        where: { isActive: true },
        orderBy: { sort: 'asc' }
      });

      return NextResponse.json({
        success: true,
        categories: categories.map(c => ({
          id: c.id,
          name: c.name
        }))
      });
    }

    // 构建查询条件
    const where: any = {
      isActive: true,
      stock: { gt: 0 }
    };

    if (category) {
      where.categoryId = category;
    }

    // 获取商品列表
    const products = await prisma.pointsExchangeProduct.findMany({
      where,
      orderBy: [
        { sort: 'asc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      image: p.image,
      points: p.points,
      stock: p.stock,
      category: p.categoryId
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts
    });
  } catch (error) {
    console.error('获取兑换商品失败:', error);
    return NextResponse.json(
      { success: false, error: '获取失败' },
      { status: 500 }
    );
  }
}

// POST /api/miniprogram/points/exchange - 兑换商品
export async function POST(request: NextRequest) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, addressId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: '请选择商品' },
        { status: 400 }
      );
    }

    // 查询商品
    const product = await prisma.pointsExchangeProduct.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: '商品不存在' },
        { status: 404 }
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        { success: false, error: '商品已下架' },
        { status: 400 }
      );
    }

    if (product.stock <= 0) {
      return NextResponse.json(
        { success: false, error: '商品已兑完' },
        { status: 400 }
      );
    }

    // 查询用户积分
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId: user.id }
    });

    if (!userPoints || userPoints.balance < product.points) {
      return NextResponse.json(
        { success: false, error: '积分不足' },
        { status: 400 }
      );
    }

    // 执行兑换
    const result = await prisma.$transaction(async (tx) => {
      // 扣除积分
      await tx.userPoints.update({
        where: { userId: user.id },
        data: {
          balance: { decrement: product.points },
          totalSpent: { increment: product.points }
        }
      });

      // 记录积分消费
      await tx.pointsRecord.create({
        data: {
          userId: user.id,
          amount: -product.points,
          type: 'exchange',
          title: `兑换商品: ${product.name}`
        }
      });

      // 减少库存
      await tx.pointsExchangeProduct.update({
        where: { id: productId },
        data: { stock: { decrement: 1 } }
      });

      // 创建兑换订单
      const order = await tx.pointsExchangeOrder.create({
        data: {
          userId: user.id,
          productId,
          productName: product.name,
          points: product.points,
          addressId: addressId || null,
          status: 'pending'
        }
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      message: '兑换成功',
      orderId: result.id
    });
  } catch (error) {
    console.error('兑换商品失败:', error);
    return NextResponse.json(
      { success: false, error: '兑换失败' },
      { status: 500 }
    );
  }
}

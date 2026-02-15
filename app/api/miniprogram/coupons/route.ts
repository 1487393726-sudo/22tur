import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// GET /api/miniprogram/coupons - 获取优惠券列表
export async function GET(request: NextRequest) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'available';

    const now = new Date();

    // 构建查询条件
    let where: any = {
      userId: user.id
    };

    if (status === 'available') {
      where.usedAt = null;
      where.coupon = {
        endDate: { gte: now }
      };
    } else if (status === 'used') {
      where.usedAt = { not: null };
    } else if (status === 'expired') {
      where.usedAt = null;
      where.coupon = {
        endDate: { lt: now }
      };
    }

    // 查询用户优惠券
    const userCoupons = await prisma.userCoupon.findMany({
      where,
      include: {
        coupon: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 统计可用数量
    const availableCount = await prisma.userCoupon.count({
      where: {
        userId: user.id,
        usedAt: null,
        coupon: {
          endDate: { gte: now }
        }
      }
    });

    const list = userCoupons.map(uc => ({
      id: uc.id,
      name: uc.coupon.name,
      type: uc.coupon.type,
      value: uc.coupon.value,
      minAmount: uc.coupon.minAmount,
      startDate: uc.coupon.startDate.toISOString(),
      endDate: uc.coupon.endDate.toISOString(),
      status: uc.usedAt ? 'used' : (uc.coupon.endDate < now ? 'expired' : 'available'),
      description: uc.coupon.description
    }));

    return NextResponse.json({
      success: true,
      list,
      availableCount
    });
  } catch (error) {
    console.error('获取优惠券列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/miniprogram/coupons - 领取优惠券
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
    const { couponId } = body;

    if (!couponId) {
      return NextResponse.json(
        { success: false, error: '请选择优惠券' },
        { status: 400 }
      );
    }

    // 查询优惠券
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId }
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: '优惠券不存在' },
        { status: 404 }
      );
    }

    // 检查是否在有效期内
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return NextResponse.json(
        { success: false, error: '优惠券不在有效期内' },
        { status: 400 }
      );
    }

    // 检查库存
    if (coupon.stock !== null && coupon.stock <= 0) {
      return NextResponse.json(
        { success: false, error: '优惠券已领完' },
        { status: 400 }
      );
    }

    // 检查是否已领取
    const existingCoupon = await prisma.userCoupon.findFirst({
      where: {
        userId: user.id,
        couponId
      }
    });

    if (existingCoupon && !coupon.allowMultiple) {
      return NextResponse.json(
        { success: false, error: '您已领取过该优惠券' },
        { status: 400 }
      );
    }

    // 领取优惠券
    await prisma.$transaction([
      prisma.userCoupon.create({
        data: {
          userId: user.id,
          couponId
        }
      }),
      ...(coupon.stock !== null ? [
        prisma.coupon.update({
          where: { id: couponId },
          data: { stock: { decrement: 1 } }
        })
      ] : [])
    ]);

    return NextResponse.json({
      success: true,
      message: '领取成功'
    });
  } catch (error) {
    console.error('领取优惠券失败:', error);
    return NextResponse.json(
      { success: false, error: '领取失败' },
      { status: 500 }
    );
  }
}

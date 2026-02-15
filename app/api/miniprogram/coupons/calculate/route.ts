import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// POST /api/miniprogram/coupons/calculate - 计算优惠金额
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
    const { userCouponId, orderAmount, productIds } = body;

    if (!userCouponId || orderAmount === undefined) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    // 查询用户优惠券
    const userCoupon = await prisma.userCoupon.findFirst({
      where: {
        id: userCouponId,
        userId: user.id
      },
      include: {
        coupon: true
      }
    });

    if (!userCoupon) {
      return NextResponse.json(
        { success: false, error: '优惠券不存在' },
        { status: 404 }
      );
    }

    // 检查是否已使用
    if (userCoupon.usedAt) {
      return NextResponse.json({
        success: false,
        error: '优惠券已使用',
        canUse: false,
        discount: 0
      });
    }

    const coupon = userCoupon.coupon;
    const now = new Date();

    // 检查有效期
    if (now < coupon.startDate || now > coupon.endDate) {
      return NextResponse.json({
        success: false,
        error: '优惠券不在有效期内',
        canUse: false,
        discount: 0
      });
    }

    // 检查最低消费
    if (coupon.minAmount && orderAmount < coupon.minAmount) {
      return NextResponse.json({
        success: false,
        error: `订单金额需满 ¥${coupon.minAmount} 才能使用`,
        canUse: false,
        discount: 0,
        minAmount: coupon.minAmount
      });
    }

    // 检查适用商品范围
    if (coupon.productScope && productIds && productIds.length > 0) {
      const scopeProducts = JSON.parse(coupon.productScope as string || '[]');
      if (scopeProducts.length > 0) {
        const hasValidProduct = productIds.some((id: string) => scopeProducts.includes(id));
        if (!hasValidProduct) {
          return NextResponse.json({
            success: false,
            error: '优惠券不适用于当前商品',
            canUse: false,
            discount: 0
          });
        }
      }
    }

    // 计算优惠金额
    let discount = 0;
    
    switch (coupon.type) {
      case 'fixed':
        // 固定金额优惠
        discount = Math.min(coupon.value, orderAmount);
        break;
      case 'percent':
        // 百分比折扣
        discount = Math.floor(orderAmount * coupon.value / 100);
        // 如果有最大优惠限制
        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
        break;
      case 'shipping':
        // 免运费券
        discount = coupon.value; // 运费金额
        break;
      default:
        discount = 0;
    }

    // 确保优惠金额不超过订单金额
    discount = Math.min(discount, orderAmount);

    return NextResponse.json({
      success: true,
      canUse: true,
      discount,
      finalAmount: orderAmount - discount,
      couponInfo: {
        id: userCoupon.id,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description
      }
    });
  } catch (error) {
    console.error('计算优惠金额失败:', error);
    return NextResponse.json(
      { success: false, error: '计算失败' },
      { status: 500 }
    );
  }
}

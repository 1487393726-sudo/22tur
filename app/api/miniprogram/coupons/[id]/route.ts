import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// GET /api/miniprogram/coupons/[id] - 获取优惠券详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const { id } = params;

    const userCoupon = await prisma.userCoupon.findUnique({
      where: { id },
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

    if (userCoupon.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: '无权访问' },
        { status: 403 }
      );
    }

    const now = new Date();
    const status = userCoupon.usedAt 
      ? 'used' 
      : (userCoupon.coupon.endDate < now ? 'expired' : 'available');

    return NextResponse.json({
      success: true,
      id: userCoupon.id,
      name: userCoupon.coupon.name,
      type: userCoupon.coupon.type,
      value: userCoupon.coupon.value,
      minAmount: userCoupon.coupon.minAmount,
      startDate: userCoupon.coupon.startDate.toISOString(),
      endDate: userCoupon.coupon.endDate.toISOString(),
      status,
      scope: userCoupon.coupon.scope,
      usedAt: userCoupon.usedAt?.toISOString(),
      orderId: userCoupon.orderId
    });
  } catch (error) {
    console.error('获取优惠券详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取详情失败' },
      { status: 500 }
    );
  }
}

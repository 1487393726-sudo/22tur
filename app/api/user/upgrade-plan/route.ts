import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 套餐价格配置
const PLAN_PRICES: Record<string, { price: number; features: number }> = {
  pro: { price: 99, features: 6 },
  enterprise: { price: 299, features: 7 },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { planId, billingPeriod = 'MONTHLY' } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: '套餐 ID 为必填项' },
        { status: 400 }
      );
    }

    if (!PLAN_PRICES[planId]) {
      return NextResponse.json(
        { error: '无效的套餐' },
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

    // 获取或创建服务
    let service = await prisma.service.findFirst({
      where: { type: 'SERVICE' },
    });

    if (!service) {
      service = await prisma.service.create({
        data: {
          title: '订阅服务',
          description: '企业管理系统订阅',
          price: PLAN_PRICES[planId].price,
          category: 'subscription',
          type: 'SERVICE',
          status: 'ACTIVE',
        },
      });
    }

    // 计算订阅期限
    const startDate = new Date();
    const endDate = new Date();
    if (billingPeriod === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (billingPeriod === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // 取消旧的活跃订阅
    await prisma.userSubscription.updateMany({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    // 创建新订阅
    const subscription = await prisma.userSubscription.create({
      data: {
        userId: user.id,
        serviceId: service.id,
        planType: billingPeriod,
        status: 'ACTIVE',
        amount: PLAN_PRICES[planId].price,
        currency: 'CNY',
        startDate,
        endDate,
        autoRenew: true,
      },
    });

    // 更新用户类型
    const userTypeMap: Record<string, string> = {
      pro: 'MEMBER',
      enterprise: 'ENTERPRISE',
    };

    await prisma.user.update({
      where: { id: user.id },
      data: {
        userType: userTypeMap[planId] || 'NORMAL',
        membershipExpiry: endDate,
      },
    });

    return NextResponse.json({
      message: '套餐升级成功',
      subscription: {
        id: subscription.id,
        planId,
        status: subscription.status,
        amount: subscription.amount,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew,
      },
      paymentRequired: true,
      paymentUrl: `/payments?subscriptionId=${subscription.id}`,
    });
  } catch (error) {
    console.error('升级套餐错误:', error);
    return NextResponse.json(
      { error: '升级套餐失败' },
      { status: 500 }
    );
  }
}

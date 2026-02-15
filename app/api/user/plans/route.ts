import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 定义可用的套餐
const PLANS = [
  {
    id: 'free',
    name: '免费版',
    price: 0,
    currency: 'CNY',
    features: [
      '基础功能',
      '最多 5 个项目',
      '最多 10 个用户',
      '基础报表',
    ],
    description: '适合个人和小团队',
  },
  {
    id: 'pro',
    name: '专业版',
    price: 99,
    currency: 'CNY',
    billingPeriod: 'MONTHLY',
    features: [
      '所有免费版功能',
      '无限项目',
      '最多 50 个用户',
      '高级报表',
      '优先支持',
      '自定义品牌',
    ],
    description: '适合成长中的企业',
  },
  {
    id: 'enterprise',
    name: '企业版',
    price: 299,
    currency: 'CNY',
    billingPeriod: 'MONTHLY',
    features: [
      '所有专业版功能',
      '无限用户',
      '高级安全',
      '专属账户经理',
      'API 访问',
      '自定义集成',
    ],
    description: '适合大型企业',
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 获取用户当前订阅
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userSubscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const currentPlan = user.userSubscriptions[0];
    const currentPlanId = currentPlan?.serviceId || 'free';

    return NextResponse.json({
      plans: PLANS,
      currentPlan: {
        id: currentPlanId,
        startDate: currentPlan?.startDate,
        endDate: currentPlan?.endDate,
        autoRenew: currentPlan?.autoRenew,
      },
    });
  } catch (error) {
    console.error('获取套餐列表错误:', error);
    return NextResponse.json(
      { error: '获取套餐列表失败' },
      { status: 500 }
    );
  }
}

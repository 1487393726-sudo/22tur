import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const serviceId = searchParams.get('serviceId');
    const status = searchParams.get('status');
    const planType = searchParams.get('planType');

    const where: any = {};
    if (userId) where.userId = userId;
    if (serviceId) where.serviceId = serviceId;
    if (status) where.status = status;
    if (planType) where.planType = planType;

    const subscriptions = await prisma.userSubscription.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            userType: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            category: true,
            type: true,
            imageUrl: true,
            features: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('获取订阅列表失败:', error);
    return NextResponse.json(
      { error: '获取订阅列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 计算订阅结束时间
    const startDate = new Date(data.startDate || new Date());
    let endDate = new Date(startDate);
    
    if (data.planType === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (data.planType === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // 计算下次付款时间
    let nextPaymentAt = new Date(endDate);

    const subscription = await prisma.userSubscription.create({
      data: {
        userId: data.userId,
        serviceId: data.serviceId,
        planType: data.planType,
        status: data.status || 'ACTIVE',
        amount: data.amount,
        currency: data.currency || 'CNY',
        startDate,
        endDate,
        autoRenew: data.autoRenew || false,
        lastPaymentAt: data.lastPaymentAt || new Date(),
        nextPaymentAt,
        notes: data.notes
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            userType: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            category: true,
            type: true
          }
        }
      }
    });

    // 更新用户的会员到期时间
    await prisma.user.update({
      where: { id: data.userId },
      data: {
        membershipExpiry: endDate
      }
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('创建订阅失败:', error);
    return NextResponse.json(
      { error: '创建订阅失败' },
      { status: 500 }
    );
  }
}
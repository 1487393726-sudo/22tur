import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { subscriptionId, planType, userId } = data;

    // 开始事务
    const result = await prisma.$transaction(async (tx) => {
      // 1. 获取当前订阅信息
      const currentSubscription = await tx.userSubscription.findUnique({
        where: { id: subscriptionId },
        include: { service: true }
      });

      if (!currentSubscription) {
        throw new Error('订阅不存在');
      }

      // 2. 计算新的订阅时间
      const now = new Date();
      const currentEndDate = new Date(currentSubscription.endDate);
      
      // 如果当前还没过期，从结束时间开始计算；如果已过期，从现在开始计算
      const startDate = currentEndDate > now ? currentEndDate : now;
      let endDate = new Date(startDate);
      
      if (planType === 'MONTHLY') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (planType === 'YEARLY') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // 3. 更新现有订阅
      const updatedSubscription = await tx.userSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'ACTIVE',
          planType,
          startDate,
          endDate,
          lastPaymentAt: now,
          nextPaymentAt: endDate,
          cancelledAt: null
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

      // 4. 更新用户的会员到期时间
      await tx.user.update({
        where: { id: userId },
        data: {
          membershipExpiry: endDate
        }
      });

      // 5. 创建新的购买记录
      const purchase = await tx.purchase.create({
        data: {
          userId,
          serviceId: currentSubscription.serviceId,
          amount: currentSubscription.amount,
          status: 'COMPLETED',
          paymentMethod: 'RENEWAL',
          purchaseDate: now,
          completedAt: now,
          notes: `续费服务: ${currentSubscription.service.title} (${planType === 'MONTHLY' ? '月付' : '年付'})`
        },
        include: {
          service: {
            select: {
              title: true,
              type: true
            }
          }
        }
      });

      return {
        subscription: updatedSubscription,
        purchase
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('续费失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '续费失败' },
      { status: 500 }
    );
  }
}

// 获取即将到期的订阅
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const userId = searchParams.get('userId');

    const where: any = {
      status: 'ACTIVE',
      endDate: {
        lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000) // n天后到期
      }
    };

    if (userId) {
      where.userId = userId;
    }

    const expiringSubscriptions = await prisma.userSubscription.findMany({
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
        endDate: 'asc'
      }
    });

    // 计算剩余天数
    const processedSubscriptions = expiringSubscriptions.map(sub => {
      const now = new Date();
      const endDate = new Date(sub.endDate);
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...sub,
        daysRemaining: Math.max(0, daysRemaining)
      };
    });

    return NextResponse.json(processedSubscriptions);
  } catch (error) {
    console.error('获取到期订阅失败:', error);
    return NextResponse.json(
      { error: '获取到期订阅失败' },
      { status: 500 }
    );
  }
}
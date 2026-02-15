import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 开始事务
    const result = await prisma.$transaction(async (tx) => {
      // 1. 创建购买记录
      const purchase = await tx.purchase.create({
        data: {
          userId: data.userId,
          serviceId: data.serviceId,
          amount: data.amount,
          status: data.status || 'PENDING',
          paymentMethod: data.paymentMethod,
          paymentId: data.paymentId,
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

      // 2. 如果是服务类型，创建订阅记录
      if (data.serviceType === 'SERVICE' && data.createSubscription) {
        const startDate = new Date(data.startDate || new Date());
        let endDate = new Date(startDate);
        
        if (data.planType === 'MONTHLY') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else if (data.planType === 'YEARLY') {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        let nextPaymentAt = new Date(endDate);

        const subscription = await tx.userSubscription.create({
          data: {
            userId: data.userId,
            serviceId: data.serviceId,
            planType: data.planType,
            status: 'ACTIVE',
            amount: data.amount,
            currency: data.currency || 'CNY',
            startDate,
            endDate,
            autoRenew: data.autoRenew || false,
            lastPaymentAt: new Date(),
            nextPaymentAt,
            notes: `购买服务: ${purchase.service.title}`
          }
        });

        // 3. 更新用户的会员到期时间
        await tx.user.update({
          where: { id: data.userId },
          data: {
            membershipExpiry: endDate,
            userType: determineUserType(data.userType, data.planType)
          }
        });

        return { purchase, subscription };
      }

      // 4. 如果是投资类型，创建投资记录
      if (data.serviceType === 'INVESTMENT' && data.createInvestment) {
        const investment = await tx.investment.create({
          data: {
            userId: data.userId,
            serviceId: data.serviceId,
            amount: data.amount,
            status: 'ACTIVE',
            returnRate: data.returnRate,
            expectedReturn: data.expectedReturn,
            investmentDate: new Date(),
            maturityDate: data.maturityDate ? new Date(data.maturityDate) : null
          }
        });

        return { purchase, investment };
      }

      return { purchase };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('创建购买记录失败:', error);
    return NextResponse.json(
      { error: '创建购买记录失败' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const serviceId = searchParams.get('serviceId');
    const status = searchParams.get('status');

    const where: any = {};
    if (userId) where.userId = userId;
    if (serviceId) where.serviceId = serviceId;
    if (status) where.status = status;

    const purchases = await prisma.purchase.findMany({
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
            imageUrl: true
          }
        }
      },
      orderBy: {
        purchaseDate: 'desc'
      }
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error('获取购买记录失败:', error);
    return NextResponse.json(
      { error: '获取购买记录失败' },
      { status: 500 }
    );
  }
}

// 根据服务类型和计划确定用户类型
function determineUserType(currentType: string, planType: string): string {
  if (currentType === 'ENTERPRISE') return 'ENTERPRISE';
  if (currentType === 'VIP') return 'VIP';
  
  if (planType === 'YEARLY') {
    return 'VIP';
  } else if (planType === 'MONTHLY') {
    return 'MEMBER';
  }
  
  return currentType;
}
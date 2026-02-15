import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const userType = searchParams.get('userType');

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { username: { contains: search } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (userType && userType !== 'ALL') {
      where.userType = userType;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        },
        userSubscriptions: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            service: {
              select: {
                id: true,
                title: true,
                type: true
              }
            }
          },
          orderBy: {
            endDate: 'desc'
          }
        },
        _count: {
          select: {
            userSubscriptions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // 限制返回数量
    });

    // 移除密码字段
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    return NextResponse.json(usersWithoutPasswords);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    );
  }
}
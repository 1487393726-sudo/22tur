import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: any = {};
    if (category) where.category = category;
    if (type) where.type = type;
    if (status) where.status = status;

    const services = await prisma.service.findMany({
      where,
      include: {
        userSubscriptions: {
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
            }
          }
        },
        _count: {
          select: {
            userSubscriptions: true,
            purchases: true,
            investments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('获取服务列表失败:', error);
    return NextResponse.json(
      { error: '获取服务列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const service = await prisma.service.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        type: data.type, // SERVICE, INVESTMENT
        status: data.status || 'ACTIVE',
        imageUrl: data.imageUrl,
        features: data.features ? JSON.stringify(data.features) : null,
        duration: data.duration,
        deliveryTime: data.deliveryTime
      }
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('创建服务失败:', error);
    return NextResponse.json(
      { error: '创建服务失败' },
      { status: 500 }
    );
  }
}
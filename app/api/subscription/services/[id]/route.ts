import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: (await params).id },
      include: {
        subscriptions: {
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
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            subscriptions: true,
            purchases: true,
            investments: true
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: '服务不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('获取服务详情失败:', error);
    return NextResponse.json(
      { error: '获取服务详情失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json();
    
    const service = await prisma.service.update({
      where: { id: (await params).id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        type: data.type,
        status: data.status,
        imageUrl: data.imageUrl,
        features: data.features ? JSON.stringify(data.features) : null,
        duration: data.duration,
        deliveryTime: data.deliveryTime
      }
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('更新服务失败:', error);
    return NextResponse.json(
      { error: '更新服务失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.service.delete({
      where: { id: (await params).id }
    });

    return NextResponse.json({ message: '服务删除成功' });
  } catch (error) {
    console.error('删除服务失败:', error);
    return NextResponse.json(
      { error: '删除服务失败' },
      { status: 500 }
    );
  }
}
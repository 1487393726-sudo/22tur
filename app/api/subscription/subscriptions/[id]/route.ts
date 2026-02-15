import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const subscription = await prisma.userSubscription.findUnique({
      where: { id: (await params).id },
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
            features: true,
            duration: true
          }
        }
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: '订阅不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('获取订阅详情失败:', error);
    return NextResponse.json(
      { error: '获取订阅详情失败' },
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
    
    const subscription = await prisma.userSubscription.update({
      where: { id: (await params).id },
      data: {
        status: data.status,
        autoRenew: data.autoRenew,
        nextPaymentAt: data.nextPaymentAt,
        cancelledAt: data.cancelledAt,
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

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('更新订阅失败:', error);
    return NextResponse.json(
      { error: '更新订阅失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.userSubscription.delete({
      where: { id: (await params).id }
    });

    return NextResponse.json({ message: '订阅删除成功' });
  } catch (error) {
    console.error('删除订阅失败:', error);
    return NextResponse.json(
      { error: '删除订阅失败' },
      { status: 500 }
    );
  }
}
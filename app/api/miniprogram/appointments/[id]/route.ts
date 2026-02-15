import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - 获取预约详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        serviceType: true,
        rating: true
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: '预约不存在' }, { status: 404 });
    }

    return NextResponse.json({
      id: appointment.id,
      orderNo: appointment.orderNo,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      price: appointment.price,
      remark: appointment.remark,
      location: appointment.location,
      contact: appointment.contact,
      serviceType: {
        id: appointment.serviceType.id,
        name: appointment.serviceType.name,
        icon: appointment.serviceType.icon,
        description: appointment.serviceType.description
      },
      rating: appointment.rating ? {
        score: appointment.rating.score,
        comment: appointment.rating.comment,
        createdAt: appointment.rating.createdAt.toISOString()
      } : null,
      createdAt: appointment.createdAt.toISOString()
    });
  } catch (error) {
    console.error('获取预约详情失败:', error);
    return NextResponse.json({ error: '获取预约详情失败' }, { status: 500 });
  }
}

// PUT - 更新预约状态
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // 验证预约存在且属于当前用户
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: '预约不存在' }, { status: 404 });
    }

    // 验证状态转换是否合法
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[appointment.status]?.includes(status)) {
      return NextResponse.json({ error: '无效的状态转换' }, { status: 400 });
    }

    // 更新状态
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      message: '状态更新成功'
    });
  } catch (error) {
    console.error('更新预约状态失败:', error);
    return NextResponse.json({ error: '更新预约状态失败' }, { status: 500 });
  }
}

// DELETE - 取消预约
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;

    // 验证预约存在且属于当前用户
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: '预约不存在' }, { status: 404 });
    }

    // 只有待确认和已确认状态可以取消
    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return NextResponse.json({ error: '当前状态不可取消' }, { status: 400 });
    }

    // 更新状态为已取消
    await prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    // 恢复时间段剩余数量
    await prisma.appointmentSlot.updateMany({
      where: {
        serviceTypeId: appointment.serviceTypeId,
        date: appointment.date,
        startTime: appointment.startTime
      },
      data: { remaining: { increment: 1 } }
    });

    return NextResponse.json({
      message: '取消成功'
    });
  } catch (error) {
    console.error('取消预约失败:', error);
    return NextResponse.json({ error: '取消预约失败' }, { status: 500 });
  }
}

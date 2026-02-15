import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

// GET - 获取预约列表
export async function GET(request: NextRequest) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const where: any = { userId: user.id };
    if (status && status !== 'all') {
      where.status = status;
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          serviceType: true,
          rating: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.appointment.count({ where })
    ]);

    const items = appointments.map(apt => ({
      id: apt.id,
      orderNo: apt.orderNo,
      date: apt.date,
      startTime: apt.startTime,
      endTime: apt.endTime,
      status: apt.status,
      price: apt.price,
      remark: apt.remark,
      location: apt.location,
      serviceType: {
        id: apt.serviceType.id,
        name: apt.serviceType.name,
        icon: apt.serviceType.icon,
        description: apt.serviceType.description
      },
      rated: !!apt.rating,
      createdAt: apt.createdAt.toISOString()
    }));

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error('获取预约列表失败:', error);
    return NextResponse.json({ error: '获取预约列表失败' }, { status: 500 });
  }
}

// POST - 创建预约
export async function POST(request: NextRequest) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceTypeId, date, slotId, remark } = body;

    // 验证必填字段
    if (!serviceTypeId || !date || !slotId) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 获取服务类型
    const serviceType = await prisma.serviceType.findUnique({
      where: { id: serviceTypeId }
    });

    if (!serviceType) {
      return NextResponse.json({ error: '服务类型不存在' }, { status: 404 });
    }

    // 获取时间段
    const slot = await prisma.appointmentSlot.findUnique({
      where: { id: slotId }
    });

    if (!slot) {
      return NextResponse.json({ error: '时间段不存在' }, { status: 404 });
    }

    // 检查时间段是否可用
    if (slot.remaining <= 0) {
      return NextResponse.json({ error: '该时间段已约满' }, { status: 400 });
    }

    // 检查是否有时间冲突
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        userId: user.id,
        date,
        status: { in: ['pending', 'confirmed'] },
        OR: [
          {
            startTime: { lte: slot.startTime },
            endTime: { gt: slot.startTime }
          },
          {
            startTime: { lt: slot.endTime },
            endTime: { gte: slot.endTime }
          },
          {
            startTime: { gte: slot.startTime },
            endTime: { lte: slot.endTime }
          }
        ]
      }
    });

    if (existingAppointment) {
      return NextResponse.json({ error: '该时间段与已有预约冲突' }, { status: 400 });
    }

    // 生成订单号
    const orderNo = `APT${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // 创建预约
    const appointment = await prisma.appointment.create({
      data: {
        orderNo,
        userId: user.id,
        serviceTypeId,
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: serviceType.price,
        remark,
        status: 'pending',
        location: serviceType.location
      },
      include: {
        serviceType: true
      }
    });

    // 更新时间段剩余数量
    await prisma.appointmentSlot.update({
      where: { id: slotId },
      data: { remaining: { decrement: 1 } }
    });

    return NextResponse.json({
      id: appointment.id,
      orderNo: appointment.orderNo,
      message: '预约成功'
    });
  } catch (error) {
    console.error('创建预约失败:', error);
    return NextResponse.json({ error: '创建预约失败' }, { status: 500 });
  }
}

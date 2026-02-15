import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

// GET - 获取可用时间段
export async function GET(request: NextRequest) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceTypeId = searchParams.get('serviceTypeId');
    const date = searchParams.get('date');

    if (!serviceTypeId || !date) {
      return NextResponse.json({ error: '缺少必填参数' }, { status: 400 });
    }

    // 获取该日期的时间段
    let slots = await prisma.appointmentSlot.findMany({
      where: {
        serviceTypeId,
        date,
        remaining: { gt: 0 }
      },
      orderBy: { startTime: 'asc' }
    });

    // 如果没有预设时间段，生成默认时间段
    if (slots.length === 0) {
      const serviceType = await prisma.serviceType.findUnique({
        where: { id: serviceTypeId }
      });

      if (serviceType) {
        // 生成默认时间段 (9:00-18:00, 每小时一个)
        const defaultSlots = [];
        for (let hour = 9; hour < 18; hour++) {
          const startTime = `${hour.toString().padStart(2, '0')}:00`;
          const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
          
          defaultSlots.push({
            serviceTypeId,
            date,
            startTime,
            endTime,
            capacity: 5,
            remaining: 5
          });
        }

        // 批量创建时间段
        await prisma.appointmentSlot.createMany({
          data: defaultSlots
        });

        // 重新查询
        slots = await prisma.appointmentSlot.findMany({
          where: {
            serviceTypeId,
            date,
            remaining: { gt: 0 }
          },
          orderBy: { startTime: 'asc' }
        });
      }
    }

    // 过滤掉已过期的时间段（当天）
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    if (date === today) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      slots = slots.filter(slot => slot.startTime > currentTime);
    }

    const result = slots.map(slot => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      remaining: slot.remaining,
      capacity: slot.capacity,
      available: slot.remaining > 0
    }));

    return NextResponse.json({ slots: result });
  } catch (error) {
    console.error('获取时间段失败:', error);
    return NextResponse.json({ error: '获取时间段失败' }, { status: 500 });
  }
}

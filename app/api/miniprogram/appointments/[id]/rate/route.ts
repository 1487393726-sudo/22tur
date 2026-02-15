import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMiniprogramToken } from '@/lib/miniprogram/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - 提交预约评价
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyMiniprogramToken(request);
    if (!user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { score, comment } = body;

    // 验证评分
    if (!score || score < 1 || score > 5) {
      return NextResponse.json({ error: '评分必须在1-5之间' }, { status: 400 });
    }

    // 验证预约存在且属于当前用户
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        rating: true
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: '预约不存在' }, { status: 404 });
    }

    // 只有已完成的预约可以评价
    if (appointment.status !== 'completed') {
      return NextResponse.json({ error: '只有已完成的预约可以评价' }, { status: 400 });
    }

    // 检查是否已评价
    if (appointment.rating) {
      return NextResponse.json({ error: '该预约已评价' }, { status: 400 });
    }

    // 创建评价
    const rating = await prisma.appointmentRating.create({
      data: {
        appointmentId: id,
        userId: user.id,
        score,
        comment: comment || ''
      }
    });

    return NextResponse.json({
      id: rating.id,
      message: '评价成功'
    });
  } catch (error) {
    console.error('提交评价失败:', error);
    return NextResponse.json({ error: '提交评价失败' }, { status: 500 });
  }
}

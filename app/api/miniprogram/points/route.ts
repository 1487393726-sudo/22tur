import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMiniprogramUser } from '@/lib/miniprogram/auth';

// GET /api/miniprogram/points - 获取积分信息和明细
export async function GET(request: NextRequest) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // earn, spend, all
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // 获取用户积分
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId: user.id }
    });

    const points = userPoints?.balance || 0;

    // 构建查询条件
    const where: any = { userId: user.id };
    
    if (type === 'earn') {
      where.amount = { gt: 0 };
    } else if (type === 'spend') {
      where.amount = { lt: 0 };
    }

    // 获取积分记录
    const records = await prisma.pointsRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    const formattedRecords = records.map(record => ({
      id: record.id,
      title: record.title,
      amount: record.amount,
      type: record.type,
      createdAt: record.createdAt.toISOString().slice(0, 16).replace('T', ' ')
    }));

    return NextResponse.json({
      success: true,
      points,
      records: formattedRecords
    });
  } catch (error) {
    console.error('获取积分信息失败:', error);
    return NextResponse.json(
      { success: false, error: '获取失败' },
      { status: 500 }
    );
  }
}

// POST /api/miniprogram/points - 积分操作（签到等）
export async function POST(request: NextRequest) {
  try {
    const user = await getMiniprogramUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'checkin') {
      // 每日签到
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 检查今日是否已签到
      const existingCheckin = await prisma.pointsRecord.findFirst({
        where: {
          userId: user.id,
          type: 'checkin',
          createdAt: { gte: today }
        }
      });

      if (existingCheckin) {
        return NextResponse.json({
          success: false,
          error: '今日已签到'
        });
      }

      // 签到奖励积分
      const checkinPoints = 5;

      await prisma.$transaction([
        prisma.userPoints.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            balance: checkinPoints,
            totalEarned: checkinPoints
          },
          update: {
            balance: { increment: checkinPoints },
            totalEarned: { increment: checkinPoints }
          }
        }),
        prisma.pointsRecord.create({
          data: {
            userId: user.id,
            amount: checkinPoints,
            type: 'checkin',
            title: '每日签到'
          }
        })
      ]);

      return NextResponse.json({
        success: true,
        message: '签到成功',
        points: checkinPoints
      });
    }

    return NextResponse.json(
      { success: false, error: '未知操作' },
      { status: 400 }
    );
  } catch (error) {
    console.error('积分操作失败:', error);
    return NextResponse.json(
      { success: false, error: '操作失败' },
      { status: 500 }
    );
  }
}

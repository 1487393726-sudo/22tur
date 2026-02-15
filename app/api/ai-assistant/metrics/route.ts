/**
 * AI 助手指标 API
 * 提供 AI 助手的使用统计和性能指标
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const days = parseInt(searchParams.get('days') || '30');

    // 计算时间范围
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // 构建查询条件
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    // 获取对话统计
    const totalConversations = await prisma.aIConversation.count({
      where: {
        ...whereClause,
        isActive: true,
      },
    });

    // 获取建议统计
    const totalRecommendations = await prisma.recommendation.count({
      where: whereClause,
    });

    const appliedRecommendations = await prisma.recommendation.count({
      where: {
        ...whereClause,
        status: 'APPLIED',
      },
    });

    // 获取 AI 调用统计
    const aiCallStats = await prisma.aICallLog.aggregate({
      where: whereClause,
      _avg: {
        duration: true,
      },
      _count: {
        id: true,
      },
    });

    const successfulCalls = await prisma.aICallLog.count({
      where: {
        ...whereClause,
        status: 'SUCCESS',
      },
    });

    const averageResponseTime = (aiCallStats._avg.duration || 0) / 1000; // 转换为秒
    const totalCalls = aiCallStats._count.id || 0;
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

    // 获取操作分布
    const operationStats = await prisma.aICallLog.groupBy({
      by: ['operation'],
      where: whereClause,
      _count: {
        operation: true,
      },
      orderBy: {
        _count: {
          operation: 'desc',
        },
      },
      take: 5,
    });

    // 获取每日使用趋势
    const dailyUsage = await getDailyUsageTrend(startDate, endDate, projectId);

    // 获取用户活跃度
    const activeUsers = await prisma.aIConversation.findMany({
      where: {
        ...whereClause,
        isActive: true,
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    const metrics = {
      totalConversations,
      totalRecommendations,
      appliedRecommendations,
      averageResponseTime,
      successRate,
      totalCalls,
      activeUsers: activeUsers.length,
      operationBreakdown: operationStats.map(stat => ({
        operation: stat.operation,
        count: stat._count.operation,
      })),
      dailyUsage,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days,
      },
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error getting AI metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get AI metrics' },
      { status: 500 }
    );
  }
}

async function getDailyUsageTrend(startDate: Date, endDate: Date, projectId?: string): Promise<Array<{ date: string; conversations: number; recommendations: number; calls: number }>> {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const trend = [];

  for (let i = 0; i < days; i++) {
    const dayStart = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const whereClause: any = {
      createdAt: {
        gte: dayStart,
        lt: dayEnd,
      },
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    const [conversations, recommendations, calls] = await Promise.all([
      prisma.aIConversation.count({
        where: {
          ...whereClause,
          isActive: true,
        },
      }),
      prisma.recommendation.count({
        where: whereClause,
      }),
      prisma.aICallLog.count({
        where: whereClause,
      }),
    ]);

    trend.push({
      date: dayStart.toISOString().split('T')[0],
      conversations,
      recommendations,
      calls,
    });
  }

  return trend;
}
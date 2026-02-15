// 邮件日志统计 API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/email-logs/stats
 * 获取邮件发送统计
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 检查是否为管理员
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // 计算日期范围
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 基础查询条件
    const baseWhere = {
      action: {
        in: ['EMAIL_SENT', 'EMAIL_FAILED'],
      },
      createdAt: {
        gte: startDate,
      },
    };

    // 总体统计
    const [total, successful, failed] = await Promise.all([
      prisma.auditLog.count({ where: baseWhere }),
      prisma.auditLog.count({
        where: { ...baseWhere, status: 'SUCCESS' },
      }),
      prisma.auditLog.count({
        where: { ...baseWhere, status: 'FAILED' },
      }),
    ]);

    // 按日期统计
    const dailyLogs = await prisma.auditLog.findMany({
      where: baseWhere,
      select: {
        createdAt: true,
        status: true,
      },
    });

    // 按日期分组
    const dailyStats: Record<string, { date: string; sent: number; failed: number }> = {};
    
    dailyLogs.forEach((log) => {
      const date = log.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { date, sent: 0, failed: 0 };
      }
      if (log.status === 'SUCCESS') {
        dailyStats[date].sent++;
      } else {
        dailyStats[date].failed++;
      }
    });

    const dailyData = Object.values(dailyStats).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // 最近失败的邮件
    const recentFailures = await prisma.auditLog.findMany({
      where: {
        ...baseWhere,
        status: 'FAILED',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // 解析失败详情
    const parsedFailures = recentFailures.map((log) => {
      let details: any = {};
      try {
        details = log.details ? JSON.parse(log.details) : {};
      } catch (e) {
        console.error('解析日志详情失败:', e);
      }

      return {
        id: log.id,
        userId: log.userId,
        user: log.user,
        recipient: log.resourceId,
        subject: details.subject || '',
        error: details.error || '未知错误',
        createdAt: log.createdAt,
      };
    });

    // 成功率
    const successRate = total > 0 ? ((successful / total) * 100).toFixed(2) : '0';

    return NextResponse.json({
      summary: {
        total,
        successful,
        failed,
        successRate: parseFloat(successRate),
        period: `${days} 天`,
      },
      daily: dailyData,
      recentFailures: parsedFailures,
    });
  } catch (error) {
    console.error('获取邮件统计失败:', error);
    return NextResponse.json(
      { error: '获取邮件统计失败' },
      { status: 500 }
    );
  }
}

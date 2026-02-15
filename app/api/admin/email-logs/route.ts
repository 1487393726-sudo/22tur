// 邮件日志查看 API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/email-logs
 * 获取邮件发送日志
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
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;

    // 筛选参数
    const userId = searchParams.get('userId');
    const status = searchParams.get('status'); // SUCCESS, FAILED
    const action = searchParams.get('action'); // EMAIL_SENT, EMAIL_FAILED
    const search = searchParams.get('search'); // 搜索邮箱或主题
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 构建查询条件
    const where: any = {
      action: {
        in: ['EMAIL_SENT', 'EMAIL_FAILED'],
      },
    };

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (action) {
      where.action = action;
    }

    if (search) {
      where.OR = [
        { resourceId: { contains: search, mode: 'insensitive' } }, // 邮箱
        { details: { contains: search, mode: 'insensitive' } }, // 主题在details中
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // 查询日志
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // 解析日志详情
    const parsedLogs = logs.map((log) => {
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
        action: log.action,
        recipient: log.resourceId, // 收件人邮箱
        subject: details.subject || '',
        status: log.status,
        success: details.success,
        duration: details.duration,
        error: details.error,
        createdAt: log.createdAt,
      };
    });

    return NextResponse.json({
      data: parsedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('获取邮件日志失败:', error);
    return NextResponse.json(
      { error: '获取邮件日志失败' },
      { status: 500 }
    );
  }
}

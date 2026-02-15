import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 只有管理员可以导出审计日志
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const exportFormat = searchParams.get('format') || 'csv'; // csv 或 json
    
    // 筛选参数（与 GET /api/security/logs 相同）
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const status = searchParams.get('status');
    const risk = searchParams.get('risk');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    // 构建查询条件
    const where: any = {};
    
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resource) where.resource = { contains: resource, mode: 'insensitive' };
    if (status) where.status = status;
    if (risk) where.risk = risk;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    if (search) {
      where.OR = [
        { resource: { contains: search, mode: 'insensitive' } },
        { resourceId: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 查询所有符合条件的日志（限制最多10000条）
    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10000 // 限制最多导出10000条
    });

    if (exportFormat === 'json') {
      // JSON 格式导出
      const jsonData = logs.map(log => ({
        id: log.id,
        userId: log.userId,
        userName: log.user ? `${log.user.firstName} ${log.user.lastName}` : null,
        userEmail: log.user?.email,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        status: log.status,
        risk: log.risk,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        sessionId: log.sessionId,
        details: log.details ? JSON.parse(log.details) : null,
        createdAt: log.createdAt.toISOString()
      }));

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json"`
        }
      });
    } else {
      // CSV 格式导出
      const csvRows = [
        // CSV 头部
        [
          'ID',
          '用户ID',
          '用户名',
          '用户邮箱',
          '操作',
          '资源',
          '资源ID',
          '状态',
          '风险等级',
          'IP地址',
          'User Agent',
          '会话ID',
          '详情',
          '创建时间'
        ].join(',')
      ];

      // CSV 数据行
      logs.forEach(log => {
        const row = [
          log.id,
          log.userId || '',
          log.user ? `${log.user.firstName} ${log.user.lastName}` : '',
          log.user?.email || '',
          log.action,
          log.resource,
          log.resourceId || '',
          log.status,
          log.risk,
          log.ipAddress || '',
          log.userAgent ? `"${log.userAgent.replace(/"/g, '""')}"` : '',
          log.sessionId || '',
          log.details ? `"${log.details.replace(/"/g, '""')}"` : '',
          format(log.createdAt, 'yyyy-MM-dd HH:mm:ss')
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv"`
        }
      });
    }
  } catch (error) {
    console.error('导出安全日志失败:', error);
    return NextResponse.json({ error: '导出安全日志失败' }, { status: 500 });
  }
}

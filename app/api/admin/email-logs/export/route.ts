// 邮件日志导出 API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/email-logs/export
 * 导出邮件日志为 CSV
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
    
    // 筛选参数
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 构建查询条件
    const where: any = {
      action: {
        in: ['EMAIL_SENT', 'EMAIL_FAILED'],
      },
    };

    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { resourceId: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // 查询日志（限制最多10000条）
    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    // 生成 CSV
    const csvRows: string[] = [];
    
    // CSV 头部
    csvRows.push([
      '时间',
      '收件人',
      '主题',
      '发送人邮箱',
      '发送人姓名',
      '状态',
      '成功',
      '耗时(ms)',
      '错误信息',
    ].join(','));

    // CSV 数据行
    logs.forEach((log) => {
      let details: any = {};
      try {
        details = log.details ? JSON.parse(log.details) : {};
      } catch (e) {
        console.error('解析日志详情失败:', e);
      }

      const row = [
        log.createdAt.toISOString(),
        log.resourceId || '',
        `"${(details.subject || '').replace(/"/g, '""')}"`, // 转义引号
        log.user.email,
        `${log.user.firstName} ${log.user.lastName}`,
        log.status,
        details.success ? '是' : '否',
        details.duration || '',
        `"${(details.error || '').replace(/"/g, '""')}"`, // 转义引号
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');
    
    // 添加 BOM 以支持 Excel 正确显示中文
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    // 返回 CSV 文件
    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="email-logs-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('导出邮件日志失败:', error);
    return NextResponse.json(
      { error: '导出邮件日志失败' },
      { status: 500 }
    );
  }
}

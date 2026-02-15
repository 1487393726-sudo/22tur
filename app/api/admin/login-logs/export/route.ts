// app/api/admin/login-logs/export/route.ts
// 管理员登录日志导出 API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { LoginLogService } from '@/lib/auth/login-log-service';
import type { LoginLogFilters, LoginResult, LoginMethod, OAuthProvider } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 解析查询参数
    const searchParams = request.nextUrl.searchParams;
    const format = (searchParams.get('format') as 'csv' | 'json') || 'json';

    const filters: LoginLogFilters = {
      userId: searchParams.get('userId') || undefined,
      identifier: searchParams.get('identifier') || undefined,
      result: (searchParams.get('result') as LoginResult) || undefined,
      method: (searchParams.get('method') as LoginMethod) || undefined,
      provider: (searchParams.get('provider') as OAuthProvider) || undefined,
      startDate: searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : undefined,
      endDate: searchParams.get('endDate')
        ? new Date(searchParams.get('endDate')!)
        : undefined,
    };

    const content = await LoginLogService.exportLogs(filters, format);

    // 设置响应头
    const contentType = format === 'csv' ? 'text/csv' : 'application/json';
    const filename = `login-logs-${new Date().toISOString().split('T')[0]}.${format}`;

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Failed to export login logs:', error);
    return NextResponse.json(
      { error: 'Failed to export login logs' },
      { status: 500 }
    );
  }
}

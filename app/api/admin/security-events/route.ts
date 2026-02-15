// app/api/admin/security-events/route.ts
// 管理员安全事件 API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { AnomalyService } from '@/lib/auth/anomaly-service';
import type { SecurityEventType, SecuritySeverity } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 解析查询参数
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      userId: searchParams.get('userId') || undefined,
      eventType: (searchParams.get('eventType') as SecurityEventType) || undefined,
      severity: (searchParams.get('severity') as SecuritySeverity) || undefined,
      resolved: searchParams.has('resolved')
        ? searchParams.get('resolved') === 'true'
        : undefined,
      startDate: searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : undefined,
      endDate: searchParams.get('endDate')
        ? new Date(searchParams.get('endDate')!)
        : undefined,
      page: searchParams.get('page')
        ? parseInt(searchParams.get('page')!, 10)
        : 1,
      pageSize: searchParams.get('pageSize')
        ? parseInt(searchParams.get('pageSize')!, 10)
        : 20,
    };

    const result = await AnomalyService.getSecurityEvents(filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get security events:', error);
    return NextResponse.json(
      { error: 'Failed to get security events' },
      { status: 500 }
    );
  }
}

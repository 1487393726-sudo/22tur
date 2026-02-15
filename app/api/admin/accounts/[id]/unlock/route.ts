// app/api/admin/accounts/[id]/unlock/route.ts
// 管理员解锁账户 API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { AnomalyService } from '@/lib/auth/anomaly-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证管理员权限
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: identifier } = await params;

    // 检查账户是否被锁定
    const lock = await AnomalyService.getAccountLock(identifier);
    if (!lock) {
      return NextResponse.json(
        { error: 'Account is not locked' },
        { status: 400 }
      );
    }

    // 解锁账户
    await AnomalyService.unlockAccount(
      identifier,
      session.user.email || session.user.name || 'admin'
    );

    return NextResponse.json({
      success: true,
      message: 'Account unlocked successfully',
    });
  } catch (error) {
    console.error('Failed to unlock account:', error);
    return NextResponse.json(
      { error: 'Failed to unlock account' },
      { status: 500 }
    );
  }
}

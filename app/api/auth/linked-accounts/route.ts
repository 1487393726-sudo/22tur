// app/api/auth/linked-accounts/route.ts
// 已关联账户 API

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { AccountLinkingService } from '@/lib/auth/account-linking-service';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户 ID（这里假设 session 中有 userId，实际实现可能需要调整）
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    const linkedAccounts = await AccountLinkingService.getLinkedAccounts(userId);

    return NextResponse.json({
      accounts: linkedAccounts,
      count: linkedAccounts.length,
    });
  } catch (error) {
    console.error('Failed to get linked accounts:', error);
    return NextResponse.json(
      { error: 'Failed to get linked accounts' },
      { status: 500 }
    );
  }
}

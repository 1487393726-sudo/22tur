// app/api/auth/linked-accounts/[provider]/route.ts
// 解除账户关联 API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { AccountLinkingService } from '@/lib/auth/account-linking-service';
import type { OAuthProvider } from '@/types/auth';

const VALID_PROVIDERS: OAuthProvider[] = ['google', 'github', 'wechat', 'qq'];

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await params;

    // 验证提供商
    if (!VALID_PROVIDERS.includes(provider as OAuthProvider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }

    // 获取用户 ID
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    const result = await AccountLinkingService.unlinkAccount(
      userId,
      provider as OAuthProvider
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to unlink account:', error);
    return NextResponse.json(
      { error: 'Failed to unlink account' },
      { status: 500 }
    );
  }
}

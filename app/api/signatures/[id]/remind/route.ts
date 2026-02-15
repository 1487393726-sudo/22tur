/**
 * Signature Reminder API
 * 签名提醒 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { signatureService } from '@/lib/signature';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/signatures/[id]/remind
 * 发送签名提醒
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { signerId } = body;

    if (!signerId) {
      return NextResponse.json({ error: '缺少签名者 ID' }, { status: 400 });
    }

    const success = await signatureService.sendReminder(id, signerId);

    if (!success) {
      return NextResponse.json({ error: '发送提醒失败' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '提醒已发送',
    });
  } catch (error) {
    console.error('[Signatures API] Remind error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '发送提醒失败' },
      { status: 500 }
    );
  }
}

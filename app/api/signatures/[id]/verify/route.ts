/**
 * Signature Verification API
 * 签名验证 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { signatureService } from '@/lib/signature';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/signatures/[id]/verify
 * 验证签名
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const verification = await signatureService.verifySignature(id);

    return NextResponse.json({
      success: true,
      data: verification,
    });
  } catch (error) {
    console.error('[Signatures API] Verify error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '验证签名失败' },
      { status: 500 }
    );
  }
}

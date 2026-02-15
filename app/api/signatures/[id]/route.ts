/**
 * Signature Request Detail API
 * 签名请求详情 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { signatureService, pdfGenerator } from '@/lib/signature';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/signatures/[id]
 * 获取签名请求详情
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const signatureRequest = await signatureService.getRequest(id);

    if (!signatureRequest) {
      return NextResponse.json({ error: '签名请求不存在' }, { status: 404 });
    }

    // 获取审计日志
    const auditLog = await signatureService.getAuditLog(id);

    return NextResponse.json({
      success: true,
      data: {
        request: signatureRequest,
        auditLog,
      },
    });
  } catch (error) {
    console.error('[Signatures API] GET detail error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取签名请求失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/signatures/[id]
 * 取消签名请求
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    const success = await signatureService.cancelRequest(id, reason);

    if (!success) {
      return NextResponse.json({ error: '取消签名请求失败' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '签名请求已取消',
    });
  } catch (error) {
    console.error('[Signatures API] DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '取消签名请求失败' },
      { status: 500 }
    );
  }
}

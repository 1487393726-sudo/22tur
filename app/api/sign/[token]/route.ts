/**
 * Signing Token API
 * 签名 Token API - 用于签名页面
 */

import { NextRequest, NextResponse } from 'next/server';
import { signatureService } from '@/lib/signature';
import { headers } from 'next/headers';

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * GET /api/sign/[token]
 * 获取签名信息
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    // 验证 token
    const tokenInfo = await signatureService.verifyToken(token);
    if (!tokenInfo) {
      return NextResponse.json({ error: '签名链接无效或已过期' }, { status: 400 });
    }

    // 获取签名请求
    const signatureRequest = await signatureService.getRequest(tokenInfo.requestId);
    if (!signatureRequest) {
      return NextResponse.json({ error: '签名请求不存在' }, { status: 404 });
    }

    // 获取签名者信息
    const signer = signatureRequest.signers.find((s) => s.id === tokenInfo.signerId);
    if (!signer) {
      return NextResponse.json({ error: '签名者不存在' }, { status: 404 });
    }

    // 检查签名者状态
    if (signer.status !== 'PENDING') {
      return NextResponse.json(
        { error: signer.status === 'SIGNED' ? '您已完成签名' : '签名状态无效' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        requestId: signatureRequest.id,
        documentTitle: signatureRequest.documentTitle,
        documentUrl: signatureRequest.documentUrl,
        signerName: signer.name,
        signerEmail: signer.email,
        message: signatureRequest.message,
        expiresAt: signatureRequest.expiresAt.toISOString(),
        status: signer.status,
      },
    });
  } catch (error) {
    console.error('[Sign API] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取签名信息失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sign/[token]
 * 提交签名或拒绝
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { action, signatureData, reason } = body;

    // 获取客户端 IP
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || 'unknown';

    if (action === 'sign') {
      // 提交签名
      if (!signatureData) {
        return NextResponse.json({ error: '缺少签名数据' }, { status: 400 });
      }

      const result = await signatureService.submitSignature(token, {
        ...signatureData,
        ipAddress,
        timestamp: new Date(),
      });

      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else if (action === 'decline') {
      // 拒绝签名
      if (!reason) {
        return NextResponse.json({ error: '请填写拒绝原因' }, { status: 400 });
      }

      const result = await signatureService.declineSignature(token, reason, ipAddress);

      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else {
      return NextResponse.json({ error: '无效的操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Sign API] POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '操作失败' },
      { status: 500 }
    );
  }
}

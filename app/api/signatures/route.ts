/**
 * Signature API
 * 电子签名 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { signatureService } from '@/lib/signature';
import type { CreateSignatureRequestParams } from '@/lib/signature/types';

/**
 * GET /api/signatures
 * 获取签名请求列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    if (!userId) {
      return NextResponse.json({ error: '缺少用户 ID' }, { status: 400 });
    }

    const result = await signatureService.getUserRequests(userId, {
      status: status as any,
      page,
      pageSize,
    });

    return NextResponse.json({
      success: true,
      data: result.requests,
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize),
      },
    });
  } catch (error) {
    console.error('[Signatures API] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取签名请求失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/signatures
 * 创建签名请求
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      documentId,
      documentTitle,
      documentUrl,
      signers,
      expiresInDays,
      message,
      redirectUrl,
      webhookUrl,
    } = body as CreateSignatureRequestParams;

    // 验证必填字段
    if (!documentId || !documentTitle || !documentUrl) {
      return NextResponse.json({ error: '缺少文档信息' }, { status: 400 });
    }

    if (!signers || signers.length === 0) {
      return NextResponse.json({ error: '至少需要一位签名者' }, { status: 400 });
    }

    // 验证签名者信息
    for (const signer of signers) {
      if (!signer.userId || !signer.email || !signer.name) {
        return NextResponse.json({ error: '签名者信息不完整' }, { status: 400 });
      }
    }

    const signatureRequest = await signatureService.createRequest({
      documentId,
      documentTitle,
      documentUrl,
      signers,
      expiresInDays,
      message,
      redirectUrl,
      webhookUrl,
    });

    // 为每个签名者生成签名链接
    const signingUrls = await Promise.all(
      signatureRequest.signers.map(async (signer) => {
        const urlInfo = await signatureService.generateSigningUrl(signatureRequest.id, signer.id);
        return {
          signerId: signer.id,
          signerName: signer.name,
          signerEmail: signer.email,
          ...urlInfo,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        request: signatureRequest,
        signingUrls,
      },
    });
  } catch (error) {
    console.error('[Signatures API] POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建签名请求失败' },
      { status: 500 }
    );
  }
}

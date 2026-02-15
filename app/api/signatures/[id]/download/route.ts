/**
 * Signed PDF Download API
 * 签名 PDF 下载 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { signatureService, pdfGenerator } from '@/lib/signature';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/signatures/[id]/download
 * 下载签名后的 PDF
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const includeAuditTrail = searchParams.get('auditTrail') !== 'false';
    const includeVerificationQR = searchParams.get('qr') !== 'false';

    const signatureRequest = await signatureService.getRequest(id);

    if (!signatureRequest) {
      return NextResponse.json({ error: '签名请求不存在' }, { status: 404 });
    }

    if (signatureRequest.status !== 'COMPLETED') {
      return NextResponse.json({ error: '签名尚未完成，无法下载' }, { status: 400 });
    }

    // 获取审计日志
    const auditLog = await signatureService.getAuditLog(id);

    // 生成 PDF
    const result = await pdfGenerator.generateSignedPDF(signatureRequest, auditLog, {
      includeAuditTrail,
      includeVerificationQR,
    });

    if (!result.success || !result.pdfBuffer) {
      return NextResponse.json({ error: result.error || '生成 PDF 失败' }, { status: 500 });
    }

    // 返回 PDF 文件
    const filename = `signed_${signatureRequest.documentTitle}_${id}.pdf`;

    return new NextResponse(result.pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error('[Signatures API] Download error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '下载失败' },
      { status: 500 }
    );
  }
}

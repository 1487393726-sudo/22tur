/**
 * Signed PDF Generator
 * 签名 PDF 生成服务
 */

import type {
  SignatureRequest,
  SignedPDFOptions,
  AuditLogEntry,
} from './types';

// PDF 生成结果
interface PDFGenerationResult {
  success: boolean;
  pdfBuffer?: Buffer;
  pdfUrl?: string;
  error?: string;
}

// 签名位置信息
interface SignaturePosition {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class SignedPDFGenerator {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  /**
   * 生成签名后的 PDF
   */
  async generateSignedPDF(
    request: SignatureRequest,
    auditLog: AuditLogEntry[],
    options: SignedPDFOptions = {}
  ): Promise<PDFGenerationResult> {
    try {
      const {
        includeAuditTrail = true,
        includeVerificationQR = true,
        watermark,
      } = options;

      // 验证请求状态
      if (request.status !== 'COMPLETED') {
        return {
          success: false,
          error: '签名请求尚未完成',
        };
      }

      // 构建 PDF 内容
      const pdfContent = await this.buildPDFContent(request, auditLog, {
        includeAuditTrail,
        includeVerificationQR,
        watermark,
      });

      // 在实际实现中，这里会使用 pdf-lib 或类似库生成真实 PDF
      // 目前返回模拟数据
      const pdfBuffer = Buffer.from(pdfContent, 'utf-8');

      return {
        success: true,
        pdfBuffer,
        pdfUrl: `${this.baseUrl}/api/signatures/${request.id}/download`,
      };
    } catch (error) {
      console.error('[PDFGenerator] Error generating PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '生成 PDF 失败',
      };
    }
  }

  /**
   * 构建 PDF 内容
   */
  private async buildPDFContent(
    request: SignatureRequest,
    auditLog: AuditLogEntry[],
    options: {
      includeAuditTrail: boolean;
      includeVerificationQR: boolean;
      watermark?: string;
    }
  ): Promise<string> {
    const lines: string[] = [];

    // 文档标题
    lines.push('='.repeat(60));
    lines.push(`签名文档: ${request.documentTitle}`);
    lines.push('='.repeat(60));
    lines.push('');

    // 文档信息
    lines.push('【文档信息】');
    lines.push(`文档 ID: ${request.documentId}`);
    lines.push(`请求 ID: ${request.id}`);
    lines.push(`创建时间: ${request.createdAt.toISOString()}`);
    lines.push(`完成时间: ${request.updatedAt.toISOString()}`);
    lines.push('');

    // 签名者信息
    lines.push('【签名者信息】');
    lines.push('-'.repeat(40));
    for (const signer of request.signers) {
      lines.push(`姓名: ${signer.name}`);
      lines.push(`邮箱: ${signer.email}`);
      lines.push(`状态: ${this.translateStatus(signer.status)}`);
      if (signer.signedAt) {
        lines.push(`签名时间: ${signer.signedAt.toISOString()}`);
      }
      if (signer.ipAddress) {
        lines.push(`IP 地址: ${signer.ipAddress}`);
      }
      lines.push('-'.repeat(40));
    }
    lines.push('');

    // 审计日志
    if (options.includeAuditTrail && auditLog.length > 0) {
      lines.push('【审计日志】');
      lines.push('-'.repeat(40));
      for (const entry of auditLog) {
        lines.push(`[${entry.timestamp.toISOString()}] ${entry.action}`);
        lines.push(`  操作者: ${entry.actor}`);
        if (entry.ipAddress) {
          lines.push(`  IP: ${entry.ipAddress}`);
        }
        if (entry.details) {
          lines.push(`  详情: ${entry.details}`);
        }
      }
      lines.push('');
    }

    // 验证信息
    if (options.includeVerificationQR) {
      lines.push('【验证信息】');
      lines.push(`验证链接: ${this.baseUrl}/verify/signature/${request.id}`);
      lines.push('扫描下方二维码可验证文档签名真实性');
      lines.push('[QR Code Placeholder]');
      lines.push('');
    }

    // 水印
    if (options.watermark) {
      lines.push(`[水印: ${options.watermark}]`);
    }

    // 页脚
    lines.push('='.repeat(60));
    lines.push('本文档由电子签名系统生成');
    lines.push(`生成时间: ${new Date().toISOString()}`);
    lines.push('='.repeat(60));

    return lines.join('\n');
  }

  /**
   * 嵌入签名图片到 PDF
   */
  async embedSignatureImage(
    pdfBuffer: Buffer,
    signatureImage: string,
    position: SignaturePosition
  ): Promise<Buffer> {
    // 在实际实现中，这里会使用 pdf-lib 嵌入签名图片
    // 目前返回原始 buffer
    console.log('[PDFGenerator] Embedding signature at position:', position);
    return pdfBuffer;
  }

  /**
   * 生成验证二维码
   */
  async generateVerificationQR(requestId: string): Promise<string> {
    const verificationUrl = `${this.baseUrl}/verify/signature/${requestId}`;
    
    // 在实际实现中，这里会使用 qrcode 库生成二维码
    // 目前返回占位符
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="10" y="50">QR: ${verificationUrl}</text></svg>`;
  }

  /**
   * 添加水印
   */
  async addWatermark(pdfBuffer: Buffer, watermarkText: string): Promise<Buffer> {
    // 在实际实现中，这里会使用 pdf-lib 添加水印
    console.log('[PDFGenerator] Adding watermark:', watermarkText);
    return pdfBuffer;
  }

  /**
   * 翻译状态
   */
  private translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: '待签名',
      SIGNED: '已签名',
      DECLINED: '已拒绝',
      EXPIRED: '已过期',
    };
    return statusMap[status] || status;
  }

  /**
   * 计算签名位置
   */
  calculateSignaturePosition(
    pageIndex: number,
    signerIndex: number,
    totalSigners: number
  ): SignaturePosition {
    // 默认签名区域在页面底部
    const baseY = 100;
    const signatureHeight = 50;
    const signatureWidth = 150;
    const spacing = 20;

    return {
      page: pageIndex,
      x: 50 + signerIndex * (signatureWidth + spacing),
      y: baseY,
      width: signatureWidth,
      height: signatureHeight,
    };
  }
}

// 导出单例
export const pdfGenerator = new SignedPDFGenerator();

/**
 * Electronic Signature Service
 * 电子签名服务
 */

import { randomUUID } from 'crypto';
import type {
  CreateSignatureRequestParams,
  SignatureRequest,
  SignatureRecord,
  SignatureData,
  SignatureVerificationResult,
  SigningUrlInfo,
  SignatureRequestStatus,
  SignerStatus,
  AuditLogEntry,
  SignedPDFOptions,
} from './types';

// 模拟数据库存储
const signatureRequests = new Map<string, SignatureRequest>();
const signatureRecords = new Map<string, SignatureRecord>();
const signingTokens = new Map<string, { requestId: string; signerId: string; expiresAt: Date }>();
const auditLogs = new Map<string, AuditLogEntry[]>();

export class SignatureService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  /**
   * 创建签名请求
   */
  async createRequest(params: CreateSignatureRequestParams): Promise<SignatureRequest> {
    const requestId = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (params.expiresInDays || 7) * 24 * 60 * 60 * 1000);

    // 创建签名者记录
    const signers: SignatureRecord[] = params.signers.map((signer, index) => {
      const signerId = randomUUID();
      const record: SignatureRecord = {
        id: signerId,
        requestId,
        userId: signer.userId,
        email: signer.email,
        name: signer.name,
        order: signer.order ?? index + 1,
        status: 'PENDING',
      };
      signatureRecords.set(signerId, record);
      return record;
    });

    // 创建签名请求
    const request: SignatureRequest = {
      id: requestId,
      documentId: params.documentId,
      documentTitle: params.documentTitle,
      documentUrl: params.documentUrl,
      status: 'PENDING',
      message: params.message,
      redirectUrl: params.redirectUrl,
      webhookUrl: params.webhookUrl,
      expiresAt,
      createdAt: now,
      updatedAt: now,
      signers,
    };

    signatureRequests.set(requestId, request);

    // 记录审计日志
    this.addAuditLog(requestId, {
      timestamp: now,
      action: 'REQUEST_CREATED',
      actor: 'system',
      details: `签名请求已创建，共 ${signers.length} 位签名者`,
    });

    return request;
  }

  /**
   * 获取签名请求
   */
  async getRequest(requestId: string): Promise<SignatureRequest | null> {
    const request = signatureRequests.get(requestId);
    if (!request) return null;

    // 检查是否过期
    if (new Date() > request.expiresAt && request.status !== 'COMPLETED') {
      request.status = 'EXPIRED';
      signatureRequests.set(requestId, request);
    }

    return request;
  }

  /**
   * 生成签名 URL
   */
  async generateSigningUrl(requestId: string, signerId: string): Promise<SigningUrlInfo> {
    const request = await this.getRequest(requestId);
    if (!request) {
      throw new Error('签名请求不存在');
    }

    const signer = request.signers.find((s) => s.id === signerId);
    if (!signer) {
      throw new Error('签名者不存在');
    }

    if (signer.status !== 'PENDING') {
      throw new Error('签名者状态无效');
    }

    // 生成唯一 token
    const token = randomUUID();
    const expiresAt = new Date(Math.min(request.expiresAt.getTime(), Date.now() + 24 * 60 * 60 * 1000));

    signingTokens.set(token, {
      requestId,
      signerId,
      expiresAt,
    });

    return {
      url: `${this.baseUrl}/sign/${token}`,
      token,
      expiresAt,
    };
  }

  /**
   * 验证签名 token
   */
  async verifyToken(token: string): Promise<{ requestId: string; signerId: string } | null> {
    const tokenData = signingTokens.get(token);
    if (!tokenData) return null;

    if (new Date() > tokenData.expiresAt) {
      signingTokens.delete(token);
      return null;
    }

    return {
      requestId: tokenData.requestId,
      signerId: tokenData.signerId,
    };
  }

  /**
   * 提交签名
   */
  async submitSignature(
    token: string,
    signatureData: SignatureData
  ): Promise<{ success: boolean; message: string }> {
    const tokenInfo = await this.verifyToken(token);
    if (!tokenInfo) {
      return { success: false, message: '签名链接无效或已过期' };
    }

    const { requestId, signerId } = tokenInfo;
    const request = await this.getRequest(requestId);
    if (!request) {
      return { success: false, message: '签名请求不存在' };
    }

    if (request.status === 'EXPIRED' || request.status === 'CANCELLED') {
      return { success: false, message: '签名请求已过期或已取消' };
    }

    const signer = signatureRecords.get(signerId);
    if (!signer) {
      return { success: false, message: '签名者不存在' };
    }

    if (signer.status !== 'PENDING') {
      return { success: false, message: '您已完成签名' };
    }

    // 更新签名记录
    signer.status = 'SIGNED';
    signer.signatureType = signatureData.type;
    signer.signatureData = signatureData.data;
    signer.signedAt = signatureData.timestamp;
    signer.ipAddress = signatureData.ipAddress;
    signer.userAgent = signatureData.userAgent;
    signatureRecords.set(signerId, signer);

    // 更新请求中的签名者
    const signerIndex = request.signers.findIndex((s) => s.id === signerId);
    if (signerIndex !== -1) {
      request.signers[signerIndex] = signer;
    }

    // 更新请求状态
    this.updateRequestStatus(request);
    signatureRequests.set(requestId, request);

    // 删除已使用的 token
    signingTokens.delete(token);

    // 记录审计日志
    this.addAuditLog(requestId, {
      timestamp: new Date(),
      action: 'SIGNATURE_SUBMITTED',
      actor: signer.email,
      ipAddress: signatureData.ipAddress,
      details: `${signer.name} 已完成签名`,
    });

    return { success: true, message: '签名成功' };
  }


  /**
   * 拒绝签名
   */
  async declineSignature(
    token: string,
    reason: string,
    ipAddress: string
  ): Promise<{ success: boolean; message: string }> {
    const tokenInfo = await this.verifyToken(token);
    if (!tokenInfo) {
      return { success: false, message: '签名链接无效或已过期' };
    }

    const { requestId, signerId } = tokenInfo;
    const request = await this.getRequest(requestId);
    if (!request) {
      return { success: false, message: '签名请求不存在' };
    }

    const signer = signatureRecords.get(signerId);
    if (!signer) {
      return { success: false, message: '签名者不存在' };
    }

    // 更新签名记录
    signer.status = 'DECLINED';
    signer.declineReason = reason;
    signatureRecords.set(signerId, signer);

    // 更新请求中的签名者
    const signerIndex = request.signers.findIndex((s) => s.id === signerId);
    if (signerIndex !== -1) {
      request.signers[signerIndex] = signer;
    }

    // 更新请求状态
    this.updateRequestStatus(request);
    signatureRequests.set(requestId, request);

    // 删除已使用的 token
    signingTokens.delete(token);

    // 记录审计日志
    this.addAuditLog(requestId, {
      timestamp: new Date(),
      action: 'SIGNATURE_DECLINED',
      actor: signer.email,
      ipAddress,
      details: `${signer.name} 拒绝签名: ${reason}`,
    });

    return { success: true, message: '已拒绝签名' };
  }

  /**
   * 验证签名
   */
  async verifySignature(requestId: string): Promise<SignatureVerificationResult> {
    const request = await this.getRequest(requestId);
    if (!request) {
      throw new Error('签名请求不存在');
    }

    const isValid = request.status === 'COMPLETED';

    return {
      isValid,
      requestId: request.id,
      documentId: request.documentId,
      signers: request.signers.map((s) => ({
        name: s.name,
        email: s.email,
        signedAt: s.signedAt,
        status: s.status,
      })),
      verifiedAt: new Date(),
    };
  }

  /**
   * 取消签名请求
   */
  async cancelRequest(requestId: string, reason?: string): Promise<boolean> {
    const request = await this.getRequest(requestId);
    if (!request) return false;

    if (request.status === 'COMPLETED') {
      throw new Error('已完成的签名请求无法取消');
    }

    request.status = 'CANCELLED';
    request.updatedAt = new Date();
    signatureRequests.set(requestId, request);

    // 记录审计日志
    this.addAuditLog(requestId, {
      timestamp: new Date(),
      action: 'REQUEST_CANCELLED',
      actor: 'system',
      details: reason || '签名请求已取消',
    });

    return true;
  }

  /**
   * 获取用户的签名请求列表
   */
  async getUserRequests(
    userId: string,
    options?: { status?: SignatureRequestStatus; page?: number; pageSize?: number }
  ): Promise<{ requests: SignatureRequest[]; total: number }> {
    const { status, page = 1, pageSize = 10 } = options || {};

    const allRequests = Array.from(signatureRequests.values()).filter((request) => {
      const isUserSigner = request.signers.some((s) => s.userId === userId);
      const matchesStatus = !status || request.status === status;
      return isUserSigner && matchesStatus;
    });

    const total = allRequests.length;
    const start = (page - 1) * pageSize;
    const requests = allRequests.slice(start, start + pageSize);

    return { requests, total };
  }

  /**
   * 获取待签名列表
   */
  async getPendingSignatures(userId: string): Promise<SignatureRequest[]> {
    return Array.from(signatureRequests.values()).filter((request) => {
      if (request.status !== 'PENDING' && request.status !== 'PARTIALLY_SIGNED') {
        return false;
      }
      return request.signers.some((s) => s.userId === userId && s.status === 'PENDING');
    });
  }

  /**
   * 获取审计日志
   */
  async getAuditLog(requestId: string): Promise<AuditLogEntry[]> {
    return auditLogs.get(requestId) || [];
  }

  /**
   * 发送签名提醒
   */
  async sendReminder(requestId: string, signerId: string): Promise<boolean> {
    const request = await this.getRequest(requestId);
    if (!request) return false;

    const signer = request.signers.find((s) => s.id === signerId);
    if (!signer || signer.status !== 'PENDING') return false;

    // 记录审计日志
    this.addAuditLog(requestId, {
      timestamp: new Date(),
      action: 'REMINDER_SENT',
      actor: 'system',
      details: `已向 ${signer.email} 发送签名提醒`,
    });

    // TODO: 实际发送邮件/短信提醒
    console.log(`[Signature] Reminder sent to ${signer.email} for request ${requestId}`);

    return true;
  }

  /**
   * 更新请求状态
   */
  private updateRequestStatus(request: SignatureRequest): void {
    const pendingCount = request.signers.filter((s) => s.status === 'PENDING').length;
    const signedCount = request.signers.filter((s) => s.status === 'SIGNED').length;
    const totalCount = request.signers.length;

    if (signedCount === totalCount) {
      request.status = 'COMPLETED';
    } else if (signedCount > 0 && pendingCount > 0) {
      request.status = 'PARTIALLY_SIGNED';
    }

    request.updatedAt = new Date();
  }

  /**
   * 添加审计日志
   */
  private addAuditLog(requestId: string, entry: AuditLogEntry): void {
    const logs = auditLogs.get(requestId) || [];
    logs.push(entry);
    auditLogs.set(requestId, logs);
  }

  /**
   * 生成验证二维码数据
   */
  generateVerificationQRData(requestId: string): string {
    return `${this.baseUrl}/verify/signature/${requestId}`;
  }

  /**
   * 检查过期请求
   */
  async checkExpiredRequests(): Promise<number> {
    const now = new Date();
    let expiredCount = 0;

    for (const [id, request] of signatureRequests) {
      if (
        now > request.expiresAt &&
        request.status !== 'COMPLETED' &&
        request.status !== 'EXPIRED' &&
        request.status !== 'CANCELLED'
      ) {
        request.status = 'EXPIRED';
        request.updatedAt = now;
        signatureRequests.set(id, request);

        // 更新所有待签名者状态
        for (const signer of request.signers) {
          if (signer.status === 'PENDING') {
            signer.status = 'EXPIRED';
            signatureRecords.set(signer.id, signer);
          }
        }

        this.addAuditLog(id, {
          timestamp: now,
          action: 'REQUEST_EXPIRED',
          actor: 'system',
          details: '签名请求已过期',
        });

        expiredCount++;
      }
    }

    return expiredCount;
  }
}

// 导出单例
export const signatureService = new SignatureService();

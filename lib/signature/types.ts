/**
 * Electronic Signature Types
 * 电子签名类型定义
 */

// 签名请求状态
export type SignatureRequestStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PARTIALLY_SIGNED'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED';

// 签名者状态
export type SignerStatus = 'PENDING' | 'SIGNED' | 'DECLINED' | 'EXPIRED';

// 签名类型
export type SignatureType = 'DRAW' | 'TYPE' | 'UPLOAD';

// 签名请求创建参数
export interface CreateSignatureRequestParams {
  documentId: string;
  documentTitle: string;
  documentUrl: string;
  signers: SignerInfo[];
  expiresInDays?: number;
  message?: string;
  redirectUrl?: string;
  webhookUrl?: string;
}

// 签名者信息
export interface SignerInfo {
  userId: string;
  email: string;
  name: string;
  order?: number; // 签名顺序，用于顺序签名
  required?: boolean;
}

// 签名请求
export interface SignatureRequest {
  id: string;
  documentId: string;
  documentTitle: string;
  documentUrl: string;
  status: SignatureRequestStatus;
  message?: string;
  redirectUrl?: string;
  webhookUrl?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  signers: SignatureRecord[];
}

// 签名记录
export interface SignatureRecord {
  id: string;
  requestId: string;
  userId: string;
  email: string;
  name: string;
  order: number;
  status: SignerStatus;
  signatureType?: SignatureType;
  signatureData?: string; // Base64 encoded signature image
  signedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  declineReason?: string;
}

// 签名数据（用于捕获签名）
export interface SignatureData {
  type: SignatureType;
  data: string; // Base64 for DRAW/UPLOAD, text for TYPE
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

// 签名验证结果
export interface SignatureVerificationResult {
  isValid: boolean;
  requestId: string;
  documentId: string;
  signers: {
    name: string;
    email: string;
    signedAt?: Date;
    status: SignerStatus;
  }[];
  verifiedAt: Date;
}

// 签名 URL 信息
export interface SigningUrlInfo {
  url: string;
  token: string;
  expiresAt: Date;
}

// 签名完成回调数据
export interface SignatureWebhookPayload {
  event: 'signature.completed' | 'signature.declined' | 'request.completed' | 'request.expired';
  requestId: string;
  documentId: string;
  signerId?: string;
  timestamp: Date;
}

// PDF 生成选项
export interface SignedPDFOptions {
  includeAuditTrail?: boolean;
  includeVerificationQR?: boolean;
  watermark?: string;
}

// 审计日志条目
export interface AuditLogEntry {
  timestamp: Date;
  action: string;
  actor: string;
  ipAddress?: string;
  details?: string;
}

/**
 * KYC (Know Your Customer) Types
 * 投资者认证类型定义
 */

// 证件类型
export type IDType = 'ID_CARD' | 'PASSPORT' | 'DRIVER_LICENSE' | 'OTHER';

// KYC 状态
export type KYCStatus = 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

// KYC 提交数据
export interface KYCSubmissionData {
  userId: string;
  idType: IDType;
  idNumber: string;
  realName: string;
  frontImage: string; // 证件正面图片路径
  backImage?: string; // 证件背面图片路径
  selfieImage?: string; // 手持证件自拍
  nationality?: string;
  dateOfBirth?: Date;
  address?: string;
}

// KYC 记录
export interface KYCRecord {
  id: string;
  userId: string;
  idType: IDType;
  idNumber: string; // 加密存储
  realName: string; // 加密存储
  frontImage: string; // 加密路径
  backImage?: string;
  selfieImage?: string;
  status: KYCStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// KYC 审核数据
export interface KYCReviewData {
  submissionId: string;
  reviewerId: string;
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  expiresAt?: Date; // 认证有效期
}

// KYC 查询参数
export interface KYCQueryParams {
  userId?: string;
  status?: KYCStatus;
  idType?: IDType;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

// KYC 查询结果
export interface KYCQueryResult {
  submissions: KYCRecord[];
  total: number;
  page: number;
  pageSize: number;
}

// KYC 统计
export interface KYCStats {
  total: number;
  pending: number;
  reviewing: number;
  approved: number;
  rejected: number;
  expired: number;
  expiringIn30Days: number;
}

// KYC 通知类型
export type KYCNotificationType = 
  | 'SUBMISSION_RECEIVED'
  | 'REVIEW_STARTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRING_SOON'
  | 'EXPIRED';

// KYC 通知
export interface KYCNotification {
  type: KYCNotificationType;
  userId: string;
  submissionId: string;
  message: string;
  data?: Record<string, unknown>;
}

// 加密配置
export interface EncryptionConfig {
  algorithm: string;
  key: string;
  iv?: string;
}

// KYC 服务接口
export interface IKYCService {
  // 提交 KYC
  submit(data: KYCSubmissionData): Promise<KYCRecord>;
  
  // 获取 KYC 记录
  getById(id: string): Promise<KYCRecord | null>;
  getByUserId(userId: string): Promise<KYCRecord | null>;
  
  // 查询 KYC 记录
  query(params: KYCQueryParams): Promise<KYCQueryResult>;
  
  // 审核 KYC
  review(data: KYCReviewData): Promise<KYCRecord>;
  
  // 获取统计
  getStats(): Promise<KYCStats>;
  
  // 检查过期
  checkExpiring(daysBeforeExpiry: number): Promise<KYCRecord[]>;
  
  // 发送通知
  sendNotification(notification: KYCNotification): Promise<void>;
}

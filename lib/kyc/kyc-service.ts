/**
 * KYC Service
 * 投资者认证服务实现
 */

import crypto from 'crypto';
import {
  KYCSubmissionData,
  KYCRecord,
  KYCReviewData,
  KYCQueryParams,
  KYCQueryResult,
  KYCStats,
  KYCNotification,
  KYCStatus,
  IKYCService,
} from './types';

// 加密配置
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.KYC_ENCRYPTION_KEY || 'default-key-change-in-production';

/**
 * 加密敏感数据
 */
function encryptData(data: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // 返回格式: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * 解密敏感数据
 */
function decryptData(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * 掩码敏感数据（用于显示）
 */
function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  const start = data.slice(0, visibleChars);
  const end = data.slice(-visibleChars);
  const middle = '*'.repeat(data.length - visibleChars * 2);
  return `${start}${middle}${end}`;
}

/**
 * KYC 服务类
 */
export class KYCService implements IKYCService {
  private prisma: any;

  constructor(prismaClient?: any) {
    // 延迟加载 Prisma 以避免循环依赖
    if (prismaClient) {
      this.prisma = prismaClient;
    }
  }

  private async getPrisma() {
    if (!this.prisma) {
      const { prisma } = await import('@/lib/prisma');
      this.prisma = prisma;
    }
    return this.prisma;
  }

  /**
   * 提交 KYC 认证
   */
  async submit(data: KYCSubmissionData): Promise<KYCRecord> {
    const prisma = await this.getPrisma();

    // 检查是否已有待审核或已通过的 KYC
    const existing = await prisma.kYCSubmission?.findFirst({
      where: {
        userId: data.userId,
        status: { in: ['PENDING', 'REVIEWING', 'APPROVED'] },
      },
    });

    if (existing) {
      if (existing.status === 'APPROVED') {
        throw new Error('您已通过 KYC 认证');
      }
      throw new Error('您有待审核的 KYC 申请');
    }

    // 加密敏感数据
    const encryptedIdNumber = encryptData(data.idNumber);
    const encryptedRealName = encryptData(data.realName);
    const encryptedFrontImage = encryptData(data.frontImage);
    const encryptedBackImage = data.backImage ? encryptData(data.backImage) : null;
    const encryptedSelfieImage = data.selfieImage ? encryptData(data.selfieImage) : null;

    // 创建 KYC 记录
    const submission = await prisma.kYCSubmission?.create({
      data: {
        userId: data.userId,
        idType: data.idType,
        idNumber: encryptedIdNumber,
        realName: encryptedRealName,
        frontImage: encryptedFrontImage,
        backImage: encryptedBackImage,
        selfieImage: encryptedSelfieImage,
        status: 'PENDING',
      },
    });

    // 发送提交通知
    await this.sendNotification({
      type: 'SUBMISSION_RECEIVED',
      userId: data.userId,
      submissionId: submission.id,
      message: '您的 KYC 认证申请已提交，我们将尽快审核',
    });

    return this.formatRecord(submission);
  }

  /**
   * 根据 ID 获取 KYC 记录
   */
  async getById(id: string): Promise<KYCRecord | null> {
    const prisma = await this.getPrisma();
    
    const submission = await prisma.kYCSubmission?.findUnique({
      where: { id },
    });

    if (!submission) return null;
    return this.formatRecord(submission);
  }

  /**
   * 根据用户 ID 获取 KYC 记录
   */
  async getByUserId(userId: string): Promise<KYCRecord | null> {
    const prisma = await this.getPrisma();
    
    const submission = await prisma.kYCSubmission?.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!submission) return null;
    return this.formatRecord(submission);
  }

  /**
   * 查询 KYC 记录
   */
  async query(params: KYCQueryParams): Promise<KYCQueryResult> {
    const prisma = await this.getPrisma();
    const { userId, status, idType, startDate, endDate, page = 1, pageSize = 20 } = params;

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (idType) where.idType = idType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [submissions, total] = await Promise.all([
      prisma.kYCSubmission?.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }) || [],
      prisma.kYCSubmission?.count({ where }) || 0,
    ]);

    return {
      submissions: submissions.map((s: any) => this.formatRecord(s)),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 审核 KYC
   */
  async review(data: KYCReviewData): Promise<KYCRecord> {
    const prisma = await this.getPrisma();

    const submission = await prisma.kYCSubmission?.findUnique({
      where: { id: data.submissionId },
    });

    if (!submission) {
      throw new Error('KYC 记录不存在');
    }

    if (submission.status !== 'PENDING' && submission.status !== 'REVIEWING') {
      throw new Error('该 KYC 记录已审核完成');
    }

    // 更新状态
    const updated = await prisma.kYCSubmission?.update({
      where: { id: data.submissionId },
      data: {
        status: data.status,
        reviewedBy: data.reviewerId,
        reviewedAt: new Date(),
        rejectionReason: data.status === 'REJECTED' ? data.rejectionReason : null,
        expiresAt: data.status === 'APPROVED' ? data.expiresAt : null,
      },
    });

    // 如果通过，更新用户验证状态
    if (data.status === 'APPROVED') {
      await prisma.user?.update({
        where: { id: submission.userId },
        data: { isVerified: true },
      });
    }

    // 发送审核结果通知
    await this.sendNotification({
      type: data.status,
      userId: submission.userId,
      submissionId: data.submissionId,
      message: data.status === 'APPROVED' 
        ? '恭喜！您的 KYC 认证已通过' 
        : `您的 KYC 认证未通过，原因：${data.rejectionReason}`,
    });

    return this.formatRecord(updated);
  }

  /**
   * 获取 KYC 统计
   */
  async getStats(): Promise<KYCStats> {
    const prisma = await this.getPrisma();

    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [total, pending, reviewing, approved, rejected, expired, expiringIn30Days] = await Promise.all([
      prisma.kYCSubmission?.count() || 0,
      prisma.kYCSubmission?.count({ where: { status: 'PENDING' } }) || 0,
      prisma.kYCSubmission?.count({ where: { status: 'REVIEWING' } }) || 0,
      prisma.kYCSubmission?.count({ where: { status: 'APPROVED' } }) || 0,
      prisma.kYCSubmission?.count({ where: { status: 'REJECTED' } }) || 0,
      prisma.kYCSubmission?.count({ where: { status: 'EXPIRED' } }) || 0,
      prisma.kYCSubmission?.count({
        where: {
          status: 'APPROVED',
          expiresAt: {
            gte: now,
            lte: thirtyDaysLater,
          },
        },
      }) || 0,
    ]);

    return {
      total,
      pending,
      reviewing,
      approved,
      rejected,
      expired,
      expiringIn30Days,
    };
  }

  /**
   * 检查即将过期的 KYC
   */
  async checkExpiring(daysBeforeExpiry: number = 30): Promise<KYCRecord[]> {
    const prisma = await this.getPrisma();

    const now = new Date();
    const expiryDate = new Date(now.getTime() + daysBeforeExpiry * 24 * 60 * 60 * 1000);

    const submissions = await prisma.kYCSubmission?.findMany({
      where: {
        status: 'APPROVED',
        expiresAt: {
          gte: now,
          lte: expiryDate,
        },
      },
    }) || [];

    return submissions.map((s: any) => this.formatRecord(s));
  }

  /**
   * 处理过期的 KYC
   */
  async processExpired(): Promise<number> {
    const prisma = await this.getPrisma();

    const now = new Date();

    // 查找已过期的 KYC
    const expiredSubmissions = await prisma.kYCSubmission?.findMany({
      where: {
        status: 'APPROVED',
        expiresAt: { lt: now },
      },
    }) || [];

    // 更新状态为过期
    for (const submission of expiredSubmissions) {
      await prisma.kYCSubmission?.update({
        where: { id: submission.id },
        data: { status: 'EXPIRED' },
      });

      // 更新用户验证状态
      await prisma.user?.update({
        where: { id: submission.userId },
        data: { isVerified: false },
      });

      // 发送过期通知
      await this.sendNotification({
        type: 'EXPIRED',
        userId: submission.userId,
        submissionId: submission.id,
        message: '您的 KYC 认证已过期，请重新提交认证',
      });
    }

    return expiredSubmissions.length;
  }

  /**
   * 发送通知
   */
  async sendNotification(notification: KYCNotification): Promise<void> {
    // TODO: 集成通知服务（邮件、短信、站内信）
    console.log('[KYC Notification]', notification);
    
    // 可以在这里调用邮件服务、短信服务等
    // await emailService.send(...)
    // await smsService.send(...)
  }

  /**
   * 格式化 KYC 记录（解密敏感数据）
   */
  private formatRecord(submission: any): KYCRecord {
    return {
      id: submission.id,
      userId: submission.userId,
      idType: submission.idType,
      idNumber: maskSensitiveData(decryptData(submission.idNumber)),
      realName: maskSensitiveData(decryptData(submission.realName), 1),
      frontImage: submission.frontImage, // 保持加密
      backImage: submission.backImage,
      selfieImage: submission.selfieImage,
      status: submission.status,
      reviewedBy: submission.reviewedBy,
      reviewedAt: submission.reviewedAt,
      rejectionReason: submission.rejectionReason,
      expiresAt: submission.expiresAt,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    };
  }

  /**
   * 获取解密后的完整数据（仅管理员使用）
   */
  async getDecryptedRecord(id: string): Promise<KYCRecord | null> {
    const prisma = await this.getPrisma();
    
    const submission = await prisma.kYCSubmission?.findUnique({
      where: { id },
    });

    if (!submission) return null;

    return {
      id: submission.id,
      userId: submission.userId,
      idType: submission.idType,
      idNumber: decryptData(submission.idNumber),
      realName: decryptData(submission.realName),
      frontImage: decryptData(submission.frontImage),
      backImage: submission.backImage ? decryptData(submission.backImage) : undefined,
      selfieImage: submission.selfieImage ? decryptData(submission.selfieImage) : undefined,
      status: submission.status,
      reviewedBy: submission.reviewedBy,
      reviewedAt: submission.reviewedAt,
      rejectionReason: submission.rejectionReason,
      expiresAt: submission.expiresAt,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    };
  }
}

// 导出单例
export const kycService = new KYCService();

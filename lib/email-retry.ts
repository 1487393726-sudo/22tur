// 邮件重试机制
import { prisma } from '@/lib/prisma';

interface EmailQueueItem {
  id: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  userId?: string;
  attempts: number;
  maxAttempts: number;
  lastAttempt?: Date;
  status: 'PENDING' | 'SENDING' | 'SENT' | 'FAILED';
  error?: string;
  createdAt: Date;
}

// 内存队列（生产环境建议使用 Redis 或数据库）
const emailQueue: Map<string, EmailQueueItem> = new Map();

/**
 * 添加邮件到重试队列
 * @param to 收件人
 * @param subject 主题
 * @param html HTML内容
 * @param text 纯文本内容
 * @param userId 用户ID（可选）
 * @param maxAttempts 最大重试次数（默认3次）
 * @returns 队列项ID
 */
export function addToEmailQueue(
  to: string,
  subject: string,
  html: string,
  text?: string,
  userId?: string,
  maxAttempts: number = 3
): string {
  const id = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const item: EmailQueueItem = {
    id,
    to,
    subject,
    html,
    text,
    userId,
    attempts: 0,
    maxAttempts,
    status: 'PENDING',
    createdAt: new Date(),
  };

  emailQueue.set(id, item);
  console.log(`📧 邮件已加入队列: ${id} (${to})`);
  
  return id;
}

/**
 * 从队列中获取待发送的邮件
 * @param limit 最多获取数量
 * @returns 待发送邮件列表
 */
export function getPendingEmails(limit: number = 10): EmailQueueItem[] {
  const pending: EmailQueueItem[] = [];
  
  for (const item of emailQueue.values()) {
    if (item.status === 'PENDING' && item.attempts < item.maxAttempts) {
      pending.push(item);
      if (pending.length >= limit) break;
    }
  }
  
  return pending;
}

/**
 * 标记邮件为发送中
 * @param id 队列项ID
 */
export function markEmailAsSending(id: string): void {
  const item = emailQueue.get(id);
  if (item) {
    item.status = 'SENDING';
    item.attempts++;
    item.lastAttempt = new Date();
  }
}

/**
 * 标记邮件发送成功
 * @param id 队列项ID
 */
export function markEmailAsSent(id: string): void {
  const item = emailQueue.get(id);
  if (item) {
    item.status = 'SENT';
    console.log(`✅ 邮件发送成功: ${id} (${item.to})`);
    
    // 发送成功后，可以选择从队列中移除或保留一段时间
    setTimeout(() => {
      emailQueue.delete(id);
    }, 60000); // 1分钟后清理
  }
}

/**
 * 标记邮件发送失败
 * @param id 队列项ID
 * @param error 错误信息
 */
export function markEmailAsFailed(id: string, error: string): void {
  const item = emailQueue.get(id);
  if (!item) return;

  item.error = error;
  
  if (item.attempts >= item.maxAttempts) {
    item.status = 'FAILED';
    console.error(`❌ 邮件发送失败（已达最大重试次数）: ${id} (${item.to})`);
    console.error(`错误: ${error}`);
    
    // 记录到数据库（如果有 userId）
    if (item.userId) {
      recordFailedEmail(item).catch(console.error);
    }
    
    // 失败后保留一段时间用于调试
    setTimeout(() => {
      emailQueue.delete(id);
    }, 300000); // 5分钟后清理
  } else {
    item.status = 'PENDING';
    console.warn(`⚠️  邮件发送失败，将重试: ${id} (${item.to}) - 尝试 ${item.attempts}/${item.maxAttempts}`);
  }
}

/**
 * 记录失败的邮件到数据库
 * @param item 队列项
 */
async function recordFailedEmail(item: EmailQueueItem): Promise<void> {
  try {
    if (!item.userId) return;

    await prisma.auditLog.create({
      data: {
        userId: item.userId,
        action: 'EMAIL_FAILED',
        resource: 'Email',
        resourceId: item.to,
        details: JSON.stringify({
          subject: item.subject,
          attempts: item.attempts,
          error: item.error,
        }),
        status: 'FAILED',
        risk: 'MEDIUM',
      },
    });
  } catch (error) {
    console.error('记录失败邮件到数据库时出错:', error);
  }
}

/**
 * 获取队列统计信息
 * @returns 统计信息
 */
export function getQueueStats(): {
  total: number;
  pending: number;
  sending: number;
  sent: number;
  failed: number;
} {
  const stats = {
    total: emailQueue.size,
    pending: 0,
    sending: 0,
    sent: 0,
    failed: 0,
  };

  for (const item of emailQueue.values()) {
    switch (item.status) {
      case 'PENDING':
        stats.pending++;
        break;
      case 'SENDING':
        stats.sending++;
        break;
      case 'SENT':
        stats.sent++;
        break;
      case 'FAILED':
        stats.failed++;
        break;
    }
  }

  return stats;
}

/**
 * 清理队列中的旧项目
 * @param maxAge 最大保留时间（毫秒）
 */
export function cleanupQueue(maxAge: number = 3600000): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [id, item] of emailQueue.entries()) {
    const age = now - item.createdAt.getTime();
    
    // 清理已发送或已失败且超过保留时间的项目
    if (age > maxAge && (item.status === 'SENT' || item.status === 'FAILED')) {
      emailQueue.delete(id);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 清理了 ${cleaned} 个旧邮件队列项`);
  }

  return cleaned;
}

/**
 * 计算指数退避延迟时间
 * @param attempt 尝试次数
 * @returns 延迟时间（毫秒）
 */
export function calculateBackoffDelay(attempt: number): number {
  // 指数退避：1秒、2秒、4秒、8秒...
  const baseDelay = 1000;
  const maxDelay = 60000; // 最大1分钟
  
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  
  // 添加随机抖动（±20%）避免雷鸣群效应
  const jitter = delay * 0.2 * (Math.random() - 0.5);
  
  return Math.floor(delay + jitter);
}

/**
 * 获取需要重试的邮件（考虑退避延迟）
 * @param limit 最多获取数量
 * @returns 需要重试的邮件列表
 */
export function getEmailsForRetry(limit: number = 10): EmailQueueItem[] {
  const now = Date.now();
  const retry: EmailQueueItem[] = [];

  for (const item of emailQueue.values()) {
    if (item.status !== 'PENDING' || item.attempts >= item.maxAttempts) {
      continue;
    }

    // 如果是第一次尝试，立即发送
    if (item.attempts === 0) {
      retry.push(item);
      if (retry.length >= limit) break;
      continue;
    }

    // 如果有上次尝试时间，检查是否已过退避延迟
    if (item.lastAttempt) {
      const timeSinceLastAttempt = now - item.lastAttempt.getTime();
      const backoffDelay = calculateBackoffDelay(item.attempts);

      if (timeSinceLastAttempt >= backoffDelay) {
        retry.push(item);
        if (retry.length >= limit) break;
      }
    } else {
      // 没有上次尝试时间，立即重试
      retry.push(item);
      if (retry.length >= limit) break;
    }
  }

  return retry;
}

/**
 * 获取队列中的所有邮件（用于调试）
 * @returns 所有邮件列表
 */
export function getAllQueueItems(): EmailQueueItem[] {
  return Array.from(emailQueue.values());
}

/**
 * 清空整个队列（谨慎使用）
 */
export function clearQueue(): void {
  const size = emailQueue.size;
  emailQueue.clear();
  console.log(`🗑️  已清空邮件队列（${size} 个项目）`);
}

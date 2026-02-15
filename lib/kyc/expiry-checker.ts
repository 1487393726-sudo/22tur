/**
 * KYC Expiry Checker
 * KYC 过期检查和提醒服务
 */

import { kycService } from './kyc-service';
import { KYCRecord } from './types';

// 过期检查配置
interface ExpiryCheckConfig {
  // 提前多少天发送提醒
  reminderDays: number[];
  // 检查间隔（毫秒）
  checkInterval: number;
}

const DEFAULT_CONFIG: ExpiryCheckConfig = {
  reminderDays: [30, 14, 7, 3, 1], // 提前 30、14、7、3、1 天提醒
  checkInterval: 24 * 60 * 60 * 1000, // 每天检查一次
};

/**
 * KYC 过期检查器
 */
export class KYCExpiryChecker {
  private config: ExpiryCheckConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private sentReminders: Map<string, Set<number>> = new Map(); // 记录已发送的提醒

  constructor(config: Partial<ExpiryCheckConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 启动定时检查
   */
  start(): void {
    if (this.intervalId) {
      console.log('[KYC Expiry Checker] 已在运行中');
      return;
    }

    console.log('[KYC Expiry Checker] 启动过期检查服务');
    
    // 立即执行一次检查
    this.check();

    // 设置定时检查
    this.intervalId = setInterval(() => {
      this.check();
    }, this.config.checkInterval);
  }

  /**
   * 停止定时检查
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[KYC Expiry Checker] 已停止');
    }
  }

  /**
   * 执行过期检查
   */
  async check(): Promise<void> {
    console.log('[KYC Expiry Checker] 开始检查过期 KYC...');

    try {
      // 1. 处理已过期的 KYC
      const expiredCount = await kycService.processExpired();
      if (expiredCount > 0) {
        console.log(`[KYC Expiry Checker] 已处理 ${expiredCount} 个过期 KYC`);
      }

      // 2. 发送即将过期提醒
      for (const days of this.config.reminderDays) {
        await this.sendExpiryReminders(days);
      }

      console.log('[KYC Expiry Checker] 检查完成');
    } catch (error) {
      console.error('[KYC Expiry Checker] 检查失败:', error);
    }
  }

  /**
   * 发送即将过期提醒
   */
  private async sendExpiryReminders(daysBeforeExpiry: number): Promise<void> {
    const expiringRecords = await kycService.checkExpiring(daysBeforeExpiry);

    for (const record of expiringRecords) {
      // 检查是否已发送过该天数的提醒
      const sentDays = this.sentReminders.get(record.id) || new Set();
      if (sentDays.has(daysBeforeExpiry)) {
        continue;
      }

      // 计算剩余天数
      const remainingDays = record.expiresAt 
        ? Math.ceil((record.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
        : 0;

      // 只在精确的天数发送提醒
      if (remainingDays !== daysBeforeExpiry) {
        continue;
      }

      // 发送提醒
      await kycService.sendNotification({
        type: 'EXPIRING_SOON',
        userId: record.userId,
        submissionId: record.id,
        message: `您的 KYC 认证将在 ${daysBeforeExpiry} 天后过期，请及时更新`,
        data: {
          expiresAt: record.expiresAt,
          remainingDays: daysBeforeExpiry,
        },
      });

      // 记录已发送
      sentDays.add(daysBeforeExpiry);
      this.sentReminders.set(record.id, sentDays);

      console.log(`[KYC Expiry Checker] 已发送过期提醒: 用户 ${record.userId}, ${daysBeforeExpiry} 天后过期`);
    }
  }

  /**
   * 手动触发检查（用于测试或管理员操作）
   */
  async manualCheck(): Promise<{
    expired: number;
    reminders: number;
  }> {
    let expiredCount = 0;
    let reminderCount = 0;

    try {
      // 处理已过期
      expiredCount = await kycService.processExpired();

      // 发送提醒
      for (const days of this.config.reminderDays) {
        const expiringRecords = await kycService.checkExpiring(days);
        for (const record of expiringRecords) {
          const remainingDays = record.expiresAt 
            ? Math.ceil((record.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
            : 0;

          if (remainingDays === days) {
            await kycService.sendNotification({
              type: 'EXPIRING_SOON',
              userId: record.userId,
              submissionId: record.id,
              message: `您的 KYC 认证将在 ${days} 天后过期，请及时更新`,
            });
            reminderCount++;
          }
        }
      }
    } catch (error) {
      console.error('[KYC Expiry Checker] 手动检查失败:', error);
      throw error;
    }

    return { expired: expiredCount, reminders: reminderCount };
  }

  /**
   * 清除已发送提醒记录（用于测试）
   */
  clearSentReminders(): void {
    this.sentReminders.clear();
  }
}

// 导出单例
export const kycExpiryChecker = new KYCExpiryChecker();

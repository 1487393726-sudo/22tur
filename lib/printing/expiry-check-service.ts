/**
 * 报价过期检查服务
 * Requirements: 3.4
 */

import { prisma } from '@/lib/prisma';
import { expireQuote } from './quote-service';
import { notifyQuoteExpired, notifyQuoteExpiryReminder } from './notification-service';

/**
 * 检查并标记过期报价
 */
export async function checkAndExpireQuotes(): Promise<number> {
  const now = new Date();

  // 查找所有已过期的报价（validUntil < now）
  const expiredQuotes = await prisma.printQuote.findMany({
    where: {
      status: 'quoted',
      validUntil: {
        lt: now,
      },
    },
  });

  let expiredCount = 0;

  // 标记为过期并发送通知
  for (const quote of expiredQuotes) {
    try {
      await expireQuote(quote.id);
      
      // 发送过期通知
      await notifyQuoteExpired(
        quote.customerId,
        quote.quoteNumber,
        quote.id
      );

      expiredCount++;
      console.log(`Quote ${quote.quoteNumber} marked as expired`);
    } catch (error) {
      console.error(`Failed to expire quote ${quote.id}:`, error);
    }
  }

  return expiredCount;
}

/**
 * 发送过期提醒通知（24小时前）
 */
export async function sendExpiryReminders(): Promise<number> {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // 查找所有即将过期的报价（validUntil 在 24 小时内）
  const expiringQuotes = await prisma.printQuote.findMany({
    where: {
      status: 'quoted',
      validUntil: {
        gte: now,
        lte: tomorrow,
      },
    },
  });

  let reminderCount = 0;

  // 发送提醒通知
  for (const quote of expiringQuotes) {
    try {
      // 检查是否已发送过提醒（通过检查是否存在 quote_expiry_reminder 通知）
      const existingReminder = await prisma.printNotification.findFirst({
        where: {
          quoteId: quote.id,
          type: 'quote_expiry_reminder',
        },
      });

      if (!existingReminder) {
        await notifyQuoteExpiryReminder(
          quote.customerId,
          quote.quoteNumber,
          quote.id,
          quote.validUntil!
        );

        reminderCount++;
        console.log(`Expiry reminder sent for quote ${quote.quoteNumber}`);
      }
    } catch (error) {
      console.error(`Failed to send reminder for quote ${quote.id}:`, error);
    }
  }

  return reminderCount;
}

/**
 * 运行完整的过期检查流程
 */
export async function runExpiryCheckCycle(): Promise<{
  expiredCount: number;
  reminderCount: number;
}> {
  console.log('Starting expiry check cycle...');

  try {
    // 先发送提醒
    const reminderCount = await sendExpiryReminders();

    // 再检查过期
    const expiredCount = await checkAndExpireQuotes();

    console.log(
      `Expiry check cycle completed: ${expiredCount} expired, ${reminderCount} reminders sent`
    );

    return { expiredCount, reminderCount };
  } catch (error) {
    console.error('Expiry check cycle failed:', error);
    return { expiredCount: 0, reminderCount: 0 };
  }
}

/**
 * 启动定时任务（每小时运行一次）
 */
let expiryCheckInterval: ReturnType<typeof setInterval> | null = null;

export function startExpiryCheckScheduler(intervalMs: number = 60 * 60 * 1000): void {
  if (expiryCheckInterval) {
    console.warn('Expiry check scheduler already running');
    return;
  }

  // 立即运行一次
  runExpiryCheckCycle().catch(error => {
    console.error('Initial expiry check failed:', error);
  });

  // 设置定时任务
  expiryCheckInterval = setInterval(() => {
    runExpiryCheckCycle().catch(error => {
      console.error('Scheduled expiry check failed:', error);
    });
  }, intervalMs);

  console.log(`Expiry check scheduler started (interval: ${intervalMs}ms)`);
}

/**
 * 停止定时任务
 */
export function stopExpiryCheckScheduler(): void {
  if (expiryCheckInterval) {
    clearInterval(expiryCheckInterval);
    expiryCheckInterval = null;
    console.log('Expiry check scheduler stopped');
  }
}

/**
 * 检查定时任务是否运行中
 */
export function isExpiryCheckSchedulerRunning(): boolean {
  return expiryCheckInterval !== null;
}

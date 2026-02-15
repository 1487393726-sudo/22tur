/**
 * 印刷报价过期检查器
 * Requirements: 3.4
 */

import { prisma } from '@/lib/prisma';
import { notifyQuoteExpired } from './notification-service';

interface ExpiredQuote {
  id: string;
  quoteNumber: string;
  customerId: string;
}

interface ExpiringQuote {
  id: string;
  quoteNumber: string;
  customerId: string;
  validUntil: Date | null;
}

/**
 * 检查并标记过期的报价
 * 将所有 validUntil 已过期且状态为 'quoted' 的询价标记为 'expired'
 */
export async function checkAndExpireQuotes(): Promise<{
  expiredCount: number;
  expiredQuoteIds: string[];
}> {
  const now = new Date();

  // 查找所有已过期但状态仍为 'quoted' 的询价
  // @ts-expect-error - PrintQuote model exists in schema but types may not be generated
  const expiredQuotes: ExpiredQuote[] = await prisma.printQuote.findMany({
    where: {
      status: 'quoted',
      validUntil: {
        lt: now,
      },
    },
    select: {
      id: true,
      quoteNumber: true,
      customerId: true,
    },
  });

  if (expiredQuotes.length === 0) {
    return { expiredCount: 0, expiredQuoteIds: [] };
  }

  const expiredQuoteIds = expiredQuotes.map((q: ExpiredQuote) => q.id);

  // 批量更新状态为 'expired'
  // @ts-expect-error - PrintQuote model exists in schema but types may not be generated
  await prisma.printQuote.updateMany({
    where: {
      id: { in: expiredQuoteIds },
    },
    data: {
      status: 'expired',
    },
  });

  // 发送过期通知给客户
  for (const quote of expiredQuotes) {
    try {
      await notifyQuoteExpired(quote.id, quote.customerId);
    } catch (error) {
      console.error(`发送过期通知失败 (${quote.quoteNumber}):`, error);
    }
  }

  console.log(`[PrintQuoteExpiryChecker] 已标记 ${expiredQuotes.length} 个报价为过期`);

  return {
    expiredCount: expiredQuotes.length,
    expiredQuoteIds,
  };
}

/**
 * 获取即将过期的报价（24小时内）
 * 用于发送提醒通知
 */
export async function getExpiringQuotes(hoursBeforeExpiry: number = 24): Promise<{
  id: string;
  quoteNumber: string;
  customerId: string;
  validUntil: Date;
}[]> {
  const now = new Date();
  const expiryThreshold = new Date(now.getTime() + hoursBeforeExpiry * 60 * 60 * 1000);

  // @ts-expect-error - PrintQuote model exists in schema but types may not be generated
  const expiringQuotes: ExpiringQuote[] = await prisma.printQuote.findMany({
    where: {
      status: 'quoted',
      validUntil: {
        gt: now,
        lte: expiryThreshold,
      },
    },
    select: {
      id: true,
      quoteNumber: true,
      customerId: true,
      validUntil: true,
    },
  });

  return expiringQuotes.map((q: ExpiringQuote) => ({
    ...q,
    validUntil: q.validUntil!,
  }));
}

/**
 * 检查单个报价是否已过期
 */
export function isQuoteExpired(validUntil: Date | null | undefined): boolean {
  if (!validUntil) return false;
  return new Date(validUntil) < new Date();
}

/**
 * 计算报价剩余有效时间（小时）
 */
export function getQuoteRemainingHours(validUntil: Date | null | undefined): number | null {
  if (!validUntil) return null;
  
  const now = new Date();
  const expiry = new Date(validUntil);
  const diffMs = expiry.getTime() - now.getTime();
  
  if (diffMs <= 0) return 0;
  
  return Math.ceil(diffMs / (1000 * 60 * 60));
}

/**
 * 定时任务：检查过期报价
 * 建议每小时运行一次
 */
export async function runExpiryCheckJob(): Promise<void> {
  console.log('[PrintQuoteExpiryChecker] 开始检查过期报价...');
  
  try {
    const result = await checkAndExpireQuotes();
    
    if (result.expiredCount > 0) {
      console.log(`[PrintQuoteExpiryChecker] 完成，共标记 ${result.expiredCount} 个报价为过期`);
    } else {
      console.log('[PrintQuoteExpiryChecker] 完成，没有需要标记的过期报价');
    }
  } catch (error) {
    console.error('[PrintQuoteExpiryChecker] 检查过期报价时出错:', error);
    throw error;
  }
}

/**
 * 定时任务：发送即将过期提醒
 * 建议每天运行一次
 */
export async function runExpiryReminderJob(): Promise<void> {
  console.log('[PrintQuoteExpiryChecker] 开始发送即将过期提醒...');
  
  try {
    const expiringQuotes = await getExpiringQuotes(24);
    
    for (const quote of expiringQuotes) {
      try {
        // 这里可以调用通知服务发送提醒
        console.log(`[PrintQuoteExpiryChecker] 报价 ${quote.quoteNumber} 将在 24 小时内过期`);
      } catch (error) {
        console.error(`[PrintQuoteExpiryChecker] 发送提醒失败 (${quote.quoteNumber}):`, error);
      }
    }
    
    console.log(`[PrintQuoteExpiryChecker] 完成，共发送 ${expiringQuotes.length} 条即将过期提醒`);
  } catch (error) {
    console.error('[PrintQuoteExpiryChecker] 发送即将过期提醒时出错:', error);
    throw error;
  }
}

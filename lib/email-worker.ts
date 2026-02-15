// 邮件队列处理器
import { sendEmail } from '@/lib/email';
import {
  getEmailsForRetry,
  markEmailAsSending,
  markEmailAsSent,
  markEmailAsFailed,
  cleanupQueue,
  getQueueStats,
} from '@/lib/email-retry';

let isProcessing = false;
let processingInterval: NodeJS.Timeout | null = null;

/**
 * 处理邮件队列
 * @returns Promise<{ processed: number; succeeded: number; failed: number }>
 */
export async function processEmailQueue(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  if (isProcessing) {
    console.log('⏳ 邮件队列正在处理中，跳过本次');
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  isProcessing = true;
  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  try {
    // 获取需要发送的邮件（最多10封）
    const emails = getEmailsForRetry(10);

    if (emails.length === 0) {
      return { processed, succeeded, failed };
    }

    console.log(`📬 开始处理 ${emails.length} 封邮件...`);

    // 逐个处理邮件
    for (const email of emails) {
      processed++;
      markEmailAsSending(email.id);

      try {
        // 发送邮件
        const success = await sendEmail({
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text,
        });

        if (success) {
          markEmailAsSent(email.id);
          succeeded++;
        } else {
          markEmailAsFailed(email.id, '发送失败（未知原因）');
          failed++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        markEmailAsFailed(email.id, errorMessage);
        failed++;
      }

      // 添加短暂延迟，避免过快发送
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`✅ 邮件处理完成: ${succeeded} 成功, ${failed} 失败`);
  } catch (error) {
    console.error('处理邮件队列时出错:', error);
  } finally {
    isProcessing = false;
  }

  return { processed, succeeded, failed };
}

/**
 * 启动邮件队列处理器（定时任务）
 * @param intervalMs 处理间隔（毫秒），默认30秒
 */
export function startEmailWorker(intervalMs: number = 30000): void {
  if (processingInterval) {
    console.log('⚠️  邮件处理器已在运行');
    return;
  }

  console.log(`🚀 启动邮件队列处理器（间隔: ${intervalMs}ms）`);

  // 立即处理一次
  processEmailQueue().catch(console.error);

  // 定时处理
  processingInterval = setInterval(() => {
    processEmailQueue().catch(console.error);
  }, intervalMs);

  // 定时清理队列（每小时）
  setInterval(() => {
    cleanupQueue();
  }, 3600000);
}

/**
 * 停止邮件队列处理器
 */
export function stopEmailWorker(): void {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
    console.log('🛑 邮件队列处理器已停止');
  }
}

/**
 * 获取处理器状态
 * @returns 状态信息
 */
export function getWorkerStatus(): {
  isRunning: boolean;
  isProcessing: boolean;
  queueStats: ReturnType<typeof getQueueStats>;
} {
  return {
    isRunning: processingInterval !== null,
    isProcessing,
    queueStats: getQueueStats(),
  };
}

/**
 * 手动触发队列处理
 * @returns Promise<处理结果>
 */
export async function triggerEmailProcessing(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  console.log('🔄 手动触发邮件队列处理...');
  return processEmailQueue();
}

// 在开发环境自动启动处理器
if (process.env.NODE_ENV === 'development') {
  // 开发环境使用较短的间隔（10秒）
  startEmailWorker(10000);
}

// 在生产环境，需要在应用启动时手动调用 startEmailWorker()
// 例如在 app/api/route.ts 或其他初始化文件中

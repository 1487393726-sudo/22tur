/**
 * Notification Processor
 * 通知推送处理器
 */

import {
  ProcessorRegistration,
  NotificationJobData,
  Job,
} from '../types';

interface NotificationResult {
  notificationId: string;
  userId: string;
  delivered: boolean;
  channel: 'websocket' | 'push' | 'database';
}

/**
 * 发送通知（模拟实现）
 */
async function sendNotification(data: NotificationJobData): Promise<NotificationResult> {
  // 模拟通知发送延迟
  await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
  
  return {
    notificationId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: data.userId,
    delivered: true,
    channel: 'database', // 默认存储到数据库
  };
}

/**
 * 通知处理器
 */
export const notificationProcessor: ProcessorRegistration<NotificationJobData, NotificationResult> = {
  name: 'send-notification',
  type: 'notification',
  concurrency: 20,
  processor: async (job: Job<NotificationJobData>, progress) => {
    const { data } = job;
    
    // 验证必要字段
    if (!data.userId || !data.title || !data.message) {
      throw new Error('Missing required notification fields: userId, title, message');
    }

    progress(30);

    // 发送通知
    const result = await sendNotification(data);

    progress(100);

    return result;
  },
};

/**
 * 创建通知任务数据
 */
export function createNotificationJobData(
  userId: string,
  title: string,
  message: string,
  options?: {
    type?: NotificationJobData['type'];
    link?: string;
  }
): NotificationJobData {
  return {
    userId,
    title,
    message,
    type: options?.type || 'info',
    link: options?.link,
  };
}

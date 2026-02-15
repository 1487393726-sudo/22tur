/**
 * Email Processor
 * 邮件发送处理器
 */

import {
  ProcessorRegistration,
  EmailJobData,
  Job,
} from '../types';

interface EmailSendResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

/**
 * 发送邮件（模拟实现）
 */
async function sendEmail(data: EmailJobData): Promise<EmailSendResult> {
  // 模拟邮件发送延迟
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  const recipients = Array.isArray(data.to) ? data.to : [data.to];
  
  // 模拟发送结果
  return {
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    accepted: recipients,
    rejected: [],
  };
}

/**
 * 邮件处理器
 */
export const emailProcessor: ProcessorRegistration<EmailJobData, EmailSendResult> = {
  name: 'send-email',
  type: 'email',
  concurrency: 5,
  processor: async (job: Job<EmailJobData>, progress) => {
    const { data } = job;
    
    // 验证必要字段
    if (!data.to || !data.subject || !data.body) {
      throw new Error('Missing required email fields: to, subject, body');
    }

    progress(10);

    // 处理收件人列表
    const recipients = Array.isArray(data.to) ? data.to : [data.to];
    if (recipients.length === 0) {
      throw new Error('No recipients specified');
    }

    progress(30);

    // 发送邮件
    const result = await sendEmail(data);

    progress(90);

    // 检查发送结果
    if (result.rejected.length > 0) {
      console.warn(`Some emails were rejected: ${result.rejected.join(', ')}`);
    }

    progress(100);

    return result;
  },
};

/**
 * 创建邮件任务数据
 */
export function createEmailJobData(
  to: string | string[],
  subject: string,
  body: string,
  options?: {
    html?: string;
    attachments?: EmailJobData['attachments'];
  }
): EmailJobData {
  return {
    to,
    subject,
    body,
    html: options?.html,
    attachments: options?.attachments,
  };
}

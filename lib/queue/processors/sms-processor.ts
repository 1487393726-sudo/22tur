/**
 * SMS Processor
 * 短信发送处理器
 */

import {
  ProcessorRegistration,
  SMSJobData,
  Job,
} from '../types';

interface SMSSendResult {
  messageId: string;
  status: 'sent' | 'failed';
  phoneNumber: string;
}

/**
 * 发送短信（模拟实现）
 */
async function sendSMS(data: SMSJobData): Promise<SMSSendResult> {
  // 模拟短信发送延迟
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
  
  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$|^\+\d{1,3}\d{6,14}$/;
  if (!phoneRegex.test(data.phoneNumber)) {
    throw new Error(`Invalid phone number format: ${data.phoneNumber}`);
  }

  return {
    messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'sent',
    phoneNumber: data.phoneNumber,
  };
}

/**
 * 短信处理器
 */
export const smsProcessor: ProcessorRegistration<SMSJobData, SMSSendResult> = {
  name: 'send-sms',
  type: 'sms',
  concurrency: 10,
  processor: async (job: Job<SMSJobData>, progress) => {
    const { data } = job;
    
    // 验证必要字段
    if (!data.phoneNumber || !data.templateCode) {
      throw new Error('Missing required SMS fields: phoneNumber, templateCode');
    }

    progress(20);

    // 验证模板参数
    if (!data.templateParams || Object.keys(data.templateParams).length === 0) {
      console.warn('SMS template params is empty');
    }

    progress(50);

    // 发送短信
    const result = await sendSMS(data);

    progress(100);

    return result;
  },
};

/**
 * 创建短信任务数据
 */
export function createSMSJobData(
  phoneNumber: string,
  templateCode: string,
  templateParams: Record<string, string>
): SMSJobData {
  return {
    phoneNumber,
    templateCode,
    templateParams,
  };
}

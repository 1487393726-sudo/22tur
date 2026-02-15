/**
 * SMS Service Types
 * 短信服务类型定义
 */

// 短信提供商
export type SMSProvider = 'aliyun' | 'tencent';

// 短信配置
export interface SMSConfig {
  provider: SMSProvider;
  accessKeyId: string;
  accessKeySecret: string;
  signName: string;
  region?: string;
  endpoint?: string;
}

// 阿里云短信配置
export interface AliyunSMSConfig extends SMSConfig {
  provider: 'aliyun';
  region?: string; // 默认 cn-hangzhou
}

// 腾讯云短信配置
export interface TencentSMSConfig extends SMSConfig {
  provider: 'tencent';
  sdkAppId: string;
  region?: string; // 默认 ap-guangzhou
}

// 发送短信参数
export interface SendSMSParams {
  phoneNumber: string;
  templateCode: string;
  templateParams: Record<string, string>;
  signName?: string; // 可选，覆盖默认签名
}

// 批量发送短信参数
export interface SendBatchSMSParams {
  phoneNumbers: string[];
  templateCode: string;
  templateParams: Record<string, string>[];
  signName?: string;
}

// 发送结果
export interface SendResult {
  success: boolean;
  messageId?: string;
  requestId?: string;
  code?: string;
  message?: string;
  bizId?: string;
}

// 批量发送结果
export interface BatchSendResult {
  success: boolean;
  results: SendResult[];
  successCount: number;
  failedCount: number;
}

// 投递状态
export type DeliveryStatus = 
  | 'PENDING'      // 待发送
  | 'SENT'         // 已发送
  | 'DELIVERED'    // 已送达
  | 'FAILED'       // 发送失败
  | 'REJECTED'     // 被拒绝
  | 'UNKNOWN';     // 未知

// 投递状态详情
export interface DeliveryStatusResult {
  messageId: string;
  phoneNumber: string;
  status: DeliveryStatus;
  sendTime?: Date;
  receiveTime?: Date;
  errorCode?: string;
  errorMessage?: string;
}

// 短信模板
export interface SMSTemplate {
  templateCode: string;
  templateName: string;
  templateContent: string;
  templateType: 'verification' | 'notification' | 'marketing';
  status: 'pending' | 'approved' | 'rejected';
  variables: string[];
}

// 频率限制配置
export interface RateLimitConfig {
  windowMs: number;        // 时间窗口（毫秒）
  maxRequests: number;     // 最大请求数
  keyPrefix?: string;      // 缓存键前缀
}

// 默认频率限制：1小时5次
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 小时
  maxRequests: 5,
  keyPrefix: 'sms_rate_limit',
};

// 重试配置
export interface RetryConfig {
  maxRetries: number;      // 最大重试次数
  retryDelay: number;      // 重试间隔（毫秒）
  retryOn?: string[];      // 可重试的错误码
}

// 默认重试配置
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 10000, // 10 秒
  retryOn: ['TIMEOUT', 'NETWORK_ERROR', 'SERVICE_UNAVAILABLE'],
};

// 国际号码格式
export interface PhoneNumber {
  countryCode: string;     // 国家代码，如 +86
  nationalNumber: string;  // 国内号码
  e164Format: string;      // E.164 格式，如 +8613800138000
}

// 短信服务接口
export interface ISMSService {
  // 发送短信
  send(params: SendSMSParams): Promise<SendResult>;
  
  // 批量发送
  sendBatch(params: SendBatchSMSParams): Promise<BatchSendResult>;
  
  // 发送验证码
  sendVerificationCode(phoneNumber: string, code: string): Promise<SendResult>;
  
  // 检查频率限制
  checkRateLimit(phoneNumber: string): Promise<boolean>;
  
  // 获取投递状态
  getDeliveryStatus(messageId: string): Promise<DeliveryStatusResult>;
  
  // 查询发送记录
  querySendHistory(phoneNumber: string, startDate: Date, endDate: Date): Promise<DeliveryStatusResult[]>;
}

// 短信适配器接口
export interface ISMSAdapter {
  // 发送短信
  send(params: SendSMSParams): Promise<SendResult>;
  
  // 批量发送
  sendBatch(params: SendBatchSMSParams): Promise<BatchSendResult>;
  
  // 查询投递状态
  queryDeliveryStatus(messageId: string): Promise<DeliveryStatusResult>;
  
  // 查询发送记录
  querySendHistory(phoneNumber: string, startDate: Date, endDate: Date): Promise<DeliveryStatusResult[]>;
}

// 解析国际号码
export function parsePhoneNumber(phone: string): PhoneNumber {
  // 移除所有空格和连字符
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // 检查是否以 + 开头
  if (cleaned.startsWith('+')) {
    // 国际格式
    const match = cleaned.match(/^\+(\d{1,4})(\d+)$/);
    if (match) {
      return {
        countryCode: `+${match[1]}`,
        nationalNumber: match[2],
        e164Format: cleaned,
      };
    }
  }
  
  // 检查是否以 00 开头（国际拨号前缀）
  if (cleaned.startsWith('00')) {
    const withoutPrefix = cleaned.substring(2);
    // 假设前 2-4 位是国家代码
    for (let len = 2; len <= 4; len++) {
      const countryCode = withoutPrefix.substring(0, len);
      const nationalNumber = withoutPrefix.substring(len);
      if (nationalNumber.length >= 6) {
        return {
          countryCode: `+${countryCode}`,
          nationalNumber,
          e164Format: `+${withoutPrefix}`,
        };
      }
    }
  }
  
  // 默认假设是中国号码
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return {
      countryCode: '+86',
      nationalNumber: cleaned,
      e164Format: `+86${cleaned}`,
    };
  }
  
  // 无法解析，返回原始值
  return {
    countryCode: '+86',
    nationalNumber: cleaned,
    e164Format: `+86${cleaned}`,
  };
}

// 验证手机号格式
export function isValidPhoneNumber(phone: string): boolean {
  const parsed = parsePhoneNumber(phone);
  
  // 中国手机号验证
  if (parsed.countryCode === '+86') {
    return /^1[3-9]\d{9}$/.test(parsed.nationalNumber);
  }
  
  // 其他国家：简单验证长度
  return parsed.nationalNumber.length >= 6 && parsed.nationalNumber.length <= 15;
}

// 格式化手机号为 E.164 格式
export function formatToE164(phone: string): string {
  return parsePhoneNumber(phone).e164Format;
}

// 验证模板参数
export function validateTemplateParams(
  template: string,
  params: Record<string, string>
): { valid: boolean; missingParams: string[] } {
  // 提取模板中的变量 ${varName} 或 {varName}
  const variablePattern = /\$?\{(\w+)\}/g;
  const requiredParams: string[] = [];
  let match;
  
  while ((match = variablePattern.exec(template)) !== null) {
    requiredParams.push(match[1]);
  }
  
  const missingParams = requiredParams.filter(param => !(param in params));
  
  return {
    valid: missingParams.length === 0,
    missingParams,
  };
}

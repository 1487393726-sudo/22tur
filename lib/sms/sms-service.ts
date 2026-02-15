/**
 * SMS Service
 * 短信服务统一接口
 */

import {
  SMSConfig,
  AliyunSMSConfig,
  TencentSMSConfig,
  SendSMSParams,
  SendBatchSMSParams,
  SendResult,
  BatchSendResult,
  DeliveryStatusResult,
  ISMSService,
  ISMSAdapter,
  RateLimitConfig,
  RetryConfig,
  DEFAULT_RATE_LIMIT,
  DEFAULT_RETRY_CONFIG,
  isValidPhoneNumber,
  formatToE164,
  validateTemplateParams,
} from './types';
import { AliyunSMSAdapter } from './providers/aliyun';
import { TencentSMSAdapter } from './providers/tencent';

/**
 * 内存缓存（用于频率限制）
 */
class RateLimitStore {
  private store: Map<string, { count: number; resetAt: number }> = new Map();

  async increment(key: string, windowMs: number): Promise<number> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || existing.resetAt < now) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return 1;
    }

    existing.count++;
    return existing.count;
  }

  async get(key: string): Promise<number> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || existing.resetAt < now) {
      return 0;
    }

    return existing.count;
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.resetAt < now) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * 短信服务
 */
export class SMSService implements ISMSService {
  private adapter: ISMSAdapter;
  private config: SMSConfig;
  private rateLimitConfig: RateLimitConfig;
  private retryConfig: RetryConfig;
  private rateLimitStore: RateLimitStore;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    config: SMSConfig,
    options?: {
      rateLimitConfig?: Partial<RateLimitConfig>;
      retryConfig?: Partial<RetryConfig>;
    }
  ) {
    this.config = config;
    this.rateLimitConfig = { ...DEFAULT_RATE_LIMIT, ...options?.rateLimitConfig };
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...options?.retryConfig };
    this.rateLimitStore = new RateLimitStore();

    // 创建适配器
    this.adapter = this.createAdapter(config);

    // 启动清理定时器
    this.startCleanup();
  }

  /**
   * 创建适配器
   */
  private createAdapter(config: SMSConfig): ISMSAdapter {
    switch (config.provider) {
      case 'aliyun':
        return new AliyunSMSAdapter(config as AliyunSMSConfig);
      case 'tencent':
        return new TencentSMSAdapter(config as TencentSMSConfig);
      default:
        throw new Error(`Unsupported SMS provider: ${config.provider}`);
    }
  }

  /**
   * 发送短信
   */
  async send(params: SendSMSParams): Promise<SendResult> {
    // 验证手机号
    if (!isValidPhoneNumber(params.phoneNumber)) {
      return {
        success: false,
        code: 'INVALID_PHONE_NUMBER',
        message: 'Invalid phone number format',
      };
    }

    // 检查频率限制
    const canSend = await this.checkRateLimit(params.phoneNumber);
    if (!canSend) {
      return {
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Maximum ${this.rateLimitConfig.maxRequests} SMS per ${this.rateLimitConfig.windowMs / 1000 / 60} minutes.`,
      };
    }

    // 增加计数
    await this.incrementRateLimit(params.phoneNumber);

    // 发送（带重试）
    return this.sendWithRetry(params);
  }

  /**
   * 批量发送短信
   */
  async sendBatch(params: SendBatchSMSParams): Promise<BatchSendResult> {
    // 验证所有手机号
    const invalidPhones = params.phoneNumbers.filter(p => !isValidPhoneNumber(p));
    if (invalidPhones.length > 0) {
      return {
        success: false,
        results: params.phoneNumbers.map(phone => ({
          success: false,
          code: invalidPhones.includes(phone) ? 'INVALID_PHONE_NUMBER' : 'BATCH_FAILED',
          message: invalidPhones.includes(phone) ? 'Invalid phone number format' : 'Batch send failed',
        })),
        successCount: 0,
        failedCount: params.phoneNumbers.length,
      };
    }

    // 检查频率限制
    const rateLimitResults = await Promise.all(
      params.phoneNumbers.map(phone => this.checkRateLimit(phone))
    );

    const blockedPhones = params.phoneNumbers.filter((_, i) => !rateLimitResults[i]);
    if (blockedPhones.length > 0) {
      // 部分号码被限制，只发送未被限制的
      const allowedPhones = params.phoneNumbers.filter((_, i) => rateLimitResults[i]);
      const allowedParams = params.templateParams.filter((_, i) => rateLimitResults[i]);

      if (allowedPhones.length === 0) {
        return {
          success: false,
          results: params.phoneNumbers.map(() => ({
            success: false,
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Rate limit exceeded',
          })),
          successCount: 0,
          failedCount: params.phoneNumbers.length,
        };
      }

      // 发送未被限制的号码
      const result = await this.adapter.sendBatch({
        ...params,
        phoneNumbers: allowedPhones,
        templateParams: allowedParams,
      });

      // 增加计数
      for (const phone of allowedPhones) {
        await this.incrementRateLimit(phone);
      }

      // 合并结果
      let resultIndex = 0;
      const mergedResults = params.phoneNumbers.map((phone, i) => {
        if (!rateLimitResults[i]) {
          return {
            success: false,
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Rate limit exceeded',
          };
        }
        return result.results[resultIndex++];
      });

      return {
        success: result.successCount > 0,
        results: mergedResults,
        successCount: result.successCount,
        failedCount: params.phoneNumbers.length - result.successCount,
      };
    }

    // 所有号码都未被限制，直接发送
    const result = await this.adapter.sendBatch(params);

    // 增加计数
    for (const phone of params.phoneNumbers) {
      await this.incrementRateLimit(phone);
    }

    return result;
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(phoneNumber: string, code: string): Promise<SendResult> {
    // 使用默认验证码模板
    const templateCode = process.env.SMS_VERIFICATION_TEMPLATE || 'SMS_VERIFICATION';
    
    return this.send({
      phoneNumber,
      templateCode,
      templateParams: { code },
    });
  }

  /**
   * 检查频率限制
   */
  async checkRateLimit(phoneNumber: string): Promise<boolean> {
    const key = this.getRateLimitKey(phoneNumber);
    const count = await this.rateLimitStore.get(key);
    return count < this.rateLimitConfig.maxRequests;
  }

  /**
   * 获取投递状态
   */
  async getDeliveryStatus(messageId: string): Promise<DeliveryStatusResult> {
    return this.adapter.queryDeliveryStatus(messageId);
  }

  /**
   * 查询发送记录
   */
  async querySendHistory(
    phoneNumber: string,
    startDate: Date,
    endDate: Date
  ): Promise<DeliveryStatusResult[]> {
    return this.adapter.querySendHistory(phoneNumber, startDate, endDate);
  }

  /**
   * 获取频率限制状态
   */
  async getRateLimitStatus(phoneNumber: string): Promise<{
    remaining: number;
    total: number;
    resetAt?: Date;
  }> {
    const key = this.getRateLimitKey(phoneNumber);
    const count = await this.rateLimitStore.get(key);
    
    return {
      remaining: Math.max(0, this.rateLimitConfig.maxRequests - count),
      total: this.rateLimitConfig.maxRequests,
    };
  }

  /**
   * 重置频率限制
   */
  async resetRateLimit(phoneNumber: string): Promise<void> {
    const key = this.getRateLimitKey(phoneNumber);
    await this.rateLimitStore.reset(key);
  }

  /**
   * 停止服务
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * 带重试的发送
   */
  private async sendWithRetry(params: SendSMSParams): Promise<SendResult> {
    let lastError: SendResult | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      const result = await this.adapter.send(params);

      if (result.success) {
        return result;
      }

      lastError = result;

      // 检查是否可重试
      if (!this.shouldRetry(result.code)) {
        return result;
      }

      // 最后一次尝试不需要等待
      if (attempt < this.retryConfig.maxRetries) {
        await this.delay(this.retryConfig.retryDelay);
      }
    }

    return lastError || {
      success: false,
      code: 'MAX_RETRIES_EXCEEDED',
      message: 'Maximum retry attempts exceeded',
    };
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(code?: string): boolean {
    if (!code) return false;
    return this.retryConfig.retryOn?.includes(code) || false;
  }

  /**
   * 延迟
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取频率限制键
   */
  private getRateLimitKey(phoneNumber: string): string {
    const e164 = formatToE164(phoneNumber);
    return `${this.rateLimitConfig.keyPrefix}:${e164}`;
  }

  /**
   * 增加频率限制计数
   */
  private async incrementRateLimit(phoneNumber: string): Promise<void> {
    const key = this.getRateLimitKey(phoneNumber);
    await this.rateLimitStore.increment(key, this.rateLimitConfig.windowMs);
  }

  /**
   * 启动清理定时器
   */
  private startCleanup(): void {
    // 每分钟清理过期的频率限制记录
    this.cleanupInterval = setInterval(() => {
      this.rateLimitStore.cleanup();
    }, 60000);
  }
}

// 单例
let smsServiceInstance: SMSService | null = null;

/**
 * 获取短信服务实例
 */
export function getSMSService(config?: SMSConfig): SMSService {
  if (!smsServiceInstance && config) {
    smsServiceInstance = new SMSService(config);
  }
  if (!smsServiceInstance) {
    throw new Error('SMS service not initialized. Please provide config.');
  }
  return smsServiceInstance;
}

/**
 * 初始化短信服务
 */
export function initSMSService(
  config: SMSConfig,
  options?: {
    rateLimitConfig?: Partial<RateLimitConfig>;
    retryConfig?: Partial<RetryConfig>;
  }
): SMSService {
  if (smsServiceInstance) {
    smsServiceInstance.stop();
  }
  smsServiceInstance = new SMSService(config, options);
  return smsServiceInstance;
}

/**
 * 重置短信服务
 */
export function resetSMSService(): void {
  if (smsServiceInstance) {
    smsServiceInstance.stop();
  }
  smsServiceInstance = null;
}

/**
 * 默认短信服务实例（用于简单场景）
 * 注意：需要先通过 initSMSService 初始化
 */
export const smsService = {
  send: async (params: SendSMSParams) => {
    const service = getSMSService();
    return service.send(params);
  },
  sendBatch: async (params: SendBatchSMSParams) => {
    const service = getSMSService();
    return service.sendBatch(params);
  },
  sendVerificationCode: async (phoneNumber: string, code: string) => {
    const service = getSMSService();
    return service.sendVerificationCode(phoneNumber, code);
  },
};

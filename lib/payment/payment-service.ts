/**
 * Payment Service
 * 支付服务实现
 */

import {
  IPaymentService,
  IPaymentAdapter,
  PaymentProvider,
  PaymentConfig,
  CreatePaymentParams,
  PaymentResult,
  PaymentQueryResult,
  RefundParams,
  RefundResult,
  PaymentCallbackData,
  RefundCallbackData,
  SignatureVerifyResult,
  PaymentRecord,
  RefundRecord,
  PaymentStatus,
  RefundStatus,
  isValidStatusTransition,
  generateOrderNo,
  generateRefundNo,
} from './types';
import { AlipayAdapter } from './providers/alipay';
import { WechatPayAdapter } from './providers/wechat';

/**
 * 内存存储（用于开发环境）
 */
class InMemoryPaymentStore {
  private payments: Map<string, PaymentRecord> = new Map();
  private refunds: Map<string, RefundRecord> = new Map();
  private orderToPayment: Map<string, string> = new Map();

  // 支付记录操作
  savePayment(record: PaymentRecord): void {
    this.payments.set(record.id, record);
    this.orderToPayment.set(record.orderId, record.id);
  }

  getPayment(paymentId: string): PaymentRecord | undefined {
    return this.payments.get(paymentId);
  }

  getPaymentByOrderId(orderId: string): PaymentRecord | undefined {
    const paymentId = this.orderToPayment.get(orderId);
    return paymentId ? this.payments.get(paymentId) : undefined;
  }

  updatePaymentStatus(paymentId: string, status: PaymentStatus, data?: Partial<PaymentRecord>): boolean {
    const payment = this.payments.get(paymentId);
    if (!payment) return false;
    
    if (!isValidStatusTransition(payment.status, status)) {
      console.warn(`Invalid status transition: ${payment.status} -> ${status}`);
      return false;
    }
    
    payment.status = status;
    payment.updatedAt = new Date();
    if (data) {
      Object.assign(payment, data);
    }
    return true;
  }

  getPendingPayments(olderThan?: Date): PaymentRecord[] {
    const result: PaymentRecord[] = [];
    for (const payment of this.payments.values()) {
      if (payment.status === 'PENDING') {
        if (!olderThan || payment.createdAt < olderThan) {
          result.push(payment);
        }
      }
    }
    return result;
  }

  // 退款记录操作
  saveRefund(record: RefundRecord): void {
    this.refunds.set(record.id, record);
  }

  getRefund(refundId: string): RefundRecord | undefined {
    return this.refunds.get(refundId);
  }

  getRefundsByPaymentId(paymentId: string): RefundRecord[] {
    const result: RefundRecord[] = [];
    for (const refund of this.refunds.values()) {
      if (refund.paymentId === paymentId) {
        result.push(refund);
      }
    }
    return result;
  }

  updateRefundStatus(refundId: string, status: RefundStatus, data?: Partial<RefundRecord>): boolean {
    const refund = this.refunds.get(refundId);
    if (!refund) return false;
    
    refund.status = status;
    if (data) {
      Object.assign(refund, data);
    }
    return true;
  }

  // 统计
  getTotalRefundedAmount(paymentId: string): number {
    let total = 0;
    for (const refund of this.refunds.values()) {
      if (refund.paymentId === paymentId && refund.status === 'SUCCESS') {
        total += refund.amount;
      }
    }
    return total;
  }
}


/**
 * Payment Service Implementation
 * 支付服务实现
 */
export class PaymentService implements IPaymentService {
  private adapters: Map<PaymentProvider, IPaymentAdapter> = new Map();
  private store: InMemoryPaymentStore;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: PaymentConfig) {
    this.store = new InMemoryPaymentStore();
    
    // 初始化支付宝适配器
    if (config.alipay) {
      this.adapters.set('alipay', new AlipayAdapter(config.alipay));
    }
    
    // 初始化微信支付适配器
    if (config.wechat) {
      this.adapters.set('wechat', new WechatPayAdapter(config.wechat));
    }
  }

  /**
   * 启动支付状态同步
   */
  startStatusSync(intervalMs: number = 60000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      this.syncPendingPayments();
    }, intervalMs);
    
    console.log(`Payment status sync started (interval: ${intervalMs}ms)`);
  }

  /**
   * 停止支付状态同步
   */
  stopStatusSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Payment status sync stopped');
    }
  }

  /**
   * 同步待支付订单状态
   */
  async syncPendingPayments(): Promise<void> {
    // 获取超过 5 分钟的待支付订单
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const pendingPayments = this.store.getPendingPayments(fiveMinutesAgo);
    
    for (const payment of pendingPayments) {
      try {
        const adapter = this.adapters.get(payment.provider);
        if (!adapter) continue;
        
        const result = await adapter.queryPayment(payment.orderId);
        
        if (result.status !== payment.status) {
          this.store.updatePaymentStatus(payment.id, result.status, {
            tradeNo: result.tradeNo,
            paidAt: result.paidAt,
          });
          console.log(`Payment ${payment.id} status updated: ${payment.status} -> ${result.status}`);
        }
      } catch (error) {
        console.error(`Failed to sync payment ${payment.id}:`, error);
      }
    }
  }

  /**
   * 创建支付
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const adapter = this.adapters.get(params.provider);
    if (!adapter) {
      throw new Error(`Payment provider not configured: ${params.provider}`);
    }

    // 检查是否已存在相同订单号的支付
    const existing = this.store.getPaymentByOrderId(params.orderId);
    if (existing && existing.status === 'PENDING') {
      return {
        paymentId: existing.id,
        orderId: existing.orderId,
        provider: existing.provider,
        status: existing.status,
        qrCode: existing.qrCode,
        redirectUrl: existing.redirectUrl,
        createdAt: existing.createdAt,
      };
    }

    // 创建支付
    const result = await adapter.createPayment(params);

    // 保存支付记录
    const record: PaymentRecord = {
      id: result.paymentId,
      orderId: params.orderId,
      userId: params.userId,
      provider: params.provider,
      amount: params.amount,
      currency: 'CNY',
      status: 'PENDING',
      qrCode: result.qrCode,
      redirectUrl: result.redirectUrl,
      refundedAmount: 0,
      metadata: params.metadata,
      createdAt: result.createdAt,
      updatedAt: result.createdAt,
    };
    this.store.savePayment(record);

    return result;
  }

  /**
   * 查询支付
   */
  async queryPayment(paymentId: string): Promise<PaymentQueryResult> {
    const payment = this.store.getPayment(paymentId);
    if (!payment) {
      throw new Error(`Payment not found: ${paymentId}`);
    }

    // 如果是待支付状态，从支付平台查询最新状态
    if (payment.status === 'PENDING') {
      const adapter = this.adapters.get(payment.provider);
      if (adapter) {
        try {
          const result = await adapter.queryPayment(payment.orderId);
          if (result.status !== payment.status) {
            this.store.updatePaymentStatus(payment.id, result.status, {
              tradeNo: result.tradeNo,
              paidAt: result.paidAt,
            });
            payment.status = result.status;
            payment.tradeNo = result.tradeNo;
            payment.paidAt = result.paidAt;
          }
        } catch (error) {
          console.error('Failed to query payment from provider:', error);
        }
      }
    }

    return {
      paymentId: payment.id,
      orderId: payment.orderId,
      provider: payment.provider,
      status: payment.status,
      amount: payment.amount,
      paidAmount: payment.status === 'PAID' ? payment.amount : undefined,
      tradeNo: payment.tradeNo,
      paidAt: payment.paidAt,
    };
  }

  /**
   * 关闭支付
   */
  async closePayment(paymentId: string): Promise<boolean> {
    const payment = this.store.getPayment(paymentId);
    if (!payment) {
      throw new Error(`Payment not found: ${paymentId}`);
    }

    if (payment.status !== 'PENDING') {
      throw new Error(`Cannot close payment with status: ${payment.status}`);
    }

    const adapter = this.adapters.get(payment.provider);
    if (!adapter) {
      throw new Error(`Payment provider not configured: ${payment.provider}`);
    }

    const success = await adapter.closePayment(payment.orderId);
    if (success) {
      this.store.updatePaymentStatus(paymentId, 'CANCELLED');
    }

    return success;
  }

  /**
   * 退款
   */
  async refund(params: RefundParams): Promise<RefundResult> {
    const payment = this.store.getPayment(params.paymentId);
    if (!payment) {
      throw new Error(`Payment not found: ${params.paymentId}`);
    }

    if (payment.status !== 'PAID' && payment.status !== 'PARTIAL_REFUNDED') {
      throw new Error(`Cannot refund payment with status: ${payment.status}`);
    }

    // 检查退款金额
    const totalRefunded = this.store.getTotalRefundedAmount(params.paymentId);
    const maxRefundable = payment.amount - totalRefunded;
    
    if (params.amount > maxRefundable) {
      throw new Error(`Refund amount exceeds maximum refundable: ${maxRefundable}`);
    }

    const adapter = this.adapters.get(payment.provider);
    if (!adapter) {
      throw new Error(`Payment provider not configured: ${payment.provider}`);
    }

    // 执行退款
    const refundId = params.refundId || generateRefundNo();
    const result = await adapter.refund({
      ...params,
      refundId,
      orderId: payment.orderId,
      totalAmount: payment.amount,
    });

    // 保存退款记录
    const refundRecord: RefundRecord = {
      id: result.refundId,
      paymentId: params.paymentId,
      refundNo: result.refundNo,
      amount: params.amount,
      reason: params.reason,
      status: result.status,
      refundedAt: result.refundedAt,
      createdAt: new Date(),
    };
    this.store.saveRefund(refundRecord);

    // 更新支付状态
    if (result.status === 'SUCCESS') {
      const newTotalRefunded = totalRefunded + params.amount;
      const newStatus: PaymentStatus = newTotalRefunded >= payment.amount 
        ? 'REFUNDED' 
        : 'PARTIAL_REFUNDED';
      
      this.store.updatePaymentStatus(params.paymentId, newStatus, {
        refundedAmount: newTotalRefunded,
      });
    }

    return result;
  }

  /**
   * 查询退款
   */
  async queryRefund(refundId: string): Promise<RefundResult> {
    const refund = this.store.getRefund(refundId);
    if (!refund) {
      throw new Error(`Refund not found: ${refundId}`);
    }

    const payment = this.store.getPayment(refund.paymentId);
    if (!payment) {
      throw new Error(`Payment not found: ${refund.paymentId}`);
    }

    // 如果退款状态是处理中，从支付平台查询最新状态
    if (refund.status === 'PENDING' || refund.status === 'PROCESSING') {
      const adapter = this.adapters.get(payment.provider);
      if (adapter) {
        try {
          const result = await adapter.queryRefund(refundId, payment.orderId);
          if (result.status !== refund.status) {
            this.store.updateRefundStatus(refundId, result.status, {
              refundNo: result.refundNo,
              refundedAt: result.refundedAt,
            });
            refund.status = result.status;
            refund.refundNo = result.refundNo;
            refund.refundedAt = result.refundedAt;
          }
        } catch (error) {
          console.error('Failed to query refund from provider:', error);
        }
      }
    }

    return {
      refundId: refund.id,
      paymentId: refund.paymentId,
      amount: refund.amount,
      status: refund.status,
      refundNo: refund.refundNo,
      refundedAt: refund.refundedAt,
      errorCode: refund.errorCode,
      errorMessage: refund.errorMessage,
    };
  }

  /**
   * 验证回调签名
   */
  async verifyCallback(
    provider: PaymentProvider,
    data: Record<string, unknown>,
    signature: string
  ): Promise<SignatureVerifyResult> {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      return { valid: false, error: `Provider not configured: ${provider}` };
    }

    const valid = adapter.verifySignature(data, signature);
    return { valid, data: valid ? data : undefined };
  }

  /**
   * 处理支付回调
   */
  async handlePaymentCallback(
    provider: PaymentProvider,
    data: Record<string, unknown>
  ): Promise<PaymentCallbackData> {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`Provider not configured: ${provider}`);
    }

    const callbackData = adapter.parseCallback(data) as PaymentCallbackData;
    
    // 更新支付状态
    const payment = this.store.getPaymentByOrderId(callbackData.orderId);
    if (payment) {
      this.store.updatePaymentStatus(payment.id, callbackData.status, {
        tradeNo: callbackData.tradeNo,
        paidAt: callbackData.paidAt,
        callbackData: callbackData.rawData,
      });
    }

    return callbackData;
  }

  /**
   * 处理退款回调
   */
  async handleRefundCallback(
    provider: PaymentProvider,
    data: Record<string, unknown>
  ): Promise<RefundCallbackData> {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`Provider not configured: ${provider}`);
    }

    const callbackData = adapter.parseCallback(data) as RefundCallbackData;
    
    // 更新退款状态
    this.store.updateRefundStatus(callbackData.refundId, callbackData.status, {
      refundedAt: callbackData.refundedAt,
    });

    // 如果退款成功，更新支付状态
    if (callbackData.status === 'SUCCESS') {
      const payment = this.store.getPayment(callbackData.paymentId);
      if (payment) {
        const totalRefunded = this.store.getTotalRefundedAmount(callbackData.paymentId);
        const newStatus: PaymentStatus = totalRefunded >= payment.amount 
          ? 'REFUNDED' 
          : 'PARTIAL_REFUNDED';
        
        this.store.updatePaymentStatus(callbackData.paymentId, newStatus, {
          refundedAmount: totalRefunded,
        });
      }
    }

    return callbackData;
  }

  /**
   * 获取适配器
   */
  getAdapter(provider: PaymentProvider): IPaymentAdapter | undefined {
    return this.adapters.get(provider);
  }
}

// 支付服务单例
let paymentServiceInstance: PaymentService | null = null;

export function getPaymentService(config?: PaymentConfig): PaymentService {
  if (!paymentServiceInstance && config) {
    paymentServiceInstance = new PaymentService(config);
  }
  if (!paymentServiceInstance) {
    throw new Error('Payment service not initialized. Please provide config.');
  }
  return paymentServiceInstance;
}

export function resetPaymentService(): void {
  if (paymentServiceInstance) {
    paymentServiceInstance.stopStatusSync();
  }
  paymentServiceInstance = null;
}

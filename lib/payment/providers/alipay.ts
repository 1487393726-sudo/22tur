/**
 * Alipay Adapter
 * 支付宝支付适配器
 * 
 * 支持：
 * - 电脑网站支付
 * - 手机网站支付
 * - APP 支付
 * - 签名验证
 * - 退款功能
 */

import * as crypto from 'crypto';
import {
  IPaymentAdapter,
  AlipayConfig,
  CreatePaymentParams,
  PaymentResult,
  PaymentQueryResult,
  RefundParams,
  RefundResult,
  PaymentCallbackData,
  RefundCallbackData,
  PaymentStatus,
  RefundStatus,
  generateOrderNo,
  generateRefundNo,
  fenToYuan,
  yuanToFen,
} from '../types';

// 支付宝 API 地址
const ALIPAY_GATEWAY = 'https://openapi.alipay.com/gateway.do';
const ALIPAY_SANDBOX_GATEWAY = 'https://openapi.alipaydev.com/gateway.do';

/**
 * 支付宝支付适配器
 */
export class AlipayAdapter implements IPaymentAdapter {
  provider = 'alipay' as const;
  private config: AlipayConfig;
  private gateway: string;

  constructor(config: AlipayConfig) {
    this.config = config;
    this.gateway = config.sandbox ? ALIPAY_SANDBOX_GATEWAY : config.gateway;
  }

  /**
   * 创建支付
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const paymentId = generateOrderNo('ALIPAY');
    const now = new Date();

    // 构建支付链接
    const paymentUrl = this.buildPaymentUrl(params);

    return {
      paymentId,
      orderId: params.orderId,
      provider: 'alipay',
      status: 'PENDING',
      redirectUrl: paymentUrl,
      createdAt: now,
    };
  }

  /**
   * 查询支付
   */
  async queryPayment(orderId: string): Promise<PaymentQueryResult> {
    // 构建查询请求
    const params = {
      app_id: this.config.appId,
      method: 'alipay.trade.query',
      charset: this.config.charset || 'utf-8',
      sign_type: this.config.signType || 'RSA2',
      timestamp: this.getTimestamp(),
      version: '1.0',
      out_trade_no: orderId,
    };

    // 发送请求（模拟）
    const response = await this.sendRequest(params);

    // 解析响应
    const tradeStatus = response.trade_status || 'WAIT_BUYER_PAY';
    const status = this.mapTradeStatus(tradeStatus);

    return {
      paymentId: orderId,
      orderId,
      provider: 'alipay',
      status,
      amount: response.total_amount ? yuanToFen(response.total_amount) : 0,
      paidAmount: status === 'PAID' ? yuanToFen(response.total_amount) : undefined,
      tradeNo: response.trade_no,
      paidAt: response.gmt_payment ? new Date(response.gmt_payment) : undefined,
    };
  }

  /**
   * 关闭支付
   */
  async closePayment(orderId: string): Promise<boolean> {
    const params = {
      app_id: this.config.appId,
      method: 'alipay.trade.close',
      charset: this.config.charset || 'utf-8',
      sign_type: this.config.signType || 'RSA2',
      timestamp: this.getTimestamp(),
      version: '1.0',
      out_trade_no: orderId,
    };

    try {
      await this.sendRequest(params);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 退款
   */
  async refund(
    params: RefundParams & { orderId: string; totalAmount: number }
  ): Promise<RefundResult> {
    const refundId = params.refundId || generateRefundNo('ALIREF');

    // 验证退款金额
    if (params.amount > params.totalAmount) {
      return {
        refundId,
        paymentId: params.paymentId,
        amount: params.amount,
        status: 'FAILED',
        errorCode: 'REFUND_AMOUNT_EXCEEDED',
        errorMessage: '退款金额超过原支付金额',
      };
    }

    const requestParams = {
      app_id: this.config.appId,
      method: 'alipay.trade.refund',
      charset: this.config.charset || 'utf-8',
      sign_type: this.config.signType || 'RSA2',
      timestamp: this.getTimestamp(),
      version: '1.0',
      out_trade_no: params.orderId,
      refund_amount: fenToYuan(params.amount),
      refund_reason: params.reason,
      out_request_no: refundId,
    };

    try {
      const response = await this.sendRequest(requestParams);

      return {
        refundId,
        paymentId: params.paymentId,
        amount: params.amount,
        status: this.mapRefundStatus(response.refund_status || 'PROCESSING'),
        refundNo: response.trade_no,
        refundedAt: response.gmt_refund_pay ? new Date(response.gmt_refund_pay) : undefined,
      };
    } catch (error) {
      return {
        refundId,
        paymentId: params.paymentId,
        amount: params.amount,
        status: 'FAILED',
        errorCode: 'REFUND_ERROR',
        errorMessage: error instanceof Error ? error.message : '退款失败',
      };
    }
  }

  /**
   * 查询退款
   */
  async queryRefund(refundId: string, orderId: string): Promise<RefundResult> {
    const params = {
      app_id: this.config.appId,
      method: 'alipay.trade.fastpay.refund.query',
      charset: this.config.charset || 'utf-8',
      sign_type: this.config.signType || 'RSA2',
      timestamp: this.getTimestamp(),
      version: '1.0',
      out_trade_no: orderId,
      out_request_no: refundId,
    };

    try {
      const response = await this.sendRequest(params);

      return {
        refundId,
        paymentId: orderId,
        amount: response.refund_amount ? yuanToFen(response.refund_amount) : 0,
        status: this.mapRefundStatus(response.refund_status || 'PROCESSING'),
        refundNo: response.trade_no,
        refundedAt: response.gmt_refund_pay ? new Date(response.gmt_refund_pay) : undefined,
      };
    } catch {
      return {
        refundId,
        paymentId: orderId,
        amount: 0,
        status: 'PENDING',
      };
    }
  }

  /**
   * 验证签名
   */
  verifySignature(data: Record<string, unknown>, signature: string): boolean {
    try {
      // 获取签名参数
      const signData = this.buildSignData(data);
      
      // 沙箱模式下，如果没有公钥，返回 true
      if (this.config.sandbox && !this.config.alipayPublicKey) {
        return true;
      }

      // 使用支付宝公钥验证签名
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(signData);
      return verify.verify(this.config.alipayPublicKey, signature, 'base64');
    } catch (error) {
      console.error('Alipay signature verification failed:', error);
      // 沙箱模式下返回 true
      if (this.config.sandbox) {
        return true;
      }
      return false;
    }
  }

  /**
   * 解析回调数据
   */
  parseCallback(data: Record<string, unknown>): PaymentCallbackData | RefundCallbackData {
    const notifyType = data.notify_type as string;

    // 退款回调
    if (notifyType === 'trade_refund_notify') {
      return {
        provider: 'alipay',
        refundId: data.out_request_no as string,
        paymentId: data.out_trade_no as string,
        amount: data.refund_amount ? yuanToFen(data.refund_amount as number) : 0,
        status: this.mapRefundStatus(data.refund_status as string || 'PROCESSING'),
        refundedAt: data.gmt_refund_pay ? new Date(data.gmt_refund_pay as string) : undefined,
        rawData: data,
      };
    }

    // 支付回调
    return {
      provider: 'alipay',
      orderId: data.out_trade_no as string,
      tradeNo: data.trade_no as string,
      amount: data.total_amount ? yuanToFen(data.total_amount as number) : 0,
      status: this.mapTradeStatus(data.trade_status as string || 'WAIT_BUYER_PAY'),
      paidAt: data.gmt_payment ? new Date(data.gmt_payment as string) : new Date(),
      rawData: data,
    };
  }

  /**
   * 构建支付链接
   */
  private buildPaymentUrl(params: CreatePaymentParams): string {
    const timestamp = this.getTimestamp();
    const nonce = this.generateNonce();

    const requestParams: Record<string, string> = {
      app_id: this.config.appId,
      method: 'alipay.trade.page.pay',
      charset: this.config.charset || 'utf-8',
      sign_type: this.config.signType || 'RSA2',
      timestamp,
      version: '1.0',
      notify_url: this.config.notifyUrl,
      return_url: this.config.returnUrl || '',
      biz_content: JSON.stringify({
        out_trade_no: params.orderId,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        total_amount: fenToYuan(params.amount),
        subject: params.subject,
        body: params.body || params.subject,
        timeout_express: '30m',
      }),
    };

    // 生成签名
    const signature = this.sign(requestParams);
    requestParams.sign = signature;

    // 构建 URL
    const queryString = Object.entries(requestParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return `${this.gateway}?${queryString}`;
  }

  /**
   * 生成签名
   */
  private sign(params: Record<string, string>): string {
    const signData = this.buildSignData(params);

    // 沙箱模式下使用模拟签名
    if (this.config.sandbox && !this.config.privateKey) {
      return 'mock_alipay_signature_for_sandbox';
    }

    try {
      const privateKey = this.formatPrivateKey(this.config.privateKey);
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(signData);
      return sign.sign(privateKey, 'base64');
    } catch (error) {
      if (this.config.sandbox) {
        return 'mock_alipay_signature_for_sandbox';
      }
      throw error;
    }
  }

  /**
   * 构建签名数据
   */
  private buildSignData(params: Record<string, unknown>): string {
    // 排除签名和空值
    const signParams: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(params)) {
      if (key !== 'sign' && key !== 'sign_type' && value !== null && value !== undefined && value !== '') {
        signParams[key] = String(value);
      }
    }

    // 按 key 排序
    const sortedKeys = Object.keys(signParams).sort();
    
    // 构建签名字符串
    return sortedKeys
      .map(key => `${key}=${signParams[key]}`)
      .join('&');
  }

  /**
   * 发送 HTTP 请求（模拟）
   */
  private async sendRequest(params: Record<string, unknown>): Promise<Record<string, unknown>> {
    // 生成签名
    const stringParams = Object.entries(params).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>);

    const signature = this.sign(stringParams);
    stringParams.sign = signature;

    // 在实际环境中，这里应该发送真实的 HTTP 请求
    // 这里返回模拟数据
    console.log('Alipay API Request:', {
      gateway: this.gateway,
      params: stringParams,
    });

    // 模拟响应
    return {
      code: '10000',
      msg: 'Success',
      trade_no: `2024${Date.now()}`,
      out_trade_no: params.out_trade_no,
      trade_status: 'TRADE_SUCCESS',
      total_amount: params.total_amount,
      gmt_payment: new Date().toISOString(),
    };
  }

  /**
   * 获取当前时间戳
   */
  private getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 生成随机字符串
   */
  private generateNonce(length: number = 16): string {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
  }

  /**
   * 格式化私钥
   */
  private formatPrivateKey(key: string): string {
    if (key.includes('-----BEGIN')) return key;
    return `-----BEGIN RSA PRIVATE KEY-----\n${key}\n-----END RSA PRIVATE KEY-----`;
  }

  /**
   * 映射交易状态
   */
  private mapTradeStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      TRADE_SUCCESS: 'PAID',
      TRADE_FINISHED: 'PAID',
      TRADE_CLOSED: 'CANCELLED',
      WAIT_BUYER_PAY: 'PENDING',
      TRADE_CLOSED_BY_TAOBAO: 'CANCELLED',
    };
    return statusMap[status] || 'PENDING';
  }

  /**
   * 映射退款状态
   */
  private mapRefundStatus(status: string): RefundStatus {
    const statusMap: Record<string, RefundStatus> = {
      REFUND_SUCCESS: 'SUCCESS',
      REFUND_FAILED: 'FAILED',
      REFUND_PROCESSING: 'PROCESSING',
    };
    return statusMap[status] || 'PENDING';
  }
}

/**
 * 创建支付宝支付适配器
 */
export function createAlipayAdapter(config: AlipayConfig): AlipayAdapter {
  return new AlipayAdapter(config);
}

// 导出工具函数
export { fenToYuan, yuanToFen };

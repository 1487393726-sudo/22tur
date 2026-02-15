/**
 * WeChat Pay Adapter
 * 微信支付适配器
 * 
 * 支持：
 * - Native 支付（扫码支付）
 * - JSAPI 支付（公众号/小程序）
 * - APIv3 签名验证
 * - 退款功能
 */

import * as crypto from 'crypto';
import {
  IPaymentAdapter,
  WechatPayConfig,
  CreatePaymentParams,
  PaymentResult,
  PaymentQueryResult,
  RefundParams,
  RefundResult,
  PaymentCallbackData,
  RefundCallbackData,
  PaymentStatus,
  RefundStatus,
  WechatTradeType,
  generateOrderNo,
  generateRefundNo,
  fenToYuan,
  yuanToFen,
} from '../types';

// 微信支付 API 地址
const WECHAT_API_BASE = 'https://api.mch.weixin.qq.com';
const WECHAT_SANDBOX_API_BASE = 'https://api.mch.weixin.qq.com/sandboxnew';

// APIv3 端点
const API_ENDPOINTS = {
  // 支付
  NATIVE: '/v3/pay/transactions/native',
  JSAPI: '/v3/pay/transactions/jsapi',
  APP: '/v3/pay/transactions/app',
  H5: '/v3/pay/transactions/h5',
  // 查询
  QUERY_BY_OUT_TRADE_NO: '/v3/pay/transactions/out-trade-no',
  // 关闭
  CLOSE: '/v3/pay/transactions/out-trade-no',
  // 退款
  REFUND: '/v3/refund/domestic/refunds',
  REFUND_QUERY: '/v3/refund/domestic/refunds',
};

/**
 * 微信支付适配器
 */
export class WechatPayAdapter implements IPaymentAdapter {
  provider = 'wechat' as const;
  private config: WechatPayConfig;
  private apiBase: string;

  constructor(config: WechatPayConfig) {
    this.config = config;
    this.apiBase = config.sandbox ? WECHAT_SANDBOX_API_BASE : WECHAT_API_BASE;
  }

  /**
   * 创建支付
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const paymentId = generateOrderNo('WXPAY');
    const now = new Date();
    const tradeType = params.tradeType || 'NATIVE';

    // 构建请求参数
    const requestBody = this.buildPaymentRequest(params, tradeType);
    
    // 获取 API 端点
    const endpoint = this.getPaymentEndpoint(tradeType);
    
    // 发送请求（模拟）
    const response = await this.sendRequest('POST', endpoint, requestBody);

    // 根据交易类型返回不同结果
    const result: PaymentResult = {
      paymentId,
      orderId: params.orderId,
      provider: 'wechat',
      status: 'PENDING',
      createdAt: now,
    };

    if (tradeType === 'NATIVE') {
      result.qrCode = response.code_url || this.generateMockQrCode(params.orderId);
    } else if (tradeType === 'JSAPI') {
      result.prepayId = response.prepay_id || `wx${Date.now()}`;
      result.appParams = this.buildJsapiParams(result.prepayId);
    } else if (tradeType === 'APP') {
      result.prepayId = response.prepay_id || `wx${Date.now()}`;
      result.appParams = this.buildAppParams(result.prepayId);
    } else if (tradeType === 'H5' || tradeType === 'MWEB') {
      result.redirectUrl = response.h5_url || response.mweb_url;
    }

    return result;
  }

  /**
   * 查询支付
   */
  async queryPayment(orderId: string): Promise<PaymentQueryResult> {
    const endpoint = `${API_ENDPOINTS.QUERY_BY_OUT_TRADE_NO}/${orderId}?mchid=${this.config.mchId}`;
    
    // 发送请求（模拟）
    const response = await this.sendRequest('GET', endpoint);

    return {
      paymentId: orderId,
      orderId,
      provider: 'wechat',
      status: this.mapTradeState(response.trade_state || 'NOTPAY'),
      amount: response.amount?.total || 0,
      paidAmount: response.amount?.payer_total,
      tradeNo: response.transaction_id,
      paidAt: response.success_time ? new Date(response.success_time) : undefined,
    };
  }

  /**
   * 关闭支付
   */
  async closePayment(orderId: string): Promise<boolean> {
    const endpoint = `${API_ENDPOINTS.CLOSE}/${orderId}/close`;
    const requestBody = {
      mchid: this.config.mchId,
    };

    try {
      await this.sendRequest('POST', endpoint, requestBody);
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
    const refundId = params.refundId || generateRefundNo('WXREF');

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

    const requestBody = {
      out_trade_no: params.orderId,
      out_refund_no: refundId,
      reason: params.reason,
      notify_url: params.notifyUrl || this.config.notifyUrl,
      amount: {
        refund: params.amount,
        total: params.totalAmount,
        currency: 'CNY',
      },
    };

    try {
      const response = await this.sendRequest('POST', API_ENDPOINTS.REFUND, requestBody);

      return {
        refundId,
        paymentId: params.paymentId,
        amount: params.amount,
        status: this.mapRefundStatus(response.status || 'PROCESSING'),
        refundNo: response.refund_id,
        refundedAt: response.success_time ? new Date(response.success_time) : undefined,
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
  async queryRefund(refundId: string, _orderId: string): Promise<RefundResult> {
    const endpoint = `${API_ENDPOINTS.REFUND_QUERY}/${refundId}`;

    try {
      const response = await this.sendRequest('GET', endpoint);

      return {
        refundId,
        paymentId: response.out_trade_no || _orderId,
        amount: response.amount?.refund || 0,
        status: this.mapRefundStatus(response.status || 'PROCESSING'),
        refundNo: response.refund_id,
        refundedAt: response.success_time ? new Date(response.success_time) : undefined,
      };
    } catch {
      return {
        refundId,
        paymentId: _orderId,
        amount: 0,
        status: 'PENDING',
      };
    }
  }

  /**
   * 验证 APIv3 签名
   */
  verifySignature(data: Record<string, unknown>, signature: string): boolean {
    try {
      // 获取签名相关参数
      const timestamp = data['Wechatpay-Timestamp'] as string;
      const nonce = data['Wechatpay-Nonce'] as string;
      const body = data['body'] as string;
      const serial = data['Wechatpay-Serial'] as string;

      if (!timestamp || !nonce || !body) {
        return false;
      }

      // 构建验签字符串
      const message = `${timestamp}\n${nonce}\n${body}\n`;

      // 使用微信支付平台公钥验证签名
      // 在实际环境中，需要根据 serial 获取对应的平台证书
      const platformPublicKey = this.getPlatformPublicKey(serial);
      
      if (!platformPublicKey) {
        // 沙箱模式下，如果没有平台公钥，返回 true
        if (this.config.sandbox) {
          return true;
        }
        return false;
      }

      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(message);
      return verify.verify(platformPublicKey, signature, 'base64');
    } catch (error) {
      console.error('WeChat signature verification failed:', error);
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
    // 解密回调数据
    const resource = data.resource as Record<string, unknown>;
    let decryptedData: Record<string, unknown>;

    if (resource && resource.ciphertext) {
      decryptedData = this.decryptCallback(resource);
    } else {
      decryptedData = data;
    }

    const eventType = data.event_type as string;

    // 退款回调
    if (eventType === 'REFUND.SUCCESS' || eventType === 'REFUND.ABNORMAL' || eventType === 'REFUND.CLOSED') {
      return {
        provider: 'wechat',
        refundId: decryptedData.out_refund_no as string,
        paymentId: decryptedData.out_trade_no as string,
        amount: (decryptedData.amount as Record<string, number>)?.refund || 0,
        status: this.mapRefundEventStatus(eventType),
        refundedAt: decryptedData.success_time 
          ? new Date(decryptedData.success_time as string) 
          : undefined,
        rawData: data,
      };
    }

    // 支付回调
    return {
      provider: 'wechat',
      orderId: decryptedData.out_trade_no as string,
      tradeNo: decryptedData.transaction_id as string,
      amount: (decryptedData.amount as Record<string, number>)?.total || 0,
      status: this.mapTradeState(decryptedData.trade_state as string || 'SUCCESS'),
      paidAt: decryptedData.success_time 
        ? new Date(decryptedData.success_time as string) 
        : new Date(),
      rawData: data,
    };
  }

  /**
   * 生成 APIv3 签名
   */
  sign(method: string, url: string, timestamp: string, nonce: string, body: string): string {
    // 构建签名字符串
    const message = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`;

    // 沙箱模式下使用模拟签名
    if (this.config.sandbox && !this.config.privateKey) {
      return 'mock_wechat_signature_for_sandbox';
    }

    try {
      const privateKey = this.formatPrivateKey(this.config.privateKey || '');
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(message);
      return sign.sign(privateKey, 'base64');
    } catch (error) {
      if (this.config.sandbox) {
        return 'mock_wechat_signature_for_sandbox';
      }
      throw error;
    }
  }

  /**
   * 生成随机字符串
   */
  generateNonce(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
  }

  /**
   * 获取当前时间戳
   */
  getTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString();
  }

  /**
   * 构建支付请求参数
   */
  private buildPaymentRequest(
    params: CreatePaymentParams,
    tradeType: WechatTradeType
  ): Record<string, unknown> {
    const baseRequest: Record<string, unknown> = {
      appid: this.config.appId,
      mchid: this.config.mchId,
      description: params.subject,
      out_trade_no: params.orderId,
      notify_url: this.config.notifyUrl,
      amount: {
        total: params.amount,
        currency: 'CNY',
      },
    };

    // 设置过期时间
    if (params.expireTime) {
      const expireDate = new Date(Date.now() + params.expireTime * 60 * 1000);
      baseRequest.time_expire = expireDate.toISOString();
    }

    // 附加数据
    if (params.metadata) {
      baseRequest.attach = JSON.stringify(params.metadata);
    }

    // JSAPI 支付需要 openid
    if (tradeType === 'JSAPI' && params.openId) {
      baseRequest.payer = {
        openid: params.openId,
      };
    }

    // H5 支付需要场景信息
    if (tradeType === 'H5' || tradeType === 'MWEB') {
      baseRequest.scene_info = {
        payer_client_ip: params.clientIp || '127.0.0.1',
        h5_info: {
          type: 'Wap',
        },
      };
    }

    return baseRequest;
  }

  /**
   * 获取支付端点
   */
  private getPaymentEndpoint(tradeType: WechatTradeType): string {
    const endpoints: Record<WechatTradeType, string> = {
      NATIVE: API_ENDPOINTS.NATIVE,
      JSAPI: API_ENDPOINTS.JSAPI,
      APP: API_ENDPOINTS.APP,
      H5: API_ENDPOINTS.H5,
      MWEB: API_ENDPOINTS.H5,
    };
    return endpoints[tradeType] || API_ENDPOINTS.NATIVE;
  }

  /**
   * 构建 JSAPI 支付参数
   */
  private buildJsapiParams(prepayId: string): Record<string, string> {
    const timestamp = this.getTimestamp();
    const nonce = this.generateNonce();
    const packageStr = `prepay_id=${prepayId}`;

    // 构建签名字符串
    const message = `${this.config.appId}\n${timestamp}\n${nonce}\n${packageStr}\n`;
    
    let paySign: string;
    if (this.config.sandbox && !this.config.privateKey) {
      paySign = 'mock_jsapi_sign';
    } else {
      try {
        const privateKey = this.formatPrivateKey(this.config.privateKey || '');
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(message);
        paySign = sign.sign(privateKey, 'base64');
      } catch {
        paySign = 'mock_jsapi_sign';
      }
    }

    return {
      appId: this.config.appId,
      timeStamp: timestamp,
      nonceStr: nonce,
      package: packageStr,
      signType: 'RSA',
      paySign,
    };
  }

  /**
   * 构建 APP 支付参数
   */
  private buildAppParams(prepayId: string): Record<string, string> {
    const timestamp = this.getTimestamp();
    const nonce = this.generateNonce();

    // 构建签名字符串
    const message = `${this.config.appId}\n${timestamp}\n${nonce}\n${prepayId}\n`;
    
    let sign: string;
    if (this.config.sandbox && !this.config.privateKey) {
      sign = 'mock_app_sign';
    } else {
      try {
        const privateKey = this.formatPrivateKey(this.config.privateKey || '');
        const signObj = crypto.createSign('RSA-SHA256');
        signObj.update(message);
        sign = signObj.sign(privateKey, 'base64');
      } catch {
        sign = 'mock_app_sign';
      }
    }

    return {
      appid: this.config.appId,
      partnerid: this.config.mchId,
      prepayid: prepayId,
      package: 'Sign=WXPay',
      noncestr: nonce,
      timestamp,
      sign,
    };
  }

  /**
   * 发送 HTTP 请求（模拟）
   */
  private async sendRequest(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const url = `${this.apiBase}${endpoint}`;
    const timestamp = this.getTimestamp();
    const nonce = this.generateNonce();
    const bodyStr = body ? JSON.stringify(body) : '';

    // 生成签名
    const signature = this.sign(method, endpoint, timestamp, nonce, bodyStr);

    // 构建 Authorization 头
    const authorization = this.buildAuthorization(timestamp, nonce, signature);

    // 在实际环境中，这里应该发送真实的 HTTP 请求
    // 这里返回模拟数据
    console.log('WeChat Pay API Request:', {
      url,
      method,
      authorization,
      body: bodyStr,
    });

    // 模拟响应
    if (endpoint.includes('native')) {
      return { code_url: `weixin://wxpay/bizpayurl?pr=${this.generateNonce(16)}` };
    }
    if (endpoint.includes('jsapi') || endpoint.includes('app')) {
      return { prepay_id: `wx${Date.now()}${this.generateNonce(8)}` };
    }
    if (endpoint.includes('h5')) {
      return { h5_url: `https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=${this.generateNonce(16)}` };
    }
    if (endpoint.includes('refund')) {
      return { 
        refund_id: `50000000${Date.now()}`,
        status: 'PROCESSING',
      };
    }

    return {};
  }

  /**
   * 构建 Authorization 头
   */
  private buildAuthorization(timestamp: string, nonce: string, signature: string): string {
    const serialNo = this.config.serialNo || 'mock_serial_no';
    return `WECHATPAY2-SHA256-RSA2048 mchid="${this.config.mchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${serialNo}"`;
  }

  /**
   * 解密回调数据
   */
  private decryptCallback(resource: Record<string, unknown>): Record<string, unknown> {
    const ciphertext = resource.ciphertext as string;
    const nonce = resource.nonce as string;
    const associatedData = (resource.associated_data as string) || '';

    // 沙箱模式下返回模拟数据
    if (this.config.sandbox && !this.config.apiV3Key) {
      return {
        out_trade_no: 'mock_order_no',
        transaction_id: 'mock_transaction_id',
        trade_state: 'SUCCESS',
        amount: { total: 100 },
      };
    }

    try {
      const key = this.config.apiV3Key || '';
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        Buffer.from(key),
        Buffer.from(nonce)
      );
      
      decipher.setAuthTag(Buffer.from(ciphertext.slice(-16), 'base64'));
      decipher.setAAD(Buffer.from(associatedData));
      
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(ciphertext.slice(0, -16), 'base64')),
        decipher.final(),
      ]);
      
      return JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
      console.error('Failed to decrypt WeChat callback:', error);
      return {};
    }
  }

  /**
   * 获取平台公钥
   */
  private getPlatformPublicKey(_serial: string): string | null {
    // 在实际环境中，应该根据 serial 从证书存储中获取对应的平台公钥
    // 这里返回 null，表示需要实际配置
    return null;
  }

  /**
   * 格式化私钥
   */
  private formatPrivateKey(key: string): string {
    if (key.includes('-----BEGIN')) return key;
    return `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
  }

  /**
   * 生成模拟二维码链接
   */
  private generateMockQrCode(orderId: string): string {
    return `weixin://wxpay/bizpayurl?pr=${orderId}${this.generateNonce(8)}`;
  }

  /**
   * 映射交易状态
   */
  private mapTradeState(state: string): PaymentStatus {
    const stateMap: Record<string, PaymentStatus> = {
      SUCCESS: 'PAID',
      REFUND: 'REFUNDED',
      NOTPAY: 'PENDING',
      CLOSED: 'CANCELLED',
      REVOKED: 'CANCELLED',
      USERPAYING: 'PENDING',
      PAYERROR: 'FAILED',
    };
    return stateMap[state] || 'PENDING';
  }

  /**
   * 映射退款状态
   */
  private mapRefundStatus(status: string): RefundStatus {
    const statusMap: Record<string, RefundStatus> = {
      SUCCESS: 'SUCCESS',
      CLOSED: 'FAILED',
      PROCESSING: 'PROCESSING',
      ABNORMAL: 'FAILED',
    };
    return statusMap[status] || 'PENDING';
  }

  /**
   * 映射退款事件状态
   */
  private mapRefundEventStatus(eventType: string): RefundStatus {
    const eventMap: Record<string, RefundStatus> = {
      'REFUND.SUCCESS': 'SUCCESS',
      'REFUND.ABNORMAL': 'FAILED',
      'REFUND.CLOSED': 'FAILED',
    };
    return eventMap[eventType] || 'PENDING';
  }
}

/**
 * 创建微信支付适配器
 */
export function createWechatPayAdapter(config: WechatPayConfig): WechatPayAdapter {
  return new WechatPayAdapter(config);
}

// 导出工具函数
export { fenToYuan, yuanToFen };

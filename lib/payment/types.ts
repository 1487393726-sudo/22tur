/**
 * Payment Service Types
 * 支付服务类型定义
 */

// 支付提供商类型
export type PaymentProvider = 'alipay' | 'wechat';

// 支付状态
export type PaymentStatus = 
  | 'PENDING'     // 待支付
  | 'PAID'        // 已支付
  | 'FAILED'      // 支付失败
  | 'CANCELLED'   // 已取消
  | 'REFUNDED'    // 已退款
  | 'PARTIAL_REFUNDED'; // 部分退款

// 退款状态
export type RefundStatus = 
  | 'PENDING'     // 待处理
  | 'PROCESSING'  // 处理中
  | 'SUCCESS'     // 退款成功
  | 'FAILED';     // 退款失败

// 微信支付交易类型
export type WechatTradeType = 'NATIVE' | 'JSAPI' | 'APP' | 'H5' | 'MWEB';

// 支付宝配置
export interface AlipayConfig {
  appId: string;
  privateKey: string;
  alipayPublicKey: string;
  gateway: string;
  notifyUrl: string;
  returnUrl?: string;
  signType?: 'RSA2' | 'RSA';
  charset?: string;
  sandbox?: boolean;
}

// 微信支付配置
export interface WechatPayConfig {
  appId: string;
  mchId: string;
  apiKey: string;
  apiV3Key?: string;
  serialNo?: string;
  privateKey?: string;
  certPath?: string;
  notifyUrl: string;
  sandbox?: boolean;
}

// 支付配置
export interface PaymentConfig {
  alipay?: AlipayConfig;
  wechat?: WechatPayConfig;
}

// 创建支付参数
export interface CreatePaymentParams {
  orderId: string;
  amount: number;          // 金额（分）
  subject: string;         // 商品标题
  body?: string;           // 商品描述
  userId: string;
  provider: PaymentProvider;
  tradeType?: WechatTradeType;
  openId?: string;         // 微信 JSAPI 支付需要
  clientIp?: string;       // 客户端 IP
  expireTime?: number;     // 过期时间（分钟）
  metadata?: Record<string, string>;
}

// 支付结果
export interface PaymentResult {
  paymentId: string;
  orderId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  qrCode?: string;         // 二维码链接
  redirectUrl?: string;    // 跳转链接
  prepayId?: string;       // 微信预支付 ID
  appParams?: Record<string, string>; // APP 支付参数
  createdAt: Date;
}

// 支付查询结果
export interface PaymentQueryResult {
  paymentId: string;
  orderId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  paidAmount?: number;
  tradeNo?: string;        // 第三方交易号
  paidAt?: Date;
  metadata?: Record<string, unknown>;
}

// 退款参数
export interface RefundParams {
  paymentId: string;
  refundId?: string;       // 退款单号（可选，自动生成）
  amount: number;          // 退款金额（分）
  reason: string;          // 退款原因
  notifyUrl?: string;      // 退款通知地址
}

// 退款结果
export interface RefundResult {
  refundId: string;
  paymentId: string;
  amount: number;
  status: RefundStatus;
  refundNo?: string;       // 第三方退款单号
  refundedAt?: Date;
  errorCode?: string;
  errorMessage?: string;
}

// 支付回调数据
export interface PaymentCallbackData {
  provider: PaymentProvider;
  orderId: string;
  tradeNo: string;
  amount: number;
  status: PaymentStatus;
  paidAt: Date;
  rawData: Record<string, unknown>;
}

// 退款回调数据
export interface RefundCallbackData {
  provider: PaymentProvider;
  refundId: string;
  paymentId: string;
  amount: number;
  status: RefundStatus;
  refundedAt?: Date;
  rawData: Record<string, unknown>;
}

// 签名验证结果
export interface SignatureVerifyResult {
  valid: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

// 支付记录
export interface PaymentRecord {
  id: string;
  orderId: string;
  userId: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: PaymentStatus;
  tradeNo?: string;
  qrCode?: string;
  redirectUrl?: string;
  paidAt?: Date;
  refundedAmount: number;
  metadata?: Record<string, unknown>;
  callbackData?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// 退款记录
export interface RefundRecord {
  id: string;
  paymentId: string;
  refundNo?: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  refundedAt?: Date;
  errorCode?: string;
  errorMessage?: string;
  createdAt: Date;
}

// 支付服务接口
export interface IPaymentService {
  // 创建支付
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;
  
  // 查询支付
  queryPayment(paymentId: string): Promise<PaymentQueryResult>;
  
  // 关闭支付
  closePayment(paymentId: string): Promise<boolean>;
  
  // 退款
  refund(params: RefundParams): Promise<RefundResult>;
  
  // 查询退款
  queryRefund(refundId: string): Promise<RefundResult>;
  
  // 验证回调签名
  verifyCallback(
    provider: PaymentProvider,
    data: Record<string, unknown>,
    signature: string
  ): Promise<SignatureVerifyResult>;
  
  // 处理支付回调
  handlePaymentCallback(
    provider: PaymentProvider,
    data: Record<string, unknown>
  ): Promise<PaymentCallbackData>;
  
  // 处理退款回调
  handleRefundCallback(
    provider: PaymentProvider,
    data: Record<string, unknown>
  ): Promise<RefundCallbackData>;
}

// 支付提供商适配器接口
export interface IPaymentAdapter {
  provider: PaymentProvider;
  
  // 创建支付
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;
  
  // 查询支付
  queryPayment(orderId: string): Promise<PaymentQueryResult>;
  
  // 关闭支付
  closePayment(orderId: string): Promise<boolean>;
  
  // 退款
  refund(params: RefundParams & { orderId: string; totalAmount: number }): Promise<RefundResult>;
  
  // 查询退款
  queryRefund(refundId: string, orderId: string): Promise<RefundResult>;
  
  // 验证签名
  verifySignature(data: Record<string, unknown>, signature: string): boolean;
  
  // 解析回调数据
  parseCallback(data: Record<string, unknown>): PaymentCallbackData | RefundCallbackData;
}

// 订单号生成器
export function generateOrderNo(prefix: string = 'PAY'): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// 退款单号生成器
export function generateRefundNo(prefix: string = 'REF'): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// 金额转换：分转元
export function fenToYuan(fen: number): string {
  return (fen / 100).toFixed(2);
}

// 金额转换：元转分
export function yuanToFen(yuan: number | string): number {
  const amount = typeof yuan === 'string' ? parseFloat(yuan) : yuan;
  return Math.round(amount * 100);
}

// 支付状态转换映射
export const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: ['PAID', 'FAILED', 'CANCELLED'],
  PAID: ['REFUNDED', 'PARTIAL_REFUNDED'],
  FAILED: [],
  CANCELLED: [],
  REFUNDED: [],
  PARTIAL_REFUNDED: ['REFUNDED'],
};

// 验证状态转换是否有效
export function isValidStatusTransition(
  currentStatus: PaymentStatus,
  newStatus: PaymentStatus
): boolean {
  if (currentStatus === newStatus) return true;
  return PAYMENT_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

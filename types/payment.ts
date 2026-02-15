/**
 * 支付交易类型定义
 */

// 支付方式枚举
export enum PaymentMethod {
  ALIPAY = 'ALIPAY',        // 支付宝
  WECHAT = 'WECHAT',        // 微信支付
  BANK = 'BANK',            // 银行卡
  CREDIT_CARD = 'CREDIT_CARD' // 信用卡
}

// 支付状态枚举
export enum PaymentStatus {
  PENDING = 'PENDING',      // 待支付
  SUCCESS = 'SUCCESS',      // 支付成功
  FAILED = 'FAILED',        // 支付失败
  REFUNDED = 'REFUNDED',    // 已退款
  CANCELLED = 'CANCELLED'   // 已取消
}

// 货币类型
export enum Currency {
  CNY = 'CNY',  // 人民币
  USD = 'USD',  // 美元
  EUR = 'EUR',  // 欧元
  JPY = 'JPY'   // 日元
}

// 支付交易接口
export interface PaymentTransaction {
  id: string
  orderId: string
  userId: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string | null
  paymentUrl?: string | null
  qrCode?: string | null
  metadata?: string | null
  failureReason?: string | null
  refundAmount?: number | null
  refundedAt?: Date | null
  paidAt?: Date | null
  expiredAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

// 创建支付交易请求
export interface CreatePaymentRequest {
  orderId: string
  userId: string
  amount: number
  currency?: string
  method: PaymentMethod
  expiredAt?: Date
  metadata?: Record<string, any>
}

// 支付交易响应
export interface PaymentTransactionResponse {
  success: boolean
  transaction?: PaymentTransaction
  paymentUrl?: string
  qrCode?: string
  message?: string
  error?: string
}

// 支付回调数据
export interface PaymentCallbackData {
  transactionId: string
  orderId: string
  amount: number
  status: PaymentStatus
  paidAt?: Date
  failureReason?: string
  [key: string]: any
}

// 退款请求
export interface RefundRequest {
  transactionId: string
  amount?: number  // 如果不提供，则全额退款
  reason?: string
}

// 退款响应
export interface RefundResponse {
  success: boolean
  refundAmount: number
  refundedAt: Date
  message?: string
  error?: string
}

// 支付查询参数
export interface PaymentQueryParams {
  userId?: string
  orderId?: string
  status?: PaymentStatus
  method?: PaymentMethod
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
}

// 支付统计数据
export interface PaymentStats {
  totalTransactions: number
  totalAmount: number
  successCount: number
  successAmount: number
  failedCount: number
  refundedCount: number
  refundedAmount: number
  pendingCount: number
  pendingAmount: number
}

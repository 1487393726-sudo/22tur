/**
 * 印刷服务定制下单系统 - 类型定义
 * Requirements: 1.2, 5.1
 */

// 产品类型
export type ProductType =
  | 'business_card'  // 名片
  | 'poster'         // 海报
  | 'brochure'       // 画册/折页
  | 'packaging'      // 包装
  | 'banner'         // 横幅/展架
  | 'sticker'        // 贴纸/标签
  | 'other';         // 其他

// 询价状态
export type QuoteStatus =
  | 'pending'    // 待报价
  | 'quoted'     // 已报价
  | 'accepted'   // 已接受
  | 'rejected'   // 已拒绝
  | 'revised'    // 需修改
  | 'expired'    // 已过期
  | 'ordered';   // 已下单

// 订单状态
export type OrderStatus =
  | 'pending_payment'  // 待支付
  | 'paid'             // 已支付
  | 'in_production'    // 生产中
  | 'shipped'          // 已发货
  | 'delivered'        // 已送达
  | 'completed'        // 已完成
  | 'cancelled';       // 已取消

// 支付状态
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

// 印刷面数
export type PrintSides = 'single' | 'double';

// 询价文件
export interface PrintQuoteFile {
  id: string;
  quoteId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
}

// 询价/报价
export interface PrintQuote {
  id: string;
  quoteNumber: string;
  customerId: string;
  status: QuoteStatus;
  
  // 产品规格
  productType: ProductType;
  quantity: number;
  size: string;
  customWidth?: number | null;
  customHeight?: number | null;
  material?: string | null;
  finishing?: string | null;  // JSON array string
  colorMode?: string | null;
  sides?: PrintSides | null;
  
  // 客户信息
  requirements?: string | null;
  deliveryAddress?: string | null;
  expectedDate?: Date | null;
  
  // 报价信息
  unitPrice?: number | null;
  totalPrice?: number | null;
  priceBreakdown?: string | null;  // JSON string
  validUntil?: Date | null;
  adminNote?: string | null;
  rejectionReason?: string | null;
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  quotedAt?: Date | null;
  acceptedAt?: Date | null;
  
  // 关联
  files?: PrintQuoteFile[];
  order?: PrintOrder | null;
}


// 印刷订单
export interface PrintOrder {
  id: string;
  orderNumber: string;
  quoteId: string;
  customerId: string;
  status: OrderStatus;
  
  // 产品信息
  productType: ProductType;
  quantity: number;
  specifications: string;  // JSON string
  
  // 价格
  unitPrice: number;
  totalPrice: number;
  
  // 支付
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  paidAt?: Date | null;
  
  // 生产和物流
  productionStatus?: string | null;
  trackingNumber?: string | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
  
  // 关联
  quote?: PrintQuote;
}

// 创建询价请求
export interface CreateQuoteRequest {
  productType: ProductType;
  quantity: number;
  size: string;
  customWidth?: number;
  customHeight?: number;
  material?: string;
  finishing?: string[];
  colorMode?: string;
  sides?: PrintSides;
  requirements?: string;
  deliveryAddress?: string;
  expectedDate?: string;  // ISO date string
}

// 提交报价请求
export interface SubmitQuoteRequest {
  unitPrice: number;
  totalPrice: number;
  priceBreakdown?: Record<string, number>;
  validUntil: string;  // ISO date string
  adminNote?: string;
}

// 拒绝询价请求
export interface RejectQuoteRequest {
  reason: string;
}

// 修改报价请求
export interface ReviseQuoteRequest {
  comment: string;
}

// 询价验证错误
export interface QuoteValidationError {
  field: string;
  message: string;
}

// 询价验证结果
export interface QuoteValidationResult {
  valid: boolean;
  errors: QuoteValidationError[];
}

// 文件验证结果
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

// 允许的文件类型
export const ALLOWED_FILE_TYPES = ['jpg', 'jpeg', 'png', 'pdf', 'ai', 'psd'] as const;
export type AllowedFileType = typeof ALLOWED_FILE_TYPES[number];

// 最大文件大小 (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// 数量范围
export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 100000;

// 常用数量预设
export const QUANTITY_PRESETS = [100, 200, 500, 1000, 2000, 5000, 10000] as const;

// 产品类型标签
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  business_card: '名片',
  poster: '海报',
  brochure: '画册/折页',
  packaging: '包装',
  banner: '横幅/展架',
  sticker: '贴纸/标签',
  other: '其他',
};

// 询价状态标签
export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  pending: '待报价',
  quoted: '已报价',
  accepted: '已接受',
  rejected: '已拒绝',
  revised: '需修改',
  expired: '已过期',
  ordered: '已下单',
};

// 订单状态标签
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: '待支付',
  paid: '已支付',
  in_production: '生产中',
  shipped: '已发货',
  delivered: '已送达',
  completed: '已完成',
  cancelled: '已取消',
};

// 状态转换规则
export const VALID_STATUS_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  pending: ['quoted', 'rejected'],
  quoted: ['accepted', 'revised', 'expired'],
  revised: ['quoted', 'rejected'],
  accepted: ['ordered'],
  rejected: [],
  expired: [],
  ordered: [],
};

// 检查状态转换是否有效
export function isValidStatusTransition(from: QuoteStatus, to: QuoteStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

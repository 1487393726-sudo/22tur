/**
 * Shopping Cart and Checkout Types
 * Defines data structures for shopping cart, checkout, and related features
 */

export type CouponType = 'percentage' | 'fixed' | 'free_shipping';
export type InvoiceType = 'personal' | 'company';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  stock: number;
  addedAt: Date;
}

export interface ShoppingCart {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  discount: number;
  finalPrice: number;
  couponCode?: string;
  updatedAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minPurchase: number;
  maxDiscount: number;
  expiryDate: Date;
  isUsed: boolean;
  usedAt?: Date;
  description: string;
}

export interface CheckoutData {
  cartItems: CartItem[];
  shippingAddressId: string;
  paymentMethodId: string;
  couponCode?: string;
  invoiceRequest?: InvoiceRequest;
  notes?: string;
}

export interface InvoiceRequest {
  type: InvoiceType;
  title: string;
  taxId?: string;
  email: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  type: InvoiceType;
  title: string;
  taxId?: string;
  amount: number;
  issueDate: Date;
  status: 'pending' | 'issued' | 'sent';
  downloadUrl?: string;
}

export interface CheckoutStep {
  step: 'cart' | 'address' | 'payment' | 'invoice' | 'confirm' | 'complete';
  completed: boolean;
  data?: Record<string, any>;
}

export interface CheckoutState {
  currentStep: CheckoutStep['step'];
  steps: CheckoutStep[];
  cartData: ShoppingCart;
  selectedAddressId?: string;
  selectedPaymentId?: string;
  appliedCoupon?: Coupon;
  invoiceRequest?: InvoiceRequest;
  orderNumber?: string;
  error?: string;
}

export const CART_ITEM_LIMITS = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 999,
  MAX_ITEMS: 100,
} as const;

export const COUPON_TYPES: Record<CouponType, string> = {
  percentage: '百分比折扣',
  fixed: '固定金额折扣',
  free_shipping: '免运费',
} as const;

export const INVOICE_TYPES: Record<InvoiceType, string> = {
  personal: '个人发票',
  company: '企业发票',
} as const;

export const INVOICE_STATUS_LABELS: Record<Invoice['status'], string> = {
  pending: '待开具',
  issued: '已开具',
  sent: '已发送',
} as const;

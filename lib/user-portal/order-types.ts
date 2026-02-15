/**
 * Order Management Types
 * Defines data structures for order management functionality
 */

export type OrderStatus = 'pending_payment' | 'pending_shipment' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'returned';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  recipient: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'alipay' | 'wechat';
  name: string;
  lastFour: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  totalPrice: number;
  discount: number;
  finalPrice: number;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  trackingNumber?: string;
}

export interface OrderFilter {
  status?: OrderStatus | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

export interface OrderTrackingEvent {
  id: string;
  timestamp: Date;
  status: OrderStatus;
  description: string;
  location?: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: '待支付',
  pending_shipment: '待发货',
  shipped: '已发货',
  delivered: '已送达',
  completed: '已完成',
  cancelled: '已取消',
  returned: '已退货',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  pending_shipment: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  shipped: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  completed: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  returned: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

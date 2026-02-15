// After-Sales Service Types

export type ReturnReason = 
  | 'defective'
  | 'wrong_item'
  | 'not_as_described'
  | 'damaged'
  | 'changed_mind'
  | 'other';

export type ReturnStatus = 
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'received'
  | 'refunded'
  | 'cancelled';

export type ContactMethod = 'online_chat' | 'phone' | 'email';

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  itemId: string;
  itemName: string;
  quantity: number;
  reason: ReturnReason;
  description: string;
  images: string[];
  status: ReturnStatus;
  refundAmount: number;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  refundedAt?: Date;
}

export interface AfterSalesRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  type: 'return' | 'exchange' | 'repair' | 'complaint';
  status: ReturnStatus;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface ContactInfo {
  method: ContactMethod;
  value: string;
  label: string;
  available: boolean;
  hours?: string;
}

export interface AfterSalesService {
  id: string;
  name: string;
  description: string;
  contactMethods: ContactInfo[];
  responseTime: string;
  policies: string[];
}

export interface ReturnTrackingEvent {
  id: string;
  returnId: string;
  status: ReturnStatus;
  timestamp: Date;
  description: string;
  location?: string;
}

export interface ReturnPolicy {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'defective' | 'damaged' | 'other';
  createdAt: Date;
}

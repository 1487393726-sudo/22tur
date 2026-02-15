/**
 * Core type definitions for Enterprise Admin System
 */

// User and Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  ipAddress?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  parentRole?: Role;
  parentRoleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: Date;
}

export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  roles: Role[];
  permissions: Permission[];
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
  statusHistory?: StatusChange[];
}

export interface StatusChange {
  status: OrderStatus;
  changedAt: Date;
  changedBy: string;
  reason?: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  stockWarningLevel?: number;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}

export interface LoginLog {
  id: string;
  userId: string;
  loginTime: Date;
  logoutTime?: Date;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  failureReason?: string;
}

// Dashboard Types
export interface DashboardMetric {
  id: string;
  name: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'activity' | 'action';
  title: string;
  data: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface WidgetConfig {
  id: string;
  userId: string;
  widgetType: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings: Record<string, any>;
}

// Financial Types
export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
  relatedOrderId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  amount: number;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'issued' | 'paid' | 'overdue';
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// Search and Filter Types
export interface SearchQuery {
  keyword: string;
  filters: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Export Types
export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  columns?: string[];
  filename?: string;
  includeHeaders?: boolean;
}

// Status Badge Types
export interface StatusBadgeConfig {
  status: string;
  label: string;
  color: string;
  icon?: string;
  description?: string;
}

// Batch Operation Types
export interface BatchOperation {
  id: string;
  type: 'update' | 'delete' | 'export';
  resourceType: string;
  resourceIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Error Types
export class EnterpriseAdminError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'EnterpriseAdminError';
  }
}

export class AuthenticationError extends EnterpriseAdminError {
  constructor(message: string = 'Authentication failed') {
    super('AUTH_ERROR', message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends EnterpriseAdminError {
  constructor(message: string = 'Access denied') {
    super('AUTHZ_ERROR', message, 403);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends EnterpriseAdminError {
  constructor(message: string, details?: Record<string, any>) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends EnterpriseAdminError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} with id ${id} not found`, 404);
    this.name = 'NotFoundError';
  }
}

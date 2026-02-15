/**
 * Constants for Enterprise Admin System
 */

// Color Palette
export const COLORS = {
  primary: '#495057', // Dark Gray
  secondary: '#6c757d',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  white: '#ffffff',
  black: '#000000',
};

// Order Status Configuration
export const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: '#ffc107',
    icon: 'clock',
    description: 'Order is pending confirmation',
  },
  confirmed: {
    label: 'Confirmed',
    color: '#17a2b8',
    icon: 'check-circle',
    description: 'Order has been confirmed',
  },
  shipped: {
    label: 'Shipped',
    color: '#007bff',
    icon: 'truck',
    description: 'Order has been shipped',
  },
  delivered: {
    label: 'Delivered',
    color: '#28a745',
    icon: 'check-double',
    description: 'Order has been delivered',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#dc3545',
    icon: 'times-circle',
    description: 'Order has been cancelled',
  },
};

// Valid Order Status Transitions
export const VALID_ORDER_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

// User Status Configuration
export const USER_STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: '#28a745',
    icon: 'check-circle',
  },
  inactive: {
    label: 'Inactive',
    color: '#6c757d',
    icon: 'minus-circle',
  },
  suspended: {
    label: 'Suspended',
    color: '#dc3545',
    icon: 'ban',
  },
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
};

// Audit Log Actions
export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
  PERMISSION_CHANGE: 'PERMISSION_CHANGE',
  ROLE_CHANGE: 'ROLE_CHANGE',
};

// Resource Types
export const RESOURCE_TYPES = {
  USER: 'USER',
  ORDER: 'ORDER',
  PRODUCT: 'PRODUCT',
  ROLE: 'ROLE',
  PERMISSION: 'PERMISSION',
  INVOICE: 'INVOICE',
  DASHBOARD: 'DASHBOARD',
  SETTINGS: 'SETTINGS',
};

// Permission Actions
export const PERMISSION_ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  EXPORT: 'export',
  IMPORT: 'import',
  MANAGE: 'manage',
};

// Default Roles
export const DEFAULT_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  VIEWER: 'viewer',
};

// Export Formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
};

// Error Codes
export const ERROR_CODES = {
  AUTH_ERROR: 'AUTH_ERROR',
  AUTHZ_ERROR: 'AUTHZ_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_TRANSITION: 'INVALID_TRANSITION',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
};

// Session Configuration
export const SESSION_CONFIG = {
  TIMEOUT_MINUTES: 30,
  REMEMBER_ME_DAYS: 7,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_MINUTES: 15,
};

// Cache Configuration
export const CACHE_CONFIG = {
  USER_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  ROLE_CACHE_TTL: 10 * 60 * 1000, // 10 minutes
  PERMISSION_CACHE_TTL: 10 * 60 * 1000, // 10 minutes
  DASHBOARD_CACHE_TTL: 1 * 60 * 1000, // 1 minute
};

// Batch Operation Configuration
export const BATCH_OPERATION_CONFIG = {
  MAX_BATCH_SIZE: 1000,
  BATCH_TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
};

/**
 * HexHub 类型定义
 */

// ============================================
// 用户相关类型
// ============================================

export interface HexHubUserInput {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
  role?: string
}

export interface HexHubUserResponse {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  role: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface HexHubUserUpdateInput {
  firstName?: string
  lastName?: string
  avatar?: string
  status?: string
}

// ============================================
// 项目相关类型
// ============================================

export interface HexHubProjectInput {
  name: string
  description?: string
  creatorId: string
  visibility?: string
}

export interface HexHubProjectResponse {
  id: string
  name: string
  description?: string
  status: string
  visibility: string
  creatorId: string
  createdAt: Date
  updatedAt: Date
}

export interface HexHubProjectUpdateInput {
  name?: string
  description?: string
  status?: string
  visibility?: string
}

export interface HexHubProjectMemberInput {
  projectId: string
  userId: string
  role?: string
}

export interface HexHubProjectMemberResponse {
  id: string
  projectId: string
  userId: string
  role: string
  joinedAt: Date
}

// ============================================
// 数据集相关类型
// ============================================

export interface HexHubDatasetInput {
  projectId: string
  name: string
  description?: string
  dataType: string
  format?: string
  ownerId: string
}

export interface HexHubDatasetResponse {
  id: string
  projectId: string
  name: string
  description?: string
  dataType: string
  format: string
  size: number
  recordCount: number
  status: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface HexHubDatasetUpdateInput {
  name?: string
  description?: string
  status?: string
  size?: number
  recordCount?: number
}

export interface HexHubDataRecordInput {
  datasetId: string
  data: string
  metadata?: string
  hash?: string
}

export interface HexHubDataRecordResponse {
  id: string
  datasetId: string
  data: string
  metadata?: string
  hash?: string
  createdAt: Date
}

// ============================================
// 分析相关类型
// ============================================

export interface HexHubAnalyticsInput {
  projectId: string
  metric: string
  value: number
  dimension?: string
}

export interface HexHubAnalyticsResponse {
  id: string
  projectId: string
  metric: string
  value: number
  dimension?: string
  timestamp: Date
}

export interface HexHubReportInput {
  projectId: string
  name: string
  description?: string
  type: string
  config: string
}

export interface HexHubReportResponse {
  id: string
  projectId: string
  name: string
  description?: string
  type: string
  config: string
  status: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// API 密钥相关类型
// ============================================

export interface HexHubApiKeyInput {
  userId: string
  name: string
}

export interface HexHubApiKeyResponse {
  id: string
  userId: string
  name: string
  key: string
  secret: string
  status: string
  lastUsedAt?: Date
  expiresAt?: Date
  createdAt: Date
}

export interface HexHubApiLogInput {
  apiKeyId?: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  ipAddress?: string
  userAgent?: string
}

export interface HexHubApiLogResponse {
  id: string
  apiKeyId?: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

// ============================================
// 审计相关类型
// ============================================

export interface HexHubAuditLogInput {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  details?: string
  ipAddress?: string
  userAgent?: string
}

export interface HexHubAuditLogResponse {
  id: string
  userId?: string
  action: string
  resource: string
  resourceId?: string
  details?: string
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export interface HexHubSecurityEventInput {
  type: string
  severity?: string
  description?: string
  userId?: string
  ipAddress?: string
}

export interface HexHubSecurityEventResponse {
  id: string
  type: string
  severity: string
  description?: string
  userId?: string
  ipAddress?: string
  status: string
  createdAt: Date
  resolvedAt?: Date
}

// ============================================
// 通知相关类型
// ============================================

export interface HexHubNotificationInput {
  userId: string
  title: string
  message: string
  type: string
  priority?: string
  actionUrl?: string
}

export interface HexHubNotificationResponse {
  id: string
  userId: string
  title: string
  message: string
  type: string
  priority: string
  isRead: boolean
  actionUrl?: string
  createdAt: Date
  readAt?: Date
}

// ============================================
// 通用类型
// ============================================

export interface PaginationOptions {
  skip?: number
  take?: number
}

export interface PaginationResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
  }
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code: string
  }
}

// ============================================
// 查询选项
// ============================================

export interface UserListOptions extends PaginationOptions {
  status?: string
  role?: string
}

export interface ProjectListOptions extends PaginationOptions {
  status?: string
  visibility?: string
}

export interface DatasetListOptions extends PaginationOptions {
  dataType?: string
  status?: string
}

export interface AuditLogListOptions extends PaginationOptions {
  userId?: string
  action?: string
  resource?: string
  startDate?: Date
  endDate?: Date
}

export interface SecurityEventListOptions extends PaginationOptions {
  type?: string
  severity?: string
  status?: string
}

// ============================================
// 常量
// ============================================

export const USER_ROLES = ['ADMIN', 'EDITOR', 'VIEWER', 'USER'] as const
export const PROJECT_VISIBILITY = ['PUBLIC', 'PRIVATE', 'SHARED'] as const
export const DATA_TYPES = ['USER', 'EVENT', 'PRODUCT', 'ORDER', 'CUSTOM'] as const
export const DATA_FORMATS = ['JSON', 'CSV', 'XML', 'PARQUET'] as const
export const RESOURCE_STATUS = ['ACTIVE', 'INACTIVE', 'ARCHIVED', 'DELETED'] as const
export const AUDIT_ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'] as const
export const SECURITY_SEVERITY = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
export const NOTIFICATION_TYPES = ['INFO', 'WARNING', 'ERROR', 'SUCCESS'] as const
export const NOTIFICATION_PRIORITY = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const

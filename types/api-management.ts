// API Management System Types

export type ConnectionType = 'PAYMENT' | 'EMAIL' | 'SMS' | 'STORAGE' | 'CUSTOM';
export type ConnectionStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';
export type Environment = 'SANDBOX' | 'PRODUCTION';
export type KeyStatus = 'ACTIVE' | 'REVOKED';
export type WebhookStatus = 'ACTIVE' | 'INACTIVE';
export type WebhookLogStatus = 'SUCCESS' | 'FAILED' | 'INVALID_SIGNATURE';

export interface ApiConnection {
  id: string;
  name: string;
  type: ConnectionType;
  provider: string;
  status: ConnectionStatus;
  environment: Environment;
  baseUrl?: string | null;
  isDefault: boolean;
  lastTestedAt?: Date | null;
  lastTestStatus?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ApiConnectionInput {
  name: string;
  type: ConnectionType;
  provider: string;
  environment: Environment;
  baseUrl?: string;
  config: Record<string, unknown>;
  isDefault?: boolean;
}

export interface ApiKey {
  id: string;
  connectionId: string;
  name: string;
  keyPrefix: string;
  status: KeyStatus;
  expiresAt?: Date | null;
  lastUsedAt?: Date | null;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKeyCreateInput {
  connectionId: string;
  name: string;
  key: string;
  expiresAt?: Date;
}


export interface ApiWebhook {
  id: string;
  connectionId: string;
  name: string;
  url: string;
  events: string[];
  status: WebhookStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiWebhookInput {
  connectionId: string;
  name: string;
  events: string[];
}

export interface ApiWebhookLog {
  id: string;
  webhookId: string;
  eventType: string;
  payload: string;
  status: WebhookLogStatus;
  responseCode?: number | null;
  errorMessage?: string | null;
  processingMs?: number | null;
  sourceIp?: string | null;
  createdAt: Date;
}

export interface WebhookPayload {
  eventType: string;
  timestamp: number;
  data: Record<string, unknown>;
  signature: string;
}

export interface ApiUsageLog {
  id: string;
  connectionId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  success: boolean;
  errorMessage?: string | null;
  metadata?: string | null;
  createdAt: Date;
}

export interface ApiTemplate {
  id: string;
  name: string;
  provider: string;
  type: ConnectionType;
  category: string;
  description: string;
  configSchema: string;
  defaultConfig: string;
  docsUrl?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiStatistics {
  connectionId: string;
  totalCalls: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgResponseTime: number;
  errorsByType: Record<string, number>;
}

export interface FilterCriteria {
  type?: ConnectionType;
  status?: ConnectionStatus;
  provider?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  responseTime: number;
  statusCode?: number;
  message: string;
  troubleshooting?: string[];
}

export interface ExportedConfig {
  version: string;
  exportedAt: string;
  connections: Omit<ApiConnection, 'id' | 'createdAt' | 'updatedAt'>[];
  webhooks: Omit<ApiWebhook, 'id' | 'url' | 'createdAt'>[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

// Error types
export class ApiManagementError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ApiManagementError';
  }
}

export const ErrorCodes = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  CONNECTION_TEST_FAILED: 'CONNECTION_TEST_FAILED',
  ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED: 'DECRYPTION_FAILED',
  WEBHOOK_SIGNATURE_INVALID: 'WEBHOOK_SIGNATURE_INVALID',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  DUPLICATE_CONNECTION: 'DUPLICATE_CONNECTION',
  IMPORT_VALIDATION_FAILED: 'IMPORT_VALIDATION_FAILED',
  KEY_ROTATION_FAILED: 'KEY_ROTATION_FAILED',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

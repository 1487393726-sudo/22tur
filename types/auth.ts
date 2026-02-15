// types/auth.ts
// 第三方认证与安全系统类型定义

// ==========================================
// OAuth 相关类型
// ==========================================

export type OAuthProvider = 'google' | 'github' | 'wechat' | 'qq';

export interface OAuthProviderConfig {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string[];
  profileMapping: {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
  };
}

export interface OAuthAccount {
  id: string;
  userId: string;
  provider: OAuthProvider;
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
  idToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthProfile {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  provider: OAuthProvider;
  raw?: Record<string, unknown>;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
}

// ==========================================
// 双因素认证相关类型
// ==========================================

export type TwoFactorMethod = 'TOTP' | 'SMS';

export interface TwoFactorSecret {
  id: string;
  userId: string;
  secret: string;
  enabled: boolean;
  method: TwoFactorMethod;
  backupCodes?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TwoFactorSetupResult {
  secret: string;
  qrCode: string;
  otpauthUrl: string;
}

export interface TwoFactorEnableResult {
  enabled: boolean;
  backupCodes: string[];
}

export interface BackupCode {
  code: string;
  used: boolean;
  usedAt?: Date;
}

// ==========================================
// 设备管理相关类型
// ==========================================

export interface LoginDevice {
  id: string;
  userId: string;
  fingerprint: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: GeoLocation;
  userAgent: string;
  lastActiveAt: Date;
  createdAt: Date;
  isRevoked: boolean;
  revokedAt?: Date;
}

export interface DeviceInfo {
  fingerprint: string;
  browser: string;
  os: string;
  ipAddress: string;
  userAgent: string;
  location?: GeoLocation;
}

export interface GeoLocation {
  country?: string;
  city?: string;
  lat?: number;
  lng?: number;
}

// ==========================================
// 登录日志相关类型
// ==========================================

export type LoginResult = 'SUCCESS' | 'FAILED' | 'BLOCKED';
export type LoginMethod = 'PASSWORD' | 'OAUTH' | '2FA';

export interface LoginLog {
  id: string;
  userId?: string;
  identifier: string;
  ipAddress: string;
  browser?: string;
  os?: string;
  location?: GeoLocation;
  result: LoginResult;
  failureReason?: string;
  method: LoginMethod;
  provider?: OAuthProvider;
  deviceId?: string;
  createdAt: Date;
}

export interface LoginAttemptData {
  userId?: string;
  identifier: string;
  ipAddress: string;
  deviceInfo: DeviceInfo;
  result: LoginResult;
  failureReason?: string;
  method: LoginMethod;
  provider?: OAuthProvider;
}

export interface LoginLogFilters {
  userId?: string;
  identifier?: string;
  result?: LoginResult;
  method?: LoginMethod;
  provider?: OAuthProvider;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

// ==========================================
// 异常检测相关类型
// ==========================================

export type SecurityEventType = 
  | 'LOGIN_FAILED'
  | 'ACCOUNT_LOCKED'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | 'NEW_DEVICE'
  | 'PASSWORD_CHANGED'
  | 'SUSPICIOUS_LOGIN'
  | 'IMPOSSIBLE_TRAVEL';

export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityEvent {
  id: string;
  userId?: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
}

export interface AnomalyResult {
  suspicious: boolean;
  reasons: string[];
  requiresVerification: boolean;
  riskScore: number;
}

export interface AccountLock {
  id: string;
  identifier: string;
  reason: string;
  attempts: number;
  lockedAt: Date;
  expiresAt: Date;
  unlockedAt?: Date;
  unlockedBy?: string;
}

// ==========================================
// SMS 验证相关类型
// ==========================================

export type SMSPurpose = 'LOGIN' | 'ENABLE_2FA' | 'VERIFY_PHONE';

export interface SMSVerificationCode {
  id: string;
  userId: string;
  phone: string;
  code: string;
  purpose: SMSPurpose;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

export interface SMSSendResult {
  success: boolean;
  messageId?: string;
  expiresAt: Date;
}

// ==========================================
// 账户关联相关类型
// ==========================================

export interface LinkedAccount {
  provider: OAuthProvider;
  providerAccountId: string;
  email?: string;
  name?: string;
  avatar?: string;
  linkedAt: Date;
}

export interface AccountLinkingResult {
  success: boolean;
  provider: OAuthProvider;
  message?: string;
}

// ==========================================
// 错误类型
// ==========================================

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const AuthErrorCodes = {
  OAUTH_FAILED: 'OAUTH_FAILED',
  INVALID_TOTP: 'INVALID_TOTP',
  TOTP_NOT_ENABLED: 'TOTP_NOT_ENABLED',
  INVALID_BACKUP_CODE: 'INVALID_BACKUP_CODE',
  SMS_RATE_LIMITED: 'SMS_RATE_LIMITED',
  SMS_CODE_EXPIRED: 'SMS_CODE_EXPIRED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  DEVICE_REVOKED: 'DEVICE_REVOKED',
  PROVIDER_ALREADY_LINKED: 'PROVIDER_ALREADY_LINKED',
  CANNOT_UNLINK_LAST_METHOD: 'CANNOT_UNLINK_LAST_METHOD',
  SUSPICIOUS_LOGIN: 'SUSPICIOUS_LOGIN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
} as const;

export type AuthErrorCode = typeof AuthErrorCodes[keyof typeof AuthErrorCodes];

// ==========================================
// API 请求/响应类型
// ==========================================

export interface TwoFactorSetupRequest {
  method?: TwoFactorMethod;
}

export interface TwoFactorEnableRequest {
  code: string;
}

export interface TwoFactorDisableRequest {
  password: string;
}

export interface TwoFactorVerifyRequest {
  code: string;
  useBackupCode?: boolean;
}

export interface SMSSendRequest {
  purpose: SMSPurpose;
}

export interface SMSVerifyRequest {
  code: string;
  purpose: SMSPurpose;
}

export interface DeviceRevokeRequest {
  deviceId: string;
}

export interface AccountUnlinkRequest {
  provider: OAuthProvider;
}

export interface LoginLogExportRequest {
  filters: LoginLogFilters;
  format: 'csv' | 'json';
}

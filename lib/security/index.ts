/**
 * 安全工具库入口
 * 导出所有安全相关的工具和函数
 */

// 文件验证
export {
  FileValidator,
  fileValidator,
  validateFile,
  sanitizeFileName,
  sanitizeHtml as sanitizeHtmlFile,
  FILE_TYPE_CONFIGS,
  type AllowedFileType,
  type FileValidationResult,
} from "./file-validator";

// 请求频率限制
export {
  SlidingWindowRateLimiter,
  TokenBucketRateLimiter,
  createRateLimiter,
  getClientIP,
  apiRateLimiter,
  loginRateLimiter,
  registerRateLimiter,
  verificationCodeRateLimiter,
  uploadRateLimiter,
  rateLimitConfigs,
  type RateLimitConfig,
} from "./rate-limiter";

// XSS 防护
export {
  encodeHtml,
  decodeHtml,
  encodeJs,
  encodeUrl,
  encodeCss,
  sanitizeInput,
  sanitizeHtml,
  sanitizeUrl,
  isUrlSafe,
  generateCspHeader,
  getSecurityHeaders,
  xssProtectionConfig,
} from "./xss-protection";

// 数据加密
export {
  encrypt,
  decrypt,
  encryptSimple,
  decryptSimple,
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateToken,
  generateUrlSafeToken,
  generateVerificationCode,
  sha256,
  hmac,
  verifyHmac,
  generateSignedUrl,
  verifySignedUrl,
  encryptSensitiveFields,
  decryptSensitiveFields,
  maskSensitiveData,
} from "./encryption";

/**
 * 安全配置
 */
export const securityConfig = {
  // 密码策略
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    saltRounds: 12,
  },

  // 会话配置
  session: {
    maxAge: 24 * 60 * 60, // 24小时
    refreshThreshold: 60 * 60, // 1小时内刷新
  },

  // 令牌配置
  token: {
    accessTokenExpiry: 15 * 60, // 15分钟
    refreshTokenExpiry: 7 * 24 * 60 * 60, // 7天
    verificationCodeExpiry: 5 * 60, // 5分钟
    passwordResetExpiry: 60 * 60, // 1小时
  },

  // 文件上传配置
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxImageSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    allowedDocumentTypes: [
      "application/pdf",
      "text/html",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  },

  // 请求限制配置
  rateLimit: {
    api: { windowMs: 60000, maxRequests: 100 },
    login: { windowMs: 900000, maxRequests: 5 },
    register: { windowMs: 3600000, maxRequests: 3 },
    upload: { windowMs: 60000, maxRequests: 10 },
  },

  // CORS 配置
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
    allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400, // 24小时
  },

  // CSP 配置
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'"],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
  },
};

/**
 * 安全检查工具
 */
export const securityChecks = {
  /**
   * 检查是否为安全的重定向 URL
   */
  isSafeRedirectUrl(url: string, allowedHosts?: string[]): boolean {
    if (!url) return false;

    try {
      const parsed = new URL(url, "http://localhost");

      // 只允许相对路径
      if (url.startsWith("/") && !url.startsWith("//")) {
        return true;
      }

      // 检查是否在允许的主机列表中
      if (allowedHosts && allowedHosts.includes(parsed.host)) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  },

  /**
   * 检查是否为有效的 CSRF 令牌
   */
  isValidCsrfToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) return false;
    try {
      return token === sessionToken;
    } catch {
      return false;
    }
  },

  /**
   * 检查请求来源
   */
  isValidOrigin(origin: string | null, allowedOrigins: string[]): boolean {
    if (!origin) return false;
    return allowedOrigins.includes(origin);
  },

  /**
   * 检查是否为 SQL 注入尝试
   */
  hasSqlInjection(input: string): boolean {
    if (!input) return false;

    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
      /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
      /(--|#|\/\*)/,
      /(\bEXEC\b|\bEXECUTE\b)/i,
      /(\bxp_)/i,
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
  },

  /**
   * 检查是否为 XSS 尝试
   */
  hasXssAttempt(input: string): boolean {
    if (!input) return false;

    const xssPatterns = [
      /<script\b[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe\b[^>]*>/i,
      /<object\b[^>]*>/i,
      /<embed\b[^>]*>/i,
    ];

    return xssPatterns.some((pattern) => pattern.test(input));
  },
};

export default {
  securityConfig,
  securityChecks,
};

// API 网关类型定义

// 路由规则
export interface RouteRule {
  id: string;
  name: string;
  pattern: string; // 路径模式，支持通配符
  methods: string[]; // 允许的 HTTP 方法
  target?: string; // 目标服务 URL
  rewrite?: string; // 路径重写规则
  headers?: Record<string, string>; // 添加的请求头
  stripPrefix?: boolean; // 是否移除前缀
  timeout?: number; // 超时时间（毫秒）
  retries?: number; // 重试次数
  isActive: boolean;
  priority: number; // 优先级，数字越大优先级越高
  rateLimit?: RateLimitConfig;
  auth?: AuthConfig;
  cors?: CorsConfig;
  createdAt: Date;
  updatedAt: Date;
}

// 速率限制配置
export interface RateLimitConfig {
  enabled: boolean;
  windowMs: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求数
  keyGenerator?: 'ip' | 'user' | 'api-key'; // 限制键生成方式
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  message?: string;
}

// 认证配置
export interface AuthConfig {
  required: boolean;
  type: 'jwt' | 'api-key' | 'basic' | 'oauth2';
  roles?: string[]; // 允许的角色
  scopes?: string[]; // 允许的权限范围
}

// CORS 配置
export interface CorsConfig {
  enabled: boolean;
  origins: string[];
  methods: string[];
  headers: string[];
  credentials: boolean;
  maxAge?: number;
}

// API 版本配置
export interface ApiVersionConfig {
  version: string;
  status: 'current' | 'deprecated' | 'sunset';
  deprecationDate?: Date;
  sunsetDate?: Date;
  message?: string;
}

// 请求上下文
export interface RequestContext {
  requestId: string;
  startTime: number;
  ip: string;
  userAgent: string;
  userId?: string;
  apiKey?: string;
  route?: RouteRule;
  version?: string;
}

// 响应元数据
export interface ResponseMetadata {
  requestId: string;
  duration: number;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
  deprecation?: {
    version: string;
    sunsetDate?: string;
    message?: string;
  };
}

// 网关统计
export interface GatewayStats {
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  requestsByRoute: Record<string, number>;
  requestsByStatus: Record<number, number>;
  rateLimitedRequests: number;
  authFailedRequests: number;
}

// 网关配置
export interface GatewayConfig {
  enabled: boolean;
  defaultTimeout: number;
  defaultRetries: number;
  globalRateLimit?: RateLimitConfig;
  globalCors?: CorsConfig;
  apiVersions: ApiVersionConfig[];
  trustedProxies: string[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// 网关错误
export class GatewayError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GatewayError';
  }
}

// 预定义错误
export const GatewayErrors = {
  UNAUTHORIZED: new GatewayError(401, '未授权访问', 'UNAUTHORIZED'),
  FORBIDDEN: new GatewayError(403, '禁止访问', 'FORBIDDEN'),
  NOT_FOUND: new GatewayError(404, '资源不存在', 'NOT_FOUND'),
  RATE_LIMITED: new GatewayError(429, '请求过于频繁', 'RATE_LIMITED'),
  TIMEOUT: new GatewayError(504, '请求超时', 'TIMEOUT'),
  SERVICE_UNAVAILABLE: new GatewayError(503, '服务暂不可用', 'SERVICE_UNAVAILABLE'),
  BAD_REQUEST: new GatewayError(400, '请求参数错误', 'BAD_REQUEST'),
  INTERNAL_ERROR: new GatewayError(500, '内部服务器错误', 'INTERNAL_ERROR'),
};

export default {
  GatewayError,
  GatewayErrors,
};

// API 网关中间件
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { v4 as uuidv4 } from 'uuid';
import {
  RouteRule,
  RequestContext,
  ResponseMetadata,
  GatewayConfig,
  GatewayError,
  GatewayErrors,
  ApiVersionConfig,
} from './types';
import { RateLimiter, RateLimitResult } from './rate-limiter';
import { monitoringService } from '@/lib/monitoring';

// 默认网关配置
const DEFAULT_CONFIG: GatewayConfig = {
  enabled: true,
  defaultTimeout: 30000,
  defaultRetries: 0,
  globalRateLimit: {
    enabled: true,
    windowMs: 60 * 1000,
    maxRequests: 100,
    keyGenerator: 'ip',
  },
  globalCors: {
    enabled: true,
    origins: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true,
    maxAge: 86400,
  },
  apiVersions: [
    { version: 'v1', status: 'current' },
  ],
  trustedProxies: [],
  logLevel: 'info',
};

// 路由规则存储
let routeRules: RouteRule[] = [];

// 速率限制器
const rateLimiter = new RateLimiter(DEFAULT_CONFIG.globalRateLimit!);

// 加载路由规则
export async function loadRouteRules(): Promise<void> {
  // 从数据库或配置文件加载
  // 这里使用默认规则
  routeRules = [
    {
      id: 'api-v1',
      name: 'API v1',
      pattern: '/api/v1/*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      isActive: true,
      priority: 100,
      auth: { required: true, type: 'jwt' },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'public-api',
      name: 'Public API',
      pattern: '/api/public/*',
      methods: ['GET'],
      isActive: true,
      priority: 90,
      auth: { required: false, type: 'jwt' },
      rateLimit: {
        enabled: true,
        windowMs: 60 * 1000,
        maxRequests: 30,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'admin-api',
      name: 'Admin API',
      pattern: '/api/admin/*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      isActive: true,
      priority: 110,
      auth: { required: true, type: 'jwt', roles: ['ADMIN', 'SUPER_ADMIN'] },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

// 匹配路由规则
function matchRoute(path: string, method: string): RouteRule | undefined {
  const sortedRules = [...routeRules]
    .filter(r => r.isActive)
    .sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    // 检查方法
    if (!rule.methods.includes(method) && !rule.methods.includes('*')) {
      continue;
    }

    // 检查路径模式
    const pattern = rule.pattern
      .replace(/\*/g, '.*')
      .replace(/\//g, '\\/');
    const regex = new RegExp(`^${pattern}$`);
    
    if (regex.test(path)) {
      return rule;
    }
  }

  return undefined;
}

// 获取客户端 IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

// 创建请求上下文
function createRequestContext(request: NextRequest): RequestContext {
  return {
    requestId: uuidv4(),
    startTime: Date.now(),
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}

// 验证认证
async function validateAuth(
  request: NextRequest,
  rule: RouteRule,
  context: RequestContext
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  if (!rule.auth?.required) {
    return { valid: true };
  }

  switch (rule.auth.type) {
    case 'jwt': {
      const token = await getToken({ req: request as any });
      if (!token) {
        return { valid: false, error: '未提供有效的认证令牌' };
      }

      // 检查角色
      if (rule.auth.roles && rule.auth.roles.length > 0) {
        const userRole = (token as any).role;
        if (!rule.auth.roles.includes(userRole)) {
          return { valid: false, error: '权限不足' };
        }
      }

      context.userId = (token as any).userId || (token as any).sub;
      return { valid: true, userId: context.userId };
    }

    case 'api-key': {
      const apiKey = request.headers.get('x-api-key');
      if (!apiKey) {
        return { valid: false, error: '未提供 API 密钥' };
      }

      // TODO: 验证 API 密钥
      context.apiKey = apiKey;
      return { valid: true };
    }

    case 'basic': {
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Basic ')) {
        return { valid: false, error: '未提供 Basic 认证' };
      }

      // TODO: 验证 Basic 认证
      return { valid: true };
    }

    default:
      return { valid: false, error: '不支持的认证类型' };
  }
}

// 检查速率限制
function checkRateLimit(
  request: NextRequest,
  rule: RouteRule,
  context: RequestContext
): RateLimitResult {
  const config = rule.rateLimit || DEFAULT_CONFIG.globalRateLimit!;
  const limiter = new RateLimiter(config);

  let key: string;
  switch (config.keyGenerator) {
    case 'user':
      key = limiter.generateKey('user', context.userId || context.ip, rule.pattern);
      break;
    case 'api-key':
      key = limiter.generateKey('api-key', context.apiKey || context.ip, rule.pattern);
      break;
    default:
      key = limiter.generateKey('ip', context.ip, rule.pattern);
  }

  return limiter.check(key);
}

// 处理 CORS
function handleCors(request: NextRequest, response: NextResponse): NextResponse {
  const cors = DEFAULT_CONFIG.globalCors!;
  const origin = request.headers.get('origin');

  if (cors.enabled && origin) {
    const allowedOrigin = cors.origins.includes('*') 
      ? origin 
      : cors.origins.includes(origin) ? origin : '';

    if (allowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
      response.headers.set('Access-Control-Allow-Methods', cors.methods.join(', '));
      response.headers.set('Access-Control-Allow-Headers', cors.headers.join(', '));
      
      if (cors.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      if (cors.maxAge) {
        response.headers.set('Access-Control-Max-Age', cors.maxAge.toString());
      }
    }
  }

  return response;
}

// 检查 API 版本
function checkApiVersion(path: string): ApiVersionConfig | undefined {
  const versionMatch = path.match(/\/api\/(v\d+)\//);
  if (!versionMatch) return undefined;

  const version = versionMatch[1];
  return DEFAULT_CONFIG.apiVersions.find(v => v.version === version);
}

// 添加响应头
function addResponseHeaders(
  response: NextResponse,
  context: RequestContext,
  rateLimitResult?: RateLimitResult,
  versionConfig?: ApiVersionConfig
): NextResponse {
  // 请求 ID
  response.headers.set('X-Request-ID', context.requestId);

  // 响应时间
  response.headers.set('X-Response-Time', `${Date.now() - context.startTime}ms`);

  // 速率限制头
  if (rateLimitResult) {
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());
    
    if (rateLimitResult.retryAfter) {
      response.headers.set('Retry-After', rateLimitResult.retryAfter.toString());
    }
  }

  // API 版本弃用警告
  if (versionConfig?.status === 'deprecated') {
    response.headers.set('Deprecation', 'true');
    if (versionConfig.sunsetDate) {
      response.headers.set('Sunset', versionConfig.sunsetDate.toISOString());
    }
    if (versionConfig.message) {
      response.headers.set('X-Deprecation-Notice', versionConfig.message);
    }
  }

  return response;
}

// 记录请求指标
function recordMetrics(
  context: RequestContext,
  statusCode: number,
  rule?: RouteRule
): void {
  const duration = Date.now() - context.startTime;
  const path = rule?.pattern || 'unknown';

  monitoringService?.recordCounter('http_requests_total', 1, {
    method: 'unknown',
    path,
    status: statusCode.toString(),
  });

  monitoringService?.recordHistogram('http_request_duration_seconds', duration / 1000, {
    path,
  });

  if (statusCode >= 400) {
    monitoringService?.recordCounter('http_errors_total', 1, {
      path,
      status: statusCode.toString(),
    });
  }
}

// 主网关中间件
export async function gatewayMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // 初始化路由规则
  if (routeRules.length === 0) {
    await loadRouteRules();
  }

  const path = request.nextUrl.pathname;
  const method = request.method;

  // 跳过非 API 路由
  if (!path.startsWith('/api/')) {
    return null;
  }

  // 创建请求上下文
  const context = createRequestContext(request);

  // 处理 OPTIONS 请求（CORS 预检）
  if (method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    return handleCors(request, response);
  }

  // 匹配路由规则
  const rule = matchRoute(path, method);
  context.route = rule;

  // 检查 API 版本
  const versionConfig = checkApiVersion(path);
  context.version = versionConfig?.version;

  // 验证认证
  if (rule) {
    const authResult = await validateAuth(request, rule, context);
    if (!authResult.valid) {
      const response = NextResponse.json(
        { error: authResult.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
      recordMetrics(context, 401, rule);
      return addResponseHeaders(handleCors(request, response), context);
    }
  }

  // 检查速率限制
  if (rule) {
    const rateLimitResult = checkRateLimit(request, rule, context);
    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        { 
          error: '请求过于频繁，请稍后重试',
          code: 'RATE_LIMITED',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
      recordMetrics(context, 429, rule);
      return addResponseHeaders(handleCors(request, response), context, rateLimitResult);
    }
  }

  // 继续处理请求（返回 null 表示继续）
  return null;
}

// 后处理中间件（用于添加响应头）
export function gatewayPostMiddleware(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const context = createRequestContext(request);
  const path = request.nextUrl.pathname;
  const rule = matchRoute(path, request.method);
  const versionConfig = checkApiVersion(path);

  // 记录指标
  recordMetrics(context, response.status, rule);

  // 添加响应头
  return addResponseHeaders(handleCors(request, response), context, undefined, versionConfig);
}

export default gatewayMiddleware;

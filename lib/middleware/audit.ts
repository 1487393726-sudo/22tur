import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { performSecurityChecks } from '@/lib/security/event-detector';

export interface AuditContext {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  status?: 'SUCCESS' | 'FAILED' | 'WARNING';
  risk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * 审计日志中间件
 * 自动记录 API 请求的审计日志
 */
export function withAudit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: {
    action?: string;
    resource?: string;
    extractResourceId?: (req: NextRequest) => string | undefined;
  }
) {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    let response: NextResponse;
    let status: 'SUCCESS' | 'FAILED' | 'WARNING' = 'SUCCESS';
    let details: Record<string, any> = {};

    try {
      // 执行实际的处理函数
      response = await handler(request);

      // 根据响应状态判断操作结果
      if (response.status >= 400) {
        status = response.status >= 500 ? 'FAILED' : 'WARNING';
      }

      // 记录响应状态
      details.statusCode = response.status;
      details.duration = Date.now() - startTime;

      return response;
    } catch (error) {
      status = 'FAILED';
      details.error = error instanceof Error ? error.message : 'Unknown error';
      details.duration = Date.now() - startTime;
      throw error;
    } finally {
      // 异步记录审计日志（不阻塞响应）
      recordAuditLog(request, {
        action: options?.action || deriveAction(request),
        resource: options?.resource || deriveResource(request),
        resourceId: options?.extractResourceId?.(request),
        status,
        details,
      }).catch((error) => {
        console.error('Failed to record audit log:', error);
      });
    }
  };
}

/**
 * 记录审计日志到数据库
 */
async function recordAuditLog(
  request: NextRequest,
  context: AuditContext
): Promise<void> {
  try {
    // 提取用户信息（从请求头或会话）
    const userId = extractUserId(request);

    // 提取 IP 地址
    const ipAddress = extractIpAddress(request);

    // 提取 User Agent
    const userAgent = request.headers.get('user-agent') || undefined;

    // 提取会话 ID
    const sessionId = extractSessionId(request);

    // 确定风险等级
    const risk = context.risk || determineRiskLevel(context);

    // 创建审计日志记录
    await prisma.auditLog.create({
      data: {
        userId,
        action: context.action,
        resource: context.resource,
        resourceId: context.resourceId,
        details: context.details ? JSON.stringify(context.details) : undefined,
        ipAddress,
        userAgent,
        sessionId,
        status: context.status || 'SUCCESS',
        risk,
      },
    });

    // 执行安全检测（异步，不阻塞）
    performSecurityChecks({
      userId,
      action: context.action,
      resource: context.resource,
      resourceId: context.resourceId,
      ipAddress,
      userAgent,
      status: context.status || 'SUCCESS',
    }).catch((error) => {
      console.error('Security checks failed:', error);
    });
  } catch (error) {
    // 记录日志失败不应该影响主流程
    console.error('Error creating audit log:', error);
  }
}

/**
 * 从请求中提取用户 ID
 */
function extractUserId(request: NextRequest): string | undefined {
  // 尝试从请求对象中获取用户信息（如果使用了 withAuth 中间件）
  const req = request as any;
  if (req.user?.userId) {
    return req.user.userId;
  }

  // 尝试从 JWT token 中解析
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      return decoded.userId;
    }
  } catch {
    // 忽略 JWT 解析错误
  }

  return undefined;
}

/**
 * 从请求中提取 IP 地址
 */
function extractIpAddress(request: NextRequest): string | undefined {
  // 尝试从各种可能的头部获取真实 IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // 如果都没有，返回 undefined
  return undefined;
}

/**
 * 从请求中提取会话 ID
 */
function extractSessionId(request: NextRequest): string | undefined {
  // 尝试从 cookie 中获取会话 ID
  const cookies = request.cookies;
  return cookies.get('sessionId')?.value;
}

/**
 * 从请求中推导操作类型
 */
function deriveAction(request: NextRequest): string {
  const method = request.method;
  const pathname = request.nextUrl.pathname;

  // 特殊路径的操作映射
  if (pathname.includes('/login')) return 'LOGIN';
  if (pathname.includes('/logout')) return 'LOGOUT';
  if (pathname.includes('/register')) return 'REGISTER';
  if (pathname.includes('/export')) return 'EXPORT';
  if (pathname.includes('/download')) return 'DOWNLOAD';
  if (pathname.includes('/upload')) return 'UPLOAD';

  // 根据 HTTP 方法映射
  switch (method) {
    case 'GET':
      return 'READ';
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return method;
  }
}

/**
 * 从请求中推导资源类型
 */
function deriveResource(request: NextRequest): string {
  const pathname = request.nextUrl.pathname;

  // 从路径中提取资源类型
  const segments = pathname.split('/').filter(Boolean);

  // 跳过 'api' 段
  const apiIndex = segments.indexOf('api');
  if (apiIndex !== -1 && segments.length > apiIndex + 1) {
    return segments[apiIndex + 1];
  }

  // 如果没有找到，返回完整路径
  return pathname;
}

/**
 * 确定操作的风险等级
 */
function determineRiskLevel(context: AuditContext): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  // 失败的操作风险较高
  if (context.status === 'FAILED') {
    return 'HIGH';
  }

  // 高风险操作
  const highRiskActions = ['DELETE', 'EXPORT', 'LOGIN', 'LOGOUT'];
  if (highRiskActions.includes(context.action)) {
    return 'MEDIUM';
  }

  // 敏感资源
  const sensitiveResources = ['users', 'auth', 'security', 'admin'];
  if (sensitiveResources.some((r) => context.resource.includes(r))) {
    return 'MEDIUM';
  }

  // 默认低风险
  return 'LOW';
}

/**
 * 创建审计日志记录的辅助函数
 * 可以在 API 路由中直接调用
 */
export async function createAuditLog(context: AuditContext & {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}): Promise<void> {
  try {
    const risk = context.risk || determineRiskLevel(context);

    await prisma.auditLog.create({
      data: {
        userId: context.userId,
        action: context.action,
        resource: context.resource,
        resourceId: context.resourceId,
        details: context.details ? JSON.stringify(context.details) : undefined,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        status: context.status || 'SUCCESS',
        risk,
      },
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
}

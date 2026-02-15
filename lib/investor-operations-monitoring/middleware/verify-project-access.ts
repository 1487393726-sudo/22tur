/**
 * 项目访问权限验证中间件
 * Project Access Verification Middleware
 * 
 * 实现 API 端点的权限验证和数据可见性过滤
 * 需求: 8.1, 8.2, 8.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  investorAccessControl,
  AccessControlError,
  AccessControlErrorCodes
} from '../investor-access-control';
import { DataVisibility, AccessLevel } from '@/types/investor-operations-monitoring';

/**
 * 权限验证结果
 */
export interface AccessVerificationResult {
  hasAccess: boolean;
  userId: string | null;
  projectId: string;
  visibility: DataVisibility | null;
  error?: string;
}

/**
 * 权限验证选项
 */
export interface VerifyAccessOptions {
  // 是否需要特定的访问级别
  requiredAccessLevel?: AccessLevel;
  // 是否需要导出权限
  requireExportPermission?: boolean;
  // 导出的数据类型
  exportDataType?: string;
  // 是否允许管理员绕过权限检查
  allowAdminBypass?: boolean;
}

/**
 * 验证项目访问权限
 * 
 * @param request - Next.js 请求对象
 * @param projectId - 项目 ID
 * @param options - 验证选项
 * @returns 验证结果
 */
export async function verifyProjectAccess(
  request: NextRequest,
  projectId: string,
  options: VerifyAccessOptions = {}
): Promise<AccessVerificationResult> {
  const { allowAdminBypass = true } = options;

  // 获取当前用户会话
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      hasAccess: false,
      userId: null,
      projectId,
      visibility: null,
      error: '未登录或会话已过期'
    };
  }

  const userId = session.user.id;

  // 检查是否为管理员
  if (allowAdminBypass && isAdmin(session.user)) {
    return {
      hasAccess: true,
      userId,
      projectId,
      visibility: {
        canViewFinancials: true,
        canViewEmployeeDetails: true,
        canViewSalaryDetails: true,
        canViewAssessments: true,
        detailLevel: 'FULL'
      }
    };
  }

  try {
    // 验证项目访问权限
    const hasAccess = await investorAccessControl.verifyProjectAccess(
      userId,
      projectId
    );

    if (!hasAccess) {
      return {
        hasAccess: false,
        userId,
        projectId,
        visibility: null,
        error: '您没有访问此项目的权限'
      };
    }

    // 获取数据可见性配置
    const visibility = await investorAccessControl.getDataVisibility(
      userId,
      projectId
    );

    // 检查是否需要特定访问级别
    if (options.requiredAccessLevel) {
      const currentLevel = getAccessLevelFromVisibility(visibility);
      if (!hasRequiredAccessLevel(currentLevel, options.requiredAccessLevel)) {
        return {
          hasAccess: false,
          userId,
          projectId,
          visibility,
          error: `需要 ${options.requiredAccessLevel} 级别的访问权限`
        };
      }
    }

    // 检查导出权限
    if (options.requireExportPermission && options.exportDataType) {
      const canExport = await investorAccessControl.verifyExportPermission(
        userId,
        projectId,
        options.exportDataType
      );

      if (!canExport) {
        return {
          hasAccess: false,
          userId,
          projectId,
          visibility,
          error: `您没有导出 ${options.exportDataType} 数据的权限`
        };
      }
    }

    return {
      hasAccess: true,
      userId,
      projectId,
      visibility
    };
  } catch (error) {
    if (error instanceof AccessControlError) {
      return {
        hasAccess: false,
        userId,
        projectId,
        visibility: null,
        error: error.message
      };
    }
    throw error;
  }
}

/**
 * 创建权限拒绝响应
 */
export function createAccessDeniedResponse(
  result: AccessVerificationResult
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: AccessControlErrorCodes.ACCESS_DENIED,
        message: result.error || '访问被拒绝',
        projectId: result.projectId
      }
    },
    { status: 403 }
  );
}

/**
 * 创建未授权响应
 */
export function createUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '请先登录'
      }
    },
    { status: 401 }
  );
}

/**
 * 数据可见性过滤器
 * 根据可见性配置过滤敏感数据
 */
export function filterDataByVisibility<T extends Record<string, unknown>>(
  data: T,
  visibility: DataVisibility,
  sensitiveFields: {
    financials?: string[];
    employeeDetails?: string[];
    salaryDetails?: string[];
    assessments?: string[];
  }
): Partial<T> {
  const result = { ...data };

  // 过滤财务数据
  if (!visibility.canViewFinancials && sensitiveFields.financials) {
    sensitiveFields.financials.forEach(field => {
      delete result[field];
    });
  }

  // 过滤员工详情
  if (!visibility.canViewEmployeeDetails && sensitiveFields.employeeDetails) {
    sensitiveFields.employeeDetails.forEach(field => {
      delete result[field];
    });
  }

  // 过滤薪资详情
  if (!visibility.canViewSalaryDetails && sensitiveFields.salaryDetails) {
    sensitiveFields.salaryDetails.forEach(field => {
      delete result[field];
    });
  }

  // 过滤评估数据
  if (!visibility.canViewAssessments && sensitiveFields.assessments) {
    sensitiveFields.assessments.forEach(field => {
      delete result[field];
    });
  }

  return result;
}

/**
 * 批量过滤数据
 */
export function filterArrayByVisibility<T extends Record<string, unknown>>(
  dataArray: T[],
  visibility: DataVisibility,
  sensitiveFields: {
    financials?: string[];
    employeeDetails?: string[];
    salaryDetails?: string[];
    assessments?: string[];
  }
): Partial<T>[] {
  return dataArray.map(item => 
    filterDataByVisibility(item, visibility, sensitiveFields)
  );
}

/**
 * 根据详细级别简化数据
 */
export function simplifyDataByDetailLevel<T extends Record<string, unknown>>(
  data: T,
  detailLevel: 'SUMMARY' | 'DETAILED' | 'FULL',
  fieldsByLevel: {
    summary: string[];
    detailed: string[];
    full: string[];
  }
): Partial<T> {
  let allowedFields: string[];

  switch (detailLevel) {
    case 'FULL':
      allowedFields = [...fieldsByLevel.summary, ...fieldsByLevel.detailed, ...fieldsByLevel.full];
      break;
    case 'DETAILED':
      allowedFields = [...fieldsByLevel.summary, ...fieldsByLevel.detailed];
      break;
    case 'SUMMARY':
    default:
      allowedFields = fieldsByLevel.summary;
      break;
  }

  const result: Partial<T> = {};
  allowedFields.forEach(field => {
    if (field in data) {
      (result as Record<string, unknown>)[field] = data[field];
    }
  });

  return result;
}

// =====================================================
// 辅助函数
// =====================================================

/**
 * 检查用户是否为管理员
 */
function isAdmin(user: { role?: string }): boolean {
  return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
}

/**
 * 从可见性配置获取访问级别
 */
function getAccessLevelFromVisibility(visibility: DataVisibility): AccessLevel {
  if (visibility.detailLevel === 'FULL') {
    return AccessLevel.FULL;
  }
  if (visibility.detailLevel === 'DETAILED') {
    return AccessLevel.STANDARD;
  }
  return AccessLevel.BASIC;
}

/**
 * 检查是否具有所需的访问级别
 */
function hasRequiredAccessLevel(
  currentLevel: AccessLevel,
  requiredLevel: AccessLevel
): boolean {
  const levelOrder = {
    [AccessLevel.BASIC]: 1,
    [AccessLevel.STANDARD]: 2,
    [AccessLevel.FULL]: 3
  };

  return levelOrder[currentLevel] >= levelOrder[requiredLevel];
}

/**
 * 权限验证装饰器（用于 API 路由）
 * 
 * 使用示例:
 * ```typescript
 * export async function GET(
 *   request: NextRequest,
 *   { params }: { params: Promise<{ id: string }> }
 * ) {
 *   const { id: projectId } = await params;
 *   
 *   const accessResult = await verifyProjectAccess(request, projectId);
 *   if (!accessResult.hasAccess) {
 *     return createAccessDeniedResponse(accessResult);
 *   }
 *   
 *   // 继续处理请求...
 * }
 * ```
 */
export function withProjectAccess(
  handler: (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
    accessResult: AccessVerificationResult
  ) => Promise<NextResponse>,
  options: VerifyAccessOptions = {}
) {
  return async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> => {
    const { id: projectId } = await context.params;
    
    const accessResult = await verifyProjectAccess(request, projectId, options);
    
    if (!accessResult.hasAccess) {
      if (!accessResult.userId) {
        return createUnauthorizedResponse();
      }
      return createAccessDeniedResponse(accessResult);
    }
    
    return handler(request, context, accessResult);
  };
}

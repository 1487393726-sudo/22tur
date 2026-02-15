/**
 * HexHub 工具函数库
 */

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证用户名格式
 */
export function isValidUsername(username: string): boolean {
  // 用户名长度 3-20，只能包含字母、数字、下划线
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

/**
 * 验证密码强度
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length < 8) {
    feedback.push('密码长度至少 8 个字符')
  } else {
    score += 1
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('密码需要包含小写字母')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('密码需要包含大写字母')
  } else {
    score += 1
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('密码需要包含数字')
  } else {
    score += 1
  }

  if (!/[!@#$%^&*]/.test(password)) {
    feedback.push('密码需要包含特殊字符 (!@#$%^&*)')
  } else {
    score += 1
  }

  return {
    isValid: score >= 3,
    score,
    feedback,
  }
}

/**
 * 生成随机字符串
 */
export function generateRandomString(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 生成 API 密钥
 */
export function generateApiKey(): { key: string; secret: string } {
  return {
    key: 'hk_' + generateRandomString(32),
    secret: 'sk_' + generateRandomString(64),
  }
}

/**
 * 格式化日期
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(date: Date): string {
  return date.toISOString()
}

/**
 * 计算数据集大小
 */
export function calculateDatasetSize(records: any[]): number {
  return JSON.stringify(records).length
}

/**
 * 验证项目名称
 */
export function isValidProjectName(name: string): boolean {
  // 项目名称长度 1-100，不能为空
  return name.length > 0 && name.length <= 100
}

/**
 * 验证数据类型
 */
export function isValidDataType(dataType: string): boolean {
  const validTypes = ['USER', 'EVENT', 'PRODUCT', 'ORDER', 'CUSTOM']
  return validTypes.includes(dataType)
}

/**
 * 验证数据格式
 */
export function isValidDataFormat(format: string): boolean {
  const validFormats = ['JSON', 'CSV', 'XML', 'PARQUET']
  return validFormats.includes(format)
}

/**
 * 验证用户角色
 */
export function isValidUserRole(role: string): boolean {
  const validRoles = ['ADMIN', 'EDITOR', 'VIEWER', 'USER']
  return validRoles.includes(role)
}

/**
 * 验证项目可见性
 */
export function isValidVisibility(visibility: string): boolean {
  const validVisibilities = ['PUBLIC', 'PRIVATE', 'SHARED']
  return validVisibilities.includes(visibility)
}

/**
 * 验证状态
 */
export function isValidStatus(status: string): boolean {
  const validStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED', 'DELETED']
  return validStatuses.includes(status)
}

/**
 * 分页计算
 */
export function calculatePagination(
  total: number,
  skip: number,
  take: number
): {
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
} {
  const page = Math.floor(skip / take) + 1
  const totalPages = Math.ceil(total / take)

  return {
    total,
    page,
    pageSize: take,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

/**
 * 生成错误响应
 */
export function createErrorResponse(
  message: string,
  code: string = 'ERROR',
  statusCode: number = 500
) {
  return {
    success: false,
    error: {
      message,
      code,
    },
    statusCode,
  }
}

/**
 * 生成成功响应
 */
export function createSuccessResponse(data: any, message?: string) {
  return {
    success: true,
    data,
    message,
  }
}

/**
 * 生成分页响应
 */
export function createPaginatedResponse(
  data: any[],
  total: number,
  skip: number,
  take: number
) {
  const pagination = calculatePagination(total, skip, take)

  return {
    success: true,
    data,
    pagination,
  }
}

/**
 * 验证 API 密钥格式
 */
export function isValidApiKeyFormat(key: string): boolean {
  return key.startsWith('hk_') && key.length === 35
}

/**
 * 验证 API 密钥密钥格式
 */
export function isValidApiSecretFormat(secret: string): boolean {
  return secret.startsWith('sk_') && secret.length === 67
}

/**
 * 获取 IP 地址
 */
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || null
}

/**
 * 获取用户代理
 */
export function getUserAgent(request: Request): string | null {
  return request.headers.get('user-agent')
}

/**
 * 检查权限
 */
export function hasPermission(
  userRole: string,
  requiredRole: string
): boolean {
  const roleHierarchy: { [key: string]: number } = {
    ADMIN: 4,
    EDITOR: 3,
    VIEWER: 2,
    USER: 1,
  }

  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0)
}

/**
 * 生成审计日志摘要
 */
export function generateAuditSummary(
  action: string,
  resource: string,
  details?: any
): string {
  return `${action} ${resource}${details ? ': ' + JSON.stringify(details) : ''}`
}

/**
 * 验证日期范围
 */
export function isValidDateRange(
  startDate: Date,
  endDate: Date
): boolean {
  return startDate <= endDate
}

/**
 * 计算时间差（天数）
 */
export function calculateDaysDifference(
  startDate: Date,
  endDate: Date
): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

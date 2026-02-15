/**
 * 投资者运营监控系统错误处理器
 * Investor Operations Monitoring Error Handler
 * 
 * 提供统一的错误处理、用户友好的错误消息和操作反馈
 * 需求: 全系统用户体验
 */

/**
 * 错误代码枚举
 */
export enum OperationsErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // 权限错误
  ACCESS_DENIED = 'ACCESS_DENIED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // 项目相关错误
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  INVALID_PROJECT_PHASE = 'INVALID_PROJECT_PHASE',
  PHASE_TRANSITION_ERROR = 'PHASE_TRANSITION_ERROR',
  
  // 数据相关错误
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  DUPLICATE_DATA = 'DUPLICATE_DATA',
  INVALID_DATA_FORMAT = 'INVALID_DATA_FORMAT',
  DATA_VALIDATION_FAILED = 'DATA_VALIDATION_FAILED',
  
  // 员工相关错误
  EMPLOYEE_NOT_FOUND = 'EMPLOYEE_NOT_FOUND',
  INVALID_EMPLOYEE_STATUS = 'INVALID_EMPLOYEE_STATUS',
  
  // 财务相关错误
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  
  // 报告相关错误
  REPORT_GENERATION_FAILED = 'REPORT_GENERATION_FAILED',
  EXPORT_FAILED = 'EXPORT_FAILED'
}

/**
 * 错误严重程度
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * 操作结果类型
 */
export enum OperationResultType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * 操作错误接口
 */
export interface OperationsError {
  code: OperationsErrorCode;
  message: string;
  messageZh: string;
  severity: ErrorSeverity;
  details?: unknown;
  timestamp: Date;
  recoverable: boolean;
  suggestedAction?: string;
  suggestedActionZh?: string;
}

/**
 * 操作结果接口
 */
export interface OperationResult<T = unknown> {
  success: boolean;
  type: OperationResultType;
  message: string;
  messageZh: string;
  data?: T;
  error?: OperationsError;
}

/**
 * 用户反馈消息接口
 */
export interface UserFeedback {
  id: string;
  type: OperationResultType;
  title: string;
  titleZh: string;
  message: string;
  messageZh: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    labelZh: string;
    onClick: () => void;
  };
}

/**
 * 错误消息映射
 */
const ERROR_MESSAGES: Record<OperationsErrorCode, { en: string; zh: string }> = {
  [OperationsErrorCode.UNKNOWN_ERROR]: {
    en: 'An unexpected error occurred',
    zh: '发生未知错误'
  },
  [OperationsErrorCode.NETWORK_ERROR]: {
    en: 'Network connection failed',
    zh: '网络连接失败'
  },
  [OperationsErrorCode.TIMEOUT_ERROR]: {
    en: 'Request timed out',
    zh: '请求超时'
  },
  [OperationsErrorCode.VALIDATION_ERROR]: {
    en: 'Data validation failed',
    zh: '数据验证失败'
  },
  [OperationsErrorCode.ACCESS_DENIED]: {
    en: 'Access denied',
    zh: '访问被拒绝'
  },
  [OperationsErrorCode.UNAUTHORIZED]: {
    en: 'Please log in to continue',
    zh: '请登录后继续'
  },
  [OperationsErrorCode.INSUFFICIENT_PERMISSIONS]: {
    en: 'You do not have permission to perform this action',
    zh: '您没有权限执行此操作'
  },
  [OperationsErrorCode.PROJECT_NOT_FOUND]: {
    en: 'Project not found',
    zh: '项目不存在'
  },
  [OperationsErrorCode.INVALID_PROJECT_PHASE]: {
    en: 'Invalid project phase',
    zh: '无效的项目阶段'
  },
  [OperationsErrorCode.PHASE_TRANSITION_ERROR]: {
    en: 'Cannot transition to this phase',
    zh: '无法转换到此阶段'
  },
  [OperationsErrorCode.DATA_NOT_FOUND]: {
    en: 'Data not found',
    zh: '数据不存在'
  },
  [OperationsErrorCode.DUPLICATE_DATA]: {
    en: 'Data already exists',
    zh: '数据已存在'
  },
  [OperationsErrorCode.INVALID_DATA_FORMAT]: {
    en: 'Invalid data format',
    zh: '数据格式无效'
  },
  [OperationsErrorCode.DATA_VALIDATION_FAILED]: {
    en: 'Data validation failed',
    zh: '数据验证失败'
  },
  [OperationsErrorCode.EMPLOYEE_NOT_FOUND]: {
    en: 'Employee not found',
    zh: '员工不存在'
  },
  [OperationsErrorCode.INVALID_EMPLOYEE_STATUS]: {
    en: 'Invalid employee status',
    zh: '无效的员工状态'
  },
  [OperationsErrorCode.CALCULATION_ERROR]: {
    en: 'Calculation error',
    zh: '计算错误'
  },
  [OperationsErrorCode.INVALID_AMOUNT]: {
    en: 'Invalid amount',
    zh: '金额无效'
  },
  [OperationsErrorCode.REPORT_GENERATION_FAILED]: {
    en: 'Failed to generate report',
    zh: '报告生成失败'
  },
  [OperationsErrorCode.EXPORT_FAILED]: {
    en: 'Export failed',
    zh: '导出失败'
  }
};

/**
 * 建议操作映射
 */
const SUGGESTED_ACTIONS: Record<OperationsErrorCode, { en: string; zh: string } | null> = {
  [OperationsErrorCode.UNKNOWN_ERROR]: {
    en: 'Please try again or contact support',
    zh: '请重试或联系客服'
  },
  [OperationsErrorCode.NETWORK_ERROR]: {
    en: 'Check your internet connection and try again',
    zh: '请检查网络连接后重试'
  },
  [OperationsErrorCode.TIMEOUT_ERROR]: {
    en: 'Please try again',
    zh: '请重试'
  },
  [OperationsErrorCode.VALIDATION_ERROR]: {
    en: 'Please check your input and try again',
    zh: '请检查输入后重试'
  },
  [OperationsErrorCode.ACCESS_DENIED]: {
    en: 'Contact administrator for access',
    zh: '请联系管理员获取权限'
  },
  [OperationsErrorCode.UNAUTHORIZED]: {
    en: 'Please log in',
    zh: '请登录'
  },
  [OperationsErrorCode.INSUFFICIENT_PERMISSIONS]: {
    en: 'Contact administrator for permissions',
    zh: '请联系管理员获取权限'
  },
  [OperationsErrorCode.PROJECT_NOT_FOUND]: null,
  [OperationsErrorCode.INVALID_PROJECT_PHASE]: null,
  [OperationsErrorCode.PHASE_TRANSITION_ERROR]: {
    en: 'Complete current phase requirements first',
    zh: '请先完成当前阶段要求'
  },
  [OperationsErrorCode.DATA_NOT_FOUND]: null,
  [OperationsErrorCode.DUPLICATE_DATA]: {
    en: 'Update existing data instead',
    zh: '请更新现有数据'
  },
  [OperationsErrorCode.INVALID_DATA_FORMAT]: {
    en: 'Check data format and try again',
    zh: '请检查数据格式后重试'
  },
  [OperationsErrorCode.DATA_VALIDATION_FAILED]: {
    en: 'Check input values and try again',
    zh: '请检查输入值后重试'
  },
  [OperationsErrorCode.EMPLOYEE_NOT_FOUND]: null,
  [OperationsErrorCode.INVALID_EMPLOYEE_STATUS]: null,
  [OperationsErrorCode.CALCULATION_ERROR]: {
    en: 'Check input values',
    zh: '请检查输入值'
  },
  [OperationsErrorCode.INVALID_AMOUNT]: {
    en: 'Enter a valid amount',
    zh: '请输入有效金额'
  },
  [OperationsErrorCode.REPORT_GENERATION_FAILED]: {
    en: 'Try again or contact support',
    zh: '请重试或联系客服'
  },
  [OperationsErrorCode.EXPORT_FAILED]: {
    en: 'Try again or use a different format',
    zh: '请重试或使用其他格式'
  }
};

/**
 * 创建操作错误
 */
export function createOperationsError(
  code: OperationsErrorCode,
  details?: unknown,
  customMessage?: { en: string; zh: string }
): OperationsError {
  const messages = customMessage || ERROR_MESSAGES[code];
  const suggestedAction = SUGGESTED_ACTIONS[code];
  
  const severity = getSeverityForCode(code);
  const recoverable = isRecoverableError(code);

  return {
    code,
    message: messages.en,
    messageZh: messages.zh,
    severity,
    details,
    timestamp: new Date(),
    recoverable,
    suggestedAction: suggestedAction?.en,
    suggestedActionZh: suggestedAction?.zh
  };
}

/**
 * 获取错误严重程度
 */
function getSeverityForCode(code: OperationsErrorCode): ErrorSeverity {
  const criticalErrors = [
    OperationsErrorCode.UNKNOWN_ERROR,
    OperationsErrorCode.CALCULATION_ERROR
  ];
  
  const warningErrors = [
    OperationsErrorCode.DUPLICATE_DATA,
    OperationsErrorCode.TIMEOUT_ERROR
  ];

  if (criticalErrors.includes(code)) return ErrorSeverity.CRITICAL;
  if (warningErrors.includes(code)) return ErrorSeverity.WARNING;
  return ErrorSeverity.ERROR;
}

/**
 * 判断错误是否可恢复
 */
function isRecoverableError(code: OperationsErrorCode): boolean {
  const nonRecoverableErrors = [
    OperationsErrorCode.ACCESS_DENIED,
    OperationsErrorCode.UNAUTHORIZED,
    OperationsErrorCode.INSUFFICIENT_PERMISSIONS,
    OperationsErrorCode.PROJECT_NOT_FOUND,
    OperationsErrorCode.EMPLOYEE_NOT_FOUND,
    OperationsErrorCode.DATA_NOT_FOUND
  ];
  
  return !nonRecoverableErrors.includes(code);
}

/**
 * 创建成功结果
 */
export function createSuccessResult<T>(
  data: T,
  message?: { en: string; zh: string }
): OperationResult<T> {
  return {
    success: true,
    type: OperationResultType.SUCCESS,
    message: message?.en || 'Operation completed successfully',
    messageZh: message?.zh || '操作成功完成',
    data
  };
}

/**
 * 创建错误结果
 */
export function createErrorResult(
  error: OperationsError
): OperationResult {
  return {
    success: false,
    type: OperationResultType.ERROR,
    message: error.message,
    messageZh: error.messageZh,
    error
  };
}

/**
 * 创建用户反馈消息
 */
export function createUserFeedback(
  type: OperationResultType,
  title: { en: string; zh: string },
  message: { en: string; zh: string },
  options?: {
    duration?: number;
    dismissible?: boolean;
    action?: {
      label: { en: string; zh: string };
      onClick: () => void;
    };
  }
): UserFeedback {
  return {
    id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: title.en,
    titleZh: title.zh,
    message: message.en,
    messageZh: message.zh,
    duration: options?.duration ?? (type === OperationResultType.SUCCESS ? 3000 : 5000),
    dismissible: options?.dismissible ?? true,
    action: options?.action ? {
      label: options.action.label.en,
      labelZh: options.action.label.zh,
      onClick: options.action.onClick
    } : undefined
  };
}

/**
 * 成功反馈消息
 */
export const SuccessFeedback = {
  dataSaved: createUserFeedback(
    OperationResultType.SUCCESS,
    { en: 'Data Saved', zh: '数据已保存' },
    { en: 'Your data has been saved successfully', zh: '您的数据已成功保存' }
  ),
  dataUpdated: createUserFeedback(
    OperationResultType.SUCCESS,
    { en: 'Data Updated', zh: '数据已更新' },
    { en: 'Your data has been updated successfully', zh: '您的数据已成功更新' }
  ),
  dataDeleted: createUserFeedback(
    OperationResultType.SUCCESS,
    { en: 'Data Deleted', zh: '数据已删除' },
    { en: 'The data has been deleted successfully', zh: '数据已成功删除' }
  ),
  reportGenerated: createUserFeedback(
    OperationResultType.SUCCESS,
    { en: 'Report Generated', zh: '报告已生成' },
    { en: 'Your report has been generated successfully', zh: '您的报告已成功生成' }
  ),
  exportCompleted: createUserFeedback(
    OperationResultType.SUCCESS,
    { en: 'Export Completed', zh: '导出完成' },
    { en: 'Your data has been exported successfully', zh: '您的数据已成功导出' }
  )
};

/**
 * 从API响应解析错误
 */
export function parseApiError(response: Response, body?: unknown): OperationsError {
  // 根据HTTP状态码映射错误
  if (response.status === 401) {
    return createOperationsError(OperationsErrorCode.UNAUTHORIZED);
  }
  if (response.status === 403) {
    return createOperationsError(OperationsErrorCode.ACCESS_DENIED);
  }
  if (response.status === 404) {
    return createOperationsError(OperationsErrorCode.DATA_NOT_FOUND);
  }
  if (response.status === 408 || response.status === 504) {
    return createOperationsError(OperationsErrorCode.TIMEOUT_ERROR);
  }
  if (response.status === 422) {
    return createOperationsError(OperationsErrorCode.VALIDATION_ERROR, body);
  }
  
  // 尝试从响应体解析错误
  if (body && typeof body === 'object' && 'code' in body) {
    const errorCode = (body as { code: string }).code as OperationsErrorCode;
    if (Object.values(OperationsErrorCode).includes(errorCode)) {
      return createOperationsError(errorCode, body);
    }
  }
  
  return createOperationsError(OperationsErrorCode.UNKNOWN_ERROR, body);
}

/**
 * 错误处理器类
 */
export class OperationsErrorHandler {
  private static instance: OperationsErrorHandler;
  private errorListeners: ((error: OperationsError) => void)[] = [];
  private feedbackListeners: ((feedback: UserFeedback) => void)[] = [];

  private constructor() {}

  static getInstance(): OperationsErrorHandler {
    if (!OperationsErrorHandler.instance) {
      OperationsErrorHandler.instance = new OperationsErrorHandler();
    }
    return OperationsErrorHandler.instance;
  }

  /**
   * 注册错误监听器
   */
  onError(listener: (error: OperationsError) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  /**
   * 注册反馈监听器
   */
  onFeedback(listener: (feedback: UserFeedback) => void): () => void {
    this.feedbackListeners.push(listener);
    return () => {
      this.feedbackListeners = this.feedbackListeners.filter(l => l !== listener);
    };
  }

  /**
   * 处理错误
   */
  handleError(error: OperationsError): void {
    console.error('[OperationsError]', error.code, error.message, error.details);
    this.errorListeners.forEach(listener => listener(error));
  }

  /**
   * 显示反馈
   */
  showFeedback(feedback: UserFeedback): void {
    this.feedbackListeners.forEach(listener => listener(feedback));
  }

  /**
   * 显示成功消息
   */
  showSuccess(message: { en: string; zh: string }): void {
    const feedback = createUserFeedback(
      OperationResultType.SUCCESS,
      { en: 'Success', zh: '成功' },
      message
    );
    this.showFeedback(feedback);
  }

  /**
   * 显示错误消息
   */
  showError(error: OperationsError): void {
    const feedback = createUserFeedback(
      OperationResultType.ERROR,
      { en: 'Error', zh: '错误' },
      { en: error.message, zh: error.messageZh },
      {
        duration: 5000,
        action: error.suggestedAction ? {
          label: { en: error.suggestedAction, zh: error.suggestedActionZh || error.suggestedAction },
          onClick: () => {}
        } : undefined
      }
    );
    this.showFeedback(feedback);
    this.handleError(error);
  }
}

// 导出单例实例
export const operationsErrorHandler = OperationsErrorHandler.getInstance();

/**
 * Investment Management Error Handler
 * Provides unified error handling and user feedback for investment management features
 */

export enum InvestmentErrorCode {
  // Business Logic Errors
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_INVESTMENT_AMOUNT = 'INVALID_INVESTMENT_AMOUNT',
  PORTFOLIO_NOT_FOUND = 'PORTFOLIO_NOT_FOUND',
  RISK_THRESHOLD_EXCEEDED = 'RISK_THRESHOLD_EXCEEDED',
  APPLICATION_ALREADY_EXISTS = 'APPLICATION_ALREADY_EXISTS',
  INVALID_APPLICATION_STATUS = 'INVALID_APPLICATION_STATUS',
  
  // Data Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  INVALID_CURRENCY = 'INVALID_CURRENCY',
  
  // System Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  
  // Permission Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Performance Errors
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export interface InvestmentError {
  code: InvestmentErrorCode;
  message: string;
  details?: any;
  field?: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: InvestmentErrorCode;
  value?: any;
}

export interface ErrorContext {
  userId?: string;
  portfolioId?: string;
  applicationId?: string;
  action: string;
  userAgent?: string;
  ip?: string;
}

export class InvestmentBusinessError extends Error {
  public readonly code: InvestmentErrorCode;
  public readonly details?: any;
  public readonly field?: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    code: InvestmentErrorCode,
    message: string,
    details?: any,
    field?: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'InvestmentBusinessError';
    this.code = code;
    this.details = details;
    this.field = field;
    this.timestamp = new Date();
    this.context = context;
  }
}

export class InvestmentErrorHandler {
  private static instance: InvestmentErrorHandler;
  private errorLog: InvestmentError[] = [];

  private constructor() {}

  public static getInstance(): InvestmentErrorHandler {
    if (!InvestmentErrorHandler.instance) {
      InvestmentErrorHandler.instance = new InvestmentErrorHandler();
    }
    return InvestmentErrorHandler.instance;
  }

  /**
   * Handle and log errors
   */
  public handleError(error: Error | InvestmentBusinessError, context?: ErrorContext): InvestmentError {
    const investmentError: InvestmentError = {
      code: this.getErrorCode(error),
      message: this.getUserFriendlyMessage(error),
      details: error instanceof InvestmentBusinessError ? error.details : undefined,
      field: error instanceof InvestmentBusinessError ? error.field : undefined,
      timestamp: new Date(),
      context
    };

    // Log error
    this.logError(investmentError, error);

    // Store in memory (in production, this would go to a proper logging service)
    this.errorLog.push(investmentError);

    return investmentError;
  }

  /**
   * Get user-friendly error messages
   */
  public getUserFriendlyMessage(error: Error | InvestmentBusinessError, locale: 'en' | 'zh' = 'zh'): string {
    if (error instanceof InvestmentBusinessError) {
      return this.getLocalizedMessage(error.code, locale);
    }

    // Handle generic errors
    if (error.message.includes('timeout')) {
      return this.getLocalizedMessage(InvestmentErrorCode.TIMEOUT_ERROR, locale);
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return this.getLocalizedMessage(InvestmentErrorCode.NETWORK_ERROR, locale);
    }

    return this.getLocalizedMessage(InvestmentErrorCode.DATABASE_ERROR, locale);
  }

  /**
   * Get localized error messages
   */
  private getLocalizedMessage(code: InvestmentErrorCode, locale: 'en' | 'zh'): string {
    const messages = {
      [InvestmentErrorCode.INSUFFICIENT_FUNDS]: {
        en: 'Insufficient funds for this investment',
        zh: '投资资金不足'
      },
      [InvestmentErrorCode.INVALID_INVESTMENT_AMOUNT]: {
        en: 'Invalid investment amount',
        zh: '投资金额无效'
      },
      [InvestmentErrorCode.PORTFOLIO_NOT_FOUND]: {
        en: 'Portfolio not found',
        zh: '未找到投资组合'
      },
      [InvestmentErrorCode.RISK_THRESHOLD_EXCEEDED]: {
        en: 'Investment exceeds risk threshold',
        zh: '投资超出风险阈值'
      },
      [InvestmentErrorCode.APPLICATION_ALREADY_EXISTS]: {
        en: 'Investment application already exists',
        zh: '投资申请已存在'
      },
      [InvestmentErrorCode.INVALID_APPLICATION_STATUS]: {
        en: 'Invalid application status',
        zh: '申请状态无效'
      },
      [InvestmentErrorCode.VALIDATION_ERROR]: {
        en: 'Validation error',
        zh: '验证错误'
      },
      [InvestmentErrorCode.MISSING_REQUIRED_FIELD]: {
        en: 'Required field is missing',
        zh: '缺少必填字段'
      },
      [InvestmentErrorCode.INVALID_DATE_RANGE]: {
        en: 'Invalid date range',
        zh: '日期范围无效'
      },
      [InvestmentErrorCode.INVALID_CURRENCY]: {
        en: 'Invalid currency',
        zh: '货币类型无效'
      },
      [InvestmentErrorCode.DATABASE_ERROR]: {
        en: 'Database error occurred',
        zh: '数据库错误'
      },
      [InvestmentErrorCode.NETWORK_ERROR]: {
        en: 'Network connection error',
        zh: '网络连接错误'
      },
      [InvestmentErrorCode.CALCULATION_ERROR]: {
        en: 'Calculation error occurred',
        zh: '计算错误'
      },
      [InvestmentErrorCode.EXTERNAL_API_ERROR]: {
        en: 'External service error',
        zh: '外部服务错误'
      },
      [InvestmentErrorCode.UNAUTHORIZED]: {
        en: 'Authentication required',
        zh: '需要身份验证'
      },
      [InvestmentErrorCode.FORBIDDEN]: {
        en: 'Access denied',
        zh: '访问被拒绝'
      },
      [InvestmentErrorCode.INSUFFICIENT_PERMISSIONS]: {
        en: 'Insufficient permissions',
        zh: '权限不足'
      },
      [InvestmentErrorCode.TIMEOUT_ERROR]: {
        en: 'Request timeout',
        zh: '请求超时'
      },
      [InvestmentErrorCode.RATE_LIMIT_EXCEEDED]: {
        en: 'Rate limit exceeded',
        zh: '请求频率超限'
      }
    };

    return messages[code]?.[locale] || messages[InvestmentErrorCode.DATABASE_ERROR][locale];
  }

  /**
   * Validate investment data
   */
  public validateInvestmentData(data: any): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data.amount || data.amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Investment amount must be greater than 0',
        code: InvestmentErrorCode.INVALID_INVESTMENT_AMOUNT,
        value: data.amount
      });
    }

    if (!data.currency || !['CNY', 'USD', 'EUR'].includes(data.currency)) {
      errors.push({
        field: 'currency',
        message: 'Invalid currency code',
        code: InvestmentErrorCode.INVALID_CURRENCY,
        value: data.currency
      });
    }

    if (!data.investorId) {
      errors.push({
        field: 'investorId',
        message: 'Investor ID is required',
        code: InvestmentErrorCode.MISSING_REQUIRED_FIELD,
        value: data.investorId
      });
    }

    if (!data.projectId) {
      errors.push({
        field: 'projectId',
        message: 'Project ID is required',
        code: InvestmentErrorCode.MISSING_REQUIRED_FIELD,
        value: data.projectId
      });
    }

    return errors;
  }

  /**
   * Get error code from error instance
   */
  private getErrorCode(error: Error | InvestmentBusinessError): InvestmentErrorCode {
    if (error instanceof InvestmentBusinessError) {
      return error.code;
    }

    // Map generic errors to investment error codes
    if (error.message.includes('timeout')) {
      return InvestmentErrorCode.TIMEOUT_ERROR;
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return InvestmentErrorCode.NETWORK_ERROR;
    }

    if (error.message.includes('validation')) {
      return InvestmentErrorCode.VALIDATION_ERROR;
    }

    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return InvestmentErrorCode.UNAUTHORIZED;
    }

    if (error.message.includes('forbidden') || error.message.includes('403')) {
      return InvestmentErrorCode.FORBIDDEN;
    }

    return InvestmentErrorCode.DATABASE_ERROR;
  }

  /**
   * Log error to console and external services
   */
  private logError(investmentError: InvestmentError, originalError: Error): void {
    console.error('Investment Management Error:', {
      code: investmentError.code,
      message: investmentError.message,
      details: investmentError.details,
      field: investmentError.field,
      timestamp: investmentError.timestamp,
      context: investmentError.context,
      stack: originalError.stack
    });

    // In production, send to logging service
    // await this.sendToLoggingService(investmentError, originalError);
  }

  /**
   * Get recent errors for debugging
   */
  public getRecentErrors(limit: number = 10): InvestmentError[] {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error log
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }
}

// Export singleton instance
export const investmentErrorHandler = InvestmentErrorHandler.getInstance();
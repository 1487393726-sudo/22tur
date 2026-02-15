/**
 * React hook for investment management error handling
 */

import { useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { useUserFeedback } from '@/components/investment/user-feedback';
import { 
  investmentErrorHandler, 
  InvestmentBusinessError, 
  InvestmentErrorCode,
  ErrorContext 
} from '@/lib/investment-management/error-handler';

export function useInvestmentErrorHandler() {
  const { locale } = useLanguage();
  const { showError, showWarning, showSuccess, showInfo } = useUserFeedback();

  const handleError = useCallback((
    error: Error | InvestmentBusinessError,
    context?: ErrorContext,
    customMessage?: string
  ) => {
    const investmentError = investmentErrorHandler.handleError(error, context);
    
    const title = locale === 'en' ? 'Error' : '错误';
    const message = customMessage || investmentErrorHandler.getUserFriendlyMessage(error, locale);
    
    // Show different feedback based on error type
    if (error instanceof InvestmentBusinessError) {
      switch (error.code) {
        case InvestmentErrorCode.INSUFFICIENT_FUNDS:
        case InvestmentErrorCode.RISK_THRESHOLD_EXCEEDED:
          showWarning(title, message);
          break;
        case InvestmentErrorCode.UNAUTHORIZED:
        case InvestmentErrorCode.FORBIDDEN:
          showError(title, message, true);
          break;
        default:
          showError(title, message);
      }
    } else {
      showError(title, message);
    }

    return investmentError;
  }, [locale, showError, showWarning]);

  const handleValidationErrors = useCallback((errors: any[]) => {
    const title = locale === 'en' ? 'Validation Error' : '验证错误';
    
    if (errors.length === 1) {
      showWarning(title, errors[0].message);
    } else {
      const message = locale === 'en' 
        ? `${errors.length} validation errors found`
        : `发现 ${errors.length} 个验证错误`;
      showWarning(title, message);
    }
  }, [locale, showWarning]);

  const handleSuccess = useCallback((
    action: string,
    details?: string
  ) => {
    const titles = {
      'application_submitted': locale === 'en' ? 'Application Submitted' : '申请已提交',
      'portfolio_updated': locale === 'en' ? 'Portfolio Updated' : '投资组合已更新',
      'report_generated': locale === 'en' ? 'Report Generated' : '报告已生成',
      'calculation_completed': locale === 'en' ? 'Calculation Completed' : '计算完成',
      'risk_assessment_updated': locale === 'en' ? 'Risk Assessment Updated' : '风险评估已更新',
      'transfer_completed': locale === 'en' ? 'Transfer Completed' : '转账完成'
    };

    const title = titles[action as keyof typeof titles] || (locale === 'en' ? 'Success' : '成功');
    const message = details || (locale === 'en' ? 'Operation completed successfully' : '操作成功完成');
    
    showSuccess(title, message);
  }, [locale, showSuccess]);

  const handleInfo = useCallback((
    message: string,
    title?: string
  ) => {
    const defaultTitle = locale === 'en' ? 'Information' : '信息';
    showInfo(title || defaultTitle, message);
  }, [locale, showInfo]);

  const validateInvestmentData = useCallback((data: any) => {
    const errors = investmentErrorHandler.validateInvestmentData(data);
    
    if (errors.length > 0) {
      handleValidationErrors(errors);
      return false;
    }
    
    return true;
  }, [handleValidationErrors]);

  const createBusinessError = useCallback((
    code: InvestmentErrorCode,
    message?: string,
    details?: any,
    field?: string
  ) => {
    const defaultMessage = investmentErrorHandler.getUserFriendlyMessage(
      new InvestmentBusinessError(code, message || ''), 
      locale
    );
    
    return new InvestmentBusinessError(
      code,
      message || defaultMessage,
      details,
      field
    );
  }, [locale]);

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: Partial<ErrorContext>
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error as Error, context as ErrorContext);
        return null;
      }
    };
  }, [handleError]);

  return {
    handleError,
    handleValidationErrors,
    handleSuccess,
    handleInfo,
    validateInvestmentData,
    createBusinessError,
    withErrorHandling,
    errorHandler: investmentErrorHandler
  };
}
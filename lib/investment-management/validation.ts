// Investment Management System Validation Functions
import { 
  InvestmentApplication, 
  Portfolio, 
  PortfolioInvestment, 
  RiskAssessment,
  CreateInvestmentApplicationRequest,
  ReturnCalculationRequest,
  ValidationResult,
  ValidationError,
  BusinessErrorCodes,
  ApplicationStatus,
  RiskLevel,
  InvestmentStatus,
  ReportType,
  CashFlowType
} from '@/types/investment-management';

/**
 * Validates investment application data
 */
export function validateInvestmentApplication(
  data: CreateInvestmentApplicationRequest
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate project ID
  if (!data.projectId || typeof data.projectId !== 'string') {
    errors.push({
      field: 'projectId',
      message: 'Project ID is required and must be a string',
      code: 'INVALID_PROJECT_ID'
    });
  }

  // Validate amount
  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Investment amount must be a positive number',
      code: 'INVALID_AMOUNT'
    });
  }

  // Validate minimum investment amount
  if (data.amount && data.amount < 1000) {
    errors.push({
      field: 'amount',
      message: 'Minimum investment amount is ¥1,000',
      code: 'AMOUNT_TOO_LOW'
    });
  }

  // Validate maximum investment amount
  if (data.amount && data.amount > 10000000) {
    errors.push({
      field: 'amount',
      message: 'Maximum investment amount is ¥10,000,000',
      code: 'AMOUNT_TOO_HIGH'
    });
  }

  // Validate currency
  if (data.currency && !['CNY', 'USD', 'EUR'].includes(data.currency)) {
    errors.push({
      field: 'currency',
      message: 'Currency must be CNY, USD, or EUR',
      code: 'INVALID_CURRENCY'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates portfolio data
 */
export function validatePortfolio(portfolio: Partial<Portfolio>): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate user ID
  if (!portfolio.userId || typeof portfolio.userId !== 'string') {
    errors.push({
      field: 'userId',
      message: 'User ID is required and must be a string',
      code: 'INVALID_USER_ID'
    });
  }

  // Validate name
  if (!portfolio.name || typeof portfolio.name !== 'string' || portfolio.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Portfolio name is required',
      code: 'INVALID_NAME'
    });
  }

  if (portfolio.name && portfolio.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Portfolio name must be less than 100 characters',
      code: 'NAME_TOO_LONG'
    });
  }

  // Validate financial values
  if (portfolio.totalValue !== undefined && (typeof portfolio.totalValue !== 'number' || portfolio.totalValue < 0)) {
    errors.push({
      field: 'totalValue',
      message: 'Total value must be a non-negative number',
      code: 'INVALID_TOTAL_VALUE'
    });
  }

  if (portfolio.totalInvested !== undefined && (typeof portfolio.totalInvested !== 'number' || portfolio.totalInvested < 0)) {
    errors.push({
      field: 'totalInvested',
      message: 'Total invested must be a non-negative number',
      code: 'INVALID_TOTAL_INVESTED'
    });
  }

  if (portfolio.riskScore !== undefined && (typeof portfolio.riskScore !== 'number' || portfolio.riskScore < 0 || portfolio.riskScore > 10)) {
    errors.push({
      field: 'riskScore',
      message: 'Risk score must be between 0 and 10',
      code: 'INVALID_RISK_SCORE'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates portfolio investment data
 */
export function validatePortfolioInvestment(investment: Partial<PortfolioInvestment>): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate portfolio ID
  if (!investment.portfolioId || typeof investment.portfolioId !== 'string') {
    errors.push({
      field: 'portfolioId',
      message: 'Portfolio ID is required and must be a string',
      code: 'INVALID_PORTFOLIO_ID'
    });
  }

  // Validate project ID
  if (!investment.projectId || typeof investment.projectId !== 'string') {
    errors.push({
      field: 'projectId',
      message: 'Project ID is required and must be a string',
      code: 'INVALID_PROJECT_ID'
    });
  }

  // Validate amount
  if (!investment.amount || typeof investment.amount !== 'number' || investment.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Investment amount must be a positive number',
      code: 'INVALID_AMOUNT'
    });
  }

  // Validate current value
  if (investment.currentValue !== undefined && (typeof investment.currentValue !== 'number' || investment.currentValue < 0)) {
    errors.push({
      field: 'currentValue',
      message: 'Current value must be a non-negative number',
      code: 'INVALID_CURRENT_VALUE'
    });
  }

  // Validate risk level
  if (investment.riskLevel && !Object.values(RiskLevel).includes(investment.riskLevel as RiskLevel)) {
    errors.push({
      field: 'riskLevel',
      message: 'Risk level must be LOW, MEDIUM, HIGH, or VERY_HIGH',
      code: 'INVALID_RISK_LEVEL'
    });
  }

  // Validate status
  if (investment.status && !Object.values(InvestmentStatus).includes(investment.status as InvestmentStatus)) {
    errors.push({
      field: 'status',
      message: 'Status must be ACTIVE, COMPLETED, CANCELLED, or SUSPENDED',
      code: 'INVALID_STATUS'
    });
  }

  // Validate invested date
  if (investment.investedAt && !(investment.investedAt instanceof Date) && isNaN(Date.parse(investment.investedAt as any))) {
    errors.push({
      field: 'investedAt',
      message: 'Invested date must be a valid date',
      code: 'INVALID_INVESTED_DATE'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates risk assessment data
 */
export function validateRiskAssessment(assessment: Partial<RiskAssessment>): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate portfolio ID
  if (!assessment.portfolioId || typeof assessment.portfolioId !== 'string') {
    errors.push({
      field: 'portfolioId',
      message: 'Portfolio ID is required and must be a string',
      code: 'INVALID_PORTFOLIO_ID'
    });
  }

  // Validate risk score
  if (assessment.riskScore === undefined || typeof assessment.riskScore !== 'number' || assessment.riskScore < 0 || assessment.riskScore > 10) {
    errors.push({
      field: 'riskScore',
      message: 'Risk score must be between 0 and 10',
      code: 'INVALID_RISK_SCORE'
    });
  }

  // Validate risk level
  if (!assessment.riskLevel || !Object.values(RiskLevel).includes(assessment.riskLevel as RiskLevel)) {
    errors.push({
      field: 'riskLevel',
      message: 'Risk level must be LOW, MEDIUM, HIGH, or VERY_HIGH',
      code: 'INVALID_RISK_LEVEL'
    });
  }

  // Validate risk factors
  if (!assessment.riskFactors || !Array.isArray(assessment.riskFactors)) {
    errors.push({
      field: 'riskFactors',
      message: 'Risk factors must be an array',
      code: 'INVALID_RISK_FACTORS'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates application status transition
 */
export function validateStatusTransition(
  currentStatus: ApplicationStatus,
  newStatus: ApplicationStatus
): ValidationResult {
  const errors: ValidationError[] = [];

  const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    [ApplicationStatus.PENDING]: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.CANCELLED],
    [ApplicationStatus.UNDER_REVIEW]: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.PENDING],
    [ApplicationStatus.APPROVED]: [ApplicationStatus.CANCELLED],
    [ApplicationStatus.REJECTED]: [],
    [ApplicationStatus.CANCELLED]: []
  };

  if (!validTransitions[currentStatus].includes(newStatus)) {
    errors.push({
      field: 'status',
      message: `Cannot transition from ${currentStatus} to ${newStatus}`,
      code: 'INVALID_STATUS_TRANSITION'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates investment amount against project constraints
 */
export function validateInvestmentConstraints(
  amount: number,
  projectConstraints: {
    minInvestment?: number;
    maxInvestment?: number;
    remainingCapacity?: number;
  }
): ValidationResult {
  const errors: ValidationError[] = [];

  // Check minimum investment
  if (projectConstraints.minInvestment && amount < projectConstraints.minInvestment) {
    errors.push({
      field: 'amount',
      message: `Minimum investment amount is ¥${projectConstraints.minInvestment.toLocaleString()}`,
      code: 'AMOUNT_BELOW_MINIMUM'
    });
  }

  // Check maximum investment
  if (projectConstraints.maxInvestment && amount > projectConstraints.maxInvestment) {
    errors.push({
      field: 'amount',
      message: `Maximum investment amount is ¥${projectConstraints.maxInvestment.toLocaleString()}`,
      code: 'AMOUNT_ABOVE_MAXIMUM'
    });
  }

  // Check remaining capacity
  if (projectConstraints.remainingCapacity && amount > projectConstraints.remainingCapacity) {
    errors.push({
      field: 'amount',
      message: `Only ¥${projectConstraints.remainingCapacity.toLocaleString()} remaining capacity`,
      code: 'EXCEEDS_REMAINING_CAPACITY'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates portfolio diversification rules
 */
export function validatePortfolioDiversification(
  portfolio: Portfolio,
  newInvestment: { amount: number; sector: string; riskLevel: RiskLevel }
): ValidationResult {
  const errors: ValidationError[] = [];

  // Calculate new total after investment
  const newTotal = portfolio.totalInvested + newInvestment.amount;

  // Check single investment concentration (max 20% of portfolio)
  const concentrationLimit = newTotal * 0.2;
  if (newInvestment.amount > concentrationLimit) {
    errors.push({
      field: 'amount',
      message: `Single investment cannot exceed 20% of portfolio (¥${concentrationLimit.toLocaleString()})`,
      code: 'CONCENTRATION_RISK_EXCEEDED'
    });
  }

  // Check high-risk investment limit (max 30% of portfolio in high-risk investments)
  if (newInvestment.riskLevel === RiskLevel.HIGH || newInvestment.riskLevel === RiskLevel.VERY_HIGH) {
    const currentHighRiskValue = portfolio.investments?.reduce((sum, inv) => {
      return sum + (inv.riskLevel === RiskLevel.HIGH || inv.riskLevel === RiskLevel.VERY_HIGH ? inv.amount : 0);
    }, 0) || 0;

    const newHighRiskTotal = currentHighRiskValue + newInvestment.amount;
    const highRiskLimit = newTotal * 0.3;

    if (newHighRiskTotal > highRiskLimit) {
      errors.push({
        field: 'riskLevel',
        message: `High-risk investments cannot exceed 30% of portfolio (¥${highRiskLimit.toLocaleString()})`,
        code: 'HIGH_RISK_LIMIT_EXCEEDED'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates date ranges for reports
 */
export function validateDateRange(startDate: Date, endDate: Date): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if dates are valid
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    errors.push({
      field: 'startDate',
      message: 'Start date must be a valid date',
      code: 'INVALID_START_DATE'
    });
  }

  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    errors.push({
      field: 'endDate',
      message: 'End date must be a valid date',
      code: 'INVALID_END_DATE'
    });
  }

  // Check date order
  if (startDate && endDate && startDate >= endDate) {
    errors.push({
      field: 'dateRange',
      message: 'Start date must be before end date',
      code: 'INVALID_DATE_ORDER'
    });
  }

  // Check if date range is not too far in the future
  const now = new Date();
  if (endDate && endDate > now) {
    errors.push({
      field: 'endDate',
      message: 'End date cannot be in the future',
      code: 'FUTURE_END_DATE'
    });
  }

  // Check if date range is not too long (max 10 years)
  if (startDate && endDate) {
    const diffYears = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (diffYears > 10) {
      errors.push({
        field: 'dateRange',
        message: 'Date range cannot exceed 10 years',
        code: 'DATE_RANGE_TOO_LONG'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates enum values
 */
export function validateEnum<T extends Record<string, string>>(
  value: string,
  enumObject: T,
  fieldName: string
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!Object.values(enumObject).includes(value)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be one of: ${Object.values(enumObject).join(', ')}`,
      code: 'INVALID_ENUM_VALUE'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates pagination parameters
 */
export function validatePagination(page: number, limit: number): ValidationResult {
  const errors: ValidationError[] = [];

  if (!Number.isInteger(page) || page < 1) {
    errors.push({
      field: 'page',
      message: 'Page must be a positive integer',
      code: 'INVALID_PAGE'
    });
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    errors.push({
      field: 'limit',
      message: 'Limit must be between 1 and 100',
      code: 'INVALID_LIMIT'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes and validates user input
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

/**
 * Validates financial calculations
 */
export function validateFinancialCalculation(
  principal: number,
  rate: number,
  time: number
): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof principal !== 'number' || principal <= 0) {
    errors.push({
      field: 'principal',
      message: 'Principal must be a positive number',
      code: 'INVALID_PRINCIPAL'
    });
  }

  if (typeof rate !== 'number' || rate < -1 || rate > 10) {
    errors.push({
      field: 'rate',
      message: 'Rate must be between -100% and 1000%',
      code: 'INVALID_RATE'
    });
  }

  if (typeof time !== 'number' || time <= 0) {
    errors.push({
      field: 'time',
      message: 'Time must be a positive number',
      code: 'INVALID_TIME'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates return calculation request data
 */
export function validateReturnCalculationRequest(
  data: any
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate investments array
  if (!data.investments || !Array.isArray(data.investments)) {
    errors.push({
      field: 'investments',
      message: 'Investments array is required',
      code: 'MISSING_INVESTMENTS'
    });
  } else {
    // Validate each investment
    data.investments.forEach((investment: any, index: number) => {
      const prefix = `investments[${index}]`;

      // Validate amount
      if (!investment.amount || typeof investment.amount !== 'number' || investment.amount <= 0) {
        errors.push({
          field: `${prefix}.amount`,
          message: 'Investment amount must be a positive number',
          code: 'INVALID_AMOUNT'
        });
      }

      // Validate current value
      if (!investment.currentValue || typeof investment.currentValue !== 'number' || investment.currentValue < 0) {
        errors.push({
          field: `${prefix}.currentValue`,
          message: 'Current value must be a non-negative number',
          code: 'INVALID_CURRENT_VALUE'
        });
      }

      // Validate investment date
      if (!investment.investmentDate) {
        errors.push({
          field: `${prefix}.investmentDate`,
          message: 'Investment date is required',
          code: 'MISSING_INVESTMENT_DATE'
        });
      } else {
        const investmentDate = new Date(investment.investmentDate);
        if (isNaN(investmentDate.getTime())) {
          errors.push({
            field: `${prefix}.investmentDate`,
            message: 'Investment date must be a valid date',
            code: 'INVALID_INVESTMENT_DATE'
          });
        } else if (investmentDate > new Date()) {
          errors.push({
            field: `${prefix}.investmentDate`,
            message: 'Investment date cannot be in the future',
            code: 'FUTURE_INVESTMENT_DATE'
          });
        }
      }

      // Validate cash flows if provided
      if (investment.cashFlows && Array.isArray(investment.cashFlows)) {
        investment.cashFlows.forEach((cf: any, cfIndex: number) => {
          const cfPrefix = `${prefix}.cashFlows[${cfIndex}]`;

          if (!cf.date) {
            errors.push({
              field: `${cfPrefix}.date`,
              message: 'Cash flow date is required',
              code: 'MISSING_CASH_FLOW_DATE'
            });
          }

          if (typeof cf.amount !== 'number') {
            errors.push({
              field: `${cfPrefix}.amount`,
              message: 'Cash flow amount must be a number',
              code: 'INVALID_CASH_FLOW_AMOUNT'
            });
          }

          if (!cf.type || !Object.values(CashFlowType).includes(cf.type)) {
            errors.push({
              field: `${cfPrefix}.type`,
              message: 'Cash flow type must be INFLOW or OUTFLOW',
              code: 'INVALID_CASH_FLOW_TYPE'
            });
          }
        });
      }
    });

    // Validate array size
    if (data.investments.length > 100) {
      errors.push({
        field: 'investments',
        message: 'Maximum 100 investments allowed per request',
        code: 'TOO_MANY_INVESTMENTS'
      });
    }
  }

  // Validate calculation type
  const validCalculationTypes = ['ABSOLUTE', 'ANNUALIZED', 'IRR', 'SHARPE'];
  if (!data.calculationType || !validCalculationTypes.includes(data.calculationType)) {
    errors.push({
      field: 'calculationType',
      message: 'Calculation type must be one of: ABSOLUTE, ANNUALIZED, IRR, SHARPE',
      code: 'INVALID_CALCULATION_TYPE'
    });
  }

  // Validate benchmark rate for Sharpe ratio
  if (data.calculationType === 'SHARPE') {
    if (data.benchmarkRate === undefined || typeof data.benchmarkRate !== 'number') {
      errors.push({
        field: 'benchmarkRate',
        message: 'Benchmark rate is required for Sharpe ratio calculation',
        code: 'MISSING_BENCHMARK_RATE'
      });
    } else if (data.benchmarkRate < 0 || data.benchmarkRate > 1) {
      errors.push({
        field: 'benchmarkRate',
        message: 'Benchmark rate must be between 0 and 1 (as decimal)',
        code: 'INVALID_BENCHMARK_RATE'
      });
    }
  }

  // Validate cash flows for IRR calculation
  if (data.calculationType === 'IRR') {
    const hasInvestmentsWithCashFlows = data.investments?.some((inv: any) => 
      inv.cashFlows && Array.isArray(inv.cashFlows) && inv.cashFlows.length >= 2
    );
    
    if (!hasInvestmentsWithCashFlows) {
      errors.push({
        field: 'investments',
        message: 'IRR calculation requires at least one investment with 2 or more cash flows',
        code: 'INSUFFICIENT_CASH_FLOWS'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
/**
 * Validates risk assessment request data
 */
export function validateRiskAssessmentRequest(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.portfolioId || typeof data.portfolioId !== 'string') {
    errors.push({
      field: 'portfolioId',
      message: 'Portfolio ID is required and must be a string',
      code: 'INVALID_PORTFOLIO_ID'
    });
  }

  if (data.options) {
    if (data.options.confidenceLevel !== undefined) {
      const confidence = data.options.confidenceLevel;
      if (typeof confidence !== 'number' || confidence <= 0 || confidence >= 1) {
        errors.push({
          field: 'options.confidenceLevel',
          message: 'Confidence level must be a number between 0 and 1',
          code: 'INVALID_CONFIDENCE_LEVEL'
        });
      }
    }

    if (data.options.timeHorizon !== undefined) {
      const horizon = data.options.timeHorizon;
      if (typeof horizon !== 'number' || horizon <= 0 || horizon > 2520) {
        errors.push({
          field: 'options.timeHorizon',
          message: 'Time horizon must be a positive number of days (max 2520)',
          code: 'INVALID_TIME_HORIZON'
        });
      }
    }

    if (data.options.riskFreeRate !== undefined) {
      const rate = data.options.riskFreeRate;
      if (typeof rate !== 'number' || rate < 0 || rate > 1) {
        errors.push({
          field: 'options.riskFreeRate',
          message: 'Risk-free rate must be a number between 0 and 1',
          code: 'INVALID_RISK_FREE_RATE'
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates stress test request data
 */
export function validateStressTestRequest(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.portfolioId || typeof data.portfolioId !== 'string') {
    errors.push({
      field: 'portfolioId',
      message: 'Portfolio ID is required and must be a string',
      code: 'INVALID_PORTFOLIO_ID'
    });
  }

  if (!Array.isArray(data.scenarios) || data.scenarios.length === 0) {
    errors.push({
      field: 'scenarios',
      message: 'Scenarios array is required and must not be empty',
      code: 'INVALID_SCENARIOS'
    });
  } else {
    data.scenarios.forEach((scenario: any, index: number) => {
      if (!scenario.name || typeof scenario.name !== 'string') {
        errors.push({
          field: `scenarios[${index}].name`,
          message: 'Scenario name is required and must be a string',
          code: 'INVALID_SCENARIO_NAME'
        });
      }

      if (!scenario.type || typeof scenario.type !== 'string') {
        errors.push({
          field: `scenarios[${index}].type`,
          message: 'Scenario type is required and must be a string',
          code: 'INVALID_SCENARIO_TYPE'
        });
      }

      if (scenario.maxLossThreshold !== undefined) {
        const threshold = scenario.maxLossThreshold;
        if (typeof threshold !== 'number' || threshold < 0 || threshold > 100) {
          errors.push({
            field: `scenarios[${index}].maxLossThreshold`,
            message: 'Max loss threshold must be a number between 0 and 100',
            code: 'INVALID_LOSS_THRESHOLD'
          });
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates portfolio analysis request data
 */
export function validatePortfolioAnalysisRequest(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.portfolioId || typeof data.portfolioId !== 'string') {
    errors.push({
      field: 'portfolioId',
      message: 'Portfolio ID is required and must be a string',
      code: 'INVALID_PORTFOLIO_ID'
    });
  }

  if (data.timeframe && !['1M', '3M', '6M', '1Y', '2Y', '5Y'].includes(data.timeframe)) {
    errors.push({
      field: 'timeframe',
      message: 'Invalid timeframe. Must be one of: 1M, 3M, 6M, 1Y, 2Y, 5Y',
      code: 'INVALID_TIMEFRAME'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
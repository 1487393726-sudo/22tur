/**
 * 投资者项目运营监控系统类型定义
 * Investor Operations Monitoring System Type Definitions
 */

// =====================================================
// 枚举类型 (Enums)
// =====================================================

/**
 * 项目阶段
 */
export enum ProjectPhase {
  DESIGN = 'DESIGN',           // 设计阶段
  RENOVATION = 'RENOVATION',   // 装修阶段
  PRE_OPENING = 'PRE_OPENING', // 开业准备
  OPERATING = 'OPERATING'      // 正式运营
}

/**
 * 项目类型
 */
export enum ProjectType {
  PHYSICAL = 'PHYSICAL',       // 现实版
  ONLINE = 'ONLINE'            // 网络专业版
}

/**
 * 行业类型
 */
export enum IndustryType {
  CATERING = 'CATERING',       // 餐饮
  RETAIL = 'RETAIL',           // 零售
  SERVICE = 'SERVICE',         // 服务
  TECHNOLOGY = 'TECHNOLOGY',   // 科技
  EDUCATION = 'EDUCATION',     // 教育
  HEALTHCARE = 'HEALTHCARE',   // 医疗健康
  OTHER = 'OTHER'              // 其他
}

/**
 * 支出类别
 */
export enum ExpenseCategory {
  RAW_MATERIALS = 'RAW_MATERIALS',   // 原材料
  LABOR = 'LABOR',                   // 人工
  RENT = 'RENT',                     // 租金
  UTILITIES = 'UTILITIES',           // 水电
  MARKETING = 'MARKETING',           // 营销
  EQUIPMENT = 'EQUIPMENT',           // 设备
  MAINTENANCE = 'MAINTENANCE',       // 维护
  OTHER = 'OTHER'                    // 其他
}

/**
 * 员工工龄分类
 */
export enum TenureCategory {
  NEW = 'NEW',           // 新员工 (< 1年)
  REGULAR = 'REGULAR',   // 普通员工 (1-3年)
  SENIOR = 'SENIOR'      // 老员工 (> 3年)
}

/**
 * 员工状态
 */
export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',       // 在职
  RESIGNED = 'RESIGNED',   // 离职
  ON_LEAVE = 'ON_LEAVE'    // 休假
}

/**
 * 里程碑状态
 */
export enum MilestoneStatus {
  PENDING = 'PENDING',     // 待完成
  COMPLETED = 'COMPLETED', // 已完成
  DELAYED = 'DELAYED'      // 已延期
}

/**
 * 访问级别
 */
export enum AccessLevel {
  BASIC = 'BASIC',         // 基础
  STANDARD = 'STANDARD',   // 标准
  FULL = 'FULL'            // 完整
}

/**
 * 预警类型
 */
export enum AlertType {
  LOSS_WARNING = 'LOSS_WARNING',           // 亏损预警
  CAPABILITY_WARNING = 'CAPABILITY_WARNING', // 能力预警
  DATA_ANOMALY = 'DATA_ANOMALY'            // 数据异常
}

/**
 * 预警严重程度
 */
export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * 亏损因素类型
 */
export enum LossFactorType {
  MARKET = 'MARKET',           // 市场因素
  OPERATIONS = 'OPERATIONS',   // 运营因素
  COST = 'COST',               // 成本因素
  COMPETITION = 'COMPETITION', // 竞争因素
  OTHER = 'OTHER'              // 其他因素
}


// =====================================================
// 核心接口 (Core Interfaces)
// =====================================================

/**
 * 项目阶段记录
 */
export interface ProjectPhaseRecord {
  id: string;
  projectId: string;
  phase: ProjectPhase;
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  progress: number;
  notes?: string;
  milestones: Milestone[];
  delays: DelayRecord[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 里程碑
 */
export interface Milestone {
  id: string;
  phaseRecordId: string;
  name: string;
  description?: string;
  expectedDate: Date;
  completedDate?: Date;
  status: MilestoneStatus;
  createdAt: Date;
}

/**
 * 延期记录
 */
export interface DelayRecord {
  id: string;
  phaseRecordId: string;
  delayDays: number;
  reason: string;
  newExpectedDate: Date;
  recordedBy: string;
  recordedAt: Date;
}

/**
 * 项目时间线
 */
export interface ProjectTimeline {
  projectId: string;
  phases: ProjectPhaseRecord[];
  currentPhase: ProjectPhase;
  overallProgress: number;
  estimatedCompletionDate?: Date;
}

/**
 * 每日运营数据
 */
export interface DailyOperationsData {
  id: string;
  projectId: string;
  date: Date;
  revenue: number;
  totalExpenses: number;
  profit: number;
  customerCount?: number;
  expenses: ExpenseItem[];
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 支出项目
 */
export interface ExpenseItem {
  id: string;
  dailyOperationsId: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  receiptUrl?: string;
  createdAt: Date;
}

/**
 * 运营数据汇总
 */
export interface OperationsSummary {
  projectId: string;
  dateRange: DateRange;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  averageDailyRevenue: number;
  averageDailyExpenses: number;
  averageDailyProfit: number;
  totalCustomers: number;
  expenseBreakdown: ExpenseBreakdown;
}

/**
 * 支出明细分类
 */
export interface ExpenseBreakdown {
  [category: string]: {
    amount: number;
    percentage: number;
    count: number;
  };
}

/**
 * 收入明细
 */
export interface RevenueBreakdown {
  projectId: string;
  dateRange: DateRange;
  dailyRevenue: { date: Date; amount: number }[];
  weeklyRevenue: { week: string; amount: number }[];
  monthlyRevenue: { month: string; amount: number }[];
}

/**
 * 日期范围
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * 项目员工
 */
export interface ProjectEmployee {
  id: string;
  projectId: string;
  name: string;
  position: string;
  department?: string;
  hireDate: Date;
  tenure: TenureCategory;
  recruitmentChannel?: string;
  status: EmployeeStatus;
  trainingRecords: TrainingRecord[];
  salaryInfo?: EmployeeSalary;
  assessments: PerformanceAssessment[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 培训记录
 */
export interface TrainingRecord {
  id: string;
  employeeId: string;
  trainingName: string;
  trainingType: string;
  startDate: Date;
  endDate?: Date;
  status: string;
  certificateUrl?: string;
  createdAt: Date;
}

/**
 * 员工薪资
 */
export interface EmployeeSalary {
  id: string;
  employeeId: string;
  baseSalary: number;
  bonus: number;
  allowance: number;
  overtimePay: number;
  socialInsurance: SocialInsurance;
  effectiveDate: Date;
  createdAt: Date;
}

/**
 * 五险一金
 */
export interface SocialInsurance {
  pension: number;         // 养老保险
  medical: number;         // 医疗保险
  unemployment: number;    // 失业保险
  workInjury: number;      // 工伤保险
  maternity: number;       // 生育保险
  housingFund: number;     // 住房公积金
}

/**
 * 员工统计
 */
export interface EmployeeStats {
  projectId: string;
  totalCount: number;
  activeCount: number;
  resignedCount: number;
  onLeaveCount: number;
  positionDistribution: { position: string; count: number }[];
  departmentDistribution: { department: string; count: number }[];
  tenureDistribution: { tenure: TenureCategory; count: number }[];
}

/**
 * 人员流动分析
 */
export interface TurnoverAnalysis {
  projectId: string;
  dateRange: DateRange;
  hiredCount: number;
  resignedCount: number;
  averageHeadcount: number;
  turnoverRate: number;
  monthlyTurnover: { month: string; hired: number; resigned: number; rate: number }[];
}


/**
 * 能力评估
 */
export interface PerformanceAssessment {
  id: string;
  employeeId: string;
  assessmentPeriod: string;
  professionalSkills: number;  // 专业技能 (1-10)
  workAttitude: number;        // 工作态度 (1-10)
  teamwork: number;            // 团队协作 (1-10)
  communication: number;       // 沟通能力 (1-10)
  problemSolving: number;      // 问题解决 (1-10)
  overallScore: number;        // 综合评分
  assessedBy: string;
  assessedAt: Date;
  comments?: string;
}

/**
 * 团队能力评估
 */
export interface TeamAssessment {
  projectId: string;
  assessmentPeriod: string;
  averageScores: {
    professionalSkills: number;
    workAttitude: number;
    teamwork: number;
    communication: number;
    problemSolving: number;
    overall: number;
  };
  employeeCount: number;
  topPerformers: { employeeId: string; name: string; score: number }[];
  needsImprovement: { employeeId: string; name: string; score: number }[];
}

/**
 * 评估趋势
 */
export interface AssessmentTrend {
  employeeId: string;
  periods: string[];
  scores: {
    professionalSkills: number[];
    workAttitude: number[];
    teamwork: number[];
    communication: number[];
    problemSolving: number[];
    overall: number[];
  };
}

/**
 * 薪资构成
 */
export interface SalaryComposition {
  baseSalary: number;
  baseSalaryPercentage: number;
  bonus: number;
  bonusPercentage: number;
  allowance: number;
  allowancePercentage: number;
  overtime: number;
  overtimePercentage: number;
  socialInsurance: number;
  socialInsurancePercentage: number;
  total: number;
}

/**
 * 人力成本汇总
 */
export interface LaborCostSummary {
  projectId: string;
  totalLaborCost: number;
  averageSalary: number;
  employeeCount: number;
  salaryComposition: SalaryComposition;
  socialInsuranceTotal: number;
  socialInsuranceDetail: SocialInsurance;
}

/**
 * 岗位薪资范围
 */
export interface PositionSalaryRange {
  position: string;
  minSalary: number;
  maxSalary: number;
  averageSalary: number;
  employeeCount: number;
}

/**
 * 盈亏汇总
 */
export interface ProfitLossSummary {
  projectId: string;
  dateRange: DateRange;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  profitMargin: number;
  profitLossRate: number;
  isProfit: boolean;
}

/**
 * 盈亏趋势
 */
export interface ProfitLossTrend {
  projectId: string;
  period: TrendPeriod;
  data: {
    date: string;
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  }[];
}

/**
 * 趋势周期
 */
export type TrendPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

/**
 * 投资回报分析
 */
export interface ROIAnalysis {
  investorId: string;
  projectId: string;
  investedAmount: number;
  currentValue: number;
  totalDividends: number;
  unrealizedGain: number;
  roi: number;
  roiPercentage: number;
  estimatedPaybackDate?: Date;
  holdingPeriodDays: number;
  annualizedReturn: number;
}

/**
 * 项目对比
 */
export interface ProjectComparison {
  projects: {
    projectId: string;
    projectName: string;
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    profitMargin: number;
    roi: number;
  }[];
  dateRange: DateRange;
}

/**
 * 亏损预警
 */
export interface LossAlert {
  id: string;
  projectId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  thresholdValue?: number;
  actualValue?: number;
  isRead: boolean;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
}

/**
 * 亏损因素
 */
export interface LossFactor {
  factor: LossFactorType;
  impact: number;        // 影响程度 (0-100)
  description: string;
  evidence: string[];
}

/**
 * 市场对比
 */
export interface MarketComparison {
  industryType: IndustryType;
  averageRevenue: number;
  averageProfit: number;
  averageProfitMargin: number;
  projectRanking: number;
  totalProjectsInIndustry: number;
  comparisonDate: Date;
}

/**
 * 改进计划
 */
export interface ImprovementPlan {
  id: string;
  title: string;
  description: string;
  expectedOutcome: string;
  timeline: string;
  responsiblePerson: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 决策记录
 */
export interface DecisionRecord {
  id: string;
  projectId: string;
  decisionType: string;
  title: string;
  description: string;
  rationale?: string;
  impact?: string;
  decisionDate: Date;
  decidedBy: string;
  createdAt: Date;
}

/**
 * 亏损分析报告
 */
export interface LossAnalysisReport {
  id: string;
  projectId: string;
  reportDate: Date;
  totalLoss: number;
  lossFactors: LossFactor[];
  marketComparison?: MarketComparison;
  improvementPlan?: ImprovementPlan;
  decisionHistory: DecisionRecord[];
  createdBy: string;
  createdAt: Date;
}


/**
 * 投资者项目访问权限
 */
export interface InvestorProjectAccess {
  id: string;
  investorId: string;
  projectId: string;
  shareholdingRatio: number;
  accessLevel: AccessLevel;
  grantedAt: Date;
  grantedBy: string;
}

/**
 * 数据可见性配置
 */
export interface DataVisibility {
  canViewFinancials: boolean;
  canViewEmployeeDetails: boolean;
  canViewSalaryDetails: boolean;
  canViewAssessments: boolean;
  detailLevel: 'SUMMARY' | 'DETAILED' | 'FULL';
}

/**
 * 数据修改历史
 */
export interface DataModificationHistory {
  id: string;
  tableName: string;
  recordId: string;
  fieldName: string;
  oldValue?: string;
  newValue?: string;
  modificationReason?: string;
  modifiedBy: string;
  modifiedAt: Date;
}

/**
 * 数据验证结果
 */
export interface DataValidationResult {
  isValid: boolean;
  errors: DataValidationError[];
  warnings: DataValidationWarning[];
}

/**
 * 数据验证错误
 */
export interface DataValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

/**
 * 数据验证警告
 */
export interface DataValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// =====================================================
// 输入类型 (Input Types)
// =====================================================

/**
 * 每日运营数据输入
 */
export interface DailyOperationsInput {
  projectId: string;
  date: Date;
  revenue: number;
  expenses: ExpenseItemInput[];
  customerCount?: number;
  notes?: string;
}

/**
 * 支出项目输入
 */
export interface ExpenseItemInput {
  category: ExpenseCategory;
  amount: number;
  description?: string;
  receiptUrl?: string;
}

/**
 * 员工创建输入
 */
export interface CreateEmployeeInput {
  projectId: string;
  name: string;
  position: string;
  department?: string;
  hireDate: Date;
  recruitmentChannel?: string;
}

/**
 * 薪资更新输入
 */
export interface UpdateSalaryInput {
  employeeId: string;
  baseSalary: number;
  bonus?: number;
  allowance?: number;
  overtimePay?: number;
  pension?: number;
  medical?: number;
  unemployment?: number;
  workInjury?: number;
  maternity?: number;
  housingFund?: number;
  effectiveDate: Date;
}

/**
 * 能力评估输入
 */
export interface AssessmentInput {
  employeeId: string;
  assessmentPeriod: string;
  professionalSkills: number;
  workAttitude: number;
  teamwork: number;
  communication: number;
  problemSolving: number;
  comments?: string;
}

/**
 * 里程碑创建输入
 */
export interface CreateMilestoneInput {
  phaseRecordId: string;
  name: string;
  description?: string;
  expectedDate: Date;
}

/**
 * 阶段更新输入
 */
export interface UpdatePhaseInput {
  projectId: string;
  phase: ProjectPhase;
  reason?: string;
}

/**
 * 延期记录输入
 */
export interface DelayRecordInput {
  phaseRecordId: string;
  delayDays: number;
  reason: string;
  newExpectedDate: Date;
}

// =====================================================
// 验证函数 (Validation Functions)
// =====================================================

/**
 * 验证项目阶段是否有效
 */
export function isValidProjectPhase(phase: string): phase is ProjectPhase {
  return Object.values(ProjectPhase).includes(phase as ProjectPhase);
}

/**
 * 验证项目类型是否有效
 */
export function isValidProjectType(type: string): type is ProjectType {
  return Object.values(ProjectType).includes(type as ProjectType);
}

/**
 * 验证行业类型是否有效
 */
export function isValidIndustryType(type: string): type is IndustryType {
  return Object.values(IndustryType).includes(type as IndustryType);
}

/**
 * 验证支出类别是否有效
 */
export function isValidExpenseCategory(category: string): category is ExpenseCategory {
  return Object.values(ExpenseCategory).includes(category as ExpenseCategory);
}

/**
 * 验证员工工龄分类是否有效
 */
export function isValidTenureCategory(tenure: string): tenure is TenureCategory {
  return Object.values(TenureCategory).includes(tenure as TenureCategory);
}

/**
 * 验证员工状态是否有效
 */
export function isValidEmployeeStatus(status: string): status is EmployeeStatus {
  return Object.values(EmployeeStatus).includes(status as EmployeeStatus);
}

/**
 * 验证访问级别是否有效
 */
export function isValidAccessLevel(level: string): level is AccessLevel {
  return Object.values(AccessLevel).includes(level as AccessLevel);
}

/**
 * 验证评估分数是否在有效范围内 (1-10)
 */
export function isValidAssessmentScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 10;
}

/**
 * 验证进度百分比是否在有效范围内 (0-100)
 */
export function isValidProgress(progress: number): boolean {
  return Number.isInteger(progress) && progress >= 0 && progress <= 100;
}

/**
 * 验证持股比例是否在有效范围内 (0-100)
 */
export function isValidShareholdingRatio(ratio: number): boolean {
  return ratio >= 0 && ratio <= 100;
}

/**
 * 计算员工工龄分类
 */
export function calculateTenureCategory(hireDate: Date): TenureCategory {
  const now = new Date();
  const years = (now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  if (years < 1) {
    return TenureCategory.NEW;
  } else if (years < 3) {
    return TenureCategory.REGULAR;
  } else {
    return TenureCategory.SENIOR;
  }
}

/**
 * 计算综合评分
 */
export function calculateOverallScore(assessment: {
  professionalSkills: number;
  workAttitude: number;
  teamwork: number;
  communication: number;
  problemSolving: number;
}): number {
  const weights = {
    professionalSkills: 0.3,
    workAttitude: 0.2,
    teamwork: 0.2,
    communication: 0.15,
    problemSolving: 0.15
  };
  
  return Number((
    assessment.professionalSkills * weights.professionalSkills +
    assessment.workAttitude * weights.workAttitude +
    assessment.teamwork * weights.teamwork +
    assessment.communication * weights.communication +
    assessment.problemSolving * weights.problemSolving
  ).toFixed(1));
}

/**
 * 计算五险一金总额
 */
export function calculateSocialInsuranceTotal(insurance: SocialInsurance): number {
  return (
    insurance.pension +
    insurance.medical +
    insurance.unemployment +
    insurance.workInjury +
    insurance.maternity +
    insurance.housingFund
  );
}

/**
 * 计算盈亏率
 */
export function calculateProfitLossRate(
  totalProfit: number,
  totalInvestment: number
): number {
  if (totalInvestment === 0) return 0;
  return Number(((totalProfit / totalInvestment) * 100).toFixed(2));
}

/**
 * 计算投资回报率 (ROI)
 */
export function calculateROI(
  currentValue: number,
  totalDividends: number,
  investedAmount: number
): number {
  if (investedAmount === 0) return 0;
  return Number((((currentValue + totalDividends - investedAmount) / investedAmount) * 100).toFixed(2));
}

/**
 * 计算员工流动率
 */
export function calculateTurnoverRate(
  resignedCount: number,
  averageHeadcount: number
): number {
  if (averageHeadcount === 0) return 0;
  return Number(((resignedCount / averageHeadcount) * 100).toFixed(2));
}

/**
 * 验证每日运营数据
 */
export function validateDailyOperationsData(data: DailyOperationsInput): DataValidationResult {
  const errors: DataValidationError[] = [];
  const warnings: DataValidationWarning[] = [];

  // 验证收入
  if (data.revenue < 0) {
    errors.push({
      field: 'revenue',
      message: '收入不能为负数',
      code: 'INVALID_REVENUE',
      value: data.revenue
    });
  }

  // 验证支出
  let totalExpenses = 0;
  data.expenses.forEach((expense, index) => {
    if (expense.amount < 0) {
      errors.push({
        field: `expenses[${index}].amount`,
        message: '支出金额不能为负数',
        code: 'INVALID_EXPENSE_AMOUNT',
        value: expense.amount
      });
    }
    if (!isValidExpenseCategory(expense.category)) {
      errors.push({
        field: `expenses[${index}].category`,
        message: '无效的支出类别',
        code: 'INVALID_EXPENSE_CATEGORY',
        value: expense.category
      });
    }
    totalExpenses += expense.amount;
  });

  // 警告：支出超过收入
  if (totalExpenses > data.revenue && data.revenue > 0) {
    warnings.push({
      field: 'expenses',
      message: '支出总额超过收入，项目处于亏损状态',
      suggestion: '请检查支出明细是否正确'
    });
  }

  // 验证客户数量
  if (data.customerCount !== undefined && data.customerCount < 0) {
    errors.push({
      field: 'customerCount',
      message: '客户数量不能为负数',
      code: 'INVALID_CUSTOMER_COUNT',
      value: data.customerCount
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 验证能力评估数据
 */
export function validateAssessmentData(data: AssessmentInput): DataValidationResult {
  const errors: DataValidationError[] = [];
  const warnings: DataValidationWarning[] = [];

  const scoreFields = [
    'professionalSkills',
    'workAttitude',
    'teamwork',
    'communication',
    'problemSolving'
  ] as const;

  scoreFields.forEach(field => {
    const score = data[field];
    if (!isValidAssessmentScore(score)) {
      errors.push({
        field,
        message: `${field} 评分必须在 1-10 之间`,
        code: 'INVALID_ASSESSMENT_SCORE',
        value: score
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

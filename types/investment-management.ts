// Investment Management System TypeScript Types
// Based on the Investment Management System Specification

// Enums
export enum ApplicationStatus {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW", 
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED"
}

export enum InvestmentStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  SUSPENDED = "SUSPENDED"
}

export enum RiskLevel {
  VERY_LOW = "VERY_LOW",
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export enum ReportType {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY", 
  ANNUAL = "ANNUAL",
  CUSTOM = "CUSTOM"
}

export enum CashFlowType {
  INFLOW = "INFLOW",
  OUTFLOW = "OUTFLOW"
}

// Core Interfaces
export interface InvestmentApplication {
  id: string;
  investorId: string;
  projectId: string;
  amount: number;
  currency: string;
  status: ApplicationStatus;
  submittedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  riskScore: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  investments?: PortfolioInvestment[];
  riskAssessments?: RiskAssessment[];
  reports?: InvestmentReport[];
  cashFlows?: CashFlow[];
}

export interface PortfolioInvestment {
  id: string;
  portfolioId: string;
  projectId: string;
  amount: number;
  investedAt: Date;
  currentValue: number;
  returnAmount: number;
  returnPercentage: number;
  riskLevel: RiskLevel;
  status: InvestmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Extended investment interface for risk calculations
export interface Investment extends PortfolioInvestment {
  // Additional fields for risk assessment
}

export interface RiskAssessment {
  id: string;
  portfolioId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  assessmentDate: Date;
  recommendations?: string[];
  metrics?: RiskMetrics;
  createdAt?: Date;
}

export interface RiskFactor {
  type: 'CONCENTRATION' | 'VOLATILITY' | 'LIQUIDITY' | 'MARKET' | 'CREDIT' | 'OPERATIONAL';
  severity: number; // 0-1 scale
  description: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface InvestmentReport {
  id: string;
  portfolioId: string;
  reportType: ReportType;
  periodStart: Date;
  periodEnd: Date;
  generatedAt: Date;
  content: ReportContent;
  fileUrl?: string;
  createdAt: Date;
}

export interface ReportContent {
  summary: PortfolioSummary;
  performance: PerformanceMetrics;
  riskAnalysis: RiskAnalysis;
  recommendations: string[];
  charts?: ChartData[];
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  activeInvestments: number;
  riskScore: number;
}

export interface PerformanceMetrics {
  absoluteReturn: number;
  annualizedReturn: number;
  sharpeRatio?: number;
  volatility?: number;
  maxDrawdown?: number;
  benchmarkComparison?: BenchmarkComparison;
}

export interface BenchmarkComparison {
  benchmarkName: string;
  portfolioReturn: number;
  benchmarkReturn: number;
  outperformance: number;
}

export interface RiskAnalysis {
  riskScore: number;
  riskLevel: RiskLevel;
  var95?: number; // Value at Risk 95%
  var99?: number; // Value at Risk 99%
  stressTestResults?: StressTestResult[];
}

export interface StressTestResult {
  scenarioName: string;
  baseValue: number;
  stressedValue: number;
  loss: number;
  lossPercentage: number;
  passesThreshold: boolean;
}

export interface StressScenario {
  name: string;
  type: 'MARKET_CRASH' | 'INTEREST_RATE_SHOCK' | 'LIQUIDITY_CRISIS' | 'SECTOR_SPECIFIC';
  description: string;
  maxLossThreshold?: number;
  factors?: Record<string, number>;
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: any[];
  labels: string[];
  colors?: string[];
}

export interface CashFlow {
  id: string;
  portfolioId?: string;
  type: CashFlowType;
  amount: number;
  description: string;
  category: string;
  date: Date;
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface CreateInvestmentApplicationRequest {
  projectId: string;
  amount: number;
  currency?: string;
}

export interface CreateInvestmentApplicationResponse {
  application: InvestmentApplication;
  message: string;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  rejectionReason?: string;
}

export interface PortfolioAnalysisRequest {
  portfolioId: string;
  includeProjections?: boolean;
  timeframe?: 'YTD' | '1Y' | '3Y' | '5Y' | 'ALL';
}

export interface PortfolioAnalysisResponse {
  portfolio: Portfolio;
  analysis: PortfolioAnalysis;
  recommendations: InvestmentRecommendation[];
}

export interface PortfolioAnalysis {
  assetAllocation: AssetAllocation;
  sectorDistribution: SectorDistribution;
  performanceMetrics: PerformanceMetrics;
  riskMetrics: RiskMetrics;
}

export interface AssetAllocation {
  categories: AllocationCategory[];
  diversificationScore: number;
}

export interface AllocationCategory {
  name: string;
  percentage: number;
  value: number;
  color: string;
}

export interface SectorDistribution {
  sectors: SectorAllocation[];
  concentrationRisk: number;
}

export interface SectorAllocation {
  sector: string;
  percentage: number;
  value: number;
  performance: number;
}

export interface RiskMetrics {
  riskScore: number;
  riskLevel: RiskLevel;
  valueAtRisk: number;
  conditionalVaR: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  beta: number;
}

export interface InvestmentRecommendation {
  type: 'BUY' | 'SELL' | 'HOLD' | 'REBALANCE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  expectedImpact: number;
  riskImpact: number;
  actionItems: string[];
}

export interface ReturnCalculationRequest {
  investments: InvestmentData[];
  benchmarkRate?: number;
  calculationType: 'ABSOLUTE' | 'ANNUALIZED' | 'IRR' | 'SHARPE';
}

export interface InvestmentData {
  amount: number;
  currentValue: number;
  investmentDate: Date;
  cashFlows?: CashFlowData[];
}

export interface CashFlowData {
  date: Date;
  amount: number;
  type: CashFlowType;
}

export interface ReturnCalculationResponse {
  absoluteReturn: number;
  returnPercentage: number;
  annualizedReturn?: number;
  irr?: number;
  sharpeRatio?: number;
  calculationDate: Date;
}

export interface RiskAssessmentRequest {
  portfolioId: string;
  includeStressTesting?: boolean;
  confidenceLevel?: number; // For VaR calculation
}

export interface RiskAssessmentResponse {
  assessment: RiskAssessment;
  recommendations: RiskRecommendation[];
  alerts?: RiskAlert[];
}

export interface RiskRecommendation {
  type: 'DIVERSIFY' | 'REDUCE_EXPOSURE' | 'HEDGE' | 'MONITOR';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  expectedRiskReduction: number;
}

export interface RiskAlert {
  level: 'WARNING' | 'CRITICAL';
  message: string;
  threshold: number;
  currentValue: number;
  recommendedAction: string;
}

export interface GenerateReportRequest {
  portfolioId: string;
  reportType: ReportType;
  periodStart?: Date;
  periodEnd?: Date;
  includeCharts?: boolean;
  format?: 'PDF' | 'EXCEL' | 'JSON';
}

export interface GenerateReportResponse {
  report: InvestmentReport;
  downloadUrl?: string;
  message: string;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Error Types
export class InvestmentBusinessError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'InvestmentBusinessError';
  }
}

export enum BusinessErrorCodes {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_INVESTMENT_AMOUNT = 'INVALID_INVESTMENT_AMOUNT',
  PORTFOLIO_NOT_FOUND = 'PORTFOLIO_NOT_FOUND',
  RISK_THRESHOLD_EXCEEDED = 'RISK_THRESHOLD_EXCEEDED',
  APPLICATION_ALREADY_EXISTS = 'APPLICATION_ALREADY_EXISTS',
  INVALID_PROJECT_STATUS = 'INVALID_PROJECT_STATUS',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  REPORT_GENERATION_FAILED = 'REPORT_GENERATION_FAILED'
}

// Utility Types
export type TimePeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'ALL';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Component Props Types (for React components)
export interface InvestmentApplicationFormProps {
  projectId?: string;
  onSubmit: (data: CreateInvestmentApplicationRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface PortfolioDashboardProps {
  portfolioId: string;
  refreshInterval?: number;
  showRecommendations?: boolean;
}

export interface ReturnAnalysisChartProps {
  data: PerformanceMetrics[];
  timeframe: TimePeriod;
  showBenchmark?: boolean;
}

export interface RiskMonitoringProps {
  portfolioId: string;
  alertThresholds: RiskThresholds;
  onAlertTriggered: (alert: RiskAlert) => void;
}

export interface RiskThresholds {
  maxRiskScore: number;
  maxConcentration: number;
  maxDrawdown: number;
  minLiquidity: number;
}

// Strategy Optimization Types
export enum OptimizationObjective {
  MAXIMIZE_RETURN = "MAXIMIZE_RETURN",
  MINIMIZE_RISK = "MINIMIZE_RISK",
  MAXIMIZE_SHARPE = "MAXIMIZE_SHARPE",
  TARGET_RETURN = "TARGET_RETURN",
  TARGET_RISK = "TARGET_RISK"
}

export enum RebalancingFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY", 
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  ANNUALLY = "ANNUALLY",
  THRESHOLD_BASED = "THRESHOLD_BASED"
}

export interface InvestmentStrategy {
  id: string;
  name: string;
  description: string;
  objective: OptimizationObjective;
  targetReturn?: number;
  targetRisk?: number;
  constraints: StrategyConstraints;
  rebalancingFrequency: RebalancingFrequency;
  rebalancingThreshold?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StrategyConstraints {
  maxPositionSize: number; // Maximum percentage per investment
  minPositionSize: number; // Minimum percentage per investment
  maxSectorConcentration: number; // Maximum percentage per sector
  allowedAssetTypes: string[];
  excludedInvestments: string[];
  liquidityRequirement: number; // Minimum liquidity percentage
  riskBudget: number; // Maximum portfolio risk score
}

export interface OptimizationRequest {
  portfolioId: string;
  objective: OptimizationObjective;
  constraints: StrategyConstraints;
  targetReturn?: number;
  targetRisk?: number;
  rebalancingBudget?: number; // Maximum transaction cost budget
  includeNewInvestments?: boolean;
  excludeCurrentHoldings?: string[];
}

export interface OptimizationResult {
  id: string;
  portfolioId: string;
  requestedAt: Date;
  completedAt: Date;
  objective: OptimizationObjective;
  currentAllocation: AllocationRecommendation[];
  optimizedAllocation: AllocationRecommendation[];
  expectedReturn: number;
  expectedRisk: number;
  expectedSharpe: number;
  rebalancingCost: number;
  improvementMetrics: ImprovementMetrics;
  recommendations: OptimizationRecommendation[];
}

export interface AllocationRecommendation {
  investmentId: string;
  investmentName: string;
  sector: string;
  currentWeight: number;
  recommendedWeight: number;
  currentValue: number;
  recommendedValue: number;
  action: 'BUY' | 'SELL' | 'HOLD';
  transactionAmount: number;
  reasoning: string;
}

export interface ImprovementMetrics {
  returnImprovement: number; // Expected return improvement
  riskReduction: number; // Expected risk reduction
  sharpeImprovement: number; // Sharpe ratio improvement
  diversificationImprovement: number; // Diversification score improvement
  costEfficiency: number; // Improvement per unit of transaction cost
}

export interface OptimizationRecommendation {
  type: 'REBALANCE' | 'ADD_INVESTMENT' | 'REMOVE_INVESTMENT' | 'CHANGE_STRATEGY';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  expectedBenefit: string;
  implementationSteps: string[];
  estimatedCost: number;
  timeframe: string;
}

export interface BacktestRequest {
  strategyId: string;
  portfolioId: string;
  startDate: Date;
  endDate: Date;
  initialValue: number;
  rebalancingFrequency: RebalancingFrequency;
  transactionCosts: number; // Percentage per transaction
  includeMarketData?: boolean;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  portfolioId: string;
  period: DateRange;
  initialValue: number;
  finalValue: number;
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  calmarRatio: number;
  winRate: number;
  transactionCosts: number;
  numberOfRebalances: number;
  performanceHistory: PerformanceDataPoint[];
  benchmarkComparison?: BenchmarkComparison;
  riskMetrics: BacktestRiskMetrics;
}

export interface PerformanceDataPoint {
  date: Date;
  portfolioValue: number;
  return: number;
  cumulativeReturn: number;
  drawdown: number;
  allocation: Record<string, number>;
}

export interface BacktestRiskMetrics {
  var95: number;
  var99: number;
  cvar95: number;
  cvar99: number;
  skewness: number;
  kurtosis: number;
  correlationMatrix: Record<string, Record<string, number>>;
}

export interface StrategyRecommendation {
  id: string;
  portfolioId: string;
  recommendationType: 'OPTIMIZATION' | 'REBALANCING' | 'RISK_ADJUSTMENT' | 'OPPORTUNITY';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  rationale: string;
  expectedOutcome: ExpectedOutcome;
  implementationPlan: ImplementationStep[];
  riskAssessment: RecommendationRisk;
  validUntil: Date;
  createdAt: Date;
}

export interface ExpectedOutcome {
  returnImpact: number;
  riskImpact: number;
  timeHorizon: string;
  confidence: number; // 0-1 scale
  keyMetrics: Record<string, number>;
}

export interface ImplementationStep {
  order: number;
  action: string;
  description: string;
  estimatedCost: number;
  estimatedTime: string;
  dependencies: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RecommendationRisk {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: string[];
  mitigation: string[];
  worstCaseScenario: string;
  probabilityOfSuccess: number;
}

// API Request/Response Types for Strategy Optimization
export interface OptimizePortfolioRequest {
  portfolioId: string;
  objective: OptimizationObjective;
  constraints?: Partial<StrategyConstraints>;
  targetReturn?: number;
  targetRisk?: number;
  rebalancingBudget?: number;
}

export interface OptimizePortfolioResponse {
  optimization: OptimizationResult;
  recommendations: StrategyRecommendation[];
  message: string;
}

export interface BacktestStrategyRequest {
  strategyId?: string;
  portfolioId: string;
  startDate: Date;
  endDate: Date;
  initialValue?: number;
  rebalancingFrequency?: RebalancingFrequency;
  transactionCosts?: number;
}

export interface BacktestStrategyResponse {
  backtest: BacktestResult;
  insights: BacktestInsight[];
  message: string;
}

export interface BacktestInsight {
  type: 'PERFORMANCE' | 'RISK' | 'COST' | 'TIMING';
  title: string;
  description: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  significance: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation?: string;
}

export interface GetRecommendationsRequest {
  portfolioId: string;
  types?: ('OPTIMIZATION' | 'REBALANCING' | 'RISK_ADJUSTMENT' | 'OPPORTUNITY')[];
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  limit?: number;
}

export interface GetRecommendationsResponse {
  recommendations: StrategyRecommendation[];
  summary: RecommendationSummary;
  message: string;
}

export interface RecommendationSummary {
  totalRecommendations: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  potentialReturn: number;
  potentialRiskReduction: number;
  estimatedImplementationCost: number;
}

// Component Props for Strategy Optimization
export interface StrategyOptimizerProps {
  portfolioId: string;
  onOptimizationComplete: (result: OptimizationResult) => void;
  onError: (error: Error) => void;
}

export interface BacktestVisualizerProps {
  backtestResult: BacktestResult;
  showBenchmark?: boolean;
  interactive?: boolean;
}

export interface RecommendationListProps {
  recommendations: StrategyRecommendation[];
  onImplement: (recommendation: StrategyRecommendation) => void;
  onDismiss: (recommendationId: string) => void;
}
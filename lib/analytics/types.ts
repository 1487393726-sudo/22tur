/**
 * Analytics Types
 * 用户行为分析类型定义
 */

// 事件类型
export type EventType =
  | 'page_view'
  | 'click'
  | 'scroll'
  | 'form_submit'
  | 'search'
  | 'purchase'
  | 'signup'
  | 'login'
  | 'logout'
  | 'share'
  | 'download'
  | 'video_play'
  | 'video_complete'
  | 'error'
  | 'custom';

// 用户行为事件
export interface BehaviorEvent {
  id?: string;
  userId?: string;
  sessionId: string;
  eventType: EventType;
  eventName?: string;
  eventData: Record<string, unknown>;
  pageUrl?: string;
  pagePath?: string;
  pageTitle?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  timestamp: Date;
  duration?: number;
}

// 事件记录请求
export interface TrackEventRequest {
  eventType: EventType;
  eventName?: string;
  eventData?: Record<string, unknown>;
  pageUrl?: string;
  pagePath?: string;
  pageTitle?: string;
  referrer?: string;
  duration?: number;
}

// 会话信息
export interface SessionInfo {
  sessionId: string;
  userId?: string;
  startTime: Date;
  lastActivityTime: Date;
  pageViews: number;
  events: number;
  duration: number;
  entryPage?: string;
  exitPage?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  country?: string;
}

// 漏斗步骤
export interface FunnelStep {
  name: string;
  eventType: EventType;
  eventName?: string;
  conditions?: Record<string, unknown>;
}

// 漏斗定义
export interface FunnelDefinition {
  id: string;
  name: string;
  description?: string;
  steps: FunnelStep[];
  timeWindow?: number; // 时间窗口（小时）
  createdAt: Date;
  updatedAt?: Date;
}

// 漏斗分析结果
export interface FunnelAnalysisResult {
  funnelId: string;
  funnelName: string;
  dateRange: { start: Date; end: Date };
  steps: FunnelStepResult[];
  overallConversionRate: number;
  totalUsers: number;
}

// 漏斗步骤结果
export interface FunnelStepResult {
  stepIndex: number;
  stepName: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
  avgTimeToNext?: number; // 平均到下一步的时间（秒）
}

// 留存类型
export type RetentionType = 'daily' | 'weekly' | 'monthly';

// 留存分析请求
export interface RetentionAnalysisRequest {
  type: RetentionType;
  startDate: Date;
  endDate: Date;
  cohortEvent?: EventType;
  returnEvent?: EventType;
  segments?: string[];
}

// 留存分析结果
export interface RetentionAnalysisResult {
  type: RetentionType;
  dateRange: { start: Date; end: Date };
  cohorts: RetentionCohort[];
  averageRetention: number[];
}

// 留存队列
export interface RetentionCohort {
  cohortDate: Date;
  cohortSize: number;
  retention: number[]; // 各期留存率
  retentionCounts: number[]; // 各期留存人数
}

// 用户分群规则
export interface SegmentRule {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'regex';
  value: unknown;
}

// 用户分群定义
export interface SegmentDefinition {
  id: string;
  name: string;
  description?: string;
  rules: SegmentRule[];
  ruleLogic: 'and' | 'or';
  createdAt: Date;
  updatedAt?: Date;
}

// 用户分群结果
export interface SegmentResult {
  segmentId: string;
  segmentName: string;
  userCount: number;
  percentage: number;
  users?: string[];
}

// 事件统计
export interface EventStats {
  eventType: EventType;
  eventName?: string;
  count: number;
  uniqueUsers: number;
  avgPerUser: number;
}

// 页面统计
export interface PageStats {
  pagePath: string;
  pageTitle?: string;
  pageViews: number;
  uniqueVisitors: number;
  avgDuration: number;
  bounceRate: number;
  exitRate: number;
}

// 时间范围
export interface TimeRange {
  start: Date;
  end: Date;
}

// 分析查询参数
export interface AnalyticsQuery {
  timeRange: TimeRange;
  eventTypes?: EventType[];
  userId?: string;
  sessionId?: string;
  segments?: string[];
  groupBy?: 'hour' | 'day' | 'week' | 'month';
  limit?: number;
}

// 趋势数据点
export interface TrendDataPoint {
  date: Date;
  value: number;
  label?: string;
}

// 趋势分析结果
export interface TrendAnalysisResult {
  metric: string;
  timeRange: TimeRange;
  data: TrendDataPoint[];
  total: number;
  average: number;
  change: number; // 环比变化百分比
}

// 实时统计
export interface RealtimeStats {
  activeUsers: number;
  activeSessions: number;
  pageViewsPerMinute: number;
  topPages: Array<{ path: string; count: number }>;
  topEvents: Array<{ type: EventType; count: number }>;
  deviceBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
}

// 行为追踪服务接口
export interface IBehaviorTracker {
  // 事件追踪
  track(event: TrackEventRequest): Promise<string>;
  trackPageView(pageUrl: string, pageTitle?: string): Promise<string>;
  trackClick(elementId: string, elementText?: string): Promise<string>;
  trackSearch(query: string, resultsCount?: number): Promise<string>;
  trackPurchase(orderId: string, amount: number, items?: unknown[]): Promise<string>;
  
  // 会话管理
  startSession(userId?: string): string;
  endSession(sessionId: string): Promise<void>;
  getSession(sessionId: string): Promise<SessionInfo | null>;
  
  // 事件查询
  getEvents(query: AnalyticsQuery): Promise<BehaviorEvent[]>;
  getEventStats(query: AnalyticsQuery): Promise<EventStats[]>;
  getPageStats(query: AnalyticsQuery): Promise<PageStats[]>;
}

// 漏斗分析服务接口
export interface IFunnelAnalyzer {
  createFunnel(definition: Omit<FunnelDefinition, 'id' | 'createdAt'>): Promise<FunnelDefinition>;
  updateFunnel(id: string, definition: Partial<FunnelDefinition>): Promise<FunnelDefinition>;
  deleteFunnel(id: string): Promise<boolean>;
  getFunnel(id: string): Promise<FunnelDefinition | null>;
  listFunnels(): Promise<FunnelDefinition[]>;
  analyze(funnelId: string, timeRange: TimeRange): Promise<FunnelAnalysisResult>;
}

// 留存分析服务接口
export interface IRetentionAnalyzer {
  analyze(request: RetentionAnalysisRequest): Promise<RetentionAnalysisResult>;
  getRetentionTrend(type: RetentionType, periods: number): Promise<TrendDataPoint[]>;
}

// 用户分群服务接口
export interface ISegmentService {
  createSegment(definition: Omit<SegmentDefinition, 'id' | 'createdAt'>): Promise<SegmentDefinition>;
  updateSegment(id: string, definition: Partial<SegmentDefinition>): Promise<SegmentDefinition>;
  deleteSegment(id: string): Promise<boolean>;
  getSegment(id: string): Promise<SegmentDefinition | null>;
  listSegments(): Promise<SegmentDefinition[]>;
  evaluateSegment(segmentId: string): Promise<SegmentResult>;
  getUserSegments(userId: string): Promise<SegmentDefinition[]>;
}

// 分析服务配置
export interface AnalyticsConfig {
  // 数据保留天数
  retentionDays: number;
  // 会话超时时间（分钟）
  sessionTimeout: number;
  // 是否启用实时统计
  enableRealtime: boolean;
  // 采样率 (0-1)
  samplingRate: number;
  // 排除的 IP 地址
  excludedIPs?: string[];
  // 排除的用户代理
  excludedUserAgents?: string[];
}

// 默认配置
export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  retentionDays: 90,
  sessionTimeout: 30,
  enableRealtime: true,
  samplingRate: 1,
};

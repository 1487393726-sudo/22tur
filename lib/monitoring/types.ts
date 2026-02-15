// 监控服务类型定义

// 指标数据
export interface MetricData {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp?: Date;
}

// 指标类型
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

// 指标定义
export interface MetricDefinition {
  name: string;
  type: MetricType;
  description: string;
  labels?: string[];
  buckets?: number[]; // for histogram
}

// 时间范围
export interface TimeRange {
  start: Date;
  end: Date;
}

// 聚合类型
export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'rate';

// 指标查询
export interface MetricQuery {
  name: string;
  labels?: Record<string, string>;
  timeRange: TimeRange;
  aggregation?: AggregationType;
  interval?: string; // e.g., '1m', '5m', '1h'
}

// 指标结果
export interface MetricResult {
  name: string;
  labels?: Record<string, string>;
  values: Array<{
    timestamp: Date;
    value: number;
  }>;
}

// 百分位结果
export interface PercentileResult {
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
}

// 告警严重级别
export type AlertSeverity = 'info' | 'warning' | 'critical';

// 告警条件
export type AlertCondition = 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne';

// 告警通道
export type AlertChannel = 'email' | 'sms' | 'webhook' | 'wechat';

// 告警规则
export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  metric: string;
  labels?: Record<string, string>;
  condition: AlertCondition;
  threshold: number;
  duration?: number; // 持续时间（秒）
  severity: AlertSeverity;
  channels: AlertChannel[];
  recipients?: string[];
  webhookUrl?: string;
  isActive: boolean;
  cooldown?: number; // 冷却时间（秒），防止重复告警
  createdAt: Date;
  updatedAt: Date;
}

// 告警状态
export type AlertStatus = 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED';

// 告警记录
export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  metric: string;
  value: number;
  threshold: number;
  condition: AlertCondition;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  labels?: Record<string, string>;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  notifiedChannels?: AlertChannel[];
}

// 告警通知
export interface AlertNotification {
  alertId: string;
  channel: AlertChannel;
  recipient: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  sentAt?: Date;
  error?: string;
}

// 系统健康状态
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, {
    status: 'up' | 'down' | 'degraded';
    latency?: number;
    message?: string;
    lastCheck: Date;
  }>;
  uptime: number;
  version: string;
}

// 监控仪表板配置
export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  panels: DashboardPanel[];
  refreshInterval?: number;
  timeRange?: TimeRange;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// 仪表板面板
export interface DashboardPanel {
  id: string;
  title: string;
  type: 'chart' | 'stat' | 'table' | 'gauge' | 'heatmap';
  metrics: MetricQuery[];
  position: { x: number; y: number; w: number; h: number };
  options?: Record<string, any>;
}

// 监控服务接口
export interface IMonitoringService {
  // 指标记录
  recordMetric(metric: MetricData): void;
  recordCounter(name: string, value?: number, labels?: Record<string, string>): void;
  recordGauge(name: string, value: number, labels?: Record<string, string>): void;
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void;
  
  // 指标查询
  getMetrics(query: MetricQuery): Promise<MetricResult>;
  getLatestValue(name: string, labels?: Record<string, string>): Promise<number | null>;
  getPercentiles(name: string, timeRange: TimeRange, percentiles?: number[]): Promise<PercentileResult>;
  
  // 告警管理
  createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlertRule>;
  updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule>;
  deleteAlertRule(id: string): Promise<void>;
  getAlertRules(): Promise<AlertRule[]>;
  
  // 告警检查
  checkAlerts(): Promise<Alert[]>;
  acknowledgeAlert(alertId: string, userId: string): Promise<void>;
  resolveAlert(alertId: string): Promise<void>;
  getActiveAlerts(): Promise<Alert[]>;
  getAlertHistory(timeRange: TimeRange): Promise<Alert[]>;
  
  // 健康检查
  getHealthStatus(): Promise<HealthStatus>;
}

// 预定义指标
export const PREDEFINED_METRICS: MetricDefinition[] = [
  // HTTP 指标
  { name: 'http_requests_total', type: 'counter', description: 'Total HTTP requests', labels: ['method', 'path', 'status'] },
  { name: 'http_request_duration_seconds', type: 'histogram', description: 'HTTP request duration', labels: ['method', 'path'], buckets: [0.01, 0.05, 0.1, 0.5, 1, 5] },
  { name: 'http_request_size_bytes', type: 'histogram', description: 'HTTP request size', labels: ['method', 'path'] },
  { name: 'http_response_size_bytes', type: 'histogram', description: 'HTTP response size', labels: ['method', 'path'] },
  
  // 数据库指标
  { name: 'db_queries_total', type: 'counter', description: 'Total database queries', labels: ['operation', 'table'] },
  { name: 'db_query_duration_seconds', type: 'histogram', description: 'Database query duration', labels: ['operation', 'table'] },
  { name: 'db_connections_active', type: 'gauge', description: 'Active database connections' },
  { name: 'db_connections_idle', type: 'gauge', description: 'Idle database connections' },
  
  // 缓存指标
  { name: 'cache_hits_total', type: 'counter', description: 'Cache hits', labels: ['cache'] },
  { name: 'cache_misses_total', type: 'counter', description: 'Cache misses', labels: ['cache'] },
  { name: 'cache_size_bytes', type: 'gauge', description: 'Cache size in bytes', labels: ['cache'] },
  
  // 队列指标
  { name: 'queue_jobs_total', type: 'counter', description: 'Total queue jobs', labels: ['queue', 'status'] },
  { name: 'queue_job_duration_seconds', type: 'histogram', description: 'Queue job duration', labels: ['queue'] },
  { name: 'queue_size', type: 'gauge', description: 'Queue size', labels: ['queue'] },
  
  // 系统指标
  { name: 'process_cpu_usage', type: 'gauge', description: 'Process CPU usage' },
  { name: 'process_memory_usage_bytes', type: 'gauge', description: 'Process memory usage' },
  { name: 'process_uptime_seconds', type: 'gauge', description: 'Process uptime' },
  
  // 业务指标
  { name: 'active_users', type: 'gauge', description: 'Active users' },
  { name: 'payments_total', type: 'counter', description: 'Total payments', labels: ['provider', 'status'] },
  { name: 'payment_amount_total', type: 'counter', description: 'Total payment amount', labels: ['provider'] },
];

export default {
  PREDEFINED_METRICS,
};

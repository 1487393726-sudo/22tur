/**
 * Queue Service Types
 * 消息队列服务类型定义
 */

// 任务状态
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'delayed' | 'paused';

// 任务优先级
export type JobPriority = 'low' | 'normal' | 'high' | 'critical';

// 任务类型
export type JobType = 
  | 'email'           // 邮件发送
  | 'sms'             // 短信发送
  | 'notification'    // 通知推送
  | 'file-process'    // 文件处理
  | 'report'          // 报表生成
  | 'backup'          // 数据备份
  | 'sync'            // 数据同步
  | 'cleanup'         // 清理任务
  | 'custom';         // 自定义任务

// 任务数据基础接口
export interface JobData {
  [key: string]: unknown;
}

// 邮件任务数据
export interface EmailJobData extends JobData {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

// 短信任务数据
export interface SMSJobData extends JobData {
  phoneNumber: string;
  templateCode: string;
  templateParams: Record<string, string>;
}

// 通知任务数据
export interface NotificationJobData extends JobData {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  link?: string;
}

// 文件处理任务数据
export interface FileProcessJobData extends JobData {
  fileKey: string;
  operation: 'compress' | 'resize' | 'convert' | 'thumbnail';
  options?: Record<string, unknown>;
  outputKey?: string;
}

// 报表生成任务数据
export interface ReportJobData extends JobData {
  reportType: string;
  parameters: Record<string, unknown>;
  format: 'pdf' | 'excel' | 'csv';
  userId: string;
}

// 任务选项
export interface JobOptions {
  priority?: JobPriority;
  delay?: number;           // 延迟执行（毫秒）
  attempts?: number;        // 最大重试次数
  backoff?: BackoffOptions; // 重试退避策略
  timeout?: number;         // 超时时间（毫秒）
  removeOnComplete?: boolean | number; // 完成后删除
  removeOnFail?: boolean | number;     // 失败后删除
}

// 退避策略选项
export interface BackoffOptions {
  type: 'fixed' | 'exponential';
  delay: number;      // 基础延迟（毫秒）
  maxDelay?: number;  // 最大延迟（毫秒）
}

// 任务接口
export interface Job<T extends JobData = JobData> {
  id: string;
  name: string;
  type: JobType;
  data: T;
  status: JobStatus;
  priority: JobPriority;
  attempts: number;
  maxAttempts: number;
  progress: number;
  delay?: number;
  timeout?: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  result?: unknown;
}

// 任务结果
export interface JobResult<T = unknown> {
  jobId: string;
  status: JobStatus;
  progress: number;
  result?: T;
  error?: string;
  attempts: number;
  createdAt: Date;
  completedAt?: Date;
  processingTime?: number; // 处理时间（毫秒）
}

// 队列统计
export interface QueueStats {
  name: string;
  waiting: number;      // 等待中
  active: number;       // 处理中
  completed: number;    // 已完成
  failed: number;       // 已失败
  delayed: number;      // 延迟中
  paused: boolean;      // 是否暂停
  throughput: {
    perMinute: number;
    perHour: number;
  };
  latency: {
    average: number;    // 平均延迟（毫秒）
    p50: number;
    p95: number;
    p99: number;
  };
}

// 队列配置
export interface QueueConfig {
  name: string;
  redis: RedisConfig;
  defaultJobOptions?: JobOptions;
  limiter?: RateLimiterConfig;
  settings?: QueueSettings;
}

// Redis 配置
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  tls?: boolean;
  maxRetriesPerRequest?: number;
  connectTimeout?: number;
}

// 速率限制配置
export interface RateLimiterConfig {
  max: number;          // 最大任务数
  duration: number;     // 时间窗口（毫秒）
  bounceBack?: boolean; // 是否将超限任务放回队列
}

// 队列设置
export interface QueueSettings {
  lockDuration?: number;      // 锁定时间（毫秒）
  stalledInterval?: number;   // 检查停滞任务间隔
  maxStalledCount?: number;   // 最大停滞次数
  guardInterval?: number;     // 守护间隔
  retryProcessDelay?: number; // 重试处理延迟
}

// 任务处理器
export type JobProcessor<T extends JobData = JobData, R = unknown> = (
  job: Job<T>,
  progress: (value: number) => void
) => Promise<R>;

// 任务处理器注册信息
export interface ProcessorRegistration<T extends JobData = JobData, R = unknown> {
  name: string;
  type: JobType;
  processor: JobProcessor<T, R>;
  concurrency?: number;
}

// 队列事件类型
export type QueueEventType = 
  | 'waiting'
  | 'active'
  | 'completed'
  | 'failed'
  | 'progress'
  | 'stalled'
  | 'paused'
  | 'resumed'
  | 'cleaned'
  | 'drained';

// 队列事件监听器
export type QueueEventListener = (event: QueueEvent) => void;

// 队列事件
export interface QueueEvent {
  type: QueueEventType;
  jobId?: string;
  data?: unknown;
  timestamp: Date;
}

// 告警配置
export interface AlertConfig {
  queueThreshold: number;     // 队列积压阈值
  failureRateThreshold: number; // 失败率阈值（百分比）
  latencyThreshold: number;   // 延迟阈值（毫秒）
  channels: AlertChannel[];
}

// 告警渠道
export interface AlertChannel {
  type: 'email' | 'sms' | 'webhook';
  target: string;
}

// 告警信息
export interface Alert {
  id: string;
  type: 'queue_threshold' | 'failure_rate' | 'latency';
  message: string;
  severity: 'warning' | 'critical';
  queueName: string;
  value: number;
  threshold: number;
  createdAt: Date;
}

// 队列服务接口
export interface IQueueService {
  // 任务管理
  addJob<T extends JobData>(
    type: JobType,
    name: string,
    data: T,
    options?: JobOptions
  ): Promise<string>;
  
  getJob(jobId: string): Promise<JobResult | null>;
  
  removeJob(jobId: string): Promise<boolean>;
  
  retryJob(jobId: string): Promise<boolean>;
  
  // 批量操作
  addBulkJobs<T extends JobData>(
    jobs: Array<{ type: JobType; name: string; data: T; options?: JobOptions }>
  ): Promise<string[]>;
  
  // 队列管理
  getQueueStats(queueName?: string): Promise<QueueStats>;
  
  pauseQueue(queueName: string): Promise<void>;
  
  resumeQueue(queueName: string): Promise<void>;
  
  cleanQueue(
    queueName: string,
    status: 'completed' | 'failed',
    olderThan?: number
  ): Promise<number>;
  
  // 处理器注册
  registerProcessor<T extends JobData, R>(
    registration: ProcessorRegistration<T, R>
  ): void;
  
  // 事件监听
  on(event: QueueEventType, listener: QueueEventListener): void;
  
  off(event: QueueEventType, listener: QueueEventListener): void;
  
  // 告警
  checkAlerts(): Promise<Alert[]>;
  
  // 连接管理
  connect(): Promise<void>;
  
  disconnect(): Promise<void>;
  
  isConnected(): boolean;
}

// 默认配置
export const DEFAULT_JOB_OPTIONS: JobOptions = {
  priority: 'normal',
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
    maxDelay: 30000,
  },
  timeout: 30000,
  removeOnComplete: 100,
  removeOnFail: 500,
};

export const DEFAULT_QUEUE_CONFIG: Partial<QueueConfig> = {
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
  settings: {
    lockDuration: 30000,
    stalledInterval: 30000,
    maxStalledCount: 3,
  },
};

// 优先级数值映射
export const PRIORITY_VALUES: Record<JobPriority, number> = {
  low: 10,
  normal: 5,
  high: 2,
  critical: 1,
};

// 队列阈值告警默认值
export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  queueThreshold: 1000,
  failureRateThreshold: 5,
  latencyThreshold: 60000,
  channels: [],
};

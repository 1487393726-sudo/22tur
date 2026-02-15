/**
 * Logging Service Types
 * 日志服务类型定义
 */

// 日志级别
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 日志级别优先级
export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// 日志来源类型
export type LogSource = 
  | 'api'           // API 请求
  | 'auth'          // 认证相关
  | 'database'      // 数据库操作
  | 'queue'         // 队列处理
  | 'storage'       // 存储操作
  | 'payment'       // 支付相关
  | 'websocket'     // WebSocket
  | 'scheduler'     // 定时任务
  | 'system'        // 系统级别
  | 'custom';       // 自定义

// 日志条目
export interface LogEntry {
  id?: string;
  level: LogLevel;
  message: string;
  source: LogSource | string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  stackTrace?: string;
  userId?: string;
  requestId?: string;
  duration?: number;      // 操作耗时（毫秒）
  tags?: string[];
}

// 日志查询参数
export interface LogQuery {
  level?: LogLevel[];
  source?: string | string[];
  timeRange: {
    start: Date;
    end: Date;
  };
  search?: string;
  userId?: string;
  requestId?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: 'timestamp' | 'level';
  sortOrder?: 'asc' | 'desc';
}

// 日志查询结果
export interface LogQueryResult {
  logs: LogEntry[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 日志统计
export interface LogStats {
  totalCount: number;
  byLevel: Record<LogLevel, number>;
  bySource: Record<string, number>;
  errorRate: number;
  timeRange: {
    start: Date;
    end: Date;
  };
}

// 日志导出格式
export type ExportFormat = 'json' | 'csv';

// 日志导出选项
export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeStackTrace?: boolean;
  maxRecords?: number;
}

// 日志传输配置
export interface TransportConfig {
  type: 'console' | 'file' | 'elasticsearch' | 'database';
  enabled: boolean;
  options?: Record<string, unknown>;
}

// 文件传输配置
export interface FileTransportConfig extends TransportConfig {
  type: 'file';
  options: {
    filename: string;
    maxSize?: string;       // 如 '10m'
    maxFiles?: number;
    compress?: boolean;
  };
}

// Elasticsearch 传输配置
export interface ElasticsearchTransportConfig extends TransportConfig {
  type: 'elasticsearch';
  options: {
    node: string;
    index: string;
    auth?: {
      username: string;
      password: string;
    };
  };
}

// 日志服务配置
export interface LoggingConfig {
  level: LogLevel;
  transports: TransportConfig[];
  retention: RetentionConfig;
  format?: LogFormat;
}

// 日志保留配置
export interface RetentionConfig {
  maxAge: number;           // 最大保留天数
  maxSize?: number;         // 最大存储大小（字节）
  archiveEnabled?: boolean; // 是否启用归档
  archivePath?: string;     // 归档路径
}

// 日志格式配置
export interface LogFormat {
  timestamp?: string;       // 时间戳格式
  includeSource?: boolean;
  includeLevel?: boolean;
  colorize?: boolean;
}

// 堆栈跟踪信息
export interface StackTraceInfo {
  message: string;
  stack: string[];
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  functionName?: string;
}

// 日志服务接口
export interface ILoggingService {
  // 日志记录
  log(entry: Omit<LogEntry, 'id' | 'timestamp'>): void;
  debug(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void;
  
  // 日志查询
  query(query: LogQuery): Promise<LogQueryResult>;
  
  // 日志导出
  export(query: LogQuery, options: ExportOptions): Promise<Buffer>;
  
  // 统计
  getStats(timeRange: { start: Date; end: Date }): Promise<LogStats>;
  
  // 日志清理
  cleanup(olderThan: Date): Promise<number>;
  archive(olderThan: Date): Promise<string>;
  
  // 配置
  setLevel(level: LogLevel): void;
  getConfig(): LoggingConfig;
}

// 默认配置
export const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  level: 'info',
  transports: [
    {
      type: 'console',
      enabled: true,
    },
  ],
  retention: {
    maxAge: 30,
    archiveEnabled: false,
  },
  format: {
    timestamp: 'YYYY-MM-DD HH:mm:ss',
    includeSource: true,
    includeLevel: true,
    colorize: true,
  },
};

// 日志级别颜色（用于控制台输出）
export const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m',  // 青色
  info: '\x1b[32m',   // 绿色
  warn: '\x1b[33m',   // 黄色
  error: '\x1b[31m',  // 红色
};

export const RESET_COLOR = '\x1b[0m';

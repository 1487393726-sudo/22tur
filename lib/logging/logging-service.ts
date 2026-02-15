/**
 * Logging Service
 * 日志服务实现
 */

import {
  ILoggingService,
  LogEntry,
  LogLevel,
  LogQuery,
  LogQueryResult,
  LogStats,
  LoggingConfig,
  ExportOptions,
  StackTraceInfo,
  LOG_LEVEL_PRIORITY,
  LOG_LEVEL_COLORS,
  RESET_COLOR,
  DEFAULT_LOGGING_CONFIG,
} from './types';

/**
 * 解析堆栈跟踪
 */
export function parseStackTrace(error: Error): StackTraceInfo {
  const stack = error.stack || '';
  const lines = stack.split('\n').map(line => line.trim());
  
  // 解析第一行调用信息
  const firstCallLine = lines.find(line => line.startsWith('at '));
  let fileName: string | undefined;
  let lineNumber: number | undefined;
  let columnNumber: number | undefined;
  let functionName: string | undefined;
  
  if (firstCallLine) {
    // 匹配格式: at functionName (fileName:line:column)
    const match = firstCallLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
    if (match) {
      functionName = match[1];
      fileName = match[2];
      lineNumber = parseInt(match[3], 10);
      columnNumber = parseInt(match[4], 10);
    } else {
      // 匹配格式: at fileName:line:column
      const simpleMatch = firstCallLine.match(/at\s+(.+?):(\d+):(\d+)/);
      if (simpleMatch) {
        fileName = simpleMatch[1];
        lineNumber = parseInt(simpleMatch[2], 10);
        columnNumber = parseInt(simpleMatch[3], 10);
      }
    }
  }
  
  return {
    message: error.message,
    stack: lines.filter(line => line.startsWith('at ')),
    fileName,
    lineNumber,
    columnNumber,
    functionName,
  };
}

/**
 * 格式化日志条目为字符串
 */
function formatLogEntry(entry: LogEntry, colorize: boolean = false): string {
  const timestamp = entry.timestamp.toISOString();
  const level = entry.level.toUpperCase().padEnd(5);
  const source = entry.source ? `[${entry.source}]` : '';
  
  let message = `${timestamp} ${level} ${source} ${entry.message}`;
  
  if (colorize) {
    const color = LOG_LEVEL_COLORS[entry.level];
    message = `${timestamp} ${color}${level}${RESET_COLOR} ${source} ${entry.message}`;
  }
  
  if (entry.metadata && Object.keys(entry.metadata).length > 0) {
    message += ` ${JSON.stringify(entry.metadata)}`;
  }
  
  if (entry.stackTrace) {
    message += `\n${entry.stackTrace}`;
  }
  
  return message;
}

/**
 * 内存日志存储（用于开发环境）
 */
class InMemoryLogStore {
  private logs: LogEntry[] = [];
  private maxSize: number = 10000;
  
  add(entry: LogEntry): void {
    this.logs.push(entry);
    
    // 超过最大容量时删除旧日志
    if (this.logs.length > this.maxSize) {
      this.logs = this.logs.slice(-this.maxSize);
    }
  }
  
  query(query: LogQuery): LogQueryResult {
    let filtered = [...this.logs];
    
    // 按时间范围过滤
    filtered = filtered.filter(log => 
      log.timestamp >= query.timeRange.start && 
      log.timestamp <= query.timeRange.end
    );
    
    // 按级别过滤
    if (query.level && query.level.length > 0) {
      filtered = filtered.filter(log => query.level!.includes(log.level));
    }
    
    // 按来源过滤
    if (query.source) {
      const sources = Array.isArray(query.source) ? query.source : [query.source];
      filtered = filtered.filter(log => sources.includes(log.source));
    }
    
    // 按用户 ID 过滤
    if (query.userId) {
      filtered = filtered.filter(log => log.userId === query.userId);
    }
    
    // 按请求 ID 过滤
    if (query.requestId) {
      filtered = filtered.filter(log => log.requestId === query.requestId);
    }
    
    // 按标签过滤
    if (query.tags && query.tags.length > 0) {
      filtered = filtered.filter(log => 
        log.tags && query.tags!.some(tag => log.tags!.includes(tag))
      );
    }
    
    // 全文搜索
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        (log.stackTrace && log.stackTrace.toLowerCase().includes(searchLower)) ||
        (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(searchLower))
      );
    }
    
    // 排序
    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'desc';
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'timestamp') {
        comparison = a.timestamp.getTime() - b.timestamp.getTime();
      } else if (sortBy === 'level') {
        comparison = LOG_LEVEL_PRIORITY[a.level] - LOG_LEVEL_PRIORITY[b.level];
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    // 分页
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);
    
    return {
      logs: paged,
      total: filtered.length,
      page,
      pageSize,
      hasMore: start + pageSize < filtered.length,
    };
  }
  
  getStats(timeRange: { start: Date; end: Date }): LogStats {
    const filtered = this.logs.filter(log => 
      log.timestamp >= timeRange.start && 
      log.timestamp <= timeRange.end
    );
    
    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
    };
    
    const bySource: Record<string, number> = {};
    
    for (const log of filtered) {
      byLevel[log.level]++;
      bySource[log.source] = (bySource[log.source] || 0) + 1;
    }
    
    const errorRate = filtered.length > 0 
      ? (byLevel.error / filtered.length) * 100 
      : 0;
    
    return {
      totalCount: filtered.length,
      byLevel,
      bySource,
      errorRate,
      timeRange,
    };
  }
  
  cleanup(olderThan: Date): number {
    const before = this.logs.length;
    this.logs = this.logs.filter(log => log.timestamp >= olderThan);
    return before - this.logs.length;
  }
  
  getAll(): LogEntry[] {
    return [...this.logs];
  }
}


/**
 * Logging Service Implementation
 * 日志服务实现
 */
export class LoggingService implements ILoggingService {
  private config: LoggingConfig;
  private store: InMemoryLogStore;
  private idCounter: number = 0;
  
  constructor(config?: Partial<LoggingConfig>) {
    this.config = { ...DEFAULT_LOGGING_CONFIG, ...config };
    this.store = new InMemoryLogStore();
  }
  
  private generateId(): string {
    return `log_${Date.now()}_${++this.idCounter}`;
  }
  
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.level];
  }
  
  log(entry: Omit<LogEntry, 'id' | 'timestamp'>): void {
    if (!this.shouldLog(entry.level)) return;
    
    const fullEntry: LogEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };
    
    // 存储日志
    this.store.add(fullEntry);
    
    // 输出到控制台
    if (this.config.transports.some(t => t.type === 'console' && t.enabled)) {
      const formatted = formatLogEntry(fullEntry, this.config.format?.colorize);
      
      switch (entry.level) {
        case 'debug':
          console.debug(formatted);
          break;
        case 'info':
          console.info(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'error':
          console.error(formatted);
          break;
      }
    }
  }
  
  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log({ level: 'debug', message, source: 'system', metadata });
  }
  
  info(message: string, metadata?: Record<string, unknown>): void {
    this.log({ level: 'info', message, source: 'system', metadata });
  }
  
  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log({ level: 'warn', message, source: 'system', metadata });
  }
  
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    const entry: Omit<LogEntry, 'id' | 'timestamp'> = {
      level: 'error',
      message,
      source: 'system',
      metadata,
    };
    
    if (error) {
      const stackInfo = parseStackTrace(error);
      entry.stackTrace = error.stack;
      entry.metadata = {
        ...entry.metadata,
        errorName: error.name,
        errorMessage: error.message,
        fileName: stackInfo.fileName,
        lineNumber: stackInfo.lineNumber,
        functionName: stackInfo.functionName,
      };
    }
    
    this.log(entry);
  }
  
  async query(query: LogQuery): Promise<LogQueryResult> {
    return this.store.query(query);
  }
  
  async export(query: LogQuery, options: ExportOptions): Promise<Buffer> {
    // 获取所有匹配的日志
    const result = await this.query({
      ...query,
      page: 1,
      pageSize: options.maxRecords || 10000,
    });
    
    const logs = result.logs.map(log => {
      const exported: Record<string, unknown> = {
        id: log.id,
        timestamp: log.timestamp.toISOString(),
        level: log.level,
        source: log.source,
        message: log.message,
      };
      
      if (log.userId) exported.userId = log.userId;
      if (log.requestId) exported.requestId = log.requestId;
      if (log.duration) exported.duration = log.duration;
      if (log.tags) exported.tags = log.tags;
      
      if (options.includeMetadata && log.metadata) {
        exported.metadata = log.metadata;
      }
      
      if (options.includeStackTrace && log.stackTrace) {
        exported.stackTrace = log.stackTrace;
      }
      
      return exported;
    });
    
    if (options.format === 'json') {
      return Buffer.from(JSON.stringify(logs, null, 2), 'utf-8');
    }
    
    // CSV 格式
    if (logs.length === 0) {
      return Buffer.from('', 'utf-8');
    }
    
    const headers = Object.keys(logs[0]);
    const csvLines = [
      headers.join(','),
      ...logs.map(log => 
        headers.map(h => {
          const value = log[h];
          if (value === undefined || value === null) return '';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        }).join(',')
      ),
    ];
    
    return Buffer.from(csvLines.join('\n'), 'utf-8');
  }
  
  async getStats(timeRange: { start: Date; end: Date }): Promise<LogStats> {
    return this.store.getStats(timeRange);
  }
  
  async cleanup(olderThan: Date): Promise<number> {
    return this.store.cleanup(olderThan);
  }
  
  async archive(olderThan: Date): Promise<string> {
    // 获取要归档的日志
    const logs = this.store.getAll().filter(log => log.timestamp < olderThan);
    
    if (logs.length === 0) {
      return '';
    }
    
    // 生成归档文件名
    const archiveFileName = `logs_archive_${olderThan.toISOString().split('T')[0]}.json`;
    
    // 在实际实现中，这里会将日志写入文件或云存储
    // 这里只是模拟返回归档文件名
    
    // 清理已归档的日志
    this.store.cleanup(olderThan);
    
    return archiveFileName;
  }
  
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }
  
  getConfig(): LoggingConfig {
    return { ...this.config };
  }
}

// 日志服务单例
let loggingServiceInstance: LoggingService | null = null;

export function getLoggingService(config?: Partial<LoggingConfig>): LoggingService {
  if (!loggingServiceInstance) {
    loggingServiceInstance = new LoggingService(config);
  }
  return loggingServiceInstance;
}

export function resetLoggingService(): void {
  loggingServiceInstance = null;
}

// 便捷日志函数
export const logger = {
  debug: (message: string, metadata?: Record<string, unknown>) => 
    getLoggingService().debug(message, metadata),
  info: (message: string, metadata?: Record<string, unknown>) => 
    getLoggingService().info(message, metadata),
  warn: (message: string, metadata?: Record<string, unknown>) => 
    getLoggingService().warn(message, metadata),
  error: (message: string, error?: Error, metadata?: Record<string, unknown>) => 
    getLoggingService().error(message, error, metadata),
};

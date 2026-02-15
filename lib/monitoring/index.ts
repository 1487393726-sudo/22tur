// 监控模块导出
export * from './types';
export { monitoringService } from './monitoring-service';
export { alertEngine } from './alert-engine';
export { alertNotifier } from './alert-notifier';

// 便捷方法
import { monitoringService } from './monitoring-service';

// 记录 HTTP 请求
export function recordHttpRequest(
  method: string,
  path: string,
  status: number,
  duration: number
): void {
  monitoringService.recordCounter('http_requests_total', 1, { method, path, status: status.toString() });
  monitoringService.recordHistogram('http_request_duration_seconds', duration / 1000, { method, path });
  
  if (status >= 400) {
    monitoringService.recordCounter('http_errors_total', 1, { method, path, status: status.toString() });
  }
}

// 记录数据库查询
export function recordDbQuery(
  operation: string,
  table: string,
  duration: number
): void {
  monitoringService.recordCounter('db_queries_total', 1, { operation, table });
  monitoringService.recordHistogram('db_query_duration_seconds', duration / 1000, { operation, table });
}

// 记录缓存操作
export function recordCacheOperation(
  cache: string,
  hit: boolean
): void {
  if (hit) {
    monitoringService.recordCounter('cache_hits_total', 1, { cache });
  } else {
    monitoringService.recordCounter('cache_misses_total', 1, { cache });
  }
}

// 记录队列操作
export function recordQueueJob(
  queue: string,
  status: 'added' | 'completed' | 'failed',
  duration?: number
): void {
  monitoringService.recordCounter('queue_jobs_total', 1, { queue, status });
  
  if (duration !== undefined) {
    monitoringService.recordHistogram('queue_job_duration_seconds', duration / 1000, { queue });
  }
}

// 记录业务指标
export function recordBusinessMetric(
  name: string,
  value: number,
  labels?: Record<string, string>
): void {
  monitoringService.recordGauge(name, value, labels);
}

export default {
  monitoringService,
  recordHttpRequest,
  recordDbQuery,
  recordCacheOperation,
  recordQueueJob,
  recordBusinessMetric,
};

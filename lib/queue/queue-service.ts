/**
 * Queue Service
 * 基于 Bull 的消息队列服务实现
 */

import {
  IQueueService,
  Job,
  JobData,
  JobOptions,
  JobResult,
  JobStatus,
  JobType,
  JobPriority,
  QueueConfig,
  QueueStats,
  QueueEvent,
  QueueEventType,
  QueueEventListener,
  ProcessorRegistration,
  Alert,
  AlertConfig,
  DEFAULT_JOB_OPTIONS,
  DEFAULT_ALERT_CONFIG,
  PRIORITY_VALUES,
} from './types';

// 内存队列实现（用于开发环境或无 Redis 时）
interface InMemoryJob<T extends JobData = JobData> extends Job<T> {
  processAt?: Date;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
    maxDelay?: number;
  };
}

class InMemoryQueue {
  private jobs: Map<string, InMemoryJob> = new Map();
  private processors: Map<string, ProcessorRegistration> = new Map();
  private eventListeners: Map<QueueEventType, Set<QueueEventListener>> = new Map();
  private paused: boolean = false;
  private processing: boolean = false;
  private completedCount: number = 0;
  private failedCount: number = 0;
  private processingTimes: number[] = [];
  private delayCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private config: QueueConfig) {
    // 定期检查延迟任务
    this.delayCheckInterval = setInterval(() => {
      this.checkDelayedJobs();
    }, 100);
  }

  destroy(): void {
    if (this.delayCheckInterval) {
      clearInterval(this.delayCheckInterval);
      this.delayCheckInterval = null;
    }
  }

  private checkDelayedJobs(): void {
    if (this.paused) return;
    
    const now = new Date();
    let hasReadyJobs = false;
    
    for (const job of this.jobs.values()) {
      if (job.status === 'delayed' && job.processAt && job.processAt <= now) {
        job.status = 'pending';
        job.processAt = undefined;
        hasReadyJobs = true;
      }
    }
    
    if (hasReadyJobs && !this.processing) {
      this.processNext();
    }
  }

  async addJob<T extends JobData>(
    type: JobType,
    name: string,
    data: T,
    options: JobOptions = {}
  ): Promise<string> {
    const mergedOptions = { ...DEFAULT_JOB_OPTIONS, ...options };
    const id = this.generateId();
    const now = new Date();
    
    const job: InMemoryJob<T> = {
      id,
      name,
      type,
      data,
      status: mergedOptions.delay ? 'delayed' : 'pending',
      priority: mergedOptions.priority || 'normal',
      attempts: 0,
      maxAttempts: mergedOptions.attempts || 3,
      progress: 0,
      delay: mergedOptions.delay,
      timeout: mergedOptions.timeout,
      createdAt: now,
      processAt: mergedOptions.delay 
        ? new Date(now.getTime() + mergedOptions.delay) 
        : undefined,
      backoff: mergedOptions.backoff,
    };

    this.jobs.set(id, job as InMemoryJob);
    this.emit('waiting', { jobId: id });
    
    // 触发处理
    if (!this.paused) {
      this.processNext();
    }

    return id;
  }

  async getJob(jobId: string): Promise<JobResult | null> {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    return {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
      attempts: job.attempts,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      processingTime: job.completedAt && job.startedAt
        ? job.completedAt.getTime() - job.startedAt.getTime()
        : undefined,
    };
  }

  async removeJob(jobId: string): Promise<boolean> {
    return this.jobs.delete(jobId);
  }

  async retryJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'failed') return false;

    job.status = 'pending';
    job.error = undefined;
    job.failedAt = undefined;
    this.emit('waiting', { jobId });
    
    if (!this.paused) {
      this.processNext();
    }
    
    return true;
  }

  registerProcessor<T extends JobData, R>(
    registration: ProcessorRegistration<T, R>
  ): void {
    this.processors.set(registration.name, registration as ProcessorRegistration);
  }

  async getStats(): Promise<QueueStats> {
    const jobs = Array.from(this.jobs.values());
    const waiting = jobs.filter(j => j.status === 'pending').length;
    const active = jobs.filter(j => j.status === 'processing').length;
    const delayed = jobs.filter(j => j.status === 'delayed').length;

    // 计算吞吐量
    const now = Date.now();
    const recentTimes = this.processingTimes.filter(t => now - t < 3600000);
    const lastMinuteTimes = recentTimes.filter(t => now - t < 60000);

    // 计算延迟百分位
    const sortedTimes = [...this.processingTimes].sort((a, b) => a - b);
    const getPercentile = (p: number) => {
      if (sortedTimes.length === 0) return 0;
      const index = Math.ceil((p / 100) * sortedTimes.length) - 1;
      return sortedTimes[Math.max(0, index)] || 0;
    };

    return {
      name: this.config.name,
      waiting,
      active,
      completed: this.completedCount,
      failed: this.failedCount,
      delayed,
      paused: this.paused,
      throughput: {
        perMinute: lastMinuteTimes.length,
        perHour: recentTimes.length,
      },
      latency: {
        average: sortedTimes.length > 0 
          ? sortedTimes.reduce((a, b) => a + b, 0) / sortedTimes.length 
          : 0,
        p50: getPercentile(50),
        p95: getPercentile(95),
        p99: getPercentile(99),
      },
    };
  }

  async pause(): Promise<void> {
    this.paused = true;
    this.emit('paused', {});
  }

  async resume(): Promise<void> {
    this.paused = false;
    this.emit('resumed', {});
    this.processNext();
  }

  async clean(status: 'completed' | 'failed', olderThan?: number): Promise<number> {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, job] of this.jobs.entries()) {
      if (job.status === status) {
        const jobTime = job.completedAt || job.failedAt || job.createdAt;
        if (!olderThan || (now - jobTime.getTime() > olderThan)) {
          this.jobs.delete(id);
          cleaned++;
        }
      }
    }

    this.emit('cleaned', { data: { count: cleaned, status } });
    return cleaned;
  }

  on(event: QueueEventType, listener: QueueEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off(event: QueueEventType, listener: QueueEventListener): void {
    this.eventListeners.get(event)?.delete(listener);
  }

  private emit(type: QueueEventType, data: Partial<QueueEvent>): void {
    const event: QueueEvent = {
      type,
      timestamp: new Date(),
      ...data,
    };
    this.eventListeners.get(type)?.forEach(listener => listener(event));
  }

  private generateId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async processNext(): Promise<void> {
    if (this.processing || this.paused) return;

    // 获取下一个待处理任务（按优先级排序）
    const pendingJobs = Array.from(this.jobs.values())
      .filter(j => j.status === 'pending')
      .sort((a, b) => PRIORITY_VALUES[a.priority] - PRIORITY_VALUES[b.priority]);

    if (pendingJobs.length === 0) {
      this.emit('drained', {});
      return;
    }

    const job = pendingJobs[0];
    const processor = this.processors.get(job.name);

    if (!processor) {
      console.warn(`No processor registered for job: ${job.name}`);
      return;
    }

    this.processing = true;
    job.status = 'processing';
    job.startedAt = new Date();
    job.attempts++;
    this.emit('active', { jobId: job.id });

    try {
      const result = await Promise.race([
        processor.processor(job as Job, (progress) => {
          job.progress = progress;
          this.emit('progress', { jobId: job.id, data: { progress } });
        }),
        job.timeout 
          ? new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Job timeout')), job.timeout)
            )
          : Promise.resolve(),
      ]);

      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;
      job.progress = 100;
      this.completedCount++;
      
      const processingTime = job.completedAt.getTime() - job.startedAt.getTime();
      this.processingTimes.push(processingTime);
      
      // 保留最近 1000 条处理时间记录
      if (this.processingTimes.length > 1000) {
        this.processingTimes = this.processingTimes.slice(-1000);
      }

      this.emit('completed', { jobId: job.id, data: { result } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (job.attempts < job.maxAttempts) {
        // 重试 - 使用任务自己的 backoff 配置
        const backoff = job.backoff || DEFAULT_JOB_OPTIONS.backoff!;
        const delay = backoff.type === 'exponential'
          ? Math.min(backoff.delay * Math.pow(2, job.attempts - 1), backoff.maxDelay || 30000)
          : backoff.delay;
        
        job.status = 'delayed';
        job.processAt = new Date(Date.now() + delay);
        job.error = errorMessage;
        this.emit('stalled', { jobId: job.id });
      } else {
        job.status = 'failed';
        job.failedAt = new Date();
        job.error = errorMessage;
        this.failedCount++;
        this.emit('failed', { jobId: job.id, data: { error: errorMessage } });
      }
    } finally {
      this.processing = false;
      // 继续处理下一个任务
      setTimeout(() => this.processNext(), 0);
    }
  }
}


/**
 * Queue Service Implementation
 * 队列服务实现
 */
export class QueueService implements IQueueService {
  private queues: Map<string, InMemoryQueue> = new Map();
  private defaultQueue: InMemoryQueue;
  private alertConfig: AlertConfig = DEFAULT_ALERT_CONFIG;
  private connected: boolean = false;

  constructor(private config: QueueConfig) {
    this.defaultQueue = new InMemoryQueue(config);
    this.queues.set(config.name, this.defaultQueue);
  }

  async connect(): Promise<void> {
    // 内存队列无需连接
    this.connected = true;
    console.log(`Queue service connected: ${this.config.name}`);
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    console.log(`Queue service disconnected: ${this.config.name}`);
  }

  isConnected(): boolean {
    return this.connected;
  }

  async addJob<T extends JobData>(
    type: JobType,
    name: string,
    data: T,
    options?: JobOptions
  ): Promise<string> {
    return this.defaultQueue.addJob(type, name, data, options);
  }

  async getJob(jobId: string): Promise<JobResult | null> {
    // 在所有队列中查找
    for (const queue of this.queues.values()) {
      const result = await queue.getJob(jobId);
      if (result) return result;
    }
    return null;
  }

  async removeJob(jobId: string): Promise<boolean> {
    for (const queue of this.queues.values()) {
      if (await queue.removeJob(jobId)) return true;
    }
    return false;
  }

  async retryJob(jobId: string): Promise<boolean> {
    for (const queue of this.queues.values()) {
      if (await queue.retryJob(jobId)) return true;
    }
    return false;
  }

  async addBulkJobs<T extends JobData>(
    jobs: Array<{ type: JobType; name: string; data: T; options?: JobOptions }>
  ): Promise<string[]> {
    const ids: string[] = [];
    for (const job of jobs) {
      const id = await this.addJob(job.type, job.name, job.data, job.options);
      ids.push(id);
    }
    return ids;
  }

  async getQueueStats(queueName?: string): Promise<QueueStats> {
    const queue = queueName 
      ? this.queues.get(queueName) 
      : this.defaultQueue;
    
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    return queue.getStats();
  }

  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }
    await queue.pause();
  }

  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }
    await queue.resume();
  }

  async cleanQueue(
    queueName: string,
    status: 'completed' | 'failed',
    olderThan?: number
  ): Promise<number> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }
    return queue.clean(status, olderThan);
  }

  registerProcessor<T extends JobData, R>(
    registration: ProcessorRegistration<T, R>
  ): void {
    this.defaultQueue.registerProcessor(registration);
  }

  on(event: QueueEventType, listener: QueueEventListener): void {
    this.defaultQueue.on(event, listener);
  }

  off(event: QueueEventType, listener: QueueEventListener): void {
    this.defaultQueue.off(event, listener);
  }

  setAlertConfig(config: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
  }

  async checkAlerts(): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const stats = await this.getQueueStats();

    // 检查队列积压
    if (stats.waiting > this.alertConfig.queueThreshold) {
      alerts.push({
        id: `alert_${Date.now()}_queue`,
        type: 'queue_threshold',
        message: `Queue ${stats.name} has ${stats.waiting} pending jobs (threshold: ${this.alertConfig.queueThreshold})`,
        severity: stats.waiting > this.alertConfig.queueThreshold * 2 ? 'critical' : 'warning',
        queueName: stats.name,
        value: stats.waiting,
        threshold: this.alertConfig.queueThreshold,
        createdAt: new Date(),
      });
    }

    // 检查失败率
    const total = stats.completed + stats.failed;
    if (total > 0) {
      const failureRate = (stats.failed / total) * 100;
      if (failureRate > this.alertConfig.failureRateThreshold) {
        alerts.push({
          id: `alert_${Date.now()}_failure`,
          type: 'failure_rate',
          message: `Queue ${stats.name} failure rate is ${failureRate.toFixed(2)}% (threshold: ${this.alertConfig.failureRateThreshold}%)`,
          severity: failureRate > this.alertConfig.failureRateThreshold * 2 ? 'critical' : 'warning',
          queueName: stats.name,
          value: failureRate,
          threshold: this.alertConfig.failureRateThreshold,
          createdAt: new Date(),
        });
      }
    }

    // 检查延迟
    if (stats.latency.p95 > this.alertConfig.latencyThreshold) {
      alerts.push({
        id: `alert_${Date.now()}_latency`,
        type: 'latency',
        message: `Queue ${stats.name} P95 latency is ${stats.latency.p95}ms (threshold: ${this.alertConfig.latencyThreshold}ms)`,
        severity: stats.latency.p95 > this.alertConfig.latencyThreshold * 2 ? 'critical' : 'warning',
        queueName: stats.name,
        value: stats.latency.p95,
        threshold: this.alertConfig.latencyThreshold,
        createdAt: new Date(),
      });
    }

    return alerts;
  }
}

// 队列服务单例
let queueServiceInstance: QueueService | null = null;

export function getQueueService(config?: QueueConfig): QueueService {
  if (!queueServiceInstance) {
    const defaultConfig: QueueConfig = config || {
      name: 'default',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
      },
    };
    queueServiceInstance = new QueueService(defaultConfig);
  }
  return queueServiceInstance;
}

export function resetQueueService(): void {
  queueServiceInstance = null;
}

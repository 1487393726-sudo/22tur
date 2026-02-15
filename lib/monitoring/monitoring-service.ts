// 监控服务实现
import { prisma } from '@/lib/prisma';
import {
  MetricData,
  MetricQuery,
  MetricResult,
  PercentileResult,
  AlertRule,
  Alert,
  AlertStatus,
  HealthStatus,
  TimeRange,
  IMonitoringService,
} from './types';

// 内存中的指标缓存
const metricsCache: Map<string, MetricData[]> = new Map();
const CACHE_MAX_SIZE = 10000;
const CACHE_RETENTION_MS = 24 * 60 * 60 * 1000; // 24小时

// 告警去重缓存
const alertDeduplicationCache: Map<string, number> = new Map();
const DEFAULT_COOLDOWN = 15 * 60 * 1000; // 15分钟

class MonitoringService implements IMonitoringService {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    // 定期清理过期数据
    setInterval(() => this.cleanupCache(), 60 * 1000);
  }

  // 记录指标
  recordMetric(metric: MetricData): void {
    const key = this.getMetricKey(metric.name, metric.labels);
    const data = metricsCache.get(key) || [];
    
    data.push({
      ...metric,
      timestamp: metric.timestamp || new Date(),
    });

    // 限制缓存大小
    if (data.length > CACHE_MAX_SIZE) {
      data.shift();
    }

    metricsCache.set(key, data);

    // 异步持久化到数据库
    this.persistMetric(metric).catch(console.error);
  }

  // 记录计数器
  recordCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    this.recordMetric({ name, value, labels });
  }

  // 记录仪表盘
  recordGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric({ name, value, labels });
  }

  // 记录直方图
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric({ name, value, labels });
  }

  // 查询指标
  async getMetrics(query: MetricQuery): Promise<MetricResult> {
    const { name, labels, timeRange, aggregation, interval } = query;
    
    // 先从缓存查询
    const key = this.getMetricKey(name, labels);
    const cachedData = metricsCache.get(key) || [];
    
    // 过滤时间范围
    const filteredData = cachedData.filter(m => {
      const ts = m.timestamp?.getTime() || 0;
      return ts >= timeRange.start.getTime() && ts <= timeRange.end.getTime();
    });

    // 如果缓存数据不足，从数据库查询
    if (filteredData.length === 0) {
      const dbData = await this.queryMetricsFromDB(name, labels, timeRange);
      return {
        name,
        labels,
        values: dbData.map(d => ({ timestamp: d.timestamp, value: d.value })),
      };
    }

    // 聚合数据
    if (interval && aggregation) {
      return this.aggregateMetrics(name, labels, filteredData, interval, aggregation);
    }

    return {
      name,
      labels,
      values: filteredData.map(d => ({ timestamp: d.timestamp!, value: d.value })),
    };
  }

  // 获取最新值
  async getLatestValue(name: string, labels?: Record<string, string>): Promise<number | null> {
    const key = this.getMetricKey(name, labels);
    const data = metricsCache.get(key);
    
    if (data && data.length > 0) {
      return data[data.length - 1].value;
    }

    // 从数据库查询
    const record = await prisma.metricRecord?.findFirst({
      where: {
        name,
        ...(labels ? { labels: JSON.stringify(labels) } : {}),
      },
      orderBy: { timestamp: 'desc' },
    });

    return record?.value ?? null;
  }

  // 计算百分位数
  async getPercentiles(
    name: string,
    timeRange: TimeRange,
    percentiles: number[] = [50, 75, 90, 95, 99]
  ): Promise<PercentileResult> {
    const result = await this.getMetrics({
      name,
      timeRange,
    });

    const values = result.values.map(v => v.value).sort((a, b) => a - b);
    
    if (values.length === 0) {
      return { p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 };
    }

    const getPercentile = (p: number): number => {
      const index = Math.ceil((p / 100) * values.length) - 1;
      return values[Math.max(0, index)];
    };

    return {
      p50: getPercentile(50),
      p75: getPercentile(75),
      p90: getPercentile(90),
      p95: getPercentile(95),
      p99: getPercentile(99),
    };
  }

  // 创建告警规则
  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlertRule> {
    const created = await prisma.alertRule.create({
      data: {
        name: rule.name,
        metric: rule.metric,
        condition: rule.condition,
        threshold: rule.threshold,
        duration: rule.duration || 0,
        severity: rule.severity,
        channels: JSON.stringify(rule.channels),
        isActive: rule.isActive,
      },
    });

    return {
      ...rule,
      id: created.id,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  // 更新告警规则
  async updateAlertRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule> {
    const updated = await prisma.alertRule.update({
      where: { id },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.metric && { metric: updates.metric }),
        ...(updates.condition && { condition: updates.condition }),
        ...(updates.threshold !== undefined && { threshold: updates.threshold }),
        ...(updates.duration !== undefined && { duration: updates.duration }),
        ...(updates.severity && { severity: updates.severity }),
        ...(updates.channels && { channels: JSON.stringify(updates.channels) }),
        ...(updates.isActive !== undefined && { isActive: updates.isActive }),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      metric: updated.metric,
      condition: updated.condition as any,
      threshold: updated.threshold,
      duration: updated.duration,
      severity: updated.severity as any,
      channels: JSON.parse(updated.channels),
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  // 删除告警规则
  async deleteAlertRule(id: string): Promise<void> {
    await prisma.alertRule.delete({ where: { id } });
  }

  // 获取所有告警规则
  async getAlertRules(): Promise<AlertRule[]> {
    const rules = await prisma.alertRule.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return rules.map(r => ({
      id: r.id,
      name: r.name,
      metric: r.metric,
      condition: r.condition as any,
      threshold: r.threshold,
      duration: r.duration,
      severity: r.severity as any,
      channels: JSON.parse(r.channels),
      isActive: r.isActive,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  // 检查告警
  async checkAlerts(): Promise<Alert[]> {
    const rules = await this.getAlertRules();
    const activeRules = rules.filter(r => r.isActive);
    const alerts: Alert[] = [];

    for (const rule of activeRules) {
      const value = await this.getLatestValue(rule.metric, rule.labels);
      
      if (value === null) continue;

      const isTriggered = this.evaluateCondition(value, rule.condition, rule.threshold);

      if (isTriggered) {
        // 检查去重
        const dedupeKey = `${rule.id}:${rule.metric}`;
        const lastAlert = alertDeduplicationCache.get(dedupeKey);
        const cooldown = rule.cooldown || DEFAULT_COOLDOWN;

        if (lastAlert && Date.now() - lastAlert < cooldown) {
          continue; // 在冷却期内，跳过
        }

        // 创建告警
        const alert = await this.createAlert(rule, value);
        alerts.push(alert);

        // 更新去重缓存
        alertDeduplicationCache.set(dedupeKey, Date.now());

        // 发送通知
        await this.sendAlertNotifications(alert, rule);
      }
    }

    return alerts;
  }

  // 确认告警
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    await prisma.alertHistory.update({
      where: { id: alertId },
      data: {
        status: 'ACKNOWLEDGED',
        // acknowledgedAt: new Date(),
        // acknowledgedBy: userId,
      },
    });
  }

  // 解决告警
  async resolveAlert(alertId: string): Promise<void> {
    await prisma.alertHistory.update({
      where: { id: alertId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });
  }

  // 获取活跃告警
  async getActiveAlerts(): Promise<Alert[]> {
    const alerts = await prisma.alertHistory.findMany({
      where: {
        status: { in: ['TRIGGERED', 'ACKNOWLEDGED'] },
      },
      include: { rule: true },
      orderBy: { createdAt: 'desc' },
    });

    return alerts.map(a => ({
      id: a.id,
      ruleId: a.ruleId,
      ruleName: a.rule.name,
      metric: a.rule.metric,
      value: a.value,
      threshold: a.rule.threshold,
      condition: a.rule.condition as any,
      severity: a.rule.severity as any,
      status: a.status as AlertStatus,
      message: a.message,
      triggeredAt: a.createdAt,
      resolvedAt: a.resolvedAt || undefined,
    }));
  }

  // 获取告警历史
  async getAlertHistory(timeRange: TimeRange): Promise<Alert[]> {
    const alerts = await prisma.alertHistory.findMany({
      where: {
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
      include: { rule: true },
      orderBy: { createdAt: 'desc' },
    });

    return alerts.map(a => ({
      id: a.id,
      ruleId: a.ruleId,
      ruleName: a.rule.name,
      metric: a.rule.metric,
      value: a.value,
      threshold: a.rule.threshold,
      condition: a.rule.condition as any,
      severity: a.rule.severity as any,
      status: a.status as AlertStatus,
      message: a.message,
      triggeredAt: a.createdAt,
      resolvedAt: a.resolvedAt || undefined,
    }));
  }

  // 获取健康状态
  async getHealthStatus(): Promise<HealthStatus> {
    const components: HealthStatus['components'] = {};

    // 检查数据库
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      components['database'] = {
        status: 'up',
        latency: Date.now() - start,
        lastCheck: new Date(),
      };
    } catch (error) {
      components['database'] = {
        status: 'down',
        message: (error as Error).message,
        lastCheck: new Date(),
      };
    }

    // 检查 Redis（如果配置了）
    // TODO: 添加 Redis 健康检查

    // 计算整体状态
    const statuses = Object.values(components).map(c => c.status);
    let overallStatus: HealthStatus['status'] = 'healthy';
    
    if (statuses.includes('down')) {
      overallStatus = 'unhealthy';
    } else if (statuses.includes('degraded')) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      components,
      uptime: Date.now() - this.startTime,
      version: process.env.APP_VERSION || '1.0.0',
    };
  }

  // 私有方法

  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }
    const sortedLabels = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${sortedLabels}}`;
  }

  private async persistMetric(metric: MetricData): Promise<void> {
    try {
      await prisma.metricRecord?.create({
        data: {
          name: metric.name,
          value: metric.value,
          labels: metric.labels ? JSON.stringify(metric.labels) : null,
          timestamp: metric.timestamp || new Date(),
        },
      });
    } catch (error) {
      // 忽略持久化错误，不影响主流程
    }
  }

  private async queryMetricsFromDB(
    name: string,
    labels: Record<string, string> | undefined,
    timeRange: TimeRange
  ): Promise<MetricData[]> {
    const records = await prisma.metricRecord?.findMany({
      where: {
        name,
        timestamp: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
        ...(labels ? { labels: JSON.stringify(labels) } : {}),
      },
      orderBy: { timestamp: 'asc' },
    });

    return (records || []).map(r => ({
      name: r.name,
      value: r.value,
      labels: r.labels ? JSON.parse(r.labels) : undefined,
      timestamp: r.timestamp,
    }));
  }

  private aggregateMetrics(
    name: string,
    labels: Record<string, string> | undefined,
    data: MetricData[],
    interval: string,
    aggregation: string
  ): MetricResult {
    // 解析间隔
    const intervalMs = this.parseInterval(interval);
    
    // 按间隔分组
    const buckets: Map<number, number[]> = new Map();
    
    for (const d of data) {
      const ts = d.timestamp?.getTime() || 0;
      const bucketKey = Math.floor(ts / intervalMs) * intervalMs;
      const bucket = buckets.get(bucketKey) || [];
      bucket.push(d.value);
      buckets.set(bucketKey, bucket);
    }

    // 聚合
    const values: Array<{ timestamp: Date; value: number }> = [];
    
    for (const [ts, vals] of buckets) {
      let value: number;
      switch (aggregation) {
        case 'sum':
          value = vals.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          value = vals.reduce((a, b) => a + b, 0) / vals.length;
          break;
        case 'min':
          value = Math.min(...vals);
          break;
        case 'max':
          value = Math.max(...vals);
          break;
        case 'count':
          value = vals.length;
          break;
        default:
          value = vals[vals.length - 1];
      }
      values.push({ timestamp: new Date(ts), value });
    }

    return { name, labels, values };
  }

  private parseInterval(interval: string): number {
    const match = interval.match(/^(\d+)([smhd])$/);
    if (!match) return 60000; // 默认1分钟

    const [, num, unit] = match;
    const n = parseInt(num);
    
    switch (unit) {
      case 's': return n * 1000;
      case 'm': return n * 60 * 1000;
      case 'h': return n * 60 * 60 * 1000;
      case 'd': return n * 24 * 60 * 60 * 1000;
      default: return 60000;
    }
  }

  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'eq': return value === threshold;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      case 'ne': return value !== threshold;
      default: return false;
    }
  }

  private async createAlert(rule: AlertRule, value: number): Promise<Alert> {
    const message = `${rule.name}: ${rule.metric} = ${value} (阈值: ${rule.condition} ${rule.threshold})`;

    const created = await prisma.alertHistory.create({
      data: {
        ruleId: rule.id,
        value,
        message,
        status: 'TRIGGERED',
      },
    });

    return {
      id: created.id,
      ruleId: rule.id,
      ruleName: rule.name,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      condition: rule.condition,
      severity: rule.severity,
      status: 'TRIGGERED',
      message,
      labels: rule.labels,
      triggeredAt: created.createdAt,
    };
  }

  private async sendAlertNotifications(alert: Alert, rule: AlertRule): Promise<void> {
    for (const channel of rule.channels) {
      try {
        switch (channel) {
          case 'email':
            // TODO: 发送邮件通知
            console.log(`[Alert Email] ${alert.message}`);
            break;
          case 'sms':
            // TODO: 发送短信通知
            console.log(`[Alert SMS] ${alert.message}`);
            break;
          case 'webhook':
            if (rule.webhookUrl) {
              await fetch(rule.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alert),
              });
            }
            break;
          case 'wechat':
            // TODO: 发送微信通知
            console.log(`[Alert WeChat] ${alert.message}`);
            break;
        }
      } catch (error) {
        console.error(`发送告警通知失败 [${channel}]:`, error);
      }
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    
    for (const [key, data] of metricsCache) {
      const filtered = data.filter(d => {
        const ts = d.timestamp?.getTime() || 0;
        return now - ts < CACHE_RETENTION_MS;
      });
      
      if (filtered.length === 0) {
        metricsCache.delete(key);
      } else {
        metricsCache.set(key, filtered);
      }
    }

    // 清理告警去重缓存
    for (const [key, time] of alertDeduplicationCache) {
      if (now - time > DEFAULT_COOLDOWN * 2) {
        alertDeduplicationCache.delete(key);
      }
    }
  }
}

// 单例
export const monitoringService = new MonitoringService();

export default monitoringService;

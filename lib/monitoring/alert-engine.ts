// 告警规则引擎
import { prisma } from '@/lib/prisma';
import { monitoringService } from './monitoring-service';
import {
  AlertRule,
  Alert,
  AlertSeverity,
  AlertCondition,
  AlertChannel,
  TimeRange,
} from './types';

// 告警去重缓存
interface DeduplicationEntry {
  lastTriggered: number;
  count: number;
  firstTriggered: number;
}

const deduplicationCache: Map<string, DeduplicationEntry> = new Map();

// 默认配置
const DEFAULT_CHECK_INTERVAL = 60 * 1000; // 1分钟
const DEFAULT_COOLDOWN = 15 * 60 * 1000; // 15分钟
const MAX_ALERTS_PER_RULE = 100; // 每个规则最大告警数

// 告警规则引擎
class AlertEngine {
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  // 启动告警检查
  start(intervalMs: number = DEFAULT_CHECK_INTERVAL): void {
    if (this.isRunning) {
      console.log('告警引擎已在运行');
      return;
    }

    this.isRunning = true;
    console.log('告警引擎启动');

    // 立即执行一次检查
    this.checkAllRules().catch(console.error);

    // 定期检查
    this.checkInterval = setInterval(() => {
      this.checkAllRules().catch(console.error);
    }, intervalMs);
  }

  // 停止告警检查
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('告警引擎停止');
  }

  // 检查所有规则
  async checkAllRules(): Promise<Alert[]> {
    const rules = await this.getActiveRules();
    const alerts: Alert[] = [];

    for (const rule of rules) {
      try {
        const alert = await this.checkRule(rule);
        if (alert) {
          alerts.push(alert);
        }
      } catch (error) {
        console.error(`检查规则 ${rule.name} 失败:`, error);
      }
    }

    return alerts;
  }

  // 检查单个规则
  async checkRule(rule: AlertRule): Promise<Alert | null> {
    // 获取指标值
    const value = await monitoringService.getLatestValue(rule.metric, rule.labels);
    
    if (value === null) {
      return null;
    }

    // 评估条件
    const isTriggered = this.evaluateCondition(value, rule.condition, rule.threshold);

    if (!isTriggered) {
      // 如果之前有告警，检查是否需要自动解决
      await this.checkAutoResolve(rule);
      return null;
    }

    // 检查持续时间
    if (rule.duration && rule.duration > 0) {
      const isDurationMet = await this.checkDuration(rule, value);
      if (!isDurationMet) {
        return null;
      }
    }

    // 检查去重
    if (this.isDuplicate(rule)) {
      return null;
    }

    // 创建告警
    const alert = await this.createAlert(rule, value);

    // 发送通知
    await this.sendNotifications(alert, rule);

    // 更新去重缓存
    this.updateDeduplicationCache(rule);

    return alert;
  }

  // 评估条件
  private evaluateCondition(value: number, condition: AlertCondition, threshold: number): boolean {
    switch (condition) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'eq': return Math.abs(value - threshold) < 0.0001;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      case 'ne': return Math.abs(value - threshold) >= 0.0001;
      default: return false;
    }
  }

  // 检查持续时间
  private async checkDuration(rule: AlertRule, currentValue: number): Promise<boolean> {
    const durationMs = (rule.duration || 0) * 1000;
    const timeRange: TimeRange = {
      start: new Date(Date.now() - durationMs),
      end: new Date(),
    };

    const result = await monitoringService.getMetrics({
      name: rule.metric,
      labels: rule.labels,
      timeRange,
    });

    // 检查所有值是否都满足条件
    return result.values.every(v => 
      this.evaluateCondition(v.value, rule.condition, rule.threshold)
    );
  }

  // 检查是否重复告警
  private isDuplicate(rule: AlertRule): boolean {
    const key = this.getDeduplicationKey(rule);
    const entry = deduplicationCache.get(key);

    if (!entry) {
      return false;
    }

    const cooldown = rule.cooldown || DEFAULT_COOLDOWN;
    return Date.now() - entry.lastTriggered < cooldown;
  }

  // 更新去重缓存
  private updateDeduplicationCache(rule: AlertRule): void {
    const key = this.getDeduplicationKey(rule);
    const entry = deduplicationCache.get(key);
    const now = Date.now();

    if (entry) {
      entry.lastTriggered = now;
      entry.count++;
    } else {
      deduplicationCache.set(key, {
        lastTriggered: now,
        count: 1,
        firstTriggered: now,
      });
    }
  }

  // 获取去重键
  private getDeduplicationKey(rule: AlertRule): string {
    const labelsStr = rule.labels 
      ? Object.entries(rule.labels).sort().map(([k, v]) => `${k}=${v}`).join(',')
      : '';
    return `${rule.id}:${rule.metric}:${labelsStr}`;
  }

  // 检查自动解决
  private async checkAutoResolve(rule: AlertRule): Promise<void> {
    // 查找该规则的活跃告警
    const activeAlerts = await prisma.alertHistory.findMany({
      where: {
        ruleId: rule.id,
        status: { in: ['TRIGGERED', 'ACKNOWLEDGED'] },
      },
    });

    for (const alert of activeAlerts) {
      await prisma.alertHistory.update({
        where: { id: alert.id },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
        },
      });

      // 清除去重缓存
      const key = this.getDeduplicationKey(rule);
      deduplicationCache.delete(key);
    }
  }

  // 创建告警
  private async createAlert(rule: AlertRule, value: number): Promise<Alert> {
    const message = this.formatAlertMessage(rule, value);

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

  // 格式化告警消息
  private formatAlertMessage(rule: AlertRule, value: number): string {
    const conditionText = this.getConditionText(rule.condition);
    const severityEmoji = this.getSeverityEmoji(rule.severity);
    
    return `${severityEmoji} [${rule.severity.toUpperCase()}] ${rule.name}\n` +
           `指标: ${rule.metric}\n` +
           `当前值: ${value.toFixed(2)}\n` +
           `条件: ${conditionText} ${rule.threshold}\n` +
           `时间: ${new Date().toLocaleString('zh-CN')}`;
  }

  // 获取条件文本
  private getConditionText(condition: AlertCondition): string {
    const texts: Record<AlertCondition, string> = {
      gt: '大于',
      lt: '小于',
      eq: '等于',
      gte: '大于等于',
      lte: '小于等于',
      ne: '不等于',
    };
    return texts[condition] || condition;
  }

  // 获取严重级别 emoji
  private getSeverityEmoji(severity: AlertSeverity): string {
    const emojis: Record<AlertSeverity, string> = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨',
    };
    return emojis[severity] || '📢';
  }

  // 发送通知
  private async sendNotifications(alert: Alert, rule: AlertRule): Promise<void> {
    for (const channel of rule.channels) {
      try {
        await this.sendNotification(alert, rule, channel);
      } catch (error) {
        console.error(`发送 ${channel} 通知失败:`, error);
      }
    }
  }

  // 发送单个通知
  private async sendNotification(alert: Alert, rule: AlertRule, channel: AlertChannel): Promise<void> {
    switch (channel) {
      case 'email':
        await this.sendEmailNotification(alert, rule);
        break;
      case 'sms':
        await this.sendSMSNotification(alert, rule);
        break;
      case 'webhook':
        await this.sendWebhookNotification(alert, rule);
        break;
      case 'wechat':
        await this.sendWechatNotification(alert, rule);
        break;
    }
  }

  // 发送邮件通知
  private async sendEmailNotification(alert: Alert, rule: AlertRule): Promise<void> {
    // TODO: 集成邮件服务
    console.log(`[Email Alert] ${alert.message}`);
    
    // 记录通知
    await this.recordNotification(alert.id, 'email', 'SENT');
  }

  // 发送短信通知
  private async sendSMSNotification(alert: Alert, rule: AlertRule): Promise<void> {
    // TODO: 集成短信服务
    console.log(`[SMS Alert] ${alert.ruleName}: ${alert.metric} = ${alert.value}`);
    
    await this.recordNotification(alert.id, 'sms', 'SENT');
  }

  // 发送 Webhook 通知
  private async sendWebhookNotification(alert: Alert, rule: AlertRule): Promise<void> {
    if (!rule.webhookUrl) {
      return;
    }

    const response = await fetch(rule.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Alert-Severity': alert.severity,
      },
      body: JSON.stringify({
        alert,
        rule: {
          id: rule.id,
          name: rule.name,
          metric: rule.metric,
          condition: rule.condition,
          threshold: rule.threshold,
        },
        timestamp: new Date().toISOString(),
      }),
    });

    const status = response.ok ? 'SENT' : 'FAILED';
    await this.recordNotification(alert.id, 'webhook', status);
  }

  // 发送微信通知
  private async sendWechatNotification(alert: Alert, rule: AlertRule): Promise<void> {
    // TODO: 集成微信企业号或服务号
    console.log(`[WeChat Alert] ${alert.message}`);
    
    await this.recordNotification(alert.id, 'wechat', 'SENT');
  }

  // 记录通知
  private async recordNotification(alertId: string, channel: AlertChannel, status: string): Promise<void> {
    // TODO: 记录到数据库
    console.log(`通知记录: alertId=${alertId}, channel=${channel}, status=${status}`);
  }

  // 获取活跃规则
  private async getActiveRules(): Promise<AlertRule[]> {
    const rules = await prisma.alertRule.findMany({
      where: { isActive: true },
    });

    return rules.map(r => ({
      id: r.id,
      name: r.name,
      metric: r.metric,
      condition: r.condition as AlertCondition,
      threshold: r.threshold,
      duration: r.duration,
      severity: r.severity as AlertSeverity,
      channels: JSON.parse(r.channels) as AlertChannel[],
      isActive: r.isActive,
      cooldown: DEFAULT_COOLDOWN,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  // 获取告警统计
  async getAlertStats(timeRange: TimeRange): Promise<{
    total: number;
    bySeverity: Record<AlertSeverity, number>;
    byStatus: Record<string, number>;
    topRules: Array<{ ruleId: string; ruleName: string; count: number }>;
  }> {
    const alerts = await prisma.alertHistory.findMany({
      where: {
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
      include: { rule: true },
    });

    const bySeverity: Record<AlertSeverity, number> = {
      info: 0,
      warning: 0,
      critical: 0,
    };

    const byStatus: Record<string, number> = {};
    const ruleCount: Map<string, { name: string; count: number }> = new Map();

    for (const alert of alerts) {
      // 按严重级别统计
      const severity = alert.rule.severity as AlertSeverity;
      bySeverity[severity] = (bySeverity[severity] || 0) + 1;

      // 按状态统计
      byStatus[alert.status] = (byStatus[alert.status] || 0) + 1;

      // 按规则统计
      const ruleData = ruleCount.get(alert.ruleId) || { name: alert.rule.name, count: 0 };
      ruleData.count++;
      ruleCount.set(alert.ruleId, ruleData);
    }

    // 获取 Top 规则
    const topRules = Array.from(ruleCount.entries())
      .map(([ruleId, data]) => ({ ruleId, ruleName: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: alerts.length,
      bySeverity,
      byStatus,
      topRules,
    };
  }

  // 清理过期告警
  async cleanupOldAlerts(retentionDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await prisma.alertHistory.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: 'RESOLVED',
      },
    });

    return result.count;
  }
}

// 单例
export const alertEngine = new AlertEngine();

export default alertEngine;

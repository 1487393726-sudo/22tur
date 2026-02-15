/**
 * Retention Analyzer Service
 * 留存分析服务
 */

import {
  RetentionAnalysisRequest,
  RetentionAnalysisResult,
  RetentionCohort,
  RetentionType,
  TrendDataPoint,
  IRetentionAnalyzer,
  BehaviorEvent,
} from './types';
import { getBehaviorTracker } from './behavior-tracker';

/**
 * 留存分析服务
 */
export class RetentionAnalyzer implements IRetentionAnalyzer {
  /**
   * 分析留存
   */
  async analyze(request: RetentionAnalysisRequest): Promise<RetentionAnalysisResult> {
    const tracker = getBehaviorTracker();
    
    // 获取时间范围内的所有事件
    const events = await tracker.getEvents({
      timeRange: { start: request.startDate, end: request.endDate },
      eventTypes: request.cohortEvent ? [request.cohortEvent] : undefined,
    });

    // 按用户分组事件
    const userEvents = this.groupEventsByUser(events);

    // 生成队列
    const cohorts = this.generateCohorts(
      userEvents,
      request.type,
      request.startDate,
      request.endDate,
      request.returnEvent
    );

    // 计算平均留存率
    const averageRetention = this.calculateAverageRetention(cohorts);

    return {
      type: request.type,
      dateRange: { start: request.startDate, end: request.endDate },
      cohorts,
      averageRetention,
    };
  }

  /**
   * 获取留存趋势
   */
  async getRetentionTrend(type: RetentionType, periods: number): Promise<TrendDataPoint[]> {
    const endDate = new Date();
    const startDate = this.getStartDateForPeriods(type, periods, endDate);

    const result = await this.analyze({
      type,
      startDate,
      endDate,
    });

    // 提取第一期留存率作为趋势数据
    const trend: TrendDataPoint[] = result.cohorts.map(cohort => ({
      date: cohort.cohortDate,
      value: cohort.retention[1] || 0, // 第一期留存率
      label: this.formatCohortDate(cohort.cohortDate, type),
    }));

    return trend;
  }

  /**
   * 按用户分组事件
   */
  private groupEventsByUser(events: BehaviorEvent[]): Map<string, BehaviorEvent[]> {
    const userEvents = new Map<string, BehaviorEvent[]>();
    
    // 需要从会话中获取用户 ID
    const tracker = getBehaviorTracker();
    
    for (const event of events) {
      // 使用 sessionId 作为用户标识（实际项目中应该使用 userId）
      const userId = event.sessionId;
      
      if (!userEvents.has(userId)) {
        userEvents.set(userId, []);
      }
      userEvents.get(userId)!.push(event);
    }

    return userEvents;
  }

  /**
   * 生成队列
   */
  private generateCohorts(
    userEvents: Map<string, BehaviorEvent[]>,
    type: RetentionType,
    startDate: Date,
    endDate: Date,
    returnEvent?: string
  ): RetentionCohort[] {
    const cohorts: RetentionCohort[] = [];
    const periodMs = this.getPeriodMs(type);
    
    // 计算队列数量
    const totalPeriods = Math.ceil((endDate.getTime() - startDate.getTime()) / periodMs);
    const maxRetentionPeriods = Math.min(totalPeriods, 12); // 最多显示12期

    // 按队列日期分组用户
    const cohortUsers = new Map<string, Set<string>>();
    
    for (const [userId, events] of userEvents) {
      if (events.length === 0) continue;
      
      // 找到用户的首次活动日期
      const firstEvent = events.reduce((min, e) => 
        e.timestamp < min.timestamp ? e : min
      );
      
      const cohortDate = this.getCohortDate(firstEvent.timestamp, type);
      const cohortKey = cohortDate.toISOString();
      
      if (!cohortUsers.has(cohortKey)) {
        cohortUsers.set(cohortKey, new Set());
      }
      cohortUsers.get(cohortKey)!.add(userId);
    }

    // 为每个队列计算留存
    const sortedCohortDates = Array.from(cohortUsers.keys()).sort();
    
    for (const cohortKey of sortedCohortDates) {
      const cohortDate = new Date(cohortKey);
      const users = cohortUsers.get(cohortKey)!;
      const cohortSize = users.size;
      
      if (cohortSize === 0) continue;

      const retention: number[] = [1]; // 第0期留存率为100%
      const retentionCounts: number[] = [cohortSize];

      // 计算每期留存
      for (let period = 1; period <= maxRetentionPeriods; period++) {
        const periodStart = new Date(cohortDate.getTime() + period * periodMs);
        const periodEnd = new Date(periodStart.getTime() + periodMs);
        
        if (periodStart > endDate) break;

        let retainedCount = 0;
        
        for (const userId of users) {
          const userEventList = userEvents.get(userId) || [];
          
          // 检查用户在该期间是否有活动
          const hasActivity = userEventList.some(event => {
            if (event.timestamp >= periodStart && event.timestamp < periodEnd) {
              if (returnEvent) {
                return event.eventType === returnEvent;
              }
              return true;
            }
            return false;
          });
          
          if (hasActivity) {
            retainedCount++;
          }
        }

        retention.push(cohortSize > 0 ? retainedCount / cohortSize : 0);
        retentionCounts.push(retainedCount);
      }

      cohorts.push({
        cohortDate,
        cohortSize,
        retention,
        retentionCounts,
      });
    }

    return cohorts;
  }

  /**
   * 计算平均留存率
   */
  private calculateAverageRetention(cohorts: RetentionCohort[]): number[] {
    if (cohorts.length === 0) return [];

    const maxPeriods = Math.max(...cohorts.map(c => c.retention.length));
    const averageRetention: number[] = [];

    for (let period = 0; period < maxPeriods; period++) {
      const values = cohorts
        .filter(c => c.retention.length > period)
        .map(c => c.retention[period]);
      
      if (values.length > 0) {
        averageRetention.push(values.reduce((a, b) => a + b, 0) / values.length);
      }
    }

    return averageRetention;
  }

  /**
   * 获取周期毫秒数
   */
  private getPeriodMs(type: RetentionType): number {
    switch (type) {
      case 'daily':
        return 24 * 60 * 60 * 1000;
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000;
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  /**
   * 获取队列日期（归一化到周期开始）
   */
  private getCohortDate(date: Date, type: RetentionType): Date {
    const d = new Date(date);
    
    switch (type) {
      case 'daily':
        d.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay()); // 周日开始
        break;
      case 'monthly':
        d.setHours(0, 0, 0, 0);
        d.setDate(1);
        break;
    }
    
    return d;
  }

  /**
   * 获取指定周期数的开始日期
   */
  private getStartDateForPeriods(type: RetentionType, periods: number, endDate: Date): Date {
    const periodMs = this.getPeriodMs(type);
    return new Date(endDate.getTime() - periods * periodMs);
  }

  /**
   * 格式化队列日期
   */
  private formatCohortDate(date: Date, type: RetentionType): string {
    switch (type) {
      case 'daily':
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
      case 'weekly':
        return `第${this.getWeekNumber(date)}周`;
      case 'monthly':
        return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' });
      default:
        return date.toLocaleDateString('zh-CN');
    }
  }

  /**
   * 获取周数
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}

// 单例
let retentionAnalyzerInstance: RetentionAnalyzer | null = null;

/**
 * 获取留存分析服务实例
 */
export function getRetentionAnalyzer(): RetentionAnalyzer {
  if (!retentionAnalyzerInstance) {
    retentionAnalyzerInstance = new RetentionAnalyzer();
  }
  return retentionAnalyzerInstance;
}

/**
 * 重置留存分析服务
 */
export function resetRetentionAnalyzer(): void {
  retentionAnalyzerInstance = null;
}

export default RetentionAnalyzer;

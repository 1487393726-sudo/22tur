/**
 * Funnel Analyzer Service
 * 漏斗分析服务
 */

import { v4 as uuidv4 } from 'uuid';
import {
  FunnelDefinition,
  FunnelAnalysisResult,
  FunnelStepResult,
  TimeRange,
  IFunnelAnalyzer,
  BehaviorEvent,
} from './types';
import { getBehaviorTracker } from './behavior-tracker';

/**
 * 漏斗分析服务
 */
export class FunnelAnalyzer implements IFunnelAnalyzer {
  private funnels: Map<string, FunnelDefinition> = new Map();

  /**
   * 创建漏斗
   */
  async createFunnel(
    definition: Omit<FunnelDefinition, 'id' | 'createdAt'>
  ): Promise<FunnelDefinition> {
    const funnel: FunnelDefinition = {
      ...definition,
      id: uuidv4(),
      createdAt: new Date(),
    };

    this.funnels.set(funnel.id, funnel);
    return funnel;
  }

  /**
   * 更新漏斗
   */
  async updateFunnel(
    id: string,
    definition: Partial<FunnelDefinition>
  ): Promise<FunnelDefinition> {
    const existing = this.funnels.get(id);
    if (!existing) {
      throw new Error(`漏斗不存在: ${id}`);
    }

    const updated: FunnelDefinition = {
      ...existing,
      ...definition,
      id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    this.funnels.set(id, updated);
    return updated;
  }

  /**
   * 删除漏斗
   */
  async deleteFunnel(id: string): Promise<boolean> {
    return this.funnels.delete(id);
  }

  /**
   * 获取漏斗
   */
  async getFunnel(id: string): Promise<FunnelDefinition | null> {
    return this.funnels.get(id) || null;
  }

  /**
   * 列出所有漏斗
   */
  async listFunnels(): Promise<FunnelDefinition[]> {
    return Array.from(this.funnels.values());
  }

  /**
   * 分析漏斗
   */
  async analyze(funnelId: string, timeRange: TimeRange): Promise<FunnelAnalysisResult> {
    const funnel = this.funnels.get(funnelId);
    if (!funnel) {
      throw new Error(`漏斗不存在: ${funnelId}`);
    }

    const tracker = getBehaviorTracker();
    
    // 获取时间范围内的所有事件
    const events = await tracker.getEvents({ timeRange });

    // 按会话分组事件
    const sessionEvents = this.groupEventsBySession(events);

    // 分析每个步骤
    const stepResults: FunnelStepResult[] = [];
    let previousStepUsers = new Set<string>();
    let totalUsers = 0;

    for (let i = 0; i < funnel.steps.length; i++) {
      const step = funnel.steps[i];
      const stepUsers = new Set<string>();
      const timesToNext: number[] = [];

      for (const [sessionId, sessionEventList] of sessionEvents) {
        // 检查该会话是否完成了当前步骤
        const matchingEvent = this.findMatchingEvent(sessionEventList, step, funnel.timeWindow);
        
        if (matchingEvent) {
          stepUsers.add(sessionId);

          // 如果不是最后一步，计算到下一步的时间
          if (i < funnel.steps.length - 1) {
            const nextStep = funnel.steps[i + 1];
            const nextEvent = this.findMatchingEvent(
              sessionEventList.filter(e => e.timestamp > matchingEvent.timestamp),
              nextStep,
              funnel.timeWindow
            );
            
            if (nextEvent) {
              const timeToNext = (nextEvent.timestamp.getTime() - matchingEvent.timestamp.getTime()) / 1000;
              timesToNext.push(timeToNext);
            }
          }
        }
      }

      // 第一步的用户数作为总用户数
      if (i === 0) {
        totalUsers = stepUsers.size;
        previousStepUsers = stepUsers;
      }

      // 计算转化率和流失率
      const users = i === 0 ? stepUsers.size : this.intersectSets(previousStepUsers, stepUsers).size;
      const conversionRate = totalUsers > 0 ? users / totalUsers : 0;
      const dropoffRate = i === 0 ? 0 : (previousStepUsers.size - users) / previousStepUsers.size;
      const avgTimeToNext = timesToNext.length > 0
        ? timesToNext.reduce((a, b) => a + b, 0) / timesToNext.length
        : undefined;

      stepResults.push({
        stepIndex: i,
        stepName: step.name,
        users,
        conversionRate,
        dropoffRate,
        avgTimeToNext,
      });

      // 更新前一步用户集合（只保留完成当前步骤的用户）
      if (i === 0) {
        previousStepUsers = stepUsers;
      } else {
        previousStepUsers = this.intersectSets(previousStepUsers, stepUsers);
      }
    }

    // 计算整体转化率
    const overallConversionRate = stepResults.length > 0 && totalUsers > 0
      ? stepResults[stepResults.length - 1].users / totalUsers
      : 0;

    return {
      funnelId,
      funnelName: funnel.name,
      dateRange: { start: timeRange.start, end: timeRange.end },
      steps: stepResults,
      overallConversionRate,
      totalUsers,
    };
  }

  /**
   * 按会话分组事件
   */
  private groupEventsBySession(events: BehaviorEvent[]): Map<string, BehaviorEvent[]> {
    const sessionEvents = new Map<string, BehaviorEvent[]>();
    
    for (const event of events) {
      if (!sessionEvents.has(event.sessionId)) {
        sessionEvents.set(event.sessionId, []);
      }
      sessionEvents.get(event.sessionId)!.push(event);
    }

    // 按时间排序每个会话的事件
    for (const [, eventList] of sessionEvents) {
      eventList.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    return sessionEvents;
  }

  /**
   * 查找匹配的事件
   */
  private findMatchingEvent(
    events: BehaviorEvent[],
    step: { eventType: string; eventName?: string; conditions?: Record<string, unknown> },
    timeWindowHours?: number
  ): BehaviorEvent | null {
    for (const event of events) {
      // 检查事件类型
      if (event.eventType !== step.eventType) {
        continue;
      }

      // 检查事件名称
      if (step.eventName && event.eventName !== step.eventName) {
        continue;
      }

      // 检查条件
      if (step.conditions) {
        let conditionsMet = true;
        for (const [key, value] of Object.entries(step.conditions)) {
          if (event.eventData[key] !== value) {
            conditionsMet = false;
            break;
          }
        }
        if (!conditionsMet) {
          continue;
        }
      }

      return event;
    }

    return null;
  }

  /**
   * 集合交集
   */
  private intersectSets<T>(setA: Set<T>, setB: Set<T>): Set<T> {
    const intersection = new Set<T>();
    for (const item of setA) {
      if (setB.has(item)) {
        intersection.add(item);
      }
    }
    return intersection;
  }

  /**
   * 创建预定义漏斗
   */
  async createPredefinedFunnels(): Promise<void> {
    // 注册转化漏斗
    await this.createFunnel({
      name: '用户注册转化',
      description: '从访问到完成注册的转化漏斗',
      steps: [
        { name: '访问首页', eventType: 'page_view' },
        { name: '点击注册', eventType: 'click', conditions: { elementId: 'signup-btn' } },
        { name: '填写表单', eventType: 'form_submit', conditions: { formId: 'signup-form' } },
        { name: '完成注册', eventType: 'signup' },
      ],
      timeWindow: 24,
    });

    // 购买转化漏斗
    await this.createFunnel({
      name: '购买转化',
      description: '从浏览商品到完成购买的转化漏斗',
      steps: [
        { name: '浏览商品', eventType: 'page_view', conditions: { pageType: 'product' } },
        { name: '加入购物车', eventType: 'click', conditions: { action: 'add_to_cart' } },
        { name: '进入结算', eventType: 'page_view', conditions: { pageType: 'checkout' } },
        { name: '完成支付', eventType: 'purchase' },
      ],
      timeWindow: 72,
    });
  }
}

// 单例
let funnelAnalyzerInstance: FunnelAnalyzer | null = null;

/**
 * 获取漏斗分析服务实例
 */
export function getFunnelAnalyzer(): FunnelAnalyzer {
  if (!funnelAnalyzerInstance) {
    funnelAnalyzerInstance = new FunnelAnalyzer();
  }
  return funnelAnalyzerInstance;
}

/**
 * 重置漏斗分析服务
 */
export function resetFunnelAnalyzer(): void {
  funnelAnalyzerInstance = null;
}

export default FunnelAnalyzer;

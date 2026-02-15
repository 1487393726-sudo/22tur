/**
 * Segment Service
 * 用户分群服务
 */

import { v4 as uuidv4 } from 'uuid';
import {
  SegmentDefinition,
  SegmentRule,
  SegmentResult,
  ISegmentService,
  BehaviorEvent,
  SessionInfo,
} from './types';
import { getBehaviorTracker } from './behavior-tracker';

// 用户属性（用于分群评估）
interface UserAttributes {
  userId: string;
  totalEvents: number;
  totalPageViews: number;
  totalPurchases: number;
  totalPurchaseAmount: number;
  firstSeenAt: Date;
  lastSeenAt: Date;
  sessionCount: number;
  avgSessionDuration: number;
  deviceTypes: string[];
  browsers: string[];
  countries: string[];
  eventTypes: string[];
  customAttributes: Record<string, unknown>;
}

/**
 * 用户分群服务
 */
export class SegmentService implements ISegmentService {
  private segments: Map<string, SegmentDefinition> = new Map();

  /**
   * 创建分群
   */
  async createSegment(
    definition: Omit<SegmentDefinition, 'id' | 'createdAt'>
  ): Promise<SegmentDefinition> {
    const segment: SegmentDefinition = {
      ...definition,
      id: uuidv4(),
      createdAt: new Date(),
    };

    this.segments.set(segment.id, segment);
    return segment;
  }

  /**
   * 更新分群
   */
  async updateSegment(
    id: string,
    definition: Partial<SegmentDefinition>
  ): Promise<SegmentDefinition> {
    const existing = this.segments.get(id);
    if (!existing) {
      throw new Error(`分群不存在: ${id}`);
    }

    const updated: SegmentDefinition = {
      ...existing,
      ...definition,
      id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    this.segments.set(id, updated);
    return updated;
  }

  /**
   * 删除分群
   */
  async deleteSegment(id: string): Promise<boolean> {
    return this.segments.delete(id);
  }

  /**
   * 获取分群
   */
  async getSegment(id: string): Promise<SegmentDefinition | null> {
    return this.segments.get(id) || null;
  }

  /**
   * 列出所有分群
   */
  async listSegments(): Promise<SegmentDefinition[]> {
    return Array.from(this.segments.values());
  }

  /**
   * 评估分群
   */
  async evaluateSegment(segmentId: string): Promise<SegmentResult> {
    const segment = this.segments.get(segmentId);
    if (!segment) {
      throw new Error(`分群不存在: ${segmentId}`);
    }

    // 获取所有用户属性
    const userAttributes = await this.getAllUserAttributes();
    
    // 评估每个用户
    const matchingUsers: string[] = [];
    
    for (const [userId, attributes] of userAttributes) {
      if (this.evaluateRules(attributes, segment.rules, segment.ruleLogic)) {
        matchingUsers.push(userId);
      }
    }

    const totalUsers = userAttributes.size;
    const userCount = matchingUsers.length;

    return {
      segmentId,
      segmentName: segment.name,
      userCount,
      percentage: totalUsers > 0 ? userCount / totalUsers : 0,
      users: matchingUsers,
    };
  }

  /**
   * 获取用户所属分群
   */
  async getUserSegments(userId: string): Promise<SegmentDefinition[]> {
    const userAttributes = await this.getUserAttributes(userId);
    if (!userAttributes) {
      return [];
    }

    const matchingSegments: SegmentDefinition[] = [];
    
    for (const segment of this.segments.values()) {
      if (this.evaluateRules(userAttributes, segment.rules, segment.ruleLogic)) {
        matchingSegments.push(segment);
      }
    }

    return matchingSegments;
  }

  /**
   * 获取所有用户属性
   */
  private async getAllUserAttributes(): Promise<Map<string, UserAttributes>> {
    const tracker = getBehaviorTracker();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const events = await tracker.getEvents({
      timeRange: { start: thirtyDaysAgo, end: now },
    });

    const userAttributesMap = new Map<string, UserAttributes>();

    // 按用户分组事件
    const userEvents = new Map<string, BehaviorEvent[]>();
    for (const event of events) {
      const userId = event.sessionId; // 使用 sessionId 作为用户标识
      if (!userEvents.has(userId)) {
        userEvents.set(userId, []);
      }
      userEvents.get(userId)!.push(event);
    }

    // 计算每个用户的属性
    for (const [userId, eventList] of userEvents) {
      const attributes = this.calculateUserAttributes(userId, eventList);
      userAttributesMap.set(userId, attributes);
    }

    return userAttributesMap;
  }

  /**
   * 获取单个用户属性
   */
  private async getUserAttributes(userId: string): Promise<UserAttributes | null> {
    const tracker = getBehaviorTracker();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const events = await tracker.getEvents({
      timeRange: { start: thirtyDaysAgo, end: now },
      sessionId: userId,
    });

    if (events.length === 0) {
      return null;
    }

    return this.calculateUserAttributes(userId, events);
  }

  /**
   * 计算用户属性
   */
  private calculateUserAttributes(userId: string, events: BehaviorEvent[]): UserAttributes {
    const pageViews = events.filter(e => e.eventType === 'page_view');
    const purchases = events.filter(e => e.eventType === 'purchase');
    
    const timestamps = events.map(e => e.timestamp.getTime());
    const firstSeenAt = new Date(Math.min(...timestamps));
    const lastSeenAt = new Date(Math.max(...timestamps));

    // 计算购买总额
    const totalPurchaseAmount = purchases.reduce((sum, e) => {
      const amount = (e.eventData as { amount?: number }).amount || 0;
      return sum + amount;
    }, 0);

    // 收集设备类型、浏览器等
    const deviceTypes = [...new Set(events.map(e => e.deviceType).filter(Boolean))] as string[];
    const browsers = [...new Set(events.map(e => e.browser).filter(Boolean))] as string[];
    const countries = [...new Set(events.map(e => e.country).filter(Boolean))] as string[];
    const eventTypes = [...new Set(events.map(e => e.eventType))];

    // 计算会话数（简化：按天计算）
    const sessionDays = new Set(events.map(e => e.timestamp.toDateString()));
    const sessionCount = sessionDays.size;

    return {
      userId,
      totalEvents: events.length,
      totalPageViews: pageViews.length,
      totalPurchases: purchases.length,
      totalPurchaseAmount,
      firstSeenAt,
      lastSeenAt,
      sessionCount,
      avgSessionDuration: 0, // 需要更复杂的计算
      deviceTypes,
      browsers,
      countries,
      eventTypes,
      customAttributes: {},
    };
  }

  /**
   * 评估规则
   */
  private evaluateRules(
    attributes: UserAttributes,
    rules: SegmentRule[],
    logic: 'and' | 'or'
  ): boolean {
    if (rules.length === 0) {
      return true;
    }

    const results = rules.map(rule => this.evaluateRule(attributes, rule));

    if (logic === 'and') {
      return results.every(r => r);
    } else {
      return results.some(r => r);
    }
  }

  /**
   * 评估单个规则
   */
  private evaluateRule(attributes: UserAttributes, rule: SegmentRule): boolean {
    const value = this.getAttributeValue(attributes, rule.field);
    
    switch (rule.operator) {
      case 'eq':
        return value === rule.value;
      case 'ne':
        return value !== rule.value;
      case 'gt':
        return typeof value === 'number' && value > (rule.value as number);
      case 'gte':
        return typeof value === 'number' && value >= (rule.value as number);
      case 'lt':
        return typeof value === 'number' && value < (rule.value as number);
      case 'lte':
        return typeof value === 'number' && value <= (rule.value as number);
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(value);
      case 'nin':
        return Array.isArray(rule.value) && !rule.value.includes(value);
      case 'contains':
        if (Array.isArray(value)) {
          return value.includes(rule.value);
        }
        if (typeof value === 'string') {
          return value.includes(rule.value as string);
        }
        return false;
      case 'regex':
        if (typeof value === 'string' && typeof rule.value === 'string') {
          return new RegExp(rule.value).test(value);
        }
        return false;
      default:
        return false;
    }
  }

  /**
   * 获取属性值
   */
  private getAttributeValue(attributes: UserAttributes, field: string): unknown {
    const fieldMap: Record<string, unknown> = {
      totalEvents: attributes.totalEvents,
      totalPageViews: attributes.totalPageViews,
      totalPurchases: attributes.totalPurchases,
      totalPurchaseAmount: attributes.totalPurchaseAmount,
      sessionCount: attributes.sessionCount,
      avgSessionDuration: attributes.avgSessionDuration,
      deviceTypes: attributes.deviceTypes,
      browsers: attributes.browsers,
      countries: attributes.countries,
      eventTypes: attributes.eventTypes,
      daysSinceFirstSeen: Math.floor(
        (Date.now() - attributes.firstSeenAt.getTime()) / (24 * 60 * 60 * 1000)
      ),
      daysSinceLastSeen: Math.floor(
        (Date.now() - attributes.lastSeenAt.getTime()) / (24 * 60 * 60 * 1000)
      ),
    };

    if (field in fieldMap) {
      return fieldMap[field];
    }

    // 检查自定义属性
    if (field.startsWith('custom.')) {
      const customField = field.substring(7);
      return attributes.customAttributes[customField];
    }

    return undefined;
  }

  /**
   * 创建预定义分群
   */
  async createPredefinedSegments(): Promise<void> {
    // 活跃用户
    await this.createSegment({
      name: '活跃用户',
      description: '最近7天内有活动的用户',
      rules: [
        { field: 'daysSinceLastSeen', operator: 'lte', value: 7 },
      ],
      ruleLogic: 'and',
    });

    // 高价值用户
    await this.createSegment({
      name: '高价值用户',
      description: '购买金额超过1000元的用户',
      rules: [
        { field: 'totalPurchaseAmount', operator: 'gte', value: 1000 },
      ],
      ruleLogic: 'and',
    });

    // 新用户
    await this.createSegment({
      name: '新用户',
      description: '最近30天内首次访问的用户',
      rules: [
        { field: 'daysSinceFirstSeen', operator: 'lte', value: 30 },
      ],
      ruleLogic: 'and',
    });

    // 流失风险用户
    await this.createSegment({
      name: '流失风险用户',
      description: '超过14天未活动的用户',
      rules: [
        { field: 'daysSinceLastSeen', operator: 'gte', value: 14 },
        { field: 'totalPurchases', operator: 'gte', value: 1 },
      ],
      ruleLogic: 'and',
    });

    // 移动端用户
    await this.createSegment({
      name: '移动端用户',
      description: '主要使用移动设备的用户',
      rules: [
        { field: 'deviceTypes', operator: 'contains', value: 'mobile' },
      ],
      ruleLogic: 'and',
    });
  }
}

// 单例
let segmentServiceInstance: SegmentService | null = null;

/**
 * 获取用户分群服务实例
 */
export function getSegmentService(): SegmentService {
  if (!segmentServiceInstance) {
    segmentServiceInstance = new SegmentService();
  }
  return segmentServiceInstance;
}

/**
 * 重置用户分群服务
 */
export function resetSegmentService(): void {
  segmentServiceInstance = null;
}

export default SegmentService;

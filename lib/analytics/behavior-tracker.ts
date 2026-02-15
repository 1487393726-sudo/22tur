/**
 * Behavior Tracker Service
 * 用户行为追踪服务
 */

import { v4 as uuidv4 } from 'uuid';
import {
  BehaviorEvent,
  TrackEventRequest,
  SessionInfo,
  EventStats,
  PageStats,
  AnalyticsQuery,
  IBehaviorTracker,
  AnalyticsConfig,
  DEFAULT_ANALYTICS_CONFIG,
  EventType,
} from './types';

/**
 * 行为追踪服务
 */
export class BehaviorTracker implements IBehaviorTracker {
  private config: AnalyticsConfig;
  private events: Map<string, BehaviorEvent> = new Map();
  private sessions: Map<string, SessionInfo> = new Map();
  private currentSessionId: string | null = null;

  constructor(config?: Partial<AnalyticsConfig>) {
    this.config = { ...DEFAULT_ANALYTICS_CONFIG, ...config };
  }

  /**
   * 追踪事件
   */
  async track(request: TrackEventRequest): Promise<string> {
    // 采样检查
    if (Math.random() > this.config.samplingRate) {
      return '';
    }

    const sessionId = this.currentSessionId || this.startSession();
    const eventId = uuidv4();

    const event: BehaviorEvent = {
      id: eventId,
      sessionId,
      eventType: request.eventType,
      eventName: request.eventName,
      eventData: request.eventData || {},
      pageUrl: request.pageUrl,
      pagePath: request.pagePath,
      pageTitle: request.pageTitle,
      referrer: request.referrer,
      duration: request.duration,
      timestamp: new Date(),
    };

    // 存储事件
    this.events.set(eventId, event);

    // 更新会话
    this.updateSession(sessionId, event);

    // 异步持久化（实际项目中应该发送到后端）
    this.persistEvent(event);

    return eventId;
  }

  /**
   * 追踪页面浏览
   */
  async trackPageView(pageUrl: string, pageTitle?: string): Promise<string> {
    const url = new URL(pageUrl, 'http://localhost');
    return this.track({
      eventType: 'page_view',
      eventData: { url: pageUrl, title: pageTitle },
      pageUrl,
      pagePath: url.pathname,
      pageTitle,
    });
  }

  /**
   * 追踪点击
   */
  async trackClick(elementId: string, elementText?: string): Promise<string> {
    return this.track({
      eventType: 'click',
      eventData: { elementId, elementText },
    });
  }

  /**
   * 追踪搜索
   */
  async trackSearch(query: string, resultsCount?: number): Promise<string> {
    return this.track({
      eventType: 'search',
      eventData: { query, resultsCount },
    });
  }

  /**
   * 追踪购买
   */
  async trackPurchase(orderId: string, amount: number, items?: unknown[]): Promise<string> {
    return this.track({
      eventType: 'purchase',
      eventData: { orderId, amount, items, currency: 'CNY' },
    });
  }

  /**
   * 追踪注册
   */
  async trackSignup(userId: string, method?: string): Promise<string> {
    return this.track({
      eventType: 'signup',
      eventData: { userId, method },
    });
  }

  /**
   * 追踪登录
   */
  async trackLogin(userId: string, method?: string): Promise<string> {
    return this.track({
      eventType: 'login',
      eventData: { userId, method },
    });
  }

  /**
   * 追踪自定义事件
   */
  async trackCustom(eventName: string, eventData?: Record<string, unknown>): Promise<string> {
    return this.track({
      eventType: 'custom',
      eventName,
      eventData,
    });
  }

  /**
   * 开始会话
   */
  startSession(userId?: string): string {
    const sessionId = uuidv4();
    const now = new Date();

    const session: SessionInfo = {
      sessionId,
      userId,
      startTime: now,
      lastActivityTime: now,
      pageViews: 0,
      events: 0,
      duration: 0,
    };

    this.sessions.set(sessionId, session);
    this.currentSessionId = sessionId;

    return sessionId;
  }

  /**
   * 结束会话
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.duration = Date.now() - session.startTime.getTime();
      
      // 获取最后一个页面作为退出页
      const sessionEvents = Array.from(this.events.values())
        .filter(e => e.sessionId === sessionId && e.eventType === 'page_view')
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      if (sessionEvents.length > 0) {
        session.exitPage = sessionEvents[0].pagePath;
      }

      // 持久化会话
      await this.persistSession(session);
    }

    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }
  }

  /**
   * 获取会话信息
   */
  async getSession(sessionId: string): Promise<SessionInfo | null> {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * 设置用户 ID
   */
  setUserId(userId: string): void {
    if (this.currentSessionId) {
      const session = this.sessions.get(this.currentSessionId);
      if (session) {
        session.userId = userId;
      }
    }
  }

  /**
   * 获取事件列表
   */
  async getEvents(query: AnalyticsQuery): Promise<BehaviorEvent[]> {
    let events = Array.from(this.events.values());

    // 时间范围过滤
    events = events.filter(e => 
      e.timestamp >= query.timeRange.start && 
      e.timestamp <= query.timeRange.end
    );

    // 事件类型过滤
    if (query.eventTypes && query.eventTypes.length > 0) {
      events = events.filter(e => query.eventTypes!.includes(e.eventType));
    }

    // 用户过滤
    if (query.userId) {
      const userSessions = Array.from(this.sessions.values())
        .filter(s => s.userId === query.userId)
        .map(s => s.sessionId);
      events = events.filter(e => userSessions.includes(e.sessionId));
    }

    // 会话过滤
    if (query.sessionId) {
      events = events.filter(e => e.sessionId === query.sessionId);
    }

    // 排序
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // 限制数量
    if (query.limit) {
      events = events.slice(0, query.limit);
    }

    return events;
  }

  /**
   * 获取事件统计
   */
  async getEventStats(query: AnalyticsQuery): Promise<EventStats[]> {
    const events = await this.getEvents(query);
    const statsMap = new Map<string, { count: number; users: Set<string> }>();

    for (const event of events) {
      const key = event.eventName 
        ? `${event.eventType}:${event.eventName}` 
        : event.eventType;
      
      if (!statsMap.has(key)) {
        statsMap.set(key, { count: 0, users: new Set() });
      }

      const stat = statsMap.get(key)!;
      stat.count++;
      
      const session = this.sessions.get(event.sessionId);
      if (session?.userId) {
        stat.users.add(session.userId);
      }
    }

    const stats: EventStats[] = [];
    for (const [key, value] of statsMap) {
      const [eventType, eventName] = key.split(':');
      stats.push({
        eventType: eventType as EventType,
        eventName: eventName || undefined,
        count: value.count,
        uniqueUsers: value.users.size,
        avgPerUser: value.users.size > 0 ? value.count / value.users.size : 0,
      });
    }

    return stats.sort((a, b) => b.count - a.count);
  }

  /**
   * 获取页面统计
   */
  async getPageStats(query: AnalyticsQuery): Promise<PageStats[]> {
    const events = await this.getEvents({
      ...query,
      eventTypes: ['page_view'],
    });

    const pageMap = new Map<string, {
      pageTitle?: string;
      views: number;
      visitors: Set<string>;
      durations: number[];
      bounces: number;
      exits: number;
    }>();

    // 按会话分组事件
    const sessionEvents = new Map<string, BehaviorEvent[]>();
    for (const event of events) {
      if (!sessionEvents.has(event.sessionId)) {
        sessionEvents.set(event.sessionId, []);
      }
      sessionEvents.get(event.sessionId)!.push(event);
    }

    // 统计每个页面
    for (const event of events) {
      const path = event.pagePath || '/';
      
      if (!pageMap.has(path)) {
        pageMap.set(path, {
          pageTitle: event.pageTitle,
          views: 0,
          visitors: new Set(),
          durations: [],
          bounces: 0,
          exits: 0,
        });
      }

      const stat = pageMap.get(path)!;
      stat.views++;
      
      const session = this.sessions.get(event.sessionId);
      if (session?.userId) {
        stat.visitors.add(session.userId);
      }

      if (event.duration) {
        stat.durations.push(event.duration);
      }

      // 检查是否是跳出（会话只有一个页面浏览）
      const sessionPageViews = sessionEvents.get(event.sessionId) || [];
      if (sessionPageViews.length === 1) {
        stat.bounces++;
      }

      // 检查是否是退出页
      const sortedSessionEvents = sessionPageViews.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
      if (sortedSessionEvents[0]?.id === event.id) {
        stat.exits++;
      }
    }

    const stats: PageStats[] = [];
    for (const [path, value] of pageMap) {
      const avgDuration = value.durations.length > 0
        ? value.durations.reduce((a, b) => a + b, 0) / value.durations.length
        : 0;

      stats.push({
        pagePath: path,
        pageTitle: value.pageTitle,
        pageViews: value.views,
        uniqueVisitors: value.visitors.size,
        avgDuration,
        bounceRate: value.views > 0 ? value.bounces / value.views : 0,
        exitRate: value.views > 0 ? value.exits / value.views : 0,
      });
    }

    return stats.sort((a, b) => b.pageViews - a.pageViews);
  }

  /**
   * 更新会话
   */
  private updateSession(sessionId: string, event: BehaviorEvent): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivityTime = event.timestamp;
      session.events++;
      session.duration = event.timestamp.getTime() - session.startTime.getTime();

      if (event.eventType === 'page_view') {
        session.pageViews++;
        if (!session.entryPage) {
          session.entryPage = event.pagePath;
        }
      }
    }
  }

  /**
   * 持久化事件（实际项目中应该发送到后端）
   */
  private async persistEvent(event: BehaviorEvent): Promise<void> {
    // 在实际项目中，这里应该发送到后端 API
    // await fetch('/api/analytics/events', {
    //   method: 'POST',
    //   body: JSON.stringify(event),
    // });
    console.log('[BehaviorTracker] Event tracked:', event.eventType, event.id);
  }

  /**
   * 持久化会话
   */
  private async persistSession(session: SessionInfo): Promise<void> {
    // 在实际项目中，这里应该发送到后端 API
    console.log('[BehaviorTracker] Session ended:', session.sessionId);
  }

  /**
   * 清理过期数据
   */
  async cleanup(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    // 清理过期事件
    for (const [id, event] of this.events) {
      if (event.timestamp < cutoffDate) {
        this.events.delete(id);
      }
    }

    // 清理过期会话
    for (const [id, session] of this.sessions) {
      if (session.startTime < cutoffDate) {
        this.sessions.delete(id);
      }
    }
  }

  /**
   * 获取统计摘要
   */
  getStats(): { events: number; sessions: number } {
    return {
      events: this.events.size,
      sessions: this.sessions.size,
    };
  }
}

// 单例
let behaviorTrackerInstance: BehaviorTracker | null = null;

/**
 * 获取行为追踪服务实例
 */
export function getBehaviorTracker(config?: Partial<AnalyticsConfig>): BehaviorTracker {
  if (!behaviorTrackerInstance) {
    behaviorTrackerInstance = new BehaviorTracker(config);
  }
  return behaviorTrackerInstance;
}

/**
 * 重置行为追踪服务
 */
export function resetBehaviorTracker(): void {
  behaviorTrackerInstance = null;
}

export default BehaviorTracker;

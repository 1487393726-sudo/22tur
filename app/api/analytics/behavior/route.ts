/**
 * Behavior Analytics API
 * 行为分析 API 端点
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getBehaviorTracker,
  TrackEventRequest,
  EventType,
} from '@/lib/analytics';

/**
 * GET /api/analytics/behavior
 * 获取行为事件列表和统计
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'events';

    // 解析时间范围
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const timeRange = {
      start: startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate) : new Date(),
    };

    // 解析过滤条件
    const eventTypesParam = searchParams.get('eventTypes');
    const eventTypes = eventTypesParam ? eventTypesParam.split(',') as EventType[] : undefined;
    const userId = searchParams.get('userId') || undefined;
    const sessionId = searchParams.get('sessionId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const tracker = getBehaviorTracker();

    switch (action) {
      case 'events': {
        const events = await tracker.getEvents({
          timeRange,
          eventTypes,
          userId,
          sessionId,
          limit,
        });
        return NextResponse.json({
          success: true,
          data: { events, total: events.length },
        });
      }

      case 'eventStats': {
        const stats = await tracker.getEventStats({
          timeRange,
          eventTypes,
          userId,
        });
        return NextResponse.json({
          success: true,
          data: { stats },
        });
      }

      case 'pageStats': {
        const stats = await tracker.getPageStats({
          timeRange,
          userId,
        });
        return NextResponse.json({
          success: true,
          data: { stats },
        });
      }

      case 'session': {
        if (!sessionId) {
          return NextResponse.json({ error: '缺少 sessionId' }, { status: 400 });
        }
        const sessionInfo = await tracker.getSession(sessionId);
        return NextResponse.json({
          success: true,
          data: { session: sessionInfo },
        });
      }

      case 'stats': {
        const stats = tracker.getStats();
        return NextResponse.json({
          success: true,
          data: stats,
        });
      }

      default:
        return NextResponse.json({ error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Behavior API] 获取数据失败:', error);
    return NextResponse.json(
      { error: '获取数据失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/behavior
 * 追踪行为事件
 */
export async function POST(request: NextRequest) {
  try {
    // 事件追踪不需要登录（用于前端埋点）
    const body = await request.json();
    const { eventType, eventName, eventData, pageUrl, pagePath, pageTitle, referrer, duration } = body;

    if (!eventType) {
      return NextResponse.json({ error: '缺少事件类型' }, { status: 400 });
    }

    const tracker = getBehaviorTracker();

    const trackRequest: TrackEventRequest = {
      eventType,
      eventName,
      eventData,
      pageUrl,
      pagePath,
      pageTitle,
      referrer,
      duration,
    };

    const eventId = await tracker.track(trackRequest);

    return NextResponse.json({
      success: true,
      data: { eventId },
    });
  } catch (error) {
    console.error('[Behavior API] 追踪事件失败:', error);
    return NextResponse.json(
      { error: '追踪事件失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

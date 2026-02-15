import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { monitoringService } from '@/lib/monitoring/monitoring-service';
import { alertEngine } from '@/lib/monitoring/alert-engine';

// GET /api/admin/monitoring - 获取监控数据
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'overview';

    switch (action) {
      case 'overview': {
        // 获取系统概览
        const health = await monitoringService.getHealthStatus();
        const activeAlerts = await monitoringService.getActiveAlerts();
        
        // 获取关键指标
        const now = new Date();
        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const timeRange = { start: hourAgo, end: now };

        const [httpRequests, errorRate, avgLatency] = await Promise.all([
          monitoringService.getLatestValue('http_requests_total'),
          monitoringService.getLatestValue('http_error_rate'),
          monitoringService.getPercentiles('http_request_duration_seconds', timeRange),
        ]);

        return NextResponse.json({
          health,
          activeAlerts: activeAlerts.length,
          alerts: activeAlerts.slice(0, 5),
          metrics: {
            httpRequests: httpRequests || 0,
            errorRate: errorRate || 0,
            latency: avgLatency,
          },
        });
      }

      case 'metrics': {
        // 获取指标数据
        const name = searchParams.get('name');
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        const interval = searchParams.get('interval') || '1m';
        const aggregation = searchParams.get('aggregation') || 'avg';

        if (!name) {
          return NextResponse.json({ error: '缺少指标名称' }, { status: 400 });
        }

        const timeRange = {
          start: start ? new Date(start) : new Date(Date.now() - 60 * 60 * 1000),
          end: end ? new Date(end) : new Date(),
        };

        const result = await monitoringService.getMetrics({
          name,
          timeRange,
          interval,
          aggregation: aggregation as any,
        });

        return NextResponse.json(result);
      }

      case 'alerts': {
        // 获取告警列表
        const status = searchParams.get('status');
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        const timeRange = {
          start: start ? new Date(start) : new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: end ? new Date(end) : new Date(),
        };

        let alerts;
        if (status === 'active') {
          alerts = await monitoringService.getActiveAlerts();
        } else {
          alerts = await monitoringService.getAlertHistory(timeRange);
        }

        return NextResponse.json({ alerts });
      }

      case 'rules': {
        // 获取告警规则
        const rules = await monitoringService.getAlertRules();
        return NextResponse.json({ rules });
      }

      case 'stats': {
        // 获取告警统计
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        const timeRange = {
          start: start ? new Date(start) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: end ? new Date(end) : new Date(),
        };

        const stats = await alertEngine.getAlertStats(timeRange);
        return NextResponse.json(stats);
      }

      case 'health': {
        // 获取健康状态
        const health = await monitoringService.getHealthStatus();
        return NextResponse.json(health);
      }

      default:
        return NextResponse.json({ error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('获取监控数据失败:', error);
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}

// POST /api/admin/monitoring - 创建/管理监控
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'createRule': {
        // 创建告警规则
        const { name, metric, condition, threshold, duration, severity, channels, webhookUrl, recipients } = body;

        if (!name || !metric || !condition || threshold === undefined || !severity || !channels) {
          return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
        }

        const rule = await monitoringService.createAlertRule({
          name,
          metric,
          condition,
          threshold,
          duration: duration || 0,
          severity,
          channels,
          webhookUrl,
          recipients,
          isActive: true,
        });

        return NextResponse.json({ rule });
      }

      case 'updateRule': {
        // 更新告警规则
        const { id, ...updates } = body;

        if (!id) {
          return NextResponse.json({ error: '缺少规则 ID' }, { status: 400 });
        }

        const rule = await monitoringService.updateAlertRule(id, updates);
        return NextResponse.json({ rule });
      }

      case 'deleteRule': {
        // 删除告警规则
        const { id } = body;

        if (!id) {
          return NextResponse.json({ error: '缺少规则 ID' }, { status: 400 });
        }

        await monitoringService.deleteAlertRule(id);
        return NextResponse.json({ success: true });
      }

      case 'acknowledgeAlert': {
        // 确认告警
        const { alertId } = body;

        if (!alertId) {
          return NextResponse.json({ error: '缺少告警 ID' }, { status: 400 });
        }

        await monitoringService.acknowledgeAlert(alertId, session.user.id);
        return NextResponse.json({ success: true });
      }

      case 'resolveAlert': {
        // 解决告警
        const { alertId } = body;

        if (!alertId) {
          return NextResponse.json({ error: '缺少告警 ID' }, { status: 400 });
        }

        await monitoringService.resolveAlert(alertId);
        return NextResponse.json({ success: true });
      }

      case 'recordMetric': {
        // 记录指标（用于测试）
        const { name, value, labels } = body;

        if (!name || value === undefined) {
          return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
        }

        monitoringService.recordMetric({ name, value, labels });
        return NextResponse.json({ success: true });
      }

      case 'checkAlerts': {
        // 手动触发告警检查
        const alerts = await monitoringService.checkAlerts();
        return NextResponse.json({ alerts });
      }

      default:
        return NextResponse.json({ error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('监控操作失败:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}

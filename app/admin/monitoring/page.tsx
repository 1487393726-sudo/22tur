'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Database,
  Plus,
  RefreshCw,
  Server,
  Settings,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, {
    status: 'up' | 'down' | 'degraded';
    latency?: number;
    message?: string;
    lastCheck: string;
  }>;
  uptime: number;
  version: string;
}

interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  metric: string;
  value: number;
  threshold: number;
  condition: string;
  severity: 'info' | 'warning' | 'critical';
  status: string;
  message: string;
  triggeredAt: string;
  resolvedAt?: string;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  duration: number;
  severity: string;
  channels: string[];
  isActive: boolean;
}

interface AlertStats {
  total: number;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
  topRules: Array<{ ruleId: string; ruleName: string; count: number }>;
}

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    metric: '',
    condition: 'gt',
    threshold: 0,
    duration: 0,
    severity: 'warning',
    channels: ['email'],
  });

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      const [healthRes, alertsRes, rulesRes, statsRes] = await Promise.all([
        fetch('/api/admin/monitoring?action=health'),
        fetch('/api/admin/monitoring?action=alerts&status=active'),
        fetch('/api/admin/monitoring?action=rules'),
        fetch('/api/admin/monitoring?action=stats'),
      ]);

      if (healthRes.ok) setHealth(await healthRes.json());
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts || []);
      }
      if (rulesRes.ok) {
        const data = await rulesRes.json();
        setRules(data.rules || []);
      }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error('加载监控数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // 每30秒刷新一次
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // 刷新数据
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // 确认告警
  const handleAcknowledge = async (alertId: string) => {
    try {
      await fetch('/api/admin/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledgeAlert', alertId }),
      });
      loadData();
    } catch (error) {
      console.error('确认告警失败:', error);
    }
  };

  // 解决告警
  const handleResolve = async (alertId: string) => {
    try {
      await fetch('/api/admin/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolveAlert', alertId }),
      });
      loadData();
    } catch (error) {
      console.error('解决告警失败:', error);
    }
  };

  // 创建规则
  const handleCreateRule = async () => {
    try {
      await fetch('/api/admin/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createRule', ...newRule }),
      });
      setShowCreateRule(false);
      setNewRule({
        name: '',
        metric: '',
        condition: 'gt',
        threshold: 0,
        duration: 0,
        severity: 'warning',
        channels: ['email'],
      });
      loadData();
    } catch (error) {
      console.error('创建规则失败:', error);
    }
  };

  // 切换规则状态
  const handleToggleRule = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/admin/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateRule', id, isActive: !isActive }),
      });
      loadData();
    } catch (error) {
      console.error('更新规则失败:', error);
    }
  };

  // 删除规则
  const handleDeleteRule = async (id: string) => {
    if (!confirm('确定要删除此规则吗？')) return;
    try {
      await fetch('/api/admin/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteRule', id }),
      });
      loadData();
    } catch (error) {
      console.error('删除规则失败:', error);
    }
  };

  // 格式化运行时间
  const formatUptime = (ms: number) => {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // 获取严重级别颜色
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold theme-gradient-text">监控中心</h1>
          <p className="text-muted-foreground">系统监控与告警管理</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 系统状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">系统状态</p>
                <p className="text-2xl font-bold capitalize">{health?.status || '-'}</p>
              </div>
              <div className={`h-12 w-12 rounded-full ${getStatusColor(health?.status || '')} flex items-center justify-center`}>
                {health?.status === 'healthy' ? (
                  <CheckCircle className="h-6 w-6 text-white" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">活跃告警</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <Bell className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">运行时间</p>
                <p className="text-2xl font-bold">{health ? formatUptime(health.uptime) : '-'}</p>
              </div>
              <Clock className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">版本</p>
                <p className="text-2xl font-bold">{health?.version || '-'}</p>
              </div>
              <Zap className="h-12 w-12 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="text-muted-foreground h-9 items-center justify-center rounded-lg p-[3px] bg-white/10 border-white/20 backdrop-blur-sm">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="alerts">告警</TabsTrigger>
          <TabsTrigger value="rules">规则</TabsTrigger>
          <TabsTrigger value="components">组件</TabsTrigger>
        </TabsList>

        {/* 概览 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 告警统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  告警统计 (7天)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>总告警数</span>
                    <span className="font-bold">{stats?.total || 0}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-red-500">严重</span>
                      <span>{stats?.bySeverity?.critical || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-500">警告</span>
                      <span>{stats?.bySeverity?.warning || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-500">信息</span>
                      <span>{stats?.bySeverity?.info || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top 告警规则 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Top 告警规则
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.topRules?.slice(0, 5).map((rule, index) => (
                    <div key={rule.ruleId} className="flex justify-between items-center">
                      <span className="truncate">{index + 1}. {rule.ruleName}</span>
                      <Badge variant="secondary">{rule.count}</Badge>
                    </div>
                  )) || <p className="text-muted-foreground">暂无数据</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 告警列表 */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>活跃告警</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>当前没有活跃告警</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(alert.severity) as any}>
                            {alert.severity}
                          </Badge>
                          <span className="font-medium">{alert.ruleName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          触发时间: {new Date(alert.triggeredAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          确认
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleResolve(alert.id)}
                        >
                          解决
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 规则管理 */}
        <TabsContent value="rules">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>告警规则</CardTitle>
              <Dialog open={showCreateRule} onOpenChange={setShowCreateRule}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    创建规则
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建告警规则</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>规则名称</Label>
                      <Input
                        value={newRule.name}
                        onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                        placeholder="例如: CPU 使用率过高"
                      />
                    </div>
                    <div>
                      <Label>指标名称</Label>
                      <Input
                        value={newRule.metric}
                        onChange={(e) => setNewRule({ ...newRule, metric: e.target.value })}
                        placeholder="例如: process_cpu_usage"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>条件</Label>
                        <Select
                          value={newRule.condition}
                          onValueChange={(v) => setNewRule({ ...newRule, condition: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gt">大于</SelectItem>
                            <SelectItem value="gte">大于等于</SelectItem>
                            <SelectItem value="lt">小于</SelectItem>
                            <SelectItem value="lte">小于等于</SelectItem>
                            <SelectItem value="eq">等于</SelectItem>
                            <SelectItem value="ne">不等于</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>阈值</Label>
                        <Input
                          type="number"
                          value={newRule.threshold}
                          onChange={(e) => setNewRule({ ...newRule, threshold: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>严重级别</Label>
                      <Select
                        value={newRule.severity}
                        onValueChange={(v) => setNewRule({ ...newRule, severity: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">信息</SelectItem>
                          <SelectItem value="warning">警告</SelectItem>
                          <SelectItem value="critical">严重</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateRule} className="w-full">
                      创建
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rule.name}</span>
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? '启用' : '禁用'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.metric} {rule.condition} {rule.threshold}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleRule(rule.id, rule.isActive)}
                      >
                        {rule.isActive ? '禁用' : '启用'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                ))}
                {rules.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">暂无告警规则</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 组件状态 */}
        <TabsContent value="components">
          <Card>
            <CardHeader>
              <CardTitle>组件状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {health?.components && Object.entries(health.components).map(([name, component]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(component.status)}`} />
                      <div>
                        <p className="font-medium capitalize">{name}</p>
                        {component.latency && (
                          <p className="text-sm text-muted-foreground">
                            延迟: {component.latency}ms
                          </p>
                        )}
                        {component.message && (
                          <p className="text-sm text-red-500">{component.message}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={component.status === 'up' ? 'default' : 'destructive'}>
                      {component.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

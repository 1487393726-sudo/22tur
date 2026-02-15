'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Loader2,
  Shield,
  RefreshCw,
  Unlock,
  AlertTriangle,
  Info,
  AlertCircle,
  Download,
  Eye,
  Trash2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface SecurityEvent {
  id: string;
  userId?: string;
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export default function AdminSecurityEventsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [severityFilter, setSeverityFilter] = useState('');
  const [resolvedFilter, setResolvedFilter] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [stats, setStats] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unresolved: 0,
  });

  const dateLocale = locale === 'zh' ? zhCN : enUS;

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, [page, severityFilter, resolvedFilter, eventTypeFilter]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/security-events/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (severityFilter) params.set('severity', severityFilter);
      if (resolvedFilter) params.set('resolved', resolvedFilter);
      if (eventTypeFilter) params.set('eventType', eventTypeFilter);

      const response = await fetch(`/api/admin/security-events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      toast.error(t('securityEvents.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockAccount = async (identifier: string) => {
    setUnlocking(identifier);
    try {
      const response = await fetch(`/api/admin/accounts/${encodeURIComponent(identifier)}/unlock`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(t('securityEvents.accountUnlocked'));
        fetchEvents();
      } else {
        const data = await response.json();
        toast.error(data.error || t('securityEvents.unlockFailed'));
      }
    } catch (error) {
      toast.error(t('securityEvents.unlockFailed'));
    } finally {
      setUnlocking(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/security-events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('事件已删除');
        fetchEvents();
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleExportEvents = async () => {
    try {
      const response = await fetch('/api/admin/security-events/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-events-${new Date().toISOString()}.csv`;
        a.click();
        toast.success('导出成功');
      }
    } catch (error) {
      toast.error('导出失败');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'LOW':
        return (
          <Badge variant="secondary">
            <Info className="mr-1 h-3 w-3" />
            低
          </Badge>
        );
      case 'MEDIUM':
        return (
          <Badge variant="default" className="bg-yellow-500">
            <AlertCircle className="mr-1 h-3 w-3" />
            中
          </Badge>
        );
      case 'HIGH':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" />
            高
          </Badge>
        );
      case 'CRITICAL':
        return (
          <Badge variant="destructive" className="bg-red-700">
            <AlertTriangle className="mr-1 h-3 w-3" />
            严重
          </Badge>
        );
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container py-8 space-y-8">
      {/* 扫描和防护功能 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 安全扫描 */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5" />
              安全扫描
            </CardTitle>
            <CardDescription className="text-gray-300">
              扫描系统安全漏洞
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-200">扫描项目：</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>✓ 恶意软件检测</li>
                <li>✓ 漏洞扫描</li>
                <li>✓ 配置审计</li>
                <li>✓ 权限检查</li>
              </ul>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Shield className="h-4 w-4 mr-2" />
              开始扫描
            </Button>
          </CardContent>
        </Card>

        {/* DDoS 防护 */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5" />
              DDoS 防护
            </CardTitle>
            <CardDescription className="text-gray-300">
              防护分布式拒绝服务攻击
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                <span className="text-sm text-gray-200">防护状态</span>
                <Badge className="bg-green-500/20 text-green-300">✓ 已启用</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                <span className="text-sm text-gray-200">当前请求速率</span>
                <span className="text-sm text-gray-100 font-medium">1,234 req/s</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                <span className="text-sm text-gray-200">阻止的请求</span>
                <span className="text-sm text-gray-100 font-medium">45 个</span>
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Shield className="h-4 w-4 mr-2" />
              配置防护
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">严重事件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.critical}</div>
            <p className="text-xs text-gray-300 mt-1">需要立即处理</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">高风险</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.high}</div>
            <p className="text-xs text-gray-300 mt-1">需要关注</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">中等风险</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.medium}</div>
            <p className="text-xs text-gray-300 mt-1">监控中</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">低风险</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.low}</div>
            <p className="text-xs text-gray-300 mt-1">已记录</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-white">未解决</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.unresolved}</div>
            <p className="text-xs text-gray-300 mt-1">待处理</p>
          </CardContent>
        </Card>
      </div>

      {/* 主表格 */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-6 w-6" />
            安全事件
          </CardTitle>
          <CardDescription className="text-gray-300">监控和管理系统安全事件</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 过滤器 */}
          <div className="flex flex-wrap gap-2">
            <Select value={severityFilter || 'all'} onValueChange={(value) => setSeverityFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="所有严重级别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有严重级别</SelectItem>
                <SelectItem value="LOW">低</SelectItem>
                <SelectItem value="MEDIUM">中</SelectItem>
                <SelectItem value="HIGH">高</SelectItem>
                <SelectItem value="CRITICAL">严重</SelectItem>
              </SelectContent>
            </Select>

            <Select value={eventTypeFilter || 'all'} onValueChange={(value) => setEventTypeFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="所有事件类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有事件类型</SelectItem>
                <SelectItem value="LOGIN_FAILED">登录失败</SelectItem>
                <SelectItem value="ACCOUNT_LOCKED">账户锁定</SelectItem>
                <SelectItem value="SUSPICIOUS_ACTIVITY">可疑活动</SelectItem>
                <SelectItem value="UNAUTHORIZED_ACCESS">未授权访问</SelectItem>
                <SelectItem value="DATA_BREACH">数据泄露</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resolvedFilter || 'all'} onValueChange={(value) => setResolvedFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="所有状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="false">未解决</SelectItem>
                <SelectItem value="true">已解决</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchEvents} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>

            <Button variant="outline" onClick={handleExportEvents}>
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
          </div>

          {/* 表格 */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">事件类型</TableHead>
                  <TableHead className="text-white">严重级别</TableHead>
                  <TableHead className="text-white">描述</TableHead>
                  <TableHead className="text-white">IP 地址</TableHead>
                  <TableHead className="text-white">状态</TableHead>
                  <TableHead className="text-white">时间</TableHead>
                  <TableHead className="text-white">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-white">
                      暂无安全事件
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium text-white">{event.eventType}</TableCell>
                      <TableCell className="text-white">{getSeverityBadge(event.severity)}</TableCell>
                      <TableCell className="max-w-xs truncate text-white">{event.description}</TableCell>
                      <TableCell className="font-mono text-sm text-white">{event.ipAddress || '-'}</TableCell>
                      <TableCell className="text-white">
                        {event.resolved ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-300">✓ 已解决</Badge>
                        ) : (
                          <Badge variant="destructive">✕ 未解决</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-white">
                        {format(new Date(event.createdAt), 'PPpp', { locale: dateLocale })}
                      </TableCell>
                      <TableCell className="space-x-2">
                        {event.eventType === 'ACCOUNT_LOCKED' && !event.resolved && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={unlocking !== null}
                              >
                                {unlocking === event.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Unlock className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>解锁账户</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要解锁此账户吗？
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    const metadata = event.metadata as { identifier?: string };
                                    if (metadata?.identifier) {
                                      handleUnlockAccount(metadata.identifier);
                                    }
                                  }}
                                >
                                  确认解锁
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                显示 {(page - 1) * pageSize + 1} 到 {Math.min(page * pageSize, total)} 条，共 {total} 条
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

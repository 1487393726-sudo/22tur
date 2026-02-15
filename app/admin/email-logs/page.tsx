'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Mail,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface EmailLog {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  action: string;
  recipient: string;
  subject: string;
  status: string;
  success: boolean;
  duration: number;
  error?: string;
  createdAt: string;
}

interface EmailStats {
  summary: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    period: string;
  };
  daily: Array<{
    date: string;
    sent: number;
    failed: number;
  }>;
  recentFailures: Array<{
    id: string;
    recipient: string;
    subject: string;
    error: string;
    createdAt: string;
  }>;
}

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // 筛选参数
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50,
  });

  // 分页信息
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [filters.page, filters.limit]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/admin/email-logs?${params}`);
      if (!response.ok) throw new Error('加载失败');

      const data = await response.json();
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('加载邮件日志失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/email-logs/stats?days=7');
      if (!response.ok) throw new Error('加载统计失败');

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    loadLogs();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadLogs(), loadStats()]);
    setRefreshing(false);
    toast.success('已刷新');
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/admin/email-logs/export?${params}`);
      if (!response.ok) throw new Error('导出失败');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `email-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('导出成功');
    } catch (error) {
      toast.error('导出失败');
      console.error(error);
    }
  };

  const getStatusBadge = (status: string, success: boolean) => {
    if (status === 'SUCCESS' || success) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          成功
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <XCircle className="mr-1 h-3 w-3" />
        失败
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8" />
            邮件日志
          </h1>
          <p className="text-muted-foreground mt-1">
            查看和管理系统邮件发送记录
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总发送量</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.summary.period}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">成功发送</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.summary.successful}
              </div>
              <p className="text-xs text-muted-foreground">
                成功率 {stats.summary.successRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">发送失败</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {stats.summary.failed}
              </div>
              <p className="text-xs text-muted-foreground">
                失败率 {(100 - stats.summary.successRate).toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日发送</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.daily[stats.daily.length - 1]?.sent || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                失败 {stats.daily[stats.daily.length - 1]?.failed || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  <SelectItem value="SUCCESS">成功</SelectItem>
                  <SelectItem value="FAILED">失败</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>搜索</Label>
              <Input
                placeholder="邮箱或主题"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="space-y-2">
              <Label>开始日期</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>结束日期</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 日志表格 */}
      <Card>
        <CardHeader>
          <CardTitle>邮件发送记录</CardTitle>
          <CardDescription>
            共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无邮件日志
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>收件人</TableHead>
                    <TableHead>主题</TableHead>
                    <TableHead>发送人</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>耗时</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss', {
                          locale: zhCN,
                        })}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.recipient}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.subject || '-'}
                      </TableCell>
                      <TableCell>
                        {log.user.firstName} {log.user.lastName}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.status, log.success)}
                      </TableCell>
                      <TableCell>
                        {log.duration ? `${log.duration}ms` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  显示 {(pagination.page - 1) * pagination.limit + 1} 到{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} 条，
                  共 {pagination.total} 条
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={!pagination.hasPrev}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={!pagination.hasNext}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 最近失败的邮件 */}
      {stats && stats.recentFailures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              最近失败的邮件
            </CardTitle>
            <CardDescription>最近 10 条发送失败的邮件</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentFailures.map((failure) => (
                <div
                  key={failure.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{failure.recipient}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {failure.subject}
                    </div>
                    <div className="text-sm text-red-500 mt-2">
                      错误: {failure.error}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                    {format(new Date(failure.createdAt), 'MM-dd HH:mm', {
                      locale: zhCN,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

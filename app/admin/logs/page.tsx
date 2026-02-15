'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  Info,
  AlertTriangle,
  Bug,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// 日志级别类型
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 日志条目接口
interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  source: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  stackTrace?: string;
  userId?: string;
  requestId?: string;
}

// 日志统计接口
interface LogStats {
  totalCount: number;
  byLevel: Record<LogLevel, number>;
  bySource: Record<string, number>;
  errorRate: number;
}

// 日志级别配置
const LOG_LEVEL_CONFIG: Record<LogLevel, { icon: React.ReactNode; color: string; bgColor: string }> = {
  debug: {
    icon: <Bug className="h-4 w-4" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  info: {
    icon: <Info className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  warn: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  error: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  
  // 过滤条件
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('1h');
  
  // 分页
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // 获取时间范围
  const getTimeRange = useCallback(() => {
    const now = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case '15m':
        start.setMinutes(now.getMinutes() - 15);
        break;
      case '1h':
        start.setHours(now.getHours() - 1);
        break;
      case '6h':
        start.setHours(now.getHours() - 6);
        break;
      case '24h':
        start.setDate(now.getDate() - 1);
        break;
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      default:
        start.setHours(now.getHours() - 1);
    }
    
    return { start, end: now };
  }, [timeRange]);

  // 加载日志
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { start, end } = getTimeRange();
      const params = new URLSearchParams({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (searchQuery) params.set('search', searchQuery);
      if (levelFilter !== 'all') params.set('level', levelFilter);
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      
      const response = await fetch(`/api/admin/logs?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data.logs || []);
        setTotalPages(Math.ceil((data.data.total || 0) / pageSize));
        setStats(data.data.stats || null);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  }, [getTimeRange, page, searchQuery, levelFilter, sourceFilter]);

  // 导出日志
  const exportLogs = async (format: 'json' | 'csv') => {
    try {
      const { start, end } = getTimeRange();
      const params = new URLSearchParams({
        action: 'export',
        format,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      
      if (searchQuery) params.set('search', searchQuery);
      if (levelFilter !== 'all') params.set('level', levelFilter);
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      
      const response = await fetch(`/api/admin/logs?${params}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold theme-gradient-text">日志管理</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportLogs('json')}>
            <Download className="h-4 w-4 mr-2" />
            导出 JSON
          </Button>
          <Button variant="outline" onClick={() => exportLogs('csv')}>
            <Download className="h-4 w-4 mr-2" />
            导出 CSV
          </Button>
          <Button onClick={loadLogs} disabled={loading} className="theme-gradient-bg text-white hover:shadow-lg transition-shadow">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">总日志数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">错误数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.byLevel.error || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">警告数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.byLevel.warn || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">错误率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.errorRate.toFixed(2)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 过滤器 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索日志内容..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="日志级别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有级别</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="日志来源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有来源</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="auth">认证</SelectItem>
                <SelectItem value="database">数据库</SelectItem>
                <SelectItem value="queue">队列</SelectItem>
                <SelectItem value="storage">存储</SelectItem>
                <SelectItem value="system">系统</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15m">最近 15 分钟</SelectItem>
                <SelectItem value="1h">最近 1 小时</SelectItem>
                <SelectItem value="6h">最近 6 小时</SelectItem>
                <SelectItem value="24h">最近 24 小时</SelectItem>
                <SelectItem value="7d">最近 7 天</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 日志列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">时间</TableHead>
                <TableHead className="w-[100px]">级别</TableHead>
                <TableHead className="w-[100px]">来源</TableHead>
                <TableHead>消息</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    {loading ? '加载中...' : '暂无日志数据'}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const config = LOG_LEVEL_CONFIG[log.level];
                  return (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedLog(log)}
                    >
                      <TableCell className="font-mono text-sm">
                        {formatTime(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${config.bgColor} ${config.color}`}>
                          <span className="flex items-center gap-1">
                            {config.icon}
                            {log.level.toUpperCase()}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.source}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[500px] truncate">
                        {log.message}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            上一页
          </Button>
          <span className="text-sm text-gray-500">
            第 {page} 页，共 {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            下一页
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 日志详情对话框 */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>日志详情</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">时间</label>
                  <p className="font-mono">{new Date(selectedLog.timestamp).toLocaleString('zh-CN')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">级别</label>
                  <p>
                    <Badge className={`${LOG_LEVEL_CONFIG[selectedLog.level].bgColor} ${LOG_LEVEL_CONFIG[selectedLog.level].color}`}>
                      {selectedLog.level.toUpperCase()}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">来源</label>
                  <p><Badge variant="outline">{selectedLog.source}</Badge></p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="font-mono text-sm">{selectedLog.id}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">消息</label>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedLog.message}</p>
              </div>
              
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">元数据</label>
                  <pre className="mt-1 p-3 bg-gray-50 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedLog.stackTrace && (
                <div>
                  <label className="text-sm font-medium text-gray-500">堆栈跟踪</label>
                  <pre className="mt-1 p-3 bg-red-50 rounded-md text-sm overflow-x-auto text-red-800">
                    {selectedLog.stackTrace}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

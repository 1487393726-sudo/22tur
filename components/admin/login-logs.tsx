'use client';

// components/admin/login-logs.tsx
// 管理员登录日志组件

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Loader2,
  Download,
  Search,
  CheckCircle,
  XCircle,
  Ban,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface LoginLog {
  id: string;
  userId?: string;
  identifier: string;
  ipAddress: string;
  browser?: string;
  os?: string;
  location?: {
    country?: string;
    city?: string;
  };
  result: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  failureReason?: string;
  method: 'PASSWORD' | 'OAUTH' | '2FA';
  provider?: string;
  createdAt: string;
}

interface Filters {
  identifier: string;
  result: string;
  method: string;
  startDate: string;
  endDate: string;
}

export function LoginLogs() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<Filters>({
    identifier: '',
    result: '',
    method: '',
    startDate: '',
    endDate: '',
  });

  const dateLocale = locale === 'zh' ? zhCN : enUS;

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (filters.identifier) params.set('identifier', filters.identifier);
      if (filters.result) params.set('result', filters.result);
      if (filters.method) params.set('method', filters.method);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      const response = await fetch(`/api/admin/login-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      toast.error(t('loginLogs.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ format });
      if (filters.identifier) params.set('identifier', filters.identifier);
      if (filters.result) params.set('result', filters.result);
      if (filters.method) params.set('method', filters.method);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      const response = await fetch(`/api/admin/login-logs/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `login-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(t('loginLogs.exportSuccess'));
      }
    } catch (error) {
      toast.error(t('loginLogs.exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'SUCCESS':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t('loginLogs.success')}
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            {t('loginLogs.failed')}
          </Badge>
        );
      case 'BLOCKED':
        return (
          <Badge variant="secondary">
            <Ban className="mr-1 h-3 w-3" />
            {t('loginLogs.blocked')}
          </Badge>
        );
      default:
        return <Badge>{result}</Badge>;
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {/* 过滤器 */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder={t('loginLogs.searchPlaceholder')}
            value={filters.identifier}
            onChange={(e) =>
              setFilters({ ...filters, identifier: e.target.value })
            }
            className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
        <Select
          value={filters.result || 'all'}
          onValueChange={(value) => setFilters({ ...filters, result: value === 'all' ? '' : value })}
        >
          <SelectTrigger className="w-[150px] bg-white/10 border-white/20 text-white">
            <SelectValue placeholder={t('loginLogs.allResults')} />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/20">
            <SelectItem value="all" className="text-white hover:bg-white/10">{t('loginLogs.allResults')}</SelectItem>
            <SelectItem value="SUCCESS" className="text-white hover:bg-white/10">{t('loginLogs.success')}</SelectItem>
            <SelectItem value="FAILED" className="text-white hover:bg-white/10">{t('loginLogs.failed')}</SelectItem>
            <SelectItem value="BLOCKED" className="text-white hover:bg-white/10">{t('loginLogs.blocked')}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.method || 'all'}
          onValueChange={(value) => setFilters({ ...filters, method: value === 'all' ? '' : value })}
        >
          <SelectTrigger className="w-[150px] bg-white/10 border-white/20 text-white">
            <SelectValue placeholder={t('loginLogs.allMethods')} />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/20">
            <SelectItem value="all" className="text-white hover:bg-white/10">{t('loginLogs.allMethods')}</SelectItem>
            <SelectItem value="PASSWORD" className="text-white hover:bg-white/10">{t('loginLogs.password')}</SelectItem>
            <SelectItem value="OAUTH" className="text-white hover:bg-white/10">{t('loginLogs.oauth')}</SelectItem>
            <SelectItem value="2FA" className="text-white hover:bg-white/10">{t('loginLogs.2fa')}</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="w-[150px] bg-white/10 border-white/20 text-white"
        />
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="w-[150px] bg-white/10 border-white/20 text-white"
        />
        <Button variant="outline" onClick={fetchLogs} disabled={loading} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleExport('csv')}
          disabled={exporting}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          CSV
        </Button>
        <Button
          variant="outline"
          onClick={() => handleExport('json')}
          disabled={exporting}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          JSON
        </Button>
      </div>

      {/* 表格 */}
      <div className="border border-white/20 rounded-lg bg-white/5 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white">{t('loginLogs.identifier')}</TableHead>
              <TableHead className="text-white">{t('loginLogs.ipAddress')}</TableHead>
              <TableHead className="text-white">{t('loginLogs.device')}</TableHead>
              <TableHead className="text-white">{t('loginLogs.method')}</TableHead>
              <TableHead className="text-white">{t('loginLogs.result')}</TableHead>
              <TableHead className="text-white">{t('loginLogs.time')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                  {t('loginLogs.noLogs')}
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{log.identifier}</TableCell>
                  <TableCell className="text-gray-300">{log.ipAddress}</TableCell>
                  <TableCell className="text-gray-300">
                    {log.browser && log.os ? `${log.browser} / ${log.os}` : '-'}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {log.method}
                    {log.provider && ` (${log.provider})`}
                  </TableCell>
                  <TableCell>
                    {getResultBadge(log.result)}
                    {log.failureReason && (
                      <span className="ml-2 text-xs text-gray-400">
                        {log.failureReason}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {format(new Date(log.createdAt), 'PPpp', { locale: dateLocale })}
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
          <p className="text-sm text-gray-300">
            {t('loginLogs.showing', {
              from: (page - 1) * pageSize + 1,
              to: Math.min(page * pageSize, total),
              total,
            })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              {t('common.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

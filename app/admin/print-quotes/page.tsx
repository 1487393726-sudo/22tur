'use client';

/**
 * Admin Print Quotes Management Page
 * 管理员询价管理页面
 * Requirements: 2.1, 2.2
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  FileText,
  Search,
  RefreshCw,
  Eye,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { QUOTE_STATUS_LABELS, PRODUCT_TYPE_LABELS, QuoteStatus, ProductType } from '@/lib/printing/types';

interface PrintQuote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customer?: {
    id: string;
    username: string;
    email: string;
    phone?: string;
  };
  status: QuoteStatus;
  productType: ProductType;
  quantity: number;
  size: string;
  unitPrice?: number | null;
  totalPrice?: number | null;
  validUntil?: Date | null;
  createdAt: Date;
  quotedAt?: Date | null;
}

const statusColors: Record<QuoteStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  revised: 'bg-orange-100 text-orange-800',
  expired: 'bg-gray-100 text-gray-800',
  ordered: 'bg-purple-100 text-white',
};

export default function AdminPrintQuotesPage() {
  const [quotes, setQuotes] = useState<PrintQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // 加载询价列表
  useEffect(() => {
    loadQuotes();
  }, [page, statusFilter, dateFrom, dateTo]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (dateFrom) {
        params.append('dateFrom', dateFrom);
      }
      if (dateTo) {
        params.append('dateTo', dateTo);
      }

      const response = await fetch(`/api/admin/print-quotes?${params}`);
      if (!response.ok) throw new Error('Failed to load quotes');

      const data = await response.json();
      setQuotes(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 格式化金额
  const formatAmount = (amount: number | null | undefined) => {
    if (!amount) return '-';
    return `¥${(amount / 100).toFixed(2)}`;
  };

  // 过滤本地搜索
  const filteredQuotes = quotes.filter((quote) => {
    return (
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // 计算分页
  const totalPages = Math.ceil(total / pageSize);

  // 统计数据
  const stats = {
    total: total,
    pending: quotes.filter((q) => q.status === 'pending').length,
    quoted: quotes.filter((q) => q.status === 'quoted').length,
    accepted: quotes.filter((q) => q.status === 'accepted').length,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 theme-gradient-text">
            <FileText className="h-6 w-6" />
            询价管理
          </h1>
          <p className="text-muted-foreground mt-1">
            查看和管理所有客户询价请求
          </p>
        </div>
        <Button variant="outline" onClick={loadQuotes} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总询价数</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>待报价</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>已报价</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.quoted}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>已接受</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.accepted}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索询价号、客户名称或邮箱..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待报价</SelectItem>
                  <SelectItem value="quoted">已报价</SelectItem>
                  <SelectItem value="accepted">已接受</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                  <SelectItem value="revised">需修改</SelectItem>
                  <SelectItem value="expired">已过期</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* 日期范围筛选 */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground mb-2 block">开始日期</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-10"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground mb-2 block">结束日期</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-10"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 询价列表表格 */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">加载中...</div>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">暂无询价记录</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>询价号</TableHead>
                      <TableHead>客户</TableHead>
                      <TableHead>产品类型</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>报价</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          {quote.quoteNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{quote.customer?.username}</div>
                            <div className="text-sm text-muted-foreground">
                              {quote.customer?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {PRODUCT_TYPE_LABELS[quote.productType]}
                        </TableCell>
                        <TableCell>{quote.quantity}</TableCell>
                        <TableCell>
                          {quote.totalPrice ? formatAmount(quote.totalPrice) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[quote.status]}>
                            {QUOTE_STATUS_LABELS[quote.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(quote.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/print-quotes/${quote.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  显示 {(page - 1) * pageSize + 1} 到{' '}
                  {Math.min(page * pageSize, total)} 条，共 {total} 条
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, page - 2) + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

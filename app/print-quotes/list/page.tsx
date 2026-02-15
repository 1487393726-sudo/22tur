'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  QUOTE_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  QuoteStatus,
  PrintQuote,
} from '@/lib/printing/types';
import { AlertCircle, Plus, ChevronRight } from 'lucide-react';

/**
 * 印刷询价列表页面
 * Requirements: 1.2, 3.1
 */
export default function QuoteListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [quotes, setQuotes] = useState<PrintQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);

  // 获取询价列表
  useEffect(() => {
    const fetchQuotes = async () => {
      if (status !== 'authenticated') return;

      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        });

        if (selectedStatus !== 'all') {
          params.append('status', selectedStatus);
        }

        const response = await fetch(`/api/print-quotes?${params}`);
        if (!response.ok) {
          throw new Error('获取询价列表失败');
        }

        const data = await response.json();
        setQuotes(data.items);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [status, page, selectedStatus, pageSize]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>需要登录</CardTitle>
            <CardDescription>请先登录以查看询价列表</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90"
            >
              前往登录
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    quoted: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    revised: 'bg-orange-100 text-orange-800',
    expired: 'bg-gray-100 text-gray-800',
    ordered: 'bg-purple-100 text-purple-800',
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">我的询价</h1>
            <p className="text-gray-600 mt-2">管理您的所有印刷询价和报价</p>
          </div>
          <Button
            onClick={() => router.push('/print-quotes')}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            新建询价
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 筛选 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">状态筛选:</label>
              <Select value={selectedStatus} onValueChange={(value: any) => {
                setSelectedStatus(value);
                setPage(1);
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="pending">待报价</SelectItem>
                  <SelectItem value="quoted">已报价</SelectItem>
                  <SelectItem value="accepted">已接受</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                  <SelectItem value="revised">需修改</SelectItem>
                  <SelectItem value="expired">已过期</SelectItem>
                  <SelectItem value="ordered">已下单</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 询价列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>加载中...</p>
            </div>
          </div>
        ) : quotes.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-600 mb-4">暂无询价</p>
              <Button onClick={() => router.push('/print-quotes')}>
                创建新询价
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <Card
                key={quote.id}
                className="hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/print-quotes/${quote.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {quote.quoteNumber}
                        </h3>
                        <Badge className={statusColor[quote.status]}>
                          {QUOTE_STATUS_LABELS[quote.status as any]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="text-xs text-gray-500">产品类型</p>
                          <p className="font-medium text-gray-900">
                            {PRODUCT_TYPE_LABELS[quote.productType as any]}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">数量</p>
                          <p className="font-medium text-gray-900">{quote.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">尺寸</p>
                          <p className="font-medium text-gray-900">{quote.size}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">创建时间</p>
                          <p className="font-medium text-gray-900">
                            {new Date(quote.createdAt).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      </div>
                      {quote.totalPrice && (
                        <div className="mt-3 text-lg font-bold text-primary">
                          ¥{quote.totalPrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <div className="text-sm text-gray-600">
              第 {page} / {totalPages} 页
            </div>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

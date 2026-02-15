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
  ORDER_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  OrderStatus,
  PrintOrder,
} from '@/lib/printing/types';
import { AlertCircle, ChevronRight } from 'lucide-react';

/**
 * 印刷订单列表页面
 * Requirements: 2.1, 4.3, 4.4
 */
export default function OrderListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);

  // 获取订单列表
  useEffect(() => {
    const fetchOrders = async () => {
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

        const response = await fetch(`/api/print-orders?${params}`);
        if (!response.ok) {
          throw new Error('获取订单列表失败');
        }

        const data = await response.json();
        setOrders(data.items);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
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
            <CardDescription>请先登录以查看订单列表</CardDescription>
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
    pending_payment: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    in_production: 'bg-purple-100 text-purple-800',
    shipped: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的订单</h1>
          <p className="text-gray-600 mt-2">查看和管理您的所有印刷订单</p>
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
                  <SelectItem value="pending_payment">待支付</SelectItem>
                  <SelectItem value="paid">已支付</SelectItem>
                  <SelectItem value="in_production">生产中</SelectItem>
                  <SelectItem value="shipped">已发货</SelectItem>
                  <SelectItem value="delivered">已送达</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 订单列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>加载中...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-600 mb-4">暂无订单</p>
              <Button onClick={() => router.push('/print-quotes')}>
                创建新询价
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/print-orders/${order.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {order.orderNumber}
                        </h3>
                        <Badge className={statusColor[order.status]}>
                          {ORDER_STATUS_LABELS[order.status as any]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="text-xs text-gray-500">产品类型</p>
                          <p className="font-medium text-gray-900">
                            {PRODUCT_TYPE_LABELS[order.productType as any]}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">数量</p>
                          <p className="font-medium text-gray-900">{order.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">总价</p>
                          <p className="font-medium text-gray-900">
                            ¥{order.totalPrice.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">创建时间</p>
                          <p className="font-medium text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      </div>
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

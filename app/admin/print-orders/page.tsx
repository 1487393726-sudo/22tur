'use client';

/**
 * Admin Print Orders Management Page
 * 管理员订单管理页面
 * Requirements: 4.2
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
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { ORDER_STATUS_LABELS, PRODUCT_TYPE_LABELS, OrderStatus, ProductType } from '@/lib/printing/types';

interface PrintOrder {
  id: string;
  orderNumber: string;
  quoteId: string;
  customerId: string;
  customer?: {
    id: string;
    username: string;
    email: string;
    phone?: string;
  };
  status: OrderStatus;
  productType: ProductType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentStatus: string;
  paymentMethod?: string | null;
  paidAt?: string | null;
  productionStatus?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
}

const statusColors: Record<OrderStatus, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  in_production: 'bg-purple-100 text-white',
  shipped: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<string, string> = {
  unpaid: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-red-100 text-red-800',
};

export default function AdminPrintOrdersPage() {
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // 加载订单列表
  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/print-orders?${params}`);
      if (!response.ok) throw new Error('Failed to load orders');

      const data = await response.json();
      setOrders(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    return `¥${(amount / 100).toFixed(2)}`;
  };

  // 过滤本地搜索
  const filteredOrders = orders.filter((order) => {
    return (
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // 计算分页
  const totalPages = Math.ceil(total / pageSize);

  // 统计数据
  const stats = {
    total: total,
    pending_payment: orders.filter((o) => o.status === 'pending_payment').length,
    paid: orders.filter((o) => o.status === 'paid').length,
    in_production: orders.filter((o) => o.status === 'in_production').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 theme-gradient-text">
            <ShoppingCart className="h-6 w-6" />
            订单管理
          </h1>
          <p className="text-muted-foreground mt-1">
            查看和管理所有印刷订单
          </p>
        </div>
        <Button variant="outline" onClick={loadOrders} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总订单数</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>待支付</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{stats.pending_payment}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>已支付</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.paid}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>生产中</CardDescription>
            <CardTitle className="text-2xl text-white">{stats.in_production}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>已发货</CardDescription>
            <CardTitle className="text-2xl text-orange-600">{stats.shipped}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索订单号、客户名称或邮箱..."
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
                <SelectItem value="pending_payment">待支付</SelectItem>
                <SelectItem value="paid">已支付</SelectItem>
                <SelectItem value="in_production">生产中</SelectItem>
                <SelectItem value="shipped">已发货</SelectItem>
                <SelectItem value="delivered">已送达</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 订单列表表格 */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">加载中...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">暂无订单记录</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>订单号</TableHead>
                      <TableHead>客户</TableHead>
                      <TableHead>产品</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>支付状态</TableHead>
                      <TableHead>订单状态</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customer?.username}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.customer?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {PRODUCT_TYPE_LABELS[order.productType]}
                        </TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell className="font-medium">
                          {formatAmount(order.totalPrice)}
                        </TableCell>
                        <TableCell>
                          <Badge className={paymentStatusColors[order.paymentStatus]}>
                            {order.paymentStatus === 'paid' ? '已支付' : '未支付'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[order.status]}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/print-orders/${order.id}`}>
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

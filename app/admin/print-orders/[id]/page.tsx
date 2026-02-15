'use client';

/**
 * Admin Print Order Detail and Status Update Page
 * 管理员订单详情和状态更新页面
 * Requirements: 4.2
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  ShoppingCart,
  ArrowLeft,
  Save,
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
  specifications: string;
  unitPrice: number;
  totalPrice: number;
  paymentStatus: string;
  paymentMethod?: string | null;
  paidAt?: string | null;
  productionStatus?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
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

const orderStatuses: OrderStatus[] = [
  'pending_payment',
  'paid',
  'in_production',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<PrintOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 表单状态
  const [status, setStatus] = useState<OrderStatus>('pending_payment');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [productionStatus, setProductionStatus] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 加载订单详情
  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/print-orders/${orderId}`);
      if (!response.ok) throw new Error('Failed to load order');

      const data = await response.json();
      setOrder(data);
      setStatus(data.status);
      setTrackingNumber(data.trackingNumber || '');
      setProductionStatus(data.productionStatus || '');
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!status) {
      newErrors.status = '订单状态为必填项';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交更新
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/print-orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber || undefined,
          productionStatus: productionStatus || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order');
      }

      await loadOrder();
      alert('订单已更新');
    } catch (error) {
      console.error('Error updating order:', error);
      alert(`更新失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 格式化日期
  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    return `¥${(amount / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-muted-foreground">订单不存在</div>
      </div>
    );
  }

  let specifications: Record<string, unknown> = {};
  try {
    specifications = JSON.parse(order.specifications);
  } catch (e) {
    // 忽略解析错误
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 返回按钮和标题 */}
      <div className="flex items-center gap-4">
        <Link href="/admin/print-orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            {order.orderNumber}
          </h1>
          <p className="text-muted-foreground mt-1">
            {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* 基本信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-muted-foreground">客户</Label>
              <p className="font-medium">{order.customer?.username}</p>
              <p className="text-sm text-muted-foreground">{order.customer?.email}</p>
              {order.customer?.phone && (
                <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">订单状态</Label>
              <Badge className={statusColors[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>
            <div>
              <Label className="text-muted-foreground">支付状态</Label>
              <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                {order.paymentStatus === 'paid' ? '已支付' : '未支付'}
              </Badge>
            </div>
            <div>
              <Label className="text-muted-foreground">支付方式</Label>
              <p className="font-medium">{order.paymentMethod || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">产品类型</Label>
              <p className="font-medium">{PRODUCT_TYPE_LABELS[order.productType]}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">数量</Label>
              <p className="font-medium">{order.quantity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 价格信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>价格信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-muted-foreground">单价</Label>
              <p className="font-medium text-lg">{formatAmount(order.unitPrice)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">总价</Label>
              <p className="font-medium text-lg text-green-600">{formatAmount(order.totalPrice)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">支付时间</Label>
              <p className="font-medium">{formatDate(order.paidAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 物流信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>物流信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-muted-foreground">追踪号</Label>
              <p className="font-medium">{order.trackingNumber || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">生产状态</Label>
              <p className="font-medium">{order.productionStatus || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">发货时间</Label>
              <p className="font-medium">{formatDate(order.shippedAt)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">送达时间</Label>
              <p className="font-medium">{formatDate(order.deliveredAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 状态更新表单 */}
      <Card>
        <CardHeader>
          <CardTitle>更新订单</CardTitle>
          <CardDescription>
            更新订单状态、追踪号和生产状态
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="status">订单状态 *</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.status}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackingNumber">追踪号</Label>
            <Input
              id="trackingNumber"
              placeholder="输入物流追踪号..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productionStatus">生产状态</Label>
            <Input
              id="productionStatus"
              placeholder="例如: 已排版、印刷中、质检中、待发货"
              value={productionStatus}
              onChange={(e) => setProductionStatus(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {submitting ? '更新中...' : '更新订单'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

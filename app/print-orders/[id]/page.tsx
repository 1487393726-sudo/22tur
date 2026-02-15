'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  ORDER_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  PrintOrder,
} from '@/lib/printing/types';
import { AlertCircle, CreditCard, Truck, CheckCircle } from 'lucide-react';

/**
 * 印刷订单详情页面
 * Requirements: 2.2, 4.1, 4.2, 6.4
 */
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const orderId = params.id as string;

  const [order, setOrder] = useState<PrintOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');

  // 获取订单详情
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/print-orders/${orderId}`);
        if (!response.ok) {
          throw new Error('获取订单详情失败');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // 处理支付
  const handlePay = async () => {
    if (!order) return;

    setIsPaying(true);
    try {
      const response = await fetch(`/api/print-orders/${orderId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethod }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '支付失败');
      }

      const result = await response.json();

      // 根据支付方式处理
      if (paymentMethod === 'wechat') {
        // 调用微信支付
        if (window.wx) {
          window.wx.choosePayment({
            timeStamp: result.timeStamp,
            nonceStr: result.nonceStr,
            package: result.package,
            signType: result.signType,
            paySign: result.paySign,
            success: () => {
              // 支付成功
              setOrder({ ...order, status: 'paid', paymentStatus: 'paid' });
              setError(null);
            },
            fail: () => {
              setError('支付失败，请重试');
            },
          });
        } else {
          // 模拟支付成功（开发环境）
          setOrder({ ...order, status: 'paid', paymentStatus: 'paid' });
        }
      } else {
        // 支付宝支付
        window.location.href = result.paymentUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '支付失败');
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || '订单不存在'}
            </AlertDescription>
          </Alert>
        </div>
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

  const specifications = JSON.parse(order.specifications || '{}');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">订单详情</h1>
              <p className="text-gray-600 mt-2">订单号: {order.orderNumber}</p>
            </div>
            <Badge className={statusColor[order.status]}>
              {ORDER_STATUS_LABELS[order.status as any]}
            </Badge>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 订单信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>订单信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">产品类型</p>
                <p className="font-medium">
                  {PRODUCT_TYPE_LABELS[order.productType as any]}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">数量</p>
                <p className="font-medium">{order.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">单价</p>
                <p className="font-medium">¥{order.unitPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">创建时间</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 规格信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>规格信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {specifications.size && (
                <div>
                  <p className="text-sm text-gray-600">尺寸</p>
                  <p className="font-medium">{specifications.size}</p>
                </div>
              )}
              {specifications.material && (
                <div>
                  <p className="text-sm text-gray-600">材质</p>
                  <p className="font-medium">{specifications.material}</p>
                </div>
              )}
              {specifications.colorMode && (
                <div>
                  <p className="text-sm text-gray-600">色彩模式</p>
                  <p className="font-medium">{specifications.colorMode}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 价格信息 */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">价格信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总价</p>
                <p className="text-3xl font-bold text-blue-600">
                  ¥{order.totalPrice.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">支付状态</p>
                <Badge className={order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {order.paymentStatus === 'paid' ? '已支付' : '未支付'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 物流信息 */}
        {order.status !== 'pending_payment' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>物流信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.productionStatus && (
                  <div>
                    <p className="text-sm text-gray-600">生产状态</p>
                    <p className="font-medium">{order.productionStatus}</p>
                  </div>
                )}
                {order.trackingNumber && (
                  <div>
                    <p className="text-sm text-gray-600">追踪号</p>
                    <p className="font-medium">{order.trackingNumber}</p>
                  </div>
                )}
                {order.shippedAt && (
                  <div>
                    <p className="text-sm text-gray-600">发货时间</p>
                    <p className="font-medium">
                      {new Date(order.shippedAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                )}
                {order.deliveredAt && (
                  <div>
                    <p className="text-sm text-gray-600">送达时间</p>
                    <p className="font-medium">
                      {new Date(order.deliveredAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 支付操作 */}
        {order.status === 'pending_payment' && order.paymentStatus === 'unpaid' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>支付方式</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wechat"
                      checked={paymentMethod === 'wechat'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="rounded-full"
                    />
                    <span className="ml-2">微信支付</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="alipay"
                      checked={paymentMethod === 'alipay'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="rounded-full"
                    />
                    <span className="ml-2">支付宝</span>
                  </label>
                </div>

                <Button
                  onClick={handlePay}
                  disabled={isPaying}
                  className="w-full bg-primary hover:bg-primary/90 h-12 text-lg"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  {isPaying ? '支付中...' : `立即支付 ¥${order.totalPrice.toFixed(2)}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 返回按钮 */}
        <Button
          onClick={() => router.push('/print-orders')}
          variant="outline"
          className="w-full"
        >
          返回订单列表
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronLeft,
  Package,
  MapPin,
  CreditCard,
  CheckCircle,
  Loader2,
  Truck,
} from 'lucide-react';
import type { MarketplaceOrder, OrderStatus } from '@/types/marketplace';

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: '待支付', color: 'bg-yellow-500' },
  PAID: { label: '已支付', color: 'bg-blue-500' },
  PROCESSING: { label: '处理中', color: 'bg-blue-500' },
  SHIPPED: { label: '已发货', color: 'bg-purple-500' },
  DELIVERED: { label: '已完成', color: 'bg-green-500' },
  CANCELLED: { label: '已取消', color: 'bg-gray-500' },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const isSuccess = searchParams.get('success') === 'true';

  const [order, setOrder] = useState<MarketplaceOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/marketplace/orders/${orderId}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);
      } catch {
        router.push('/marketplace/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) return null;

  const status = statusConfig[order.status] || statusConfig.PENDING;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">订单详情</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* 成功提示 */}
          {isSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                订单创建成功！请尽快完成支付。
              </AlertDescription>
            </Alert>
          )}

          {/* 订单状态 */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={status.color}>{status.label}</Badge>
                  <span className="text-sm text-muted-foreground">
                    订单号: {order.orderNumber}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  下单时间: {new Date(order.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
              {order.status === 'PENDING' && (
                <Button>立即支付</Button>
              )}
            </div>
          </div>

          {/* 物流信息 */}
          {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">物流信息</h2>
              </div>
              <div className="text-sm text-muted-foreground">
                {order.shippedAt && (
                  <p>发货时间: {new Date(order.shippedAt).toLocaleString('zh-CN')}</p>
                )}
                {order.deliveredAt && (
                  <p>送达时间: {new Date(order.deliveredAt).toLocaleString('zh-CN')}</p>
                )}
              </div>
            </div>
          )}

          {/* 收货地址 */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">收货地址</h2>
            </div>
            {order.shippingAddress ? (
              <div className="text-sm">
                <p className="font-medium">
                  {order.shippingAddress.name} {order.shippingAddress.phone}
                </p>
                <p className="text-muted-foreground mt-1">
                  {order.shippingAddress.province}
                  {order.shippingAddress.city}
                  {order.shippingAddress.district}
                  {order.shippingAddress.address}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">暂无收货地址</p>
            )}
          </div>

          {/* 商品列表 */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">商品清单</h2>
            </div>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ¥{item.price} x {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">
                    ¥{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 支付信息 */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">支付信息</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">商品小计</span>
                <span>¥{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">运费</span>
                <span>¥{order.shipping.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-semibold">
                <span>实付金额</span>
                <span className="text-primary">¥{order.total.toFixed(2)}</span>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between text-muted-foreground">
                  <span>支付方式</span>
                  <span>{order.paymentMethod}</span>
                </div>
              )}
              {order.paidAt && (
                <div className="flex justify-between text-muted-foreground">
                  <span>支付时间</span>
                  <span>{new Date(order.paidAt).toLocaleString('zh-CN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Link href="/marketplace/orders" className="flex-1">
              <Button variant="outline" className="w-full">
                返回订单列表
              </Button>
            </Link>
            <Link href="/marketplace" className="flex-1">
              <Button className="w-full">继续购物</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

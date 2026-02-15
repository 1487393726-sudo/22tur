'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OrderCard } from '@/components/marketplace/OrderCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Package, Loader2 } from 'lucide-react';
import type { MarketplaceOrder, OrderStatus } from '@/types/marketplace';

const statusTabs: { value: string; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'PENDING', label: '待支付' },
  { value: 'PAID', label: '已支付' },
  { value: 'SHIPPED', label: '已发货' },
  { value: 'DELIVERED', label: '已完成' },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('userId', 'demo-user'); // 实际应从认证获取
        if (statusFilter !== 'all') {
          params.set('status', statusFilter);
        }

        const res = await fetch(`/api/marketplace/orders?${params}`);
        const data = await res.json();
        // API returns { success: true, data: { items: [...], total: 10 } } or just array
        setOrders(data.data?.items || data.data || []);
      } catch (error) {
        console.error('获取订单失败:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">我的订单</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* 状态筛选 */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
            <TabsList className="w-full justify-start overflow-x-auto">
              {statusTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* 订单列表 */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">暂无订单</h2>
              <p className="text-muted-foreground mb-6">快去挑选心仪的直播设备吧</p>
              <Link href="/marketplace">
                <Button>去购物</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Package } from 'lucide-react';
import type { MarketplaceOrder, OrderStatus } from '@/types/marketplace';

interface OrderCardProps {
  order: MarketplaceOrder;
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: '待支付', variant: 'secondary' },
  PAID: { label: '已支付', variant: 'default' },
  PROCESSING: { label: '处理中', variant: 'default' },
  SHIPPED: { label: '已发货', variant: 'default' },
  DELIVERED: { label: '已完成', variant: 'outline' },
  CANCELLED: { label: '已取消', variant: 'destructive' },
};

export function OrderCard({ order }: OrderCardProps) {
  const status = statusConfig[order.status] || statusConfig.PENDING;
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">订单号: {order.orderNumber}</span>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          {new Date(order.createdAt).toLocaleDateString('zh-CN')}
        </span>
      </div>

      <div className="flex items-center gap-4 py-3 border-t border-b">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="h-4 w-4" />
          <span className="text-sm">{itemCount} 件商品</span>
        </div>
        <div className="flex-1">
          {order.items?.slice(0, 2).map((item) => (
            <span key={item.id} className="text-sm mr-2">
              {item.name}
              {item.quantity > 1 && ` x${item.quantity}`}
            </span>
          ))}
          {order.items && order.items.length > 2 && (
            <span className="text-sm text-muted-foreground">等...</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div>
          <span className="text-sm text-muted-foreground">实付金额: </span>
          <span className="text-lg font-semibold text-primary">¥{order.total.toFixed(2)}</span>
        </div>
        <Link href={`/marketplace/orders/${order.id}`}>
          <Button variant="outline" size="sm">
            查看详情
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

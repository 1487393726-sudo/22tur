"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Eye, MessageCircle, Package, Loader2, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { dashboardStyles, orderStatusConfig, paymentStatusConfig } from "@/lib/dashboard-styles";
import { formatAmount, formatDate } from "@/lib/dashboard-utils";
import { useDashboardTranslations } from "@/lib/i18n/use-dashboard-translations";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  total: number;
  createdAt: string;
  estimatedDelivery?: string;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    service: {
      name: string;
      nameEn: string;
    };
  }[];
  package?: {
    name: string;
  } | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, isRTL } = useDashboardTranslations();
  const [filter, setFilter] = useState(t('orders.filters.all'));

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          // API returns { success: true, data: { items: [...], total: 10 } }
          setOrders(data.data?.items || []);
        }
      } catch (error) {
        console.error(t('common.error'), error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [t]);

  const filteredOrders = filter === t('orders.filters.all')
    ? orders
    : orders.filter(order => {
        if (filter === t('orders.filters.inProgress')) return order.status === "IN_PROGRESS" || order.status === "CONFIRMED" || order.status === "REVIEW";
        if (filter === t('orders.filters.completed')) return order.status === "COMPLETED";
        if (filter === t('orders.filters.cancelled')) return order.status === "CANCELLED";
        return true;
      });

  return (
    <div className="min-h-screen space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        title={t('orders.title')}
        description={t('orders.description')}
        icon="📦"
        actions={
          <Link href="/pricing">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">{t('overview.browseServices')}</Button>
          </Link>
        }
      />

      <Card className="purple-gradient-card">
        <CardContent className="p-4 md:p-6">
          <Tabs defaultValue={t('orders.filters.all')} onValueChange={setFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:w-[400px]">
              <TabsTrigger value={t('orders.filters.all')}>{t('orders.filters.all')}</TabsTrigger>
              <TabsTrigger value={t('orders.filters.inProgress')}>{t('orders.filters.inProgress')}</TabsTrigger>
              <TabsTrigger value={t('orders.filters.completed')}>{t('orders.filters.completed')}</TabsTrigger>
              <TabsTrigger value={t('orders.filters.cancelled')}>{t('orders.filters.cancelled')}</TabsTrigger>
            </TabsList>
            <TabsContent value={filter}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className={`mt-4 ${dashboardStyles.table.wrapper}`}>
                  <Table>
                    <TableHeader>
                      <TableRow className={dashboardStyles.table.header}>
                        <TableHead>{t('orders.table.orderNumber')}</TableHead>
                        <TableHead>{t('orders.table.serviceContent')}</TableHead>
                        <TableHead className="hidden md:table-cell">{t('orders.table.amount')}</TableHead>
                        <TableHead className="hidden md:table-cell">{t('orders.table.date')}</TableHead>
                        <TableHead>{t('orders.table.status')}</TableHead>
                        <TableHead className="hidden sm:table-cell">{t('orders.table.payment')}</TableHead>
                        <TableHead className="text-right">{t('orders.table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length > 0 ? filteredOrders.map(order => {
                        const statusConfig = orderStatusConfig[order.status];
                        const paymentConfig = paymentStatusConfig[order.paymentStatus];
                        // Get translated status labels - convert SCREAMING_SNAKE_CASE to camelCase
                        const statusKey = order.status.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                        const paymentKey = order.paymentStatus.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                        const statusLabel = t(`orders.status.${statusKey}`, statusConfig?.label || order.status);
                        const paymentLabel = t(`orders.paymentStatus.${paymentKey}`, paymentConfig?.label || order.paymentStatus);
                        
                        return (
                          <TableRow key={order.id} className={dashboardStyles.table.row}>
                            <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                            <TableCell>
                              {order.items[0]?.service?.name || t('orders.defaultService')}
                              {order.items.length > 1 && (
                                <span className="text-muted-foreground ml-1">{t('orders.moreItems')} {order.items.length} {t('orders.items')}</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{formatAmount(order.total)}</TableCell>
                            <TableCell className="hidden md:table-cell">{formatDate(order.createdAt)}</TableCell>
                            <TableCell>
                              <Badge variant={statusConfig?.variant || "outline"}>
                                {statusLabel}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant={paymentConfig?.variant || "outline"}>
                                {paymentLabel}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Link href={`/client/orders/${order.id}`}>
                                <Button variant="ghost" size="icon" title={t('orders.actions.viewDetails')}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              {order.status === "COMPLETED" && (
                                <Button variant="ghost" size="icon" title={t('orders.actions.downloadFile')}>
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              <Link href="/dashboard/support">
                                <Button variant="ghost" size="icon" title={t('orders.actions.contactSupport')}>
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            <div className="flex flex-col items-center py-8">
                              <Package className="h-12 w-12 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground mb-4">{t('orders.empty.title')}</p>
                              <Link href="/pricing">
                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                                  {t('overview.browseServices')}
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

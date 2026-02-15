"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, MessageCircle, Package, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard/page-header";
import { dashboardStyles, orderStatusConfig } from "@/lib/dashboard-styles";
import { formatAmount, formatDate } from "@/lib/dashboard-utils";
import { useDashboardTranslations } from "@/lib/i18n/use-dashboard-translations";
import type { Order, OrderStatus } from "@/types/dashboard";

export default function OrdersPage() {
  const { t, isRTL } = useDashboardTranslations();
  const [filter, setFilter] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          // API returns { success: true, data: { items: [...], total: 10 } }
          setOrders(data.data?.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => {
        if (filter === 'inProgress') return order.status === 'IN_PROGRESS' || order.status === 'CONFIRMED' || order.status === 'REVIEW';
        if (filter === 'completed') return order.status === 'COMPLETED';
        if (filter === 'cancelled') return order.status === 'CANCELLED';
        return true;
      });

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        title={t("orders.title", "My Orders")}
        description={t("orders.description", "View and manage all your service orders")}
        icon="📦"
      />

      <Card className={dashboardStyles.card.base}>
        <CardContent className="p-4 md:p-6">
          <Tabs defaultValue="all" onValueChange={setFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:w-[400px]">
              <TabsTrigger value="all">{t("orders.filters.all", "All")}</TabsTrigger>
              <TabsTrigger value="inProgress">{t("orders.filters.inProgress", "In Progress")}</TabsTrigger>
              <TabsTrigger value="completed">{t("orders.filters.completed", "Completed")}</TabsTrigger>
              <TabsTrigger value="cancelled">{t("orders.filters.cancelled", "Cancelled")}</TabsTrigger>
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
                        <TableHead>{t("orders.table.orderNumber", "Order Number")}</TableHead>
                        <TableHead>{t("orders.table.serviceContent", "Service Content")}</TableHead>
                        <TableHead className="hidden md:table-cell">{t("orders.table.amount", "Amount")}</TableHead>
                        <TableHead className="hidden md:table-cell">{t("orders.table.date", "Date")}</TableHead>
                        <TableHead>{t("orders.table.status", "Status")}</TableHead>
                        <TableHead className={isRTL ? "text-left" : "text-right"}>{t("orders.table.actions", "Actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length > 0 ? filteredOrders.map(order => {
                        const statusConfig = orderStatusConfig[order.status];
                        const statusKey = order.status.toLowerCase().replace('_', '');
                        return (
                          <TableRow key={order.id} className={dashboardStyles.table.row}>
                            <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                            <TableCell>
                              {order.items[0]?.service?.name || t("market.title", "Service Item")}
                              {order.items.length > 1 && (
                                <span className={`text-muted-foreground ${isRTL ? "mr-1" : "ml-1"}`}>
                                  {t("common.more", "and")}{order.items.length}{t("client.cart.items", "items")}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{formatAmount(order.total)}</TableCell>
                            <TableCell className="hidden md:table-cell">{formatDate(order.createdAt)}</TableCell>
                            <TableCell>
                              <Badge variant={statusConfig?.variant || "outline"}>
                                {t(`orders.status.${statusKey}`, statusConfig?.label || order.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className={isRTL ? "text-left" : "text-right"}>
                              <Link href={`/client/orders/${order.id}`}>
                                <Button variant="ghost" size="icon" title={t("orders.actions.viewDetails", "View Details")}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              {order.status === 'COMPLETED' && (
                                <Button variant="ghost" size="icon" title={t("orders.actions.downloadFile", "Download File")}>
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              <Link href="/dashboard/support">
                                <Button variant="ghost" size="icon" title={t("orders.actions.contactSupport", "Contact Support")}>
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      }) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <div className="flex flex-col items-center py-8">
                              <Package className="h-12 w-12 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">{t("orders.empty.title", "No Orders")}</p>
                              <Link href="/pricing" className="mt-4">
                                <Button>{t("overview.browseServices", "Browse Services")}</Button>
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

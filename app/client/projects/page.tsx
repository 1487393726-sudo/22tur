"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FolderKanban,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { orderStatusConfig } from "@/lib/dashboard-styles";
import { formatAmount, formatDate } from "@/lib/dashboard-utils";
import { useDashboardTranslations } from "@/lib/i18n/use-dashboard-translations";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
  };
  items: Array<{
    service: {
      name: string;
    };
  }>;
  _count: {
    milestones: number;
  };
}

export default function ProjectsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, isRTL } = useDashboardTranslations();
  const [filter, setFilter] = useState<string>(t('client.projects.filters.inProgress'));

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === t('client.projects.filters.inProgress')) {
        params.set("status", "IN_PROGRESS");
      } else if (filter === t('client.projects.filters.review')) {
        params.set("status", "REVIEW");
      } else if (filter === t('client.projects.filters.completed')) {
        params.set("status", "COMPLETED");
      }
      const res = await fetch(`/api/orders?${params}`);
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
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "CANCELLED":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FolderKanban className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProgress = (order: Order) => {
    if (order.status === "COMPLETED") return 100;
    if (order.status === "CANCELLED") return 0;
    if (order.status === "PENDING") return 5;
    if (order.status === "CONFIRMED") return 15;
    if (order.status === "IN_PROGRESS") return 50;
    if (order.status === "REVIEW") return 90;
    return 0;
  };

  return (
    <div className="min-h-screen space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        title={t('client.projects.title')}
        description={t('client.projects.description')}
        icon="📊"
      />

      <Card className="purple-gradient-card">
        <CardContent className="p-4 md:p-6">
          <Tabs defaultValue={t('client.projects.filters.inProgress')} onValueChange={setFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:w-[400px]">
              <TabsTrigger value={t('client.projects.filters.all')}>{t('client.projects.filters.all')}</TabsTrigger>
              <TabsTrigger value={t('client.projects.filters.inProgress')}>{t('client.projects.filters.inProgress')}</TabsTrigger>
              <TabsTrigger value={t('client.projects.filters.review')}>{t('client.projects.filters.review')}</TabsTrigger>
              <TabsTrigger value={t('client.projects.filters.completed')}>{t('client.projects.filters.completed')}</TabsTrigger>
            </TabsList>
            <TabsContent value={filter} className="mt-4">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">{t('client.projects.noProjects')}</p>
                  <Link href="/pricing">
                    <Button variant="outline">{t('overview.browseServices')}</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {orders.map((order) => {
                    const progress = getProgress(order);
                    const statusConfig = orderStatusConfig[order.status];
                    // Get translated status labels - convert SCREAMING_SNAKE_CASE to camelCase
                    const statusKey = order.status.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                    const statusLabel = t(`orders.status.${statusKey}`, statusConfig?.label || order.status);
                    
                    return (
                      <Card key={order.id} className="bg-card/40 hover:bg-card/60 transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(order.status)}
                              <CardTitle className="text-lg">
                                {order.items[0]?.service?.name || t('orders.defaultService')}
                                {order.items.length > 1 && ` ${t('orders.moreItems')} ${order.items.length} ${t('orders.items')}`}
                              </CardTitle>
                            </div>
                            <Badge variant={statusConfig?.variant || "secondary"}>
                              {statusLabel}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">{t('client.projects.orderNumber')}</span>
                                <p className="font-medium font-mono">{order.orderNumber}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t('client.projects.projectAmount')}</span>
                                <p className="font-medium text-primary">{formatAmount(order.total)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t('client.projects.milestones')}</span>
                                <p className="font-medium">{order._count?.milestones || 0} {t('orders.items')}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t('client.projects.startTime')}</span>
                                <p className="font-medium flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('client.projects.progress')}</span>
                                <span className="font-medium">{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/client/projects/${order.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {t('client.projects.viewDetails')}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

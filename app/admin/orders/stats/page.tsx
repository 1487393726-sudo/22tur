"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  ordersByMonth: Array<{ month: string; count: number; revenue: number }>;
  topServices: Array<{ name: string; count: number; revenue: number }>;
  topClients: Array<{ name: string; email: string; orders: number; total: number }>;
}

export default function OrderStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>("all");

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // 获取所有订单数据进行统计
      const res = await fetch("/api/orders?limit=1000");
      if (res.ok) {
        const data = await res.json();
        const orders = data.data || [];

        // 计算统计数据
        const now = new Date();
        let filteredOrders = orders;

        if (period === "month") {
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          filteredOrders = orders.filter(
            (o: any) => new Date(o.createdAt) >= monthAgo
          );
        } else if (period === "quarter") {
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          filteredOrders = orders.filter(
            (o: any) => new Date(o.createdAt) >= quarterAgo
          );
        } else if (period === "year") {
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          filteredOrders = orders.filter(
            (o: any) => new Date(o.createdAt) >= yearAgo
          );
        }

        // 按状态统计
        const ordersByStatus: Record<string, number> = {};
        filteredOrders.forEach((o: any) => {
          ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
        });

        // 按月统计
        const monthlyData: Record<string, { count: number; revenue: number }> = {};
        filteredOrders.forEach((o: any) => {
          const month = new Date(o.createdAt).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "short",
          });
          if (!monthlyData[month]) {
            monthlyData[month] = { count: 0, revenue: 0 };
          }
          monthlyData[month].count++;
          if (o.paymentStatus === "PAID") {
            monthlyData[month].revenue += o.total;
          }
        });

        const ordersByMonth = Object.entries(monthlyData)
          .map(([month, data]) => ({ month, ...data }))
          .slice(-6);

        // 按服务统计
        const serviceData: Record<string, { count: number; revenue: number }> = {};
        filteredOrders.forEach((o: any) => {
          o.items?.forEach((item: any) => {
            const name = item.service?.name || "未知服务";
            if (!serviceData[name]) {
              serviceData[name] = { count: 0, revenue: 0 };
            }
            serviceData[name].count += item.quantity;
            serviceData[name].revenue += item.unitPrice * item.quantity;
          });
        });

        const topServices = Object.entries(serviceData)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // 按客户统计
        const clientData: Record<
          string,
          { name: string; email: string; orders: number; total: number }
        > = {};
        filteredOrders.forEach((o: any) => {
          const clientId = o.client?.id || "unknown";
          if (!clientData[clientId]) {
            clientData[clientId] = {
              name: `${o.client?.firstName || ""} ${o.client?.lastName || ""}`.trim() || "未知",
              email: o.client?.email || "",
              orders: 0,
              total: 0,
            };
          }
          clientData[clientId].orders++;
          clientData[clientId].total += o.total;
        });

        const topClients = Object.values(clientData)
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);

        // 计算总计
        const totalRevenue = filteredOrders
          .filter((o: any) => o.paymentStatus === "PAID")
          .reduce((sum: number, o: any) => sum + o.total, 0);

        setStats({
          totalOrders: filteredOrders.length,
          totalRevenue,
          completedOrders: filteredOrders.filter((o: any) => o.status === "COMPLETED")
            .length,
          pendingOrders: filteredOrders.filter((o: any) => o.status === "PENDING").length,
          averageOrderValue:
            filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0,
          ordersByStatus,
          ordersByMonth,
          topServices,
          topClients,
        });
      }
    } catch (error) {
      console.error("获取统计数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <RequireAuth adminOnly>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">业绩统计</h1>
            <p className="text-gray-400">订单和收入统计报表</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部时间</SelectItem>
              <SelectItem value="month">近一月</SelectItem>
              <SelectItem value="quarter">近三月</SelectItem>
              <SelectItem value="year">近一年</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 概览卡片 */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                总订单
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.totalOrders || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                总收入
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                ¥{(stats?.totalRevenue || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                平均订单
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                ¥{Math.round(stats?.averageOrderValue || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                待处理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {stats?.pendingOrders || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <Package className="h-4 w-4" />
                已完成
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats?.completedOrders || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 月度趋势 */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">月度趋势</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.ordersByMonth && stats.ordersByMonth.length > 0 ? (
                <div className="space-y-4">
                  {stats.ordersByMonth.map((item) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <div>
                        <div className="text-white">{item.month}</div>
                        <div className="text-sm text-gray-400">{item.count} 单</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-medium">
                          ¥{item.revenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">暂无数据</div>
              )}
            </CardContent>
          </Card>

          {/* 订单状态分布 */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">订单状态分布</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.ordersByStatus && Object.keys(stats.ordersByStatus).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                    const statusLabels: Record<string, string> = {
                      PENDING: "待确认",
                      CONFIRMED: "已确认",
                      IN_PROGRESS: "进行中",
                      REVIEW: "待验收",
                      COMPLETED: "已完成",
                      CANCELLED: "已取消",
                    };
                    const percent = Math.round((count / (stats?.totalOrders || 1)) * 100);
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">
                            {statusLabels[status] || status}
                          </span>
                          <span className="text-white">
                            {count} ({percent}%)
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">暂无数据</div>
              )}
            </CardContent>
          </Card>

          {/* 热门服务 */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5" />
                热门服务 TOP5
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.topServices && stats.topServices.length > 0 ? (
                <div className="space-y-4">
                  {stats.topServices.map((service, index) => (
                    <div key={service.name} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm text-gray-400">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-white">{service.name}</div>
                        <div className="text-sm text-gray-400">{service.count} 次</div>
                      </div>
                      <div className="text-green-400 font-medium">
                        ¥{service.revenue.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">暂无数据</div>
              )}
            </CardContent>
          </Card>

          {/* 优质客户 */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                优质客户 TOP5
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.topClients && stats.topClients.length > 0 ? (
                <div className="space-y-4">
                  {stats.topClients.map((client, index) => (
                    <div key={client.email} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm text-gray-400">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-white">{client.name}</div>
                        <div className="text-sm text-gray-400">
                          {client.orders} 单 · {client.email}
                        </div>
                      </div>
                      <div className="text-green-400 font-medium">
                        ¥{client.total.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">暂无数据</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}

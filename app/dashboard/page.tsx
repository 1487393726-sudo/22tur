"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingBag,
  TrendingUp,
  MessageCircle,
  FileText,
  Package,
  Clock,
  CheckCircle,
  ArrowRight,
  Loader2,
  Calendar,
  FolderKanban,
  Eye,
} from "lucide-react";
import { dashboardStyles, orderStatusConfig } from "@/lib/dashboard-styles";
import { formatAmount } from "@/lib/dashboard-utils";
import { useDashboardTranslations } from "@/lib/i18n/use-dashboard-translations";
import { cn } from "@/lib/utils";

interface DashboardStats {
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  unreadMessages: number;
  totalInvestment: number;
  activeProjects: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { service: { name: string } }[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, isRTL } = useDashboardTranslations();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    unreadMessages: 0,
    totalInvestment: 0,
    activeProjects: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const quickActions = [
    { titleKey: "quickActions.browseServices", descKey: "quickActions.browseServicesDesc", icon: ShoppingBag, href: "/pricing", color: "bg-blue-500" },
    { titleKey: "quickActions.myOrders", descKey: "quickActions.myOrdersDesc", icon: Package, href: "/client/orders", color: "bg-green-500" },
    { titleKey: "quickActions.projectProgress", descKey: "quickActions.projectProgressDesc", icon: FolderKanban, href: "/client/projects", color: "bg-purple-500" },
    { titleKey: "quickActions.appointments", descKey: "quickActions.appointmentsDesc", icon: Calendar, href: "/appointments", color: "bg-orange-500" },
    { titleKey: "quickActions.support", descKey: "quickActions.supportDesc", icon: MessageCircle, href: "/dashboard/support", color: "bg-pink-500" },
    { titleKey: "quickActions.files", descKey: "quickActions.filesDesc", icon: FileText, href: "/dashboard/files", color: "bg-indigo-500" },
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch("/api/user/dashboard-stats");
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats({
          pendingOrders: data.pendingOrders || data.purchases || 0,
          inProgressOrders: data.inProgressOrders || 0,
          completedOrders: data.completedOrders || 0,
          unreadMessages: data.unreadMessages || data.notifications || 0,
          totalInvestment: data.totalInvestment || data.investments || 0,
          activeProjects: data.activeProjects || data.tasks || 0,
        });
      }

      const ordersRes = await fetch("/api/orders?limit=5");
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setRecentOrders(data.data?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Welcome Section */}
      <Card className="purple-gradient-card">
        <CardContent className="p-6">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div>
              <h1 className="purple-gradient-title text-2xl font-bold">
                {t("overview.welcome", "欢迎回来")}，{session.user.name || session.user.email}！
              </h1>
              <p className="purple-gradient-text mt-1">
                {t("overview.welcomeDesc", "这是您的个人工作中心，管理所有业务活动")}
              </p>
            </div>
            <Avatar className="h-16 w-16 hidden md:flex ring-2 ring-primary/30">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="purple-gradient-card">
          <CardContent className="p-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="purple-gradient-text text-sm">
                  {t("overview.stats.pendingOrders", "待处理订单")}
                </p>
                <p className="purple-gradient-title text-2xl font-bold">
                  {stats.pendingOrders}
                </p>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg"><Clock className="h-5 w-5 text-yellow-500" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="purple-gradient-card">
          <CardContent className="p-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="purple-gradient-text text-sm">
                  {t("overview.stats.inProgress", "进行中")}
                </p>
                <p className="purple-gradient-title text-2xl font-bold">
                  {stats.inProgressOrders}
                </p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg"><Package className="h-5 w-5 text-blue-500" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="purple-gradient-card">
          <CardContent className="p-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="purple-gradient-text text-sm">
                  {t("overview.stats.completed", "已完成")}
                </p>
                <p className="purple-gradient-title text-2xl font-bold">
                  {stats.completedOrders}
                </p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg"><CheckCircle className="h-5 w-5 text-green-500" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="purple-gradient-card">
          <CardContent className="p-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="purple-gradient-text text-sm">
                  {t("overview.stats.unreadMessages", "未读消息")}
                </p>
                <p className="purple-gradient-title text-2xl font-bold">
                  {stats.unreadMessages}
                </p>
              </div>
              <div className="p-2 bg-pink-500/20 rounded-lg"><MessageCircle className="h-5 w-5 text-pink-500" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="purple-gradient-title text-lg font-semibold mb-4">
          {t("overview.quickActions", "快捷操作")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="purple-gradient-card cursor-pointer group"
              onClick={() => router.push(action.href)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <p className="purple-gradient-title font-medium text-sm">
                  {t(action.titleKey)}
                </p>
                <p className="purple-gradient-text text-xs mt-1">
                  {t(action.descKey)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Orders and Investment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="purple-gradient-card lg:col-span-2">
          <CardHeader className={cn("flex flex-row items-center justify-between pb-2", isRTL && "flex-row-reverse")}>
            <CardTitle className="purple-gradient-title text-lg">
              {t("overview.recentOrders", "最近订单")}
            </CardTitle>
            <Link href="/client/orders">
              <Button variant="ghost" size="sm" className={cn("gap-1", isRTL && "flex-row-reverse")}>
                {t("overview.viewAll", "查看全部")} <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="purple-gradient-text">
                        {t("orders.table.orderNumber", "订单号")}
                      </TableHead>
                      <TableHead className="hidden md:table-cell purple-gradient-text">
                        {t("orders.table.serviceContent", "服务")}
                      </TableHead>
                      <TableHead className="hidden md:table-cell purple-gradient-text">
                        {t("orders.table.amount", "金额")}
                      </TableHead>
                      <TableHead className="purple-gradient-text">
                        {t("orders.table.status", "状态")}
                      </TableHead>
                      <TableHead
                        className={cn(
                          "purple-gradient-text",
                          isRTL ? "text-left" : "text-right",
                        )}
                      >
                        {t("orders.table.actions", "操作")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => {
                      const statusConfig = orderStatusConfig[order.status];
                      return (
                        <TableRow key={order.id} className={dashboardStyles.table.row}>
                          <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {order.items?.[0]?.service?.name || t("orders.defaultService", "服务项目")}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{formatAmount(order.total)}</TableCell>
                          <TableCell>
                            <Badge variant={statusConfig?.variant || "outline"}>
                              {t(`orders.status.${order.status}`, statusConfig?.label || order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className={cn(isRTL ? "text-left" : "text-right")}>
                            <Link href={`/client/orders/${order.id}`}>
                              <Button variant="ghost" size="icon" title={t("orders.actions.viewDetails", "查看详情")}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{t("overview.noOrders", "暂无订单")}</p>
                <Link href="/pricing">
                  <Button variant="outline" className="mt-4">{t("overview.browseServices", "浏览服务")}</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Investment Summary */}
        <Card className="purple-gradient-card">
          <CardHeader className={cn("flex flex-row items-center justify-between pb-2", isRTL && "flex-row-reverse")}>
            <CardTitle className="purple-gradient-title text-lg">
              {t("overview.investmentSummary", "投资摘要")}
            </CardTitle>
            <Link href="/dashboard/investment">
              <Button variant="ghost" size="sm" className={cn("gap-1", isRTL && "flex-row-reverse")}>
                {t("overview.details", "详情")} <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className={cn("flex items-center gap-3 mb-2", isRTL && "flex-row-reverse")}>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">{t("overview.totalInvestment", "总投资额")}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatAmount(stats.totalInvestment)}</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className={cn("flex items-center gap-3 mb-2", isRTL && "flex-row-reverse")}>
                  <FolderKanban className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">{t("overview.activeProjects", "活跃项目")}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.activeProjects}</p>
              </div>
              <Link href="/dashboard/investment">
                <Button variant="outline" className="w-full">{t("overview.viewInvestmentDetails", "查看投资详情")}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

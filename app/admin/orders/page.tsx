"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingCart,
  Search,
  Eye,
  CheckCircle,
  Loader2,
  BarChart3,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  createdAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    service: {
      name: string;
    };
  }>;
  package: {
    name: string;
  } | null;
  _count: {
    milestones: number;
    payments: number;
  };
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const t = useTranslations("admin.orders");
  const tc = useTranslations("common");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [updating, setUpdating] = useState(false);

  // 状态映射
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      PENDING: { label: t("status.pending"), color: "bg-yellow-500/20 text-yellow-300" },
      CONFIRMED: { label: t("status.confirmed"), color: "bg-blue-500/20 text-blue-300" },
      IN_PROGRESS: { label: tc("status.inProgress"), color: "bg-purple-500/20 text-white" },
      REVIEW: { label: tc("status.review"), color: "bg-orange-500/20 text-orange-300" },
      COMPLETED: { label: tc("status.completed"), color: "bg-green-500/20 text-green-300" },
      CANCELLED: { label: tc("status.cancelled"), color: "bg-red-500/20 text-red-300" },
    };
    return statusMap[status] || { label: status, color: "bg-gray-500/20 text-gray-300" };
  };

  const getPaymentStatusInfo = (status: string) => {
    const paymentStatusMap: Record<string, { label: string; color: string }> = {
      UNPAID: { label: t("paymentStatus.unpaid"), color: "bg-red-500/20 text-red-300" },
      PARTIAL: { label: t("paymentStatus.partial"), color: "bg-yellow-500/20 text-yellow-300" },
      PAID: { label: t("paymentStatus.paid"), color: "bg-green-500/20 text-green-300" },
      REFUNDED: { label: t("paymentStatus.refunded"), color: "bg-gray-500/20 text-gray-300" },
    };
    return paymentStatusMap[status] || { label: status, color: "bg-gray-500/20 text-gray-300" };
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      const res = await fetch(`/api/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        // API returns { success: true, data: { items: [...], total: 10 } }
        setOrders(data.data?.items || []);
      }
    } catch (error) {
      console.error("获取订单失败:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.client.firstName} ${order.client.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const openStatusDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNote("");
    setShowStatusDialog(true);
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminNote,
        }),
      });

      if (res.ok) {
        setShowStatusDialog(false);
        fetchOrders();
      } else {
        const error = await res.json();
        alert(error.error || tc("errors.serverError"));
      }
    } catch (error) {
      console.error("更新失败:", error);
      alert(tc("errors.serverError"));
    } finally {
      setUpdating(false);
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    inProgress: orders.filter((o) => o.status === "IN_PROGRESS").length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
    totalRevenue: orders
      .filter((o) => o.paymentStatus === "PAID")
      .reduce((sum, o) => sum + o.total, 0),
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold theme-gradient-text">{t("title")}</h1>
            <p className="text-gray-400">{t("description")}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open("/api/orders/export?format=csv", "_blank")}
            >
              {tc("buttons.export")} CSV
            </Button>
            <Button variant="outline" onClick={() => router.push("/admin/orders/stats")}>
              <BarChart3 className="h-4 w-4 mr-2" />
              {tc("buttons.view")}
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">{t("table.orderNumber")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">{t("status.pending")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">{tc("status.inProgress")}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">{tc("status.completed")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">{t("table.amount")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                ¥{stats.totalRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选 */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={tc("buttons.search") + "..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder={t("table.status")} />
                </SelectTrigger>
                <SelectContent className="bg-primary-900 border-white/20">
                  <SelectItem value="all" className="text-white hover:bg-white/10">{tc("buttons.filter")}</SelectItem>
                  <SelectItem value="PENDING" className="text-white hover:bg-white/10">{t("status.pending")}</SelectItem>
                  <SelectItem value="CONFIRMED" className="text-white hover:bg-white/10">{t("status.confirmed")}</SelectItem>
                  <SelectItem value="IN_PROGRESS" className="text-white hover:bg-white/10">{tc("status.inProgress")}</SelectItem>
                  <SelectItem value="REVIEW" className="text-white hover:bg-white/10">{tc("status.review")}</SelectItem>
                  <SelectItem value="COMPLETED" className="text-white hover:bg-white/10">{tc("status.completed")}</SelectItem>
                  <SelectItem value="CANCELLED" className="text-white hover:bg-white/10">{tc("status.cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 订单列表 */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white">{t("table.orderNumber")}</TableHead>
                  <TableHead className="text-white">{t("table.customer")}</TableHead>
                  <TableHead className="text-white">{tc("nav.services")}</TableHead>
                  <TableHead className="text-white">{t("table.amount")}</TableHead>
                  <TableHead className="text-white">{t("table.status")}</TableHead>
                  <TableHead className="text-white">{t("table.paymentStatus")}</TableHead>
                  <TableHead className="text-white">{t("table.createdAt")}</TableHead>
                  <TableHead className="text-white">{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const paymentInfo = getPaymentStatusInfo(order.paymentStatus);
                  return (
                    <TableRow key={order.id} className="border-white/10">
                      <TableCell>
                        <div className="font-medium text-white">{order.orderNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-white">
                            {order.client.firstName} {order.client.lastName}
                          </div>
                          <div className="text-sm text-gray-300">{order.client.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-300">
                          {order.items[0]?.service?.name || "-"}
                          {order.items.length > 1 && (
                            <span className="text-gray-500"> +{order.items.length - 1}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white font-medium">
                          ¥{order.total.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={paymentInfo.color}>
                          {paymentInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-300">
                          {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300"
                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-400 hover:text-green-300"
                            onClick={() => openStatusDialog(order)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredOrders.length === 0 && (
              <div className="py-12 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">{tc("empty.noOrders")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 状态更新对话框 */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent className="bg-primary-900 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>{tc("buttons.edit")} {t("table.status")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  {t("table.orderNumber")}: {selectedOrder?.orderNumber}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">{t("table.status")}</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">{t("status.pending")}</SelectItem>
                    <SelectItem value="CONFIRMED">{t("status.confirmed")}</SelectItem>
                    <SelectItem value="IN_PROGRESS">{tc("status.inProgress")}</SelectItem>
                    <SelectItem value="REVIEW">{tc("status.review")}</SelectItem>
                    <SelectItem value="COMPLETED">{tc("status.completed")}</SelectItem>
                    <SelectItem value="CANCELLED">{tc("status.cancelled")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">{tc("buttons.more")}</label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                {tc("buttons.cancel")}
              </Button>
              <Button onClick={updateOrderStatus} disabled={updating}>
                {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {tc("buttons.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireAuth>
  );
}

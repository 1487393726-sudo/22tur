"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Loader2,
  User,
  Package,
  Calendar,
  DollarSign,
  FileText,
  Plus,
  CheckCircle,
  Clock,
  Circle,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: string;
  order: number;
  dueDate: string | null;
  completedAt: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  clientNote: string | null;
  adminNote: string | null;
  createdAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    options: string | null;
    note: string | null;
    service: {
      id: string;
      name: string;
      nameEn: string | null;
    };
  }>;
  package: {
    id: string;
    name: string;
  } | null;
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待确认", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "已确认", color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "进行中", color: "bg-purple-100 text-white" },
  REVIEW: { label: "待验收", color: "bg-orange-100 text-orange-800" },
  COMPLETED: { label: "已完成", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "已取消", color: "bg-red-100 text-red-800" },
};

const milestoneStatusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待开始", color: "bg-gray-500/20 text-gray-300" },
  IN_PROGRESS: { label: "进行中", color: "bg-blue-500/20 text-blue-300" },
  COMPLETED: { label: "已完成", color: "bg-green-500/20 text-green-300" },
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, milestonesRes] = await Promise.all([
        fetch(`/api/orders/${params.id}`),
        fetch(`/api/orders/${params.id}/milestones`),
      ]);

      if (orderRes.ok) {
        const data = await orderRes.json();
        setOrder(data);
      }

      if (milestonesRes.ok) {
        const data = await milestonesRes.json();
        setMilestones(data);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const createMilestone = async () => {
    if (!milestoneForm.title) {
      alert("请填写里程碑标题");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/orders/${params.id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: milestoneForm.title,
          description: milestoneForm.description || null,
          dueDate: milestoneForm.dueDate || null,
        }),
      });

      if (res.ok) {
        setShowMilestoneDialog(false);
        setMilestoneForm({ title: "", description: "", dueDate: "" });
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "创建失败");
      }
    } catch (error) {
      console.error("创建失败:", error);
      alert("创建失败");
    } finally {
      setSaving(false);
    }
  };

  const updateMilestoneStatus = async (milestoneId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${params.id}/milestones/${milestoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("更新失败:", error);
    }
  };

  const createContract = async () => {
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: params.id }),
      });

      if (res.ok) {
        const contract = await res.json();
        router.push(`/admin/contracts/${contract.id}`);
      } else {
        const error = await res.json();
        alert(error.error || "创建合同失败");
      }
    } catch (error) {
      console.error("创建合同失败:", error);
      alert("创建合同失败");
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">订单不存在</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          返回
        </Button>
      </div>
    );
  }

  return (
    <RequireAuth adminOnly>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">订单详情</h1>
            <p className="text-gray-400">{order.orderNumber}</p>
          </div>
          <Badge className={statusMap[order.status]?.color}>
            {statusMap[order.status]?.label || order.status}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* 订单信息 */}
          <Card className="bg-white/10 border-white/20 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5" />
                订单信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">订单编号</span>
                  <p className="text-white font-medium">{order.orderNumber}</p>
                </div>
                <div>
                  <span className="text-gray-400">创建时间</span>
                  <p className="text-white">
                    {new Date(order.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h4 className="text-white font-medium mb-3">服务项目</h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-white/5 rounded"
                    >
                      <div>
                        <p className="text-white">{item.service.name}</p>
                        <p className="text-sm text-gray-400">数量: {item.quantity}</p>
                      </div>
                      <p className="text-white font-medium">
                        ¥{(item.unitPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">小计</span>
                  <span className="text-white">¥{order.subtotal.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">折扣</span>
                    <span className="text-green-400">-¥{order.discount.toLocaleString()}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">税费</span>
                    <span className="text-white">¥{order.tax.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">总计</span>
                  <span className="text-cyan-400">¥{order.total.toLocaleString()}</span>
                </div>
              </div>

              {order.clientNote && (
                <>
                  <Separator className="bg-white/10" />
                  <div>
                    <h4 className="text-gray-400 text-sm mb-1">客户备注</h4>
                    <p className="text-white">{order.clientNote}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 客户信息 */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                客户信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-gray-400 text-sm">姓名</span>
                <p className="text-white">
                  {order.client.firstName} {order.client.lastName}
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">邮箱</span>
                <p className="text-white">{order.client.email}</p>
              </div>
              {order.client.phone && (
                <div>
                  <span className="text-gray-400 text-sm">电话</span>
                  <p className="text-white">{order.client.phone}</p>
                </div>
              )}

              <Separator className="bg-white/10" />

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={createContract}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  生成合同
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 里程碑管理 */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              项目里程碑
            </CardTitle>
            <Button size="sm" onClick={() => setShowMilestoneDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加里程碑
            </Button>
          </CardHeader>
          <CardContent>
            {milestones.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p>暂无里程碑</p>
              </div>
            ) : (
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="flex items-start gap-4 p-4 bg-white/5 rounded-lg"
                  >
                    <div className="mt-1">{getMilestoneIcon(milestone.status)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-medium">
                            {index + 1}. {milestone.title}
                          </h4>
                          {milestone.description && (
                            <p className="text-gray-400 text-sm mt-1">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                        <Select
                          value={milestone.status}
                          onValueChange={(value) =>
                            updateMilestoneStatus(milestone.id, value)
                          }
                        >
                          <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">待开始</SelectItem>
                            <SelectItem value="IN_PROGRESS">进行中</SelectItem>
                            <SelectItem value="COMPLETED">已完成</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {milestone.dueDate && (
                        <p className="text-gray-500 text-sm mt-2">
                          预计完成: {new Date(milestone.dueDate).toLocaleDateString("zh-CN")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 添加里程碑对话框 */}
        <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
          <DialogContent className="bg-primary-900 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>添加里程碑</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">标题 *</label>
                <Input
                  value={milestoneForm.title}
                  onChange={(e) =>
                    setMilestoneForm({ ...milestoneForm, title: e.target.value })
                  }
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="例如：需求确认"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">描述</label>
                <Textarea
                  value={milestoneForm.description}
                  onChange={(e) =>
                    setMilestoneForm({ ...milestoneForm, description: e.target.value })
                  }
                  className="bg-white/5 border-white/20 text-white"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">预计完成日期</label>
                <Input
                  type="date"
                  value={milestoneForm.dueDate}
                  onChange={(e) =>
                    setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })
                  }
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>
                取消
              </Button>
              <Button onClick={createMilestone} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireAuth>
  );
}

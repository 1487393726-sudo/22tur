"use client";

import { useState, useEffect, use } from "react";
import {
  Loader2,
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  FileText,
  MessageCircle,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  clientNote?: string;
  createdAt: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    note?: string;
    service: {
      id: string;
      name: string;
      nameEn: string;
      category?: {
        name: string;
      };
    };
  }[];
  package?: {
    id: string;
    name: string;
    nameEn: string;
  } | null;
  milestones: {
    id: string;
    name: string;
    description?: string;
    status: string;
    dueDate?: string;
    completedAt?: string;
  }[];
  contract?: {
    id: string;
    contractNumber: string;
    status: string;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "待确认", color: "text-yellow-500 bg-yellow-500/10", icon: Clock },
  CONFIRMED: { label: "已确认", color: "text-blue-500 bg-blue-500/10", icon: CheckCircle },
  IN_PROGRESS: { label: "进行中", color: "text-purple-500 bg-purple-500/10", icon: Package },
  COMPLETED: { label: "已完成", color: "text-green-500 bg-green-500/10", icon: CheckCircle },
  CANCELLED: { label: "已取消", color: "text-red-500 bg-red-500/10", icon: XCircle },
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (error) {
        console.error("加载订单失败:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!confirm("确定要取消此订单吗？")) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrder((prev) => (prev ? { ...prev, status: data.status } : null));
      } else {
        const error = await res.json();
        alert(error.error || "取消订单失败");
      }
    } catch (error) {
      console.error("取消订单失败:", error);
      alert("取消订单失败");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">加载中...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-40 text-center">
          <h1 className="purple-gradient-title text-2xl font-bold mb-4">订单不存在</h1>
          <Link href="/client/orders" className="text-primary hover:underline">
            返回订单列表
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/client/orders"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              返回订单列表
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="purple-gradient-title text-3xl font-bold mb-2">订单详情</h1>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-muted-foreground">
                    {order.orderNumber}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                    <StatusIcon className="w-4 h-4 inline mr-1" />
                    {status.label}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  ￥{order.total.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString("zh-CN")}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="purple-gradient-title text-xl font-semibold mb-4">服务项目</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div>
                        <div className="font-medium">{item.service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.service.category?.name}
                        </div>
                        {item.note && (
                          <div className="text-sm text-muted-foreground mt-1">
                            备注: {item.note}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ￥{(item.unitPrice * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ￥{item.unitPrice.toLocaleString()} × {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="mt-6 pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>小计</span>
                    <span>￥{order.subtotal.toLocaleString()}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>优惠</span>
                      <span>-￥{order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  {order.tax > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>税费</span>
                      <span>￥{order.tax.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-2">
                    <span>总计</span>
                    <span className="text-primary">￥{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              {order.milestones.length > 0 && (
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h2 className="purple-gradient-title text-xl font-semibold mb-4">项目进度</h2>
                  <div className="space-y-4">
                    {order.milestones.map((milestone, index) => (
                      <div key={milestone.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              milestone.status === "COMPLETED"
                                ? "bg-green-500 text-white"
                                : milestone.status === "IN_PROGRESS"
                                ? "bg-blue-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </div>
                          {index < order.milestones.length - 1 && (
                            <div className="w-0.5 h-full bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="font-medium">{milestone.name}</div>
                          {milestone.description && (
                            <div className="text-sm text-muted-foreground">
                              {milestone.description}
                            </div>
                          )}
                          {milestone.completedAt && (
                            <div className="text-xs text-green-500 mt-1">
                              完成于 {new Date(milestone.completedAt).toLocaleDateString("zh-CN")}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="purple-gradient-title text-lg font-semibold mb-4">操作</h2>
                <div className="space-y-3">
                  {order.paymentStatus === "UNPAID" && order.status === "PENDING" && (
                    <button className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      立即支付
                    </button>
                  )}
                  {order.contract && (
                    <Link
                      href={`/client/contracts/${order.contract.id}`}
                      className="w-full py-3 border border-border rounded-lg hover:bg-muted/50 transition-all flex items-center justify-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      查看合同
                    </Link>
                  )}
                  <button className="w-full py-3 border border-border rounded-lg hover:bg-muted/50 transition-all flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    联系客服
                  </button>
                  {order.status === "PENDING" && (
                    <button
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                      className="w-full py-3 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      {cancelling ? "取消中..." : "取消订单"}
                    </button>
                  )}
                </div>
              </div>

              {/* Client Note */}
              {order.clientNote && (
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h2 className="purple-gradient-title text-lg font-semibold mb-2">备注</h2>
                  <p className="text-muted-foreground">{order.clientNote}</p>
                </div>
              )}

              {/* Delivery Info */}
              {order.estimatedDelivery && (
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h2 className="purple-gradient-title text-lg font-semibold mb-2">交付信息</h2>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">预计交付</span>
                      <span>{new Date(order.estimatedDelivery).toLocaleDateString("zh-CN")}</span>
                    </div>
                    {order.actualDelivery && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">实际交付</span>
                        <span className="text-green-500">
                          {new Date(order.actualDelivery).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

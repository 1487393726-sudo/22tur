"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  ServiceErrorBoundary,
  ServiceLoadError,
} from "@/components/services/service-error-boundary";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle,
  Calendar,
  FileText,
  Download,
  MessageCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface Milestone {
  id: string;
  name: string;
  description: string | null;
  dueDate: string | null;
  completedAt: string | null;
  status: string;
  deliverables: { name: string; url: string; type: string }[];
}

interface ServiceProgress {
  orderId: string;
  orderNumber: string;
  status: string;
  progress: number;
  statistics: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
  milestones: Milestone[];
  currentMilestone: Milestone | null;
  estimatedCompletion: string | null;
  actualDelivery: string | null;
  startDate: string;
}

interface ServiceOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  clientNote: string | null;
  createdAt: string;
  progress: number;
  totalMilestones: number;
  completedMilestones: number;
  package: {
    id: string;
    name: string;
    nameEn: string;
    description: string;
    category: { name: string } | null;
  } | null;
  items: {
    service: {
      id: string;
      name: string;
      nameEn: string;
      description: string;
      category: { name: string };
    };
    quantity: number;
    unitPrice: number;
  }[];
  payments: {
    id: string;
    amount: number;
    method: string;
    status: string;
    paidAt: string | null;
  }[];
  contract: {
    id: string;
    contractNumber: string;
    status: string;
    pdfPath: string | null;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待处理", color: "text-gray-400 border-gray-400" },
  IN_PROGRESS: { label: "进行中", color: "text-blue-400 border-blue-400" },
  COMPLETED: { label: "已完成", color: "text-green-400 border-green-400" },
};

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [progress, setProgress] = useState<ServiceProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"progress" | "details" | "payments">("progress");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login?callbackUrl=/my-services");
    } else if (authStatus === "authenticated") {
      fetchData();
    }
  }, [authStatus, id, router]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [orderRes, progressRes] = await Promise.all([
        fetch(`/api/client-services/${id}`),
        fetch(`/api/client-services/${id}/progress`),
      ]);

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrder(orderData);
      } else if (orderRes.status === 404) {
        router.push("/my-services");
        return;
      } else {
        setError("获取服务详情失败，请稍后重试");
        return;
      }

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(progressData);
      }
    } catch (error) {
      console.error("获取服务详情失败:", error);
      setError("网络连接失败，请检查网络后重试");
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <ServiceErrorBoundary serviceName="服务详情">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navbar />
          <main className="pt-20">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回我的服务
              </Button>
            </div>
            <ServiceLoadError message={error} onRetry={fetchData} />
          </main>
          <Footer />
        </div>
      </ServiceErrorBoundary>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <ServiceErrorBoundary serviceName="服务详情">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />

      <main className="pt-20">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回我的服务
          </Button>
        </div>

        {/* Header */}
        <section className="px-4 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-sm text-gray-500 mb-2 block">
                    订单号: {order.orderNumber}
                  </span>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {order.package?.name || "服务订单"}
                  </h1>
                  {order.package?.category && (
                    <span className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-full">
                      {order.package.category.name}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">
                    ¥{order.total.toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              {progress && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">
                      整体进度: {progress.statistics.completed}/{progress.statistics.total} 里程碑
                    </span>
                    <span className="text-blue-400 font-medium">
                      {progress.progress}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {progress?.statistics.total || 0}
                  </p>
                  <p className="text-gray-500 text-sm">总里程碑</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {progress?.statistics.completed || 0}
                  </p>
                  <p className="text-gray-500 text-sm">已完成</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    {progress?.statistics.inProgress || 0}
                  </p>
                  <p className="text-gray-500 text-sm">进行中</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-400">
                    {progress?.statistics.pending || 0}
                  </p>
                  <p className="text-gray-500 text-sm">待开始</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="px-4 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2 mb-6">
              {[
                { key: "progress", label: "进度跟踪" },
                { key: "details", label: "服务详情" },
                { key: "payments", label: "付款记录" },
              ].map((tab) => (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.key as any)}
                  className="border-slate-700"
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "progress" && progress && (
              <div className="space-y-4">
                {progress.milestones.map((milestone, index) => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    index={index}
                    isLast={index === progress.milestones.length - 1}
                  />
                ))}
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Package Description */}
                {order.package?.description && (
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      套餐说明
                    </h3>
                    <p className="text-gray-400">{order.package.description}</p>
                  </div>
                )}

                {/* Services */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    包含服务 ({order.items.length} 项)
                  </h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0"
                      >
                        <div>
                          <p className="text-white font-medium">
                            {item.service.name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {item.service.category?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white">
                            ¥{item.unitPrice.toLocaleString()}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-gray-500 text-sm">
                              x{item.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contract */}
                {order.contract && (
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      服务合同
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400">
                          合同编号: {order.contract.contractNumber}
                        </p>
                        <p className="text-gray-500 text-sm">
                          状态: {order.contract.status}
                        </p>
                      </div>
                      {order.contract.pdfPath && (
                        <Button variant="outline" className="border-slate-700">
                          <Download className="w-4 h-4 mr-2" />
                          下载合同
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "payments" && (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  付款记录
                </h3>
                {order.payments.length === 0 ? (
                  <p className="text-gray-500">暂无付款记录</p>
                ) : (
                  <div className="space-y-3">
                    {order.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0"
                      >
                        <div>
                          <p className="text-white font-medium">
                            ¥{payment.amount.toLocaleString()}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {payment.method}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              payment.status === "COMPLETED"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {payment.status === "COMPLETED" ? "已支付" : "待支付"}
                          </span>
                          {payment.paidAt && (
                            <p className="text-gray-500 text-sm mt-1">
                              {new Date(payment.paidAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Price Summary */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-400">
                      <span>小计</span>
                      <span>¥{order.subtotal.toLocaleString()}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>优惠</span>
                        <span>-¥{order.discount.toLocaleString()}</span>
                      </div>
                    )}
                    {order.tax > 0 && (
                      <div className="flex justify-between text-gray-400">
                        <span>税费</span>
                        <span>¥{order.tax.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-white font-bold text-lg pt-2">
                      <span>总计</span>
                      <span>¥{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                asChild
              >
                <Link href="/contact">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  联系客服
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </ServiceErrorBoundary>
  );
}

function MilestoneCard({
  milestone,
  index,
  isLast,
}: {
  milestone: Milestone;
  index: number;
  isLast: boolean;
}) {
  const status = statusConfig[milestone.status] || statusConfig.PENDING;

  const getIcon = () => {
    switch (milestone.status) {
      case "COMPLETED":
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case "IN_PROGRESS":
        return <Clock className="w-6 h-6 text-blue-400" />;
      default:
        return <Circle className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
            milestone.status === "COMPLETED"
              ? "border-green-400 bg-green-400/10"
              : milestone.status === "IN_PROGRESS"
              ? "border-blue-400 bg-blue-400/10"
              : "border-gray-600 bg-slate-800"
          }`}
        >
          {getIcon()}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 flex-1 my-2 ${
              milestone.status === "COMPLETED" ? "bg-green-400" : "bg-slate-700"
            }`}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {milestone.name}
              </h3>
              {milestone.description && (
                <p className="text-gray-400 text-sm mt-1">
                  {milestone.description}
                </p>
              )}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm border ${status.color}`}
            >
              {status.label}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            {milestone.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                预计: {new Date(milestone.dueDate).toLocaleDateString()}
              </span>
            )}
            {milestone.completedAt && (
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-4 h-4" />
                完成: {new Date(milestone.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Deliverables */}
          {milestone.deliverables && milestone.deliverables.length > 0 && (
            <div>
              <p className="text-gray-400 text-sm mb-2">交付物:</p>
              <div className="flex flex-wrap gap-2">
                {milestone.deliverables.map((deliverable, idx) => (
                  <a
                    key={idx}
                    href={deliverable.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    {deliverable.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

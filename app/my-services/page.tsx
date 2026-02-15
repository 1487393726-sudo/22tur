"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  ServiceErrorBoundary,
  ServiceLoadError,
  ServiceEmptyState,
} from "@/components/services/service-error-boundary";
import {
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  ShoppingBag,
  Calendar,
  BarChart3,
} from "lucide-react";

interface ClientService {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  progress: number;
  totalMilestones: number;
  completedMilestones: number;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  createdAt: string;
  package: {
    id: string;
    name: string;
    nameEn: string;
    slug: string;
    coverImage: string | null;
  } | null;
  services: {
    id: string;
    name: string;
    nameEn: string;
    coverImage: string | null;
    quantity: number;
  }[];
  currentMilestone: {
    id: string;
    name: string;
    status: string;
  } | null;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<any> }
> = {
  PENDING: { label: "待确认", color: "text-yellow-400 bg-yellow-400/10", icon: Clock },
  CONFIRMED: { label: "已确认", color: "text-blue-400 bg-blue-400/10", icon: CheckCircle },
  IN_PROGRESS: { label: "进行中", color: "text-purple-400 bg-purple-400/10", icon: BarChart3 },
  COMPLETED: { label: "已完成", color: "text-green-400 bg-green-400/10", icon: CheckCircle },
  CANCELLED: { label: "已取消", color: "text-red-400 bg-red-400/10", icon: AlertCircle },
};

export default function MyServicesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<ClientService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login?callbackUrl=/my-services");
    } else if (authStatus === "authenticated") {
      fetchServices();
    }
  }, [authStatus, router]);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "/api/client-services?limit=50";
      if (filter !== "all") {
        url += `&status=${filter}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setServices(data.data || []);
      } else {
        setError("获取服务列表失败，请稍后重试");
      }
    } catch (error) {
      console.error("获取服务列表失败:", error);
      setError("网络连接失败，请检查网络后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchServices();
    }
  }, [filter, authStatus]);

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const stats = {
    total: services.length,
    inProgress: services.filter((s) => s.status === "IN_PROGRESS").length,
    completed: services.filter((s) => s.status === "COMPLETED").length,
  };

  return (
    <ServiceErrorBoundary serviceName="我的服务">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />

      <main className="pt-20">
        {/* Header */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">我的服务</h1>
                <p className="text-gray-400">
                  查看和管理您购买的所有服务
                </p>
              </div>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                asChild
              >
                <Link href="/shop">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  浏览更多服务
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-gray-400 text-sm">全部服务</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
                    <p className="text-gray-400 text-sm">进行中</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.completed}</p>
                    <p className="text-gray-400 text-sm">已完成</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-8">
              {[
                { value: "all", label: "全部" },
                { value: "IN_PROGRESS", label: "进行中" },
                { value: "COMPLETED", label: "已完成" },
                { value: "PENDING", label: "待确认" },
              ].map((item) => (
                <Button
                  key={item.value}
                  variant={filter === item.value ? "default" : "outline"}
                  onClick={() => setFilter(item.value)}
                  className="border-slate-700"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Services List */}
        <section className="px-4 pb-20">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : error ? (
              <ServiceLoadError message={error} onRetry={fetchServices} />
            ) : services.length === 0 ? (
              <ServiceEmptyState
                icon={Package}
                title="暂无服务记录"
                description="您还没有购买任何服务，快去浏览我们的服务套餐吧"
                actionLabel="浏览服务套餐"
                actionHref="/shop"
              />
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </ServiceErrorBoundary>
  );
}

function ServiceCard({ service }: { service: ClientService }) {
  const status = statusConfig[service.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <Link href={`/my-services/${service.id}`}>
      <div className="group bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all">
        <div className="flex gap-6">
          {/* Image */}
          <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
            {service.package?.coverImage ? (
              <Image
                src={service.package.coverImage}
                alt={service.package.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Package className="w-8 h-8 text-white/50" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {service.package?.name || "服务订单"}
                </h3>
                <p className="text-gray-500 text-sm">
                  订单号: {service.orderNumber}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${status.color}`}
              >
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
            </div>

            {/* Progress */}
            {service.status === "IN_PROGRESS" && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">
                    进度: {service.completedMilestones}/{service.totalMilestones} 里程碑
                  </span>
                  <span className="text-blue-400">{service.progress}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${service.progress}%` }}
                  />
                </div>
                {service.currentMilestone && (
                  <p className="text-gray-500 text-sm mt-1">
                    当前: {service.currentMilestone.name}
                  </p>
                )}
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(service.createdAt).toLocaleDateString()}
              </span>
              <span>¥{service.total.toLocaleString()}</span>
              {service.services.length > 0 && (
                <span>{service.services.length} 项服务</span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center">
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  AlertTriangle,
  Eye,
  Download,
  Filter,
} from "lucide-react";

interface Investment {
  id: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  investedAt: string;
  completedAt?: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  project: {
    id: string;
    title: string;
    expectedReturn: number;
    duration: number;
  };
}

const statusLabels: Record<string, string> = {
  PENDING: "Pending Payment",
  COMPLETED: "Completed",
  REFUNDED: "Refunded",
  FAILED: "Failed",
};

const getButtonClass = (isActive: boolean): string => {
  const baseClass = "px-4 py-2 rounded-lg text-sm font-medium transition-all";
  const activeClass = "bg-primary text-primary-foreground hover:bg-primary/90";
  const inactiveClass = "bg-muted text-foreground hover:bg-muted/80";
  return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
};

export default function InvestmentDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = new URL("/api/project-investments", window.location.origin);
        if (session?.user?.id) {
          url.searchParams.append("userId", session.user.id);
        }
        if (filterStatus) {
          url.searchParams.append("status", filterStatus);
        }
        url.searchParams.append("limit", "50");

        const response = await fetch(url.toString());

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.error || `HTTP ${response.status}`;
          throw new Error(`Failed to fetch investment list: ${errorMsg}`);
        }

        const data = await response.json();
        setInvestments(data.investments || []);
      } catch (err) {
        console.error("Failed to fetch investment list:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch investment list"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchInvestments();
    }
  }, [session?.user?.id, filterStatus]);

  if (status === "loading") {
    return (
      <div className="bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "CNY",
    });
  };

  return (
    <div className="min-h-screen space-y-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <h1 className="purple-gradient-title text-3xl font-bold mb-2">我的投资</h1>
        <p className="purple-gradient-text">
          查看和管理您的投资项目
        </p>
      </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="list">Investment List</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-6">
              <Card className="purple-gradient-card">
                <CardHeader>
                  <CardTitle className="purple-gradient-title text-base font-semibold flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    筛选
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={filterStatus === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(null)}
                    >
                      全部
                    </Button>
                    {Object.entries(statusLabels).map(([status, label]) => {
                      const isActive = filterStatus === status;
                      return (
                        <Button 
                          key={status} 
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilterStatus(status)}
                        >
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <Card className="purple-gradient-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="w-5 h-5" />
                      <p className="purple-gradient-text">{error}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : investments.length === 0 ? (
                <Card className="purple-gradient-card">
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <p className="purple-gradient-text mb-4">暂无投资记录</p>
                      <Button
                        onClick={() => router.push("/investments")}
                      >
                        浏览投资项目
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {investments.map((investment) => (
                    <Card key={investment.id} className="purple-gradient-card">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="purple-gradient-title font-semibold">
                                {investment.project.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                investment.status === 'COMPLETED' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                                investment.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                investment.status === 'FAILED' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                                'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                              }`}>
                                {statusLabels[investment.status]}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <p className="text-xs purple-gradient-text opacity-75 mb-1">
                                  投资金额
                                </p>
                                <p className="purple-gradient-title font-semibold">
                                  {formatAmount(investment.amount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs purple-gradient-text opacity-75 mb-1">
                                  年化收益率
                                </p>
                                <p className="font-semibold text-green-500">
                                  {investment.project.expectedReturn}%
                                </p>
                              </div>
                              <div>
                                <p className="text-xs purple-gradient-text opacity-75 mb-1">
                                  投资期限
                                </p>
                                <p className="purple-gradient-title font-semibold">
                                  {investment.project.duration} 个月
                                </p>
                              </div>
                              <div>
                                <p className="text-xs purple-gradient-text opacity-75 mb-1">
                                  投资日期
                                </p>
                                <p className="purple-gradient-title font-semibold">
                                  {formatDate(investment.investedAt)}
                                </p>
                              </div>
                            </div>

                            {investment.completedAt && (
                              <div className="mt-3 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                                <p className="text-sm text-green-500">
                                  投资完成于 {formatDate(investment.completedAt)}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/investments/${investment.project.id}`
                                )
                              }
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              查看项目
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `/api/project-investments/${investment.id}/certificate`
                                )
                              }
                              title="下载投资凭证"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              凭证
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `/api/project-investments/${investment.id}/invoice`
                                )
                              }
                              title="下载投资发票"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              发票
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `/api/project-investments/${investment.id}/terms`
                                )
                              }
                              title="下载服务条款"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              条款
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `/api/project-investments/${investment.id}/quality-certificate`
                                )
                              }
                              title="下载质量证书"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              质量
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
    </div>
  );
}

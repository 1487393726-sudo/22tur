"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  PieChart,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface PortfolioItem {
  id: string;
  projectTitle: string;
  amount: number;
  expectedReturn: number;
  duration: number;
  status: string;
  investedAt: string;
  currentValue?: number;
}

export default function InvestmentPortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalValue: 0,
    totalReturn: 0,
    activeInvestments: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/project-investments?userId=" + session?.user?.id);
        const data = await response.json();

        if (data.investments) {
          const items: PortfolioItem[] = data.investments.map((inv: any) => ({
            id: inv.id,
            projectTitle: inv.project?.title || "未知项目",
            amount: inv.amount,
            expectedReturn: inv.project?.expectedReturn || 0,
            duration: inv.project?.duration || 0,
            status: inv.status,
            investedAt: inv.investedAt,
            currentValue: inv.amount * (1 + (inv.project?.expectedReturn || 0) / 100),
          }));

          setPortfolio(items);

          // 计算统计数据
          const totalInvested = items.reduce((sum, item) => sum + item.amount, 0);
          const totalValue = items.reduce((sum, item) => sum + (item.currentValue || item.amount), 0);
          const totalReturn = totalValue - totalInvested;
          const activeInvestments = items.filter((item) => 
            ["ACTIVE", "COMPLETED", "PENDING"].includes(item.status)
          ).length;

          setStats({
            totalInvested,
            totalValue,
            totalReturn,
            activeInvestments,
          });
        }
      } catch (error) {
        console.error("Failed to fetch portfolio:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchPortfolio();
    }
  }, [session?.user?.id]);

  if (status === "loading" || loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("zh-CN");
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
        <h1 className="purple-gradient-title text-3xl font-bold mb-2 flex items-center gap-2">
          <PieChart className="h-8 w-8" />
          投资组合
        </h1>
        <p className="purple-gradient-text">
          查看您的投资组合详情和收益情况
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="purple-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="purple-gradient-text text-sm font-medium">总投资额</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="purple-gradient-title text-2xl font-bold">{formatAmount(stats.totalInvested)}</div>
          </CardContent>
        </Card>

        <Card className="purple-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="purple-gradient-text text-sm font-medium">当前价值</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="purple-gradient-title text-2xl font-bold text-green-500">
              {formatAmount(stats.totalValue)}
            </div>
          </CardContent>
        </Card>

        <Card className="purple-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="purple-gradient-text text-sm font-medium">总收益</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`purple-gradient-title text-2xl font-bold ${stats.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatAmount(stats.totalReturn)}
            </div>
          </CardContent>
        </Card>

        <Card className="purple-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="purple-gradient-text text-sm font-medium">活跃投资</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="purple-gradient-title text-2xl font-bold">{stats.activeInvestments}</div>
          </CardContent>
        </Card>
      </div>

      {/* 投资组合列表 */}
      <Card className="purple-gradient-card">
        <CardHeader>
          <CardTitle className="purple-gradient-title">投资组合详情</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio.length === 0 ? (
            <div className="text-center py-12">
              <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="purple-gradient-text mb-4">暂无投资组合数据</p>
              <Button onClick={() => router.push("/investments")}>
                浏览投资项目
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="purple-gradient-title font-semibold text-lg mb-2">{item.projectTitle}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="purple-gradient-text text-xs">投资金额</p>
                          <p className="purple-gradient-title font-medium">{formatAmount(item.amount)}</p>
                        </div>
                        <div>
                          <p className="purple-gradient-text text-xs">预期收益率</p>
                          <p className="purple-gradient-title font-medium text-green-500">{item.expectedReturn}%</p>
                        </div>
                        <div>
                          <p className="purple-gradient-text text-xs">投资期限</p>
                          <p className="purple-gradient-title font-medium">{item.duration} 个月</p>
                        </div>
                        <div>
                          <p className="purple-gradient-text text-xs">投资日期</p>
                          <p className="purple-gradient-title font-medium">{formatDate(item.investedAt)}</p>
                        </div>
                      </div>
                      {item.currentValue && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-sm purple-gradient-text">当前价值</span>
                            <span className="font-semibold text-green-500">
                              {formatAmount(item.currentValue)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "COMPLETED"
                            ? "bg-green-500/20 text-green-500 border border-green-500/30"
                            : item.status === "PENDING"
                            ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                            : "bg-blue-500/20 text-blue-500 border border-blue-500/30"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

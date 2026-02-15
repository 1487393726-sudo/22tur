"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  LineChart,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
} from "lucide-react";

interface ReturnData {
  period: string;
  principal: number;
  return: number;
  total: number;
  rate: number;
}

export default function ReturnsAnalysisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [returns, setReturns] = useState<ReturnData[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPrincipal: 0,
    totalReturn: 0,
    totalValue: 0,
    averageRate: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // 模拟收益数据
    const mockReturns: ReturnData[] = [
      {
        period: "2024 Q1",
        principal: 50000,
        return: 1875,
        total: 51875,
        rate: 3.75,
      },
      {
        period: "2024 Q2",
        principal: 100000,
        return: 5000,
        total: 105000,
        rate: 5.0,
      },
      {
        period: "2024 Q3",
        principal: 150000,
        return: 11250,
        total: 161250,
        rate: 7.5,
      },
    ];

    setTimeout(() => {
      setReturns(mockReturns);
      const totalPrincipal = mockReturns.reduce((sum, r) => sum + r.principal, 0);
      const totalReturn = mockReturns.reduce((sum, r) => sum + r.return, 0);
      const totalValue = totalPrincipal + totalReturn;
      const averageRate = mockReturns.reduce((sum, r) => sum + r.rate, 0) / mockReturns.length;

      setSummary({
        totalPrincipal,
        totalReturn,
        totalValue,
        averageRate,
      });
      setLoading(false);
    }, 1000);
  }, []);

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
          <LineChart className="h-8 w-8" />
          收益分析
        </h1>
        <p className="purple-gradient-text">
          详细分析您的投资收益情况和趋势
        </p>
      </div>

      {/* 收益概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="purple-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="purple-gradient-text text-sm font-medium">投资本金</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="purple-gradient-title text-2xl font-bold">{formatAmount(summary.totalPrincipal)}</div>
          </CardContent>
        </Card>

        <Card className="purple-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="purple-gradient-text text-sm font-medium">累计收益</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="purple-gradient-title text-2xl font-bold text-green-500">
              {formatAmount(summary.totalReturn)}
            </div>
          </CardContent>
        </Card>

        <Card className="purple-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="purple-gradient-text text-sm font-medium">总资产</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="purple-gradient-title text-2xl font-bold">{formatAmount(summary.totalValue)}</div>
          </CardContent>
        </Card>

        <Card className="purple-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="purple-gradient-text text-sm font-medium">平均收益率</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="purple-gradient-title text-2xl font-bold text-green-500">
              {summary.averageRate.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 收益详情 */}
      <Card className="purple-gradient-card">
        <CardHeader>
          <CardTitle className="purple-gradient-title">收益明细</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList>
              <TabsTrigger value="table">表格视图</TabsTrigger>
              <TabsTrigger value="chart">图表视图</TabsTrigger>
            </TabsList>
            <TabsContent value="table" className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 purple-gradient-text">期间</th>
                      <th className="text-right p-2 purple-gradient-text">本金</th>
                      <th className="text-right p-2 purple-gradient-text">收益</th>
                      <th className="text-right p-2 purple-gradient-text">总价值</th>
                      <th className="text-right p-2 purple-gradient-text">收益率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map((item, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/30">
                        <td className="p-2 purple-gradient-text">{item.period}</td>
                        <td className="text-right p-2 purple-gradient-title">{formatAmount(item.principal)}</td>
                        <td className="text-right p-2 text-green-500 font-semibold">
                          {formatAmount(item.return)}
                        </td>
                        <td className="text-right p-2 purple-gradient-title font-semibold">
                          {formatAmount(item.total)}
                        </td>
                        <td className="text-right p-2 text-green-500 font-semibold">
                          {item.rate.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="chart" className="mt-4">
              <div className="h-64 flex items-center justify-center border border-border rounded-lg">
                <p className="purple-gradient-text">图表功能开发中...</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Download,
  RefreshCw,
  ArrowLeft,
  Calendar,
  PieChart,
  Activity,
} from "lucide-react";
import Link from "next/link";

// 统计数据接口
interface TotalStats {
  totalAmount: number;
  totalCount: number;
  completedAmount: number;
  completedCount: number;
  uniqueInvestors: number;
  avgAmount: number;
  allTimeAmount: number;
  allTimeCount: number;
}

interface ProjectStat {
  projectId: string;
  project: { id: string; title: string; coverImage?: string; status: string } | null;
  totalAmount: number;
  investorCount: number;
}

interface DailyTrend {
  date: string;
  amount: number;
  count: number;
}

interface TopInvestor {
  userId: string;
  user: { id: string; firstName: string; lastName: string; email: string; avatar?: string } | null;
  totalAmount: number;
  investmentCount: number;
}

interface StatusDistribution {
  status: string;
  amount: number;
  count: number;
}

interface RecentInvestment {
  id: string;
  amount: number;
  status: string;
  investedAt: string;
  user: { firstName: string; lastName: string; email: string };
  project: { title: string };
}

export default function InvestmentAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const [totalStats, setTotalStats] = useState<TotalStats | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStat[]>([]);
  const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([]);
  const [topInvestors, setTopInvestors] = useState<TopInvestor[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [recentInvestments, setRecentInvestments] = useState<RecentInvestment[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics/investments?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setTotalStats(data.totalStats);
        setProjectStats(data.projectStats || []);
        setDailyTrend(data.dailyTrend || []);
        setTopInvestors(data.topInvestors || []);
        setStatusDistribution(data.statusDistribution || []);
        setRecentInvestments(data.recentInvestments || []);
      }
    } catch (error) {
      console.error("获取统计数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    try {
      setExporting(true);
      const response = await fetch(`/api/admin/analytics/investments/export?format=${format}&period=${period}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `investments_${new Date().toISOString().split("T")[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("导出失败:", error);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      COMPLETED: "bg-green-500/20 text-green-400 border-green-500/50",
      REFUNDED: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      FAILED: "bg-red-500/20 text-red-400 border-red-500/50",
    };
    const labels: Record<string, string> = {
      PENDING: "待支付",
      COMPLETED: "已完成",
      REFUNDED: "已退款",
      FAILED: "失败",
    };
    return (
      <Badge className={styles[status] || "bg-gray-500/20 text-gray-400"}>
        {labels[status] || status}
      </Badge>
    );
  };


  // 计算趋势图的最大值
  const maxTrendAmount = Math.max(...dailyTrend.map((d) => d.amount), 1);

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/analytics">
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-8 w-8" />
                投资数据分析
              </h1>
              <p className="text-gray-300">查看投资统计和趋势分析</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">近 7 天</SelectItem>
                <SelectItem value="30">近 30 天</SelectItem>
                <SelectItem value="90">近 90 天</SelectItem>
                <SelectItem value="365">近一年</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => handleExport("csv")}
              disabled={exporting}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              导出 CSV
            </Button>
            <Button onClick={fetchData} variant="ghost" size="icon" className="text-gray-300">
              <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 text-white animate-spin" />
            <span className="ml-3 text-gray-300">加载中...</span>
          </div>
        ) : (
          <>
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    期间投资总额
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(totalStats?.completedAmount || 0)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    历史总计: {formatCurrency(totalStats?.allTimeAmount || 0)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-300 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    投资笔数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">
                    {totalStats?.completedCount || 0}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    历史总计: {totalStats?.allTimeCount || 0} 笔
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    投资者数量
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">
                    {totalStats?.uniqueInvestors || 0}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">独立投资者</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-orange-300 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    平均投资额
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(totalStats?.avgAmount || 0)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">每笔平均</p>
                </CardContent>
              </Card>
            </div>

            {/* 趋势图和状态分布 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 投资趋势 */}
              <Card className="lg:col-span-2 bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    投资趋势
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    每日投资金额变化
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end gap-1">
                    {dailyTrend.slice(-30).map((day, index) => (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col items-center group"
                      >
                        <div
                          className="w-full bg-blue-500/50 hover:bg-blue-500/70 rounded-t transition-all cursor-pointer"
                          style={{
                            height: `${(day.amount / maxTrendAmount) * 100}%`,
                            minHeight: day.amount > 0 ? "4px" : "0",
                          }}
                          title={`${day.date}: ${formatCurrency(day.amount)} (${day.count}笔)`}
                        />
                        {index % 5 === 0 && (
                          <span className="text-xs text-gray-500 mt-1 rotate-45 origin-left">
                            {day.date.slice(5)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 状态分布 */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    状态分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statusDistribution.map((item) => {
                      const total = statusDistribution.reduce((sum, s) => sum + s.count, 0);
                      const percentage = total > 0 ? (item.count / total) * 100 : 0;
                      return (
                        <div key={item.status} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">{getStatusBadge(item.status)}</span>
                            <span className="text-white">{item.count} 笔</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.status === "COMPLETED"
                                  ? "bg-green-500"
                                  : item.status === "PENDING"
                                  ? "bg-yellow-500"
                                  : item.status === "REFUNDED"
                                  ? "bg-blue-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(item.amount)} ({percentage.toFixed(1)}%)
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* 项目排行和投资者排行 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 项目投资排行 */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">项目投资排行</CardTitle>
                  <CardDescription className="text-gray-400">
                    投资金额最高的项目
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {projectStats.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">暂无数据</p>
                  ) : (
                    <div className="space-y-4">
                      {projectStats.map((item, index) => (
                        <div
                          key={item.projectId}
                          className="flex items-center gap-4 p-3 rounded-lg bg-white/5"
                        >
                          <span className="text-2xl font-bold text-gray-500 w-8">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">
                              {item.project?.title || "未知项目"}
                            </p>
                            <p className="text-sm text-gray-400">
                              {item.investorCount} 位投资者
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">
                              {formatCurrency(item.totalAmount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 投资者排行 */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">投资者排行</CardTitle>
                  <CardDescription className="text-gray-400">
                    投资金额最高的用户
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {topInvestors.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">暂无数据</p>
                  ) : (
                    <div className="space-y-4">
                      {topInvestors.map((item, index) => (
                        <div
                          key={item.userId}
                          className="flex items-center gap-4 p-3 rounded-lg bg-white/5"
                        >
                          <span className="text-2xl font-bold text-gray-500 w-8">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">
                              {item.user
                                ? `${item.user.firstName} ${item.user.lastName}`
                                : "未知用户"}
                            </p>
                            <p className="text-sm text-gray-400">
                              {item.investmentCount} 笔投资
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">
                              {formatCurrency(item.totalAmount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 最近投资记录 */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">最近投资记录</CardTitle>
                <CardDescription className="text-gray-400">
                  最新的投资交易
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentInvestments.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">暂无投资记录</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20">
                        <TableHead className="text-gray-300">投资者</TableHead>
                        <TableHead className="text-gray-300">项目</TableHead>
                        <TableHead className="text-gray-300">金额</TableHead>
                        <TableHead className="text-gray-300">状态</TableHead>
                        <TableHead className="text-gray-300">时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentInvestments.map((inv) => (
                        <TableRow key={inv.id} className="border-white/10">
                          <TableCell className="text-white">
                            {inv.user.firstName} {inv.user.lastName}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {inv.project.title}
                          </TableCell>
                          <TableCell className="text-white font-medium">
                            {formatCurrency(inv.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(inv.status)}</TableCell>
                          <TableCell className="text-gray-400">
                            {new Date(inv.investedAt).toLocaleString("zh-CN")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

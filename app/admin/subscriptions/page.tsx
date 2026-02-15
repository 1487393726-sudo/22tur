"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Calendar,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Progress } from "@/components/ui/progress";
import { RequireAuth } from "@/components/auth/require-auth";

// 订阅类型定义
interface Subscription {
  id: string;
  userId: string;
  serviceId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
  };
  service: {
    id: string;
    name: string;
    type: string;
    price: number;
  };
  planType: "MONTHLY" | "YEARLY";
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  lastPaymentAt?: string;
  nextPaymentAt?: string;
  cancelledAt?: string;
  daysRemaining?: number;
  progress?: number;
}

interface SubscriptionStats {
  total: number;
  active: number;
  expired: number;
  cancelled: number;
  expiringSoon: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalRevenue: number;
}

export default function SubscriptionManagementPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planTypeFilter, setPlanTypeFilter] = useState<string>("all");

  // 加载订阅数据
  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscription/subscriptions');
      if (response.ok) {
        const data = await response.json();
        // 确保返回的是数组并计算剩余天数和进度
        const processedData = Array.isArray(data) ? data.map(processSubscription) : [];
        setSubscriptions(processedData);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('获取订阅列表失败:', error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // 处理订阅数据，计算剩余天数和进度
  const processSubscription = (sub: any): Subscription => {
    const now = new Date();
    const startDate = new Date(sub.startDate);
    const endDate = new Date(sub.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let status = sub.status;
    if (daysRemaining <= 0 && status === "ACTIVE") {
      status = "EXPIRED";
    }

    return {
      ...sub,
      daysRemaining: Math.max(0, daysRemaining),
      progress: Math.min(100, Math.max(0, (daysPassed / totalDays) * 100)),
      status,
    };
  };

  // 计算统计数据
  const calculateStats = (subscriptionData: Subscription[]) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subscriptionStats: SubscriptionStats = {
      total: subscriptionData.length,
      active: subscriptionData.filter(s => s.status === "ACTIVE").length,
      expired: subscriptionData.filter(s => s.status === "EXPIRED").length,
      cancelled: subscriptionData.filter(s => s.status === "CANCELLED").length,
      expiringSoon: subscriptionData.filter(s => 
        s.status === "ACTIVE" && 
        s.nextPaymentAt && 
        new Date(s.nextPaymentAt) <= thirtyDaysFromNow
      ).length,
      monthlyRevenue: subscriptionData
        .filter(s => s.planType === "MONTHLY" && s.status === "ACTIVE")
        .reduce((sum, s) => sum + s.amount, 0),
      yearlyRevenue: subscriptionData
        .filter(s => s.planType === "YEARLY" && s.status === "ACTIVE")
        .reduce((sum, s) => sum + s.amount, 0),
      totalRevenue: subscriptionData.reduce((sum, s) => sum + s.amount, 0),
    };

    setStats(subscriptionStats);
  };

  // 过滤订阅
  useEffect(() => {
    if (!Array.isArray(subscriptions)) return;

    const filtered = subscriptions.filter(sub => {
      const matchesSearch = 
        sub.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.service.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
      const matchesPlanType = planTypeFilter === "all" || sub.planType === planTypeFilter;

      return matchesSearch && matchesStatus && matchesPlanType;
    });

    setFilteredSubscriptions(filtered);
  }, [subscriptions, searchTerm, statusFilter, planTypeFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    if (subscriptions.length > 0) {
      calculateStats(subscriptions);
    }
  }, [subscriptions]);

  // 获取状态信息
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return {
          icon: CheckCircle,
          label: "活跃",
          color: "bg-green-500/20 text-green-300 border-green-500/30"
        };
      case "EXPIRED":
        return {
          icon: XCircle,
          label: "已过期",
          color: "bg-red-500/20 text-red-300 border-red-500/30"
        };
      case "CANCELLED":
        return {
          icon: XCircle,
          label: "已取消",
          color: "bg-gray-500/20 text-gray-300 border-gray-500/30"
        };
      default:
        return {
          icon: Clock,
          label: "未知",
          color: "bg-gray-500/20 text-gray-300 border-gray-500/30"
        };
    }
  };

  // 获取计划类型信息
  const getPlanTypeInfo = (planType: string) => {
    switch (planType) {
      case "MONTHLY":
        return { label: "月付", color: "bg-blue-500/20 text-blue-300" };
      case "YEARLY":
        return { label: "年付", color: "bg-green-500/20 text-green-300" };
      default:
        return { label: "未知", color: "bg-gray-500/20 text-gray-300" };
    }
  };

  // 获取剩余天数样式
  const getDaysRemainingColor = (days: number) => {
    if (days <= 0) return "text-red-400";
    if (days <= 7) return "text-yellow-400";
    if (days <= 30) return "text-orange-400";
    return "text-green-400";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  const handleRenew = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/subscription/renew/${subscriptionId}`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchSubscriptions();
      }
    } catch (error) {
      console.error('续费失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <RequireAuth adminOnly>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold text-white">订阅管理</h1>
          <p className="text-gray-300">管理所有用户的订阅服务和购买记录</p>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  总订阅数
                </CardTitle>
                <CreditCard className="h-4 w-4 text-gray-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <p className="text-xs text-gray-300">活跃 {stats.active}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  活跃订阅
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                <p className="text-xs text-gray-300">正在进行</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  即将到期
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">{stats.expiringSoon}</div>
                <p className="text-xs text-gray-300">30天内到期</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  月度收入
                </CardTitle>
                <Calendar className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {formatCurrency(stats.monthlyRevenue)}
                </div>
                <p className="text-xs text-gray-300">每月固定收入</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  年度收入
                </CardTitle>
                <Calendar className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(stats.yearlyRevenue)}
                </div>
                <p className="text-xs text-gray-300">年度固定收入</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  总收入
                </CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <p className="text-xs text-gray-300">累计收入</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  到期率
                </CardTitle>
                <XCircle className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {stats.total > 0 ? Math.round((stats.expired / stats.total) * 100) : 0}%
                </div>
                <p className="text-xs text-gray-300">过期订阅占比</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 搜索和过滤 */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">订阅列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索用户、服务或邮箱..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32 bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="ACTIVE">活跃</SelectItem>
                  <SelectItem value="EXPIRED">已过期</SelectItem>
                  <SelectItem value="CANCELLED">已取消</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planTypeFilter} onValueChange={setPlanTypeFilter}>
                <SelectTrigger className="w-full md:w-32 bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="计划类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="MONTHLY">月付</SelectItem>
                  <SelectItem value="YEARLY">年付</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={fetchSubscriptions}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 订阅表格 */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white">用户</TableHead>
                  <TableHead className="text-white">服务</TableHead>
                  <TableHead className="text-white">计划类型</TableHead>
                  <TableHead className="text-white">状态</TableHead>
                  <TableHead className="text-white">进度</TableHead>
                  <TableHead className="text-white">剩余天数</TableHead>
                  <TableHead className="text-white">金额</TableHead>
                  <TableHead className="text-white">开始/结束时间</TableHead>
                  <TableHead className="text-white">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => {
                  const StatusInfo = getStatusInfo(subscription.status);
                  const PlanTypeInfo = getPlanTypeInfo(subscription.planType);
                  
                  return (
                    <TableRow key={subscription.id} className="border-white/10">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/avatars/${subscription.user.id}.jpg`} />
                            <AvatarFallback className="bg-white/10 text-white">
                              {subscription.user.firstName.charAt(0)}{subscription.user.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">
                              {subscription.user.firstName} {subscription.user.lastName}
                            </div>
                            <div className="text-sm text-gray-400">
                              {subscription.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">{subscription.service.name}</div>
                          <div className="text-sm text-gray-400">
                            {subscription.service.type === 'SERVICE' ? '服务' : 
                             subscription.service.type === 'INVESTMENT' ? '投资' : '订阅'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={PlanTypeInfo.color}>
                          {PlanTypeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${StatusInfo.color} border`}>
                          <StatusInfo.icon className="h-3 w-3 mr-1" />
                          {StatusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress 
                            value={subscription.progress} 
                            className="h-2"
                          />
                          <div className="text-xs text-gray-400">
                            {Math.round(subscription.progress || 0)}% 完成
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${getDaysRemainingColor(subscription.daysRemaining || 0)}`}>
                          {subscription.daysRemaining !== undefined ? (
                            subscription.daysRemaining <= 0 ? '已过期' : `${subscription.daysRemaining} 天`
                          ) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white font-medium">
                          {formatCurrency(subscription.amount)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {subscription.autoRenew ? '自动续费' : '手动续费'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-300">
                          <div>开始: {formatDate(subscription.startDate)}</div>
                          <div>结束: {formatDate(subscription.endDate)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {subscription.status === "EXPIRED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-400 hover:text-blue-300"
                              onClick={() => handleRenew(subscription.id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 如果没有订阅数据 */}
        {filteredSubscriptions.length === 0 && (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">没有找到订阅</h3>
              <p className="text-gray-400">尝试调整搜索条件或刷新数据</p>
            </CardContent>
          </Card>
        )}
      </div>
    </RequireAuth>
  );
}
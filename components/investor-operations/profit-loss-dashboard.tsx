'use client';

/**
 * 盈亏分析仪表板
 * Profit Loss Dashboard Component
 * 
 * 展示盈亏汇总、趋势图表、ROI分析和项目对比
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from 'lucide-react';
import { 
  ProfitLossSummary, 
  ProfitLossTrend,
  TrendPeriod,
  LossAlert
} from '@/types/investor-operations-monitoring';

interface ProfitLossDashboardProps {
  projectId: string;
  projectName?: string;
}

type DateRangeOption = '7d' | '30d' | '90d' | '365d';

export function ProfitLossDashboard({
  projectId,
  projectName
}: ProfitLossDashboardProps) {
  const [summary, setSummary] = useState<ProfitLossSummary | null>(null);
  const [trend, setTrend] = useState<ProfitLossTrend | null>(null);
  const [alerts, setAlerts] = useState<LossAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeOption>('30d');
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('DAILY');

  // 获取日期范围
  const getDateRange = useCallback((range: DateRangeOption) => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '365d':
        startDate.setDate(endDate.getDate() - 365);
        break;
    }
    
    return { startDate, endDate };
  }, []);

  // 加载数据
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRange(dateRange);
      
      // 并行加载汇总和趋势数据
      const [summaryRes, trendRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/profit-loss/summary?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`),
        fetch(`/api/projects/${projectId}/profit-loss/trend?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&period=${trendPeriod}`)
      ]);

      if (!summaryRes.ok || !trendRes.ok) {
        throw new Error('获取盈亏数据失败');
      }

      const [summaryResult, trendResult] = await Promise.all([
        summaryRes.json(),
        trendRes.json()
      ]);

      if (summaryResult.success) {
        setSummary(summaryResult.data);
      }
      if (trendResult.success) {
        setTrend(trendResult.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取盈亏数据失败');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, dateRange, trendPeriod, getDateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 格式化金额
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 格式化百分比
  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-white400" />
          <span className="ml-3 text-gray-400">加载盈亏数据中...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-900/20 to-purple-900/20 border-red-500/30">
        <CardContent className="flex items-center justify-center py-12">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <span className="ml-3 text-red-400">{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="ml-4 border-red-500/50"
          >
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题和控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {projectName ? `${projectName} - ` : ''}盈亏分析
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            查看项目盈亏状况和趋势分析
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRangeOption)}>
            <SelectTrigger className="w-32 bg-gray-800/50 border-purple-500/30">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">最近7天</SelectItem>
              <SelectItem value="30d">最近30天</SelectItem>
              <SelectItem value="90d">最近90天</SelectItem>
              <SelectItem value="365d">最近一年</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            className="border-purple-500/50"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 总利润 */}
        <Card className={`bg-gradient-to-br ${
          (summary?.totalProfit || 0) >= 0 
            ? 'from-green-900/30 to-emerald-900/20 border-green-500/30' 
            : 'from-red-900/30 to-orange-900/20 border-red-500/30'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">总利润</p>
                <p className={`text-2xl font-bold ${
                  (summary?.totalProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatCurrency(summary?.totalProfit || 0)}
                </p>
                <div className="flex items-center mt-1">
                  {(summary?.totalProfit || 0) >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`text-xs ${
                    (summary?.totalProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {summary?.isProfit ? '盈利' : '亏损'}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                (summary?.totalProfit || 0) >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {(summary?.totalProfit || 0) >= 0 
                  ? <TrendingUp className="h-6 w-6 text-green-400" />
                  : <TrendingDown className="h-6 w-6 text-red-400" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 利润率 */}
        <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">利润率</p>
                <p className={`text-2xl font-bold ${
                  (summary?.profitMargin || 0) >= 0 ? 'text-blue-400' : 'text-orange-400'
                }`}>
                  {formatPercent(summary?.profitMargin || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  利润/收入
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <PieChart className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 投资回报率 */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-violet-900/20 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">投资回报率</p>
                <p className={`text-2xl font-bold ${
                  (summary?.profitLossRate || 0) >= 0 ? 'text-white400' : 'text-orange-400'
                }`}>
                  {formatPercent(summary?.profitLossRate || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  利润/投资额
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Target className="h-6 w-6 text-white400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 收支比 */}
        <Card className="bg-gradient-to-br from-cyan-900/30 to-teal-900/20 border-cyan-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">收支比</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {summary && summary.totalExpenses > 0 
                    ? (summary.totalRevenue / summary.totalExpenses).toFixed(2)
                    : '0.00'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  收入/支出
                </p>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-full">
                <BarChart3 className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 趋势图表 */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-white400" />
              盈亏趋势
            </CardTitle>
            <Select value={trendPeriod} onValueChange={(v) => setTrendPeriod(v as TrendPeriod)}>
              <SelectTrigger className="w-28 bg-gray-800/50 border-purple-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">按日</SelectItem>
                <SelectItem value="WEEKLY">按周</SelectItem>
                <SelectItem value="MONTHLY">按月</SelectItem>
                <SelectItem value="QUARTERLY">按季度</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {trend && trend.data.length > 0 ? (
            <div className="space-y-4">
              {/* 简化的趋势展示 */}
              <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                {trend.data.slice(-10).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                  >
                    <span className="text-sm text-gray-400">{item.date}</span>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-gray-500">收入</span>
                        <p className="text-sm text-green-400">
                          {formatCurrency(item.revenue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">支出</span>
                        <p className="text-sm text-red-400">
                          {formatCurrency(item.expenses)}
                        </p>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <span className="text-xs text-gray-500">利润</span>
                        <p className={`text-sm font-medium ${
                          item.profit >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(item.profit)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`min-w-[60px] justify-center ${
                          item.profitMargin >= 0 
                            ? 'border-green-500/50 text-green-400' 
                            : 'border-red-500/50 text-red-400'
                        }`}
                      >
                        {formatPercent(item.profitMargin)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* 趋势统计 */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-sm text-gray-400">盈利天数</p>
                  <p className="text-lg font-semibold text-green-400">
                    {trend.data.filter(d => d.profit >= 0).length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">亏损天数</p>
                  <p className="text-lg font-semibold text-red-400">
                    {trend.data.filter(d => d.profit < 0).length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">盈利率</p>
                  <p className="text-lg font-semibold text-white400">
                    {trend.data.length > 0 
                      ? ((trend.data.filter(d => d.profit >= 0).length / trend.data.length) * 100).toFixed(1)
                      : 0
                    }%
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>暂无趋势数据</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 亏损预警 */}
      {alerts.length > 0 && (
        <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              亏损预警
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 bg-red-900/20 rounded-lg border border-red-500/30"
                >
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    alert.severity === 'CRITICAL' ? 'text-red-500' :
                    alert.severity === 'HIGH' ? 'text-orange-500' :
                    'text-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{alert.title}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          alert.severity === 'CRITICAL' ? 'border-red-500 text-red-400' :
                          alert.severity === 'HIGH' ? 'border-orange-500 text-orange-400' :
                          'border-yellow-500 text-yellow-400'
                        }`}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProfitLossDashboard;

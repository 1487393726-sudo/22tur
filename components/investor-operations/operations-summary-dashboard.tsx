'use client';

/**
 * 运营数据汇总仪表板
 * Operations Summary Dashboard Component
 * 
 * 投资者查看运营数据汇总、支出分类和趋势
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
  ShoppingCart,
  Users,
  Calendar,
  PieChart,
  BarChart3,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { 
  OperationsSummary, 
  ExpenseBreakdown, 
  ExpenseCategory 
} from '@/types/investor-operations-monitoring';

// 支出类别颜色
const categoryColors: Record<ExpenseCategory, string> = {
  [ExpenseCategory.RAW_MATERIALS]: '#f97316',
  [ExpenseCategory.LABOR]: '#3b82f6',
  [ExpenseCategory.RENT]: '#8b5cf6',
  [ExpenseCategory.UTILITIES]: '#06b6d4',
  [ExpenseCategory.MARKETING]: '#ec4899',
  [ExpenseCategory.EQUIPMENT]: '#10b981',
  [ExpenseCategory.MAINTENANCE]: '#f59e0b',
  [ExpenseCategory.OTHER]: '#6b7280'
};

// 支出类别名称
const categoryNames: Record<ExpenseCategory, string> = {
  [ExpenseCategory.RAW_MATERIALS]: '原材料',
  [ExpenseCategory.LABOR]: '人工',
  [ExpenseCategory.RENT]: '租金',
  [ExpenseCategory.UTILITIES]: '水电',
  [ExpenseCategory.MARKETING]: '营销',
  [ExpenseCategory.EQUIPMENT]: '设备',
  [ExpenseCategory.MAINTENANCE]: '维护',
  [ExpenseCategory.OTHER]: '其他'
};

interface OperationsSummaryDashboardProps {
  projectId: string;
  projectName?: string;
}

type DateRangeOption = '7d' | '30d' | '90d' | '365d';

export function OperationsSummaryDashboard({
  projectId,
  projectName
}: OperationsSummaryDashboardProps) {
  const [summary, setSummary] = useState<OperationsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeOption>('30d');

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
      const response = await fetch(
        `/api/projects/${projectId}/operations/summary?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('获取运营数据失败');
      }

      const result = await response.json();
      if (result.success) {
        setSummary(result.data);
      } else {
        throw new Error(result.error || '获取运营数据失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取运营数据失败');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, dateRange, getDateRange]);

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

  // 计算利润率
  const profitMargin = summary && summary.totalRevenue > 0
    ? ((summary.totalProfit / summary.totalRevenue) * 100).toFixed(1)
    : '0';

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-white400" />
          <span className="ml-3 text-gray-400">加载运营数据中...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-900/20 to-purple-900/20 border-red-500/30">
        <CardContent className="flex items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-red-400" />
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
      {/* 标题和时间范围选择 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {projectName ? `${projectName} - ` : ''}运营数据概览
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            查看项目运营数据汇总和趋势分析
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

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 总收入 */}
        <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">总收入</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(summary?.totalRevenue || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  日均: {formatCurrency(summary?.averageDailyRevenue || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 总支出 */}
        <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/20 border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">总支出</p>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(summary?.totalExpenses || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  日均: {formatCurrency(summary?.averageDailyExpenses || 0)}
                </p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-full">
                <ShoppingCart className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 利润 */}
        <Card className={`bg-gradient-to-br ${
          (summary?.totalProfit || 0) >= 0 
            ? 'from-blue-900/30 to-indigo-900/20 border-blue-500/30' 
            : 'from-orange-900/30 to-red-900/20 border-orange-500/30'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">利润</p>
                <p className={`text-2xl font-bold ${
                  (summary?.totalProfit || 0) >= 0 ? 'text-blue-400' : 'text-orange-400'
                }`}>
                  {formatCurrency(summary?.totalProfit || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  利润率: {profitMargin}%
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                (summary?.totalProfit || 0) >= 0 ? 'bg-blue-500/20' : 'bg-orange-500/20'
              }`}>
                {(summary?.totalProfit || 0) >= 0 
                  ? <TrendingUp className="h-6 w-6 text-blue-400" />
                  : <TrendingDown className="h-6 w-6 text-orange-400" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 客户数 */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-violet-900/20 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">总客户数</p>
                <p className="text-2xl font-bold text-white400">
                  {(summary?.totalCustomers || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  累计服务客户
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Users className="h-6 w-6 text-white400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 支出分类 */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="h-5 w-5 text-white400" />
            支出分类明细
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary?.expenseBreakdown && Object.keys(summary.expenseBreakdown).length > 0 ? (
            <div className="space-y-4">
              {/* 支出条形图 */}
              <div className="space-y-3">
                {Object.entries(summary.expenseBreakdown)
                  .filter(([_, data]) => data.amount > 0)
                  .sort((a, b) => b[1].amount - a[1].amount)
                  .map(([category, data]) => (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">
                          {categoryNames[category as ExpenseCategory] || category}
                        </span>
                        <span className="text-gray-400">
                          {formatCurrency(data.amount)} ({data.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${data.percentage}%`,
                            backgroundColor: categoryColors[category as ExpenseCategory] || '#6b7280'
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>

              {/* 支出标签 */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
                {Object.entries(summary.expenseBreakdown)
                  .filter(([_, data]) => data.amount > 0)
                  .map(([category, data]) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="border-gray-600"
                      style={{ 
                        borderColor: categoryColors[category as ExpenseCategory],
                        color: categoryColors[category as ExpenseCategory]
                      }}
                    >
                      {categoryNames[category as ExpenseCategory]}: {data.count}笔
                    </Badge>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>暂无支出数据</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default OperationsSummaryDashboard;

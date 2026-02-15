/**
 * Cash Flow Monitoring Component
 * Displays cash flow data, transaction history, and anomaly alerts
 * 
 * Requirements: 7.2, 7.3, 7.4
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface CashFlowSummary {
  totalInflow: number;
  totalOutflow: number;
  netFlow: number;
  pendingInflow: number;
  pendingOutflow: number;
  accountBalance: number;
  currency: string;
  period: {
    start: Date;
    end: Date;
  };
}

interface CashFlowRecord {
  id: string;
  type: 'INFLOW' | 'OUTFLOW' | 'TRANSFER';
  amount: number;
  currency: string;
  description: string;
  fromAccount?: string;
  toAccount?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transactionDate: Date;
  settlementDate?: Date;
  reference: string;
  createdBy: string;
  approvedBy?: string;
}

interface Anomaly {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  transactionId?: string;
  amount?: number;
  detectedAt: Date;
}

interface CashFlowMonitoringProps {
  accountId: string;
  className?: string;
}

export function CashFlowMonitoring({ accountId, className }: CashFlowMonitoringProps) {
  const [summary, setSummary] = useState<CashFlowSummary | null>(null);
  const [transactions, setTransactions] = useState<CashFlowRecord[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    loadCashFlowData();
  }, [accountId, selectedPeriod]);

  const loadCashFlowData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch summary data
      const summaryResponse = await fetch(
        `/api/cash-flows/summary?accountId=${accountId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch cash flow summary');
      }
      
      const summaryData = await summaryResponse.json();
      setSummary(summaryData.data.summary);
      setAnomalies(summaryData.data.anomalies.recent || []);

      // Fetch transaction history
      const transactionsResponse = await fetch(
        `/api/cash-flows?accountId=${accountId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=100`
      );
      
      if (!transactionsResponse.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const transactionsData = await transactionsResponse.json();
      setTransactions(transactionsData.data.records || []);

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'CNY') => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          加载资金流转数据时出错: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!summary) {
    return (
      <Alert>
        <AlertDescription>
          暂无资金流转数据
        </AlertDescription>
      </Alert>
    );
  }

  // Prepare chart data
  const flowData = [
    { name: '资金流入', value: summary.totalInflow, color: '#10b981' },
    { name: '资金流出', value: summary.totalOutflow, color: '#ef4444' }
  ];

  const dailyFlowData = transactions
    .reduce((acc: any[], transaction) => {
      const date = new Date(transaction.transactionDate).toLocaleDateString('zh-CN');
      const existing = acc.find(item => item.date === date);
      
      if (existing) {
        if (transaction.type === 'INFLOW') {
          existing.inflow += transaction.amount;
        } else {
          existing.outflow += transaction.amount;
        }
      } else {
        acc.push({
          date,
          inflow: transaction.type === 'INFLOW' ? transaction.amount : 0,
          outflow: transaction.type === 'OUTFLOW' ? transaction.amount : 0
        });
      }
      
      return acc;
    }, [])
    .slice(0, 30)
    .reverse();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">资金流转监控</h2>
          <p className="text-gray-600">账户 {accountId} 的资金流转情况</p>
        </div>
        
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {period === '7d' ? '7天' : period === '30d' ? '30天' : period === '90d' ? '90天' : '1年'}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">总流入</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(summary.totalInflow, summary.currency)}
            </div>
            {summary.pendingInflow > 0 && (
              <p className="text-xs text-green-600 mt-1">
                待处理: {formatCurrency(summary.pendingInflow, summary.currency)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">总流出</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {formatCurrency(summary.totalOutflow, summary.currency)}
            </div>
            {summary.pendingOutflow > 0 && (
              <p className="text-xs text-red-600 mt-1">
                待处理: {formatCurrency(summary.pendingOutflow, summary.currency)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">净流量</CardTitle>
            <TrendingUp className={`h-4 w-4 ${summary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netFlow >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {formatCurrency(summary.netFlow, summary.currency)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white800">账户余额</CardTitle>
            <DollarSign className="h-4 w-4 text-white600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white900">
              {formatCurrency(summary.accountBalance, summary.currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              异常检测警报
            </CardTitle>
            <CardDescription className="text-orange-700">
              检测到 {anomalies.length} 个潜在异常情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anomalies.map((anomaly, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge className={getSeverityColor(anomaly.severity)}>
                      {anomaly.severity === 'HIGH' ? '高' : anomaly.severity === 'MEDIUM' ? '中' : '低'}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900">{anomaly.description}</p>
                      <p className="text-sm text-gray-600">
                        检测时间: {new Date(anomaly.detectedAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  {anomaly.amount && (
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(anomaly.amount, summary.currency)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="transactions">交易记录</TabsTrigger>
          <TabsTrigger value="analytics">分析图表</TabsTrigger>
          <TabsTrigger value="transfer">资金调拨</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Flow Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>资金流向分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={flowData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${formatCurrency(value, summary.currency)}`}
                    >
                      {flowData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value, summary.currency)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Daily Flow Trend */}
            <Card>
              <CardHeader>
                <CardTitle>每日资金流动趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value, summary.currency)} />
                    <Line 
                      type="monotone" 
                      dataKey="inflow" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="流入"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="outflow" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="流出"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>交易记录</CardTitle>
              <CardDescription>
                显示最近的资金流转交易记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无交易记录</p>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'INFLOW' ? 'bg-green-100' : 
                          transaction.type === 'OUTFLOW' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {transaction.type === 'INFLOW' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : transaction.type === 'OUTFLOW' ? (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>参考号: {transaction.reference}</span>
                            <span>•</span>
                            <span>{new Date(transaction.transactionDate).toLocaleString('zh-CN')}</span>
                          </div>
                          {transaction.type === 'TRANSFER' && (
                            <p className="text-xs text-gray-500">
                              从 {transaction.fromAccount} 到 {transaction.toAccount}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${
                          transaction.type === 'INFLOW' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'INFLOW' ? '+' : '-'}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status === 'COMPLETED' ? '已完成' :
                           transaction.status === 'PENDING' ? '待处理' :
                           transaction.status === 'FAILED' ? '失败' : '已取消'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>资金流动分析</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dailyFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value, summary.currency)} />
                  <Bar dataKey="inflow" fill="#10b981" name="流入" />
                  <Bar dataKey="outflow" fill="#ef4444" name="流出" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>资金调拨申请</CardTitle>
              <CardDescription>
                申请资金在不同账户间调拨
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransferRequestForm accountId={accountId} onTransferComplete={loadCashFlowData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Transfer Request Form Component
interface TransferRequestFormProps {
  accountId: string;
  onTransferComplete: () => void;
}

function TransferRequestForm({ accountId, onTransferComplete }: TransferRequestFormProps) {
  const [formData, setFormData] = useState({
    fromAccount: accountId,
    toAccount: '',
    amount: '',
    description: '',
    requiresApproval: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setMessage(null);

      const response = await fetch('/api/cash-flows/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'current-user' // In real app, would get from auth
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error);
      }

      const result = await response.json();
      
      setMessage({
        type: 'success',
        text: `资金调拨申请已提交，参考号: ${result.data.reference}`
      });
      
      // Reset form
      setFormData({
        fromAccount: accountId,
        toAccount: '',
        amount: '',
        description: '',
        requiresApproval: true
      });
      
      // Refresh data
      onTransferComplete();

    } catch (error) {
      setMessage({
        type: 'error',
        text: (error as Error).message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            源账户
          </label>
          <input
            type="text"
            value={formData.fromAccount}
            onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            目标账户
          </label>
          <input
            type="text"
            value={formData.toAccount}
            onChange={(e) => setFormData({ ...formData, toAccount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          调拨金额
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          调拨说明
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="requiresApproval"
          checked={formData.requiresApproval}
          onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
          className="rounded border-gray-300 text-white600 focus:ring-purple-500"
        />
        <label htmlFor="requiresApproval" className="text-sm text-gray-700">
          需要审批 (推荐用于大额调拨)
        </label>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {submitting ? '提交中...' : '提交调拨申请'}
      </Button>
    </form>
  );
}
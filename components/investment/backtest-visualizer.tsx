"use client";

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Target,
  Calendar,
  DollarSign,
  Percent,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import {
  BacktestResult,
  BacktestInsight,
  RebalancingFrequency
} from '@/types/investment-management';

interface BacktestVisualizerProps {
  backtestResult: BacktestResult;
  showBenchmark?: boolean;
  interactive?: boolean;
}

export function BacktestVisualizer({ 
  backtestResult, 
  showBenchmark = false, 
  interactive = true 
}: BacktestVisualizerProps) {
  const [selectedChart, setSelectedChart] = useState<'performance' | 'drawdown' | 'returns' | 'allocation'>('performance');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<BacktestInsight[]>([]);

  useEffect(() => {
    // Generate insights based on backtest results
    generateInsights();
  }, [backtestResult]);

  const generateInsights = () => {
    const newInsights: BacktestInsight[] = [];

    // Performance insights
    if (backtestResult.annualizedReturn > 0.10) {
      newInsights.push({
        type: 'PERFORMANCE',
        title: 'Strong Performance',
        description: `Strategy achieved ${(backtestResult.annualizedReturn * 100).toFixed(1)}% annualized return`,
        impact: 'POSITIVE',
        significance: 'HIGH',
        recommendation: 'Consider increasing allocation to this strategy'
      });
    }

    // Risk insights
    if (backtestResult.maxDrawdown < -0.15) {
      newInsights.push({
        type: 'RISK',
        title: 'High Drawdown Risk',
        description: `Maximum drawdown of ${(Math.abs(backtestResult.maxDrawdown) * 100).toFixed(1)}%`,
        impact: 'NEGATIVE',
        significance: 'HIGH',
        recommendation: 'Consider risk management measures'
      });
    }

    // Sharpe ratio insights
    if (backtestResult.sharpeRatio > 1.0) {
      newInsights.push({
        type: 'PERFORMANCE',
        title: 'Excellent Risk-Adjusted Returns',
        description: `Sharpe ratio of ${backtestResult.sharpeRatio.toFixed(2)}`,
        impact: 'POSITIVE',
        significance: 'HIGH'
      });
    }

    // Cost insights
    if (backtestResult.transactionCosts > backtestResult.totalReturn * 0.1) {
      newInsights.push({
        type: 'COST',
        title: 'High Transaction Costs',
        description: `Transaction costs represent significant portion of returns`,
        impact: 'NEGATIVE',
        significance: 'MEDIUM',
        recommendation: 'Consider reducing rebalancing frequency'
      });
    }

    setInsights(newInsights);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Prepare chart data
  const performanceData = backtestResult.performanceHistory.map(point => ({
    date: formatDate(point.date),
    portfolioValue: point.portfolioValue,
    cumulativeReturn: point.cumulativeReturn * 100,
    drawdown: point.drawdown * 100,
    dailyReturn: point.return * 100
  }));

  const monthlyReturns = backtestResult.performanceHistory
    .filter((_, index) => index % 30 === 0) // Sample monthly
    .map(point => ({
      month: formatDate(point.date),
      return: point.return * 100
    }));

  // Risk metrics data
  const riskMetrics = [
    { name: 'VaR 95%', value: Math.abs(backtestResult.riskMetrics.var95 * 100) },
    { name: 'VaR 99%', value: Math.abs(backtestResult.riskMetrics.var99 * 100) },
    { name: 'CVaR 95%', value: Math.abs(backtestResult.riskMetrics.cvar95 * 100) },
    { name: 'CVaR 99%', value: Math.abs(backtestResult.riskMetrics.cvar99 * 100) }
  ];

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'PERFORMANCE':
        return TrendingUp;
      case 'RISK':
        return Shield;
      case 'COST':
        return DollarSign;
      case 'TIMING':
        return Calendar;
      default:
        return Info;
    }
  };

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'POSITIVE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'NEGATIVE':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-700">Total Return</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatPercentage(backtestResult.totalReturn)}
          </p>
          <p className="text-sm text-gray-600">
            Annualized: {formatPercentage(backtestResult.annualizedReturn)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-700">Volatility</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatPercentage(backtestResult.volatility)}
          </p>
          <p className="text-sm text-gray-600">
            Annualized volatility
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-white600" />
            <span className="font-medium text-gray-700">Sharpe Ratio</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {backtestResult.sharpeRatio.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            Risk-adjusted return
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="font-medium text-gray-700">Max Drawdown</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatPercentage(backtestResult.maxDrawdown)}
          </p>
          <p className="text-sm text-gray-600">
            Largest peak-to-trough decline
          </p>
        </div>
      </div>

      {/* Chart Selection */}
      {interactive && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Analysis</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedChart('performance')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  selectedChart === 'performance'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Performance
              </button>
              <button
                onClick={() => setSelectedChart('drawdown')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  selectedChart === 'drawdown'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Drawdown
              </button>
              <button
                onClick={() => setSelectedChart('returns')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  selectedChart === 'returns'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Returns
              </button>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <>
                {selectedChart === 'performance' && (
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'portfolioValue' ? formatCurrency(value) : `${value.toFixed(2)}%`,
                        name === 'portfolioValue' ? 'Portfolio Value' : 'Cumulative Return'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="portfolioValue" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Portfolio Value"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cumulativeReturn" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Cumulative Return %"
                      yAxisId="right"
                    />
                  </LineChart>
                )}

                {selectedChart === 'drawdown' && (
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="drawdown" 
                      stroke="#EF4444" 
                      fill="#FEE2E2"
                      name="Drawdown %"
                    />
                  </AreaChart>
                )}

                {selectedChart === 'returns' && (
                  <BarChart data={monthlyReturns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(2)}%`, 'Monthly Return']}
                    />
                    <Bar 
                      dataKey="return" 
                      fill="#3B82F6"
                      name="Monthly Return %"
                    />
                  </BarChart>
                )}
              </>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Metrics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, 'Risk Value']} />
                <Bar dataKey="value" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategy Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Win Rate</span>
              <span className="font-medium">{formatPercentage(backtestResult.winRate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Calmar Ratio</span>
              <span className="font-medium">{backtestResult.calmarRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Number of Rebalances</span>
              <span className="font-medium">{backtestResult.numberOfRebalances}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Transaction Costs</span>
              <span className="font-medium">{formatCurrency(backtestResult.transactionCosts)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Initial Value</span>
              <span className="font-medium">{formatCurrency(backtestResult.initialValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Final Value</span>
              <span className="font-medium">{formatCurrency(backtestResult.finalValue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type);
              const colorClass = getInsightColor(insight.impact);
              
              return (
                <div key={index} className={`p-4 rounded-lg border ${colorClass}`}>
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          insight.significance === 'HIGH' ? 'bg-red-100 text-red-800' :
                          insight.significance === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {insight.significance}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{insight.description}</p>
                      {insight.recommendation && (
                        <p className="text-sm font-medium">
                          Recommendation: {insight.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Benchmark Comparison */}
      {showBenchmark && backtestResult.benchmarkComparison && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Benchmark Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Portfolio Return</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatPercentage(backtestResult.benchmarkComparison.portfolioReturn)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Benchmark Return</p>
              <p className="text-2xl font-bold text-gray-600">
                {formatPercentage(backtestResult.benchmarkComparison.benchmarkReturn)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Outperformance</p>
              <p className={`text-2xl font-bold ${
                backtestResult.benchmarkComparison.outperformance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {backtestResult.benchmarkComparison.outperformance >= 0 ? '+' : ''}
                {formatPercentage(backtestResult.benchmarkComparison.outperformance)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
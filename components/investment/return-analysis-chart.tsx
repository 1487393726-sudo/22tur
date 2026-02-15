'use client';

/**
 * Return Analysis Chart Component
 * Task 4.2: Create return analysis components
 * 
 * Provides comprehensive return analysis visualization with trends and comparisons
 * Requirements: 3.4, 3.5
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  ReturnAnalysisChartProps,
  PerformanceMetrics,
  TimePeriod,
  ReturnCalculationResponse
} from '@/types/investment-management';

interface ReturnData {
  period: string;
  portfolioReturn: number;
  benchmarkReturn?: number;
  cumulativeReturn: number;
  volatility?: number;
}

interface MetricsSummary {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
  volatility?: number;
  bestMonth: number;
  worstMonth: number;
}

const COLORS = {
  primary: '#8b5cf6',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  neutral: '#6b7280'
};

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

interface ExtendedReturnAnalysisChartProps extends ReturnAnalysisChartProps {
  portfolioId?: string;
  className?: string;
}

export default function ReturnAnalysisChart({
  data,
  timeframe = '1Y',
  showBenchmark = true,
  portfolioId,
  className = ''
}: ExtendedReturnAnalysisChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [selectedMetric, setSelectedMetric] = useState<'return' | 'cumulative' | 'volatility'>('return');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<ReturnCalculationResponse | null>(null);

  // Generate sample return data based on timeframe
  const returnData = useMemo((): ReturnData[] => {
    const periods = timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : timeframe === '1Y' ? 365 : 1095;
    const data: ReturnData[] = [];
    let cumulativeReturn = 0;

    for (let i = 0; i < Math.min(periods, 50); i++) {
      const monthlyReturn = (Math.random() - 0.4) * 0.1; // -4% to 6% monthly return
      const benchmarkReturn = showBenchmark ? monthlyReturn * (0.8 + Math.random() * 0.4) : undefined;
      cumulativeReturn += monthlyReturn;

      data.push({
        period: `Period ${i + 1}`,
        portfolioReturn: monthlyReturn * 100,
        benchmarkReturn: benchmarkReturn ? benchmarkReturn * 100 : undefined,
        cumulativeReturn: cumulativeReturn * 100,
        volatility: Math.random() * 20 + 5 // 5-25% volatility
      });
    }

    return data;
  }, [timeframe, showBenchmark]);

  // Calculate metrics summary
  const metricsSummary = useMemo((): MetricsSummary => {
    if (returnData.length === 0) {
      return {
        totalReturn: 0,
        annualizedReturn: 0,
        bestMonth: 0,
        worstMonth: 0
      };
    }

    const returns = returnData.map(d => d.portfolioReturn);
    const totalReturn = returnData[returnData.length - 1]?.cumulativeReturn || 0;
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const annualizedReturn = avgReturn * 12; // Assuming monthly data
    
    // Calculate volatility (standard deviation)
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);
    
    // Calculate Sharpe ratio (simplified)
    const riskFreeRate = 2; // 2% annual risk-free rate
    const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / (volatility * Math.sqrt(12)) : 0;
    
    // Calculate max drawdown
    let peak = 0;
    let maxDrawdown = 0;
    returnData.forEach(d => {
      if (d.cumulativeReturn > peak) {
        peak = d.cumulativeReturn;
      }
      const drawdown = (peak - d.cumulativeReturn) / peak * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return {
      totalReturn,
      annualizedReturn,
      sharpeRatio,
      maxDrawdown,
      volatility: volatility * Math.sqrt(12), // Annualized volatility
      bestMonth: Math.max(...returns),
      worstMonth: Math.min(...returns)
    };
  }, [returnData]);

  // Fetch performance data if portfolioId is provided
  useEffect(() => {
    if (portfolioId) {
      fetchPerformanceData();
    }
  }, [portfolioId, timeframe]);

  const fetchPerformanceData = async () => {
    if (!portfolioId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/performance?timeframe=${timeframe}`);
      const result = await response.json();

      if (result.success) {
        setPerformanceData(result.data.performance);
      } else {
        setError(result.error || 'Failed to fetch performance data');
      }
    } catch (err) {
      setError('Network error while fetching performance data');
      console.error('Performance data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTooltipValue = (value: number, name: string) => {
    if (name.includes('Return') || name.includes('return')) {
      return [`${value.toFixed(2)}%`, name];
    }
    return [value.toFixed(2), name];
  };

  const renderChart = () => {
    const chartData = returnData.map(d => ({
      ...d,
      [selectedMetric]: selectedMetric === 'return' ? d.portfolioReturn : 
                       selectedMetric === 'cumulative' ? d.cumulativeReturn : d.volatility
    }));

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="portfolioReturn" 
              stackId="1" 
              stroke={COLORS.primary} 
              fill={COLORS.primary}
              fillOpacity={0.6}
              name="Portfolio Return (%)"
            />
            {showBenchmark && (
              <Area 
                type="monotone" 
                dataKey="benchmarkReturn" 
                stackId="2" 
                stroke={COLORS.secondary} 
                fill={COLORS.secondary}
                fillOpacity={0.4}
                name="Benchmark Return (%)"
              />
            )}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            <Bar dataKey="portfolioReturn" fill={COLORS.primary} name="Portfolio Return (%)" />
            {showBenchmark && (
              <Bar dataKey="benchmarkReturn" fill={COLORS.secondary} name="Benchmark Return (%)" />
            )}
          </BarChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="portfolioReturn" 
              stroke={COLORS.primary} 
              strokeWidth={2}
              name="Portfolio Return (%)"
            />
            {showBenchmark && (
              <Line 
                type="monotone" 
                dataKey="benchmarkReturn" 
                stroke={COLORS.secondary} 
                strokeWidth={2}
                name="Benchmark Return (%)"
              />
            )}
            <Line 
              type="monotone" 
              dataKey="cumulativeReturn" 
              stroke={COLORS.success} 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Cumulative Return (%)"
            />
          </LineChart>
        );
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️ Error Loading Data</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchPerformanceData}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Return Analysis</h3>
        <div className="flex space-x-2">
          {/* Chart Type Selector */}
          <select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="line">Line Chart</option>
            <option value="area">Area Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
          
          {/* Metric Selector */}
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="return">Period Returns</option>
            <option value="cumulative">Cumulative Returns</option>
            <option value="volatility">Volatility</option>
          </select>
        </div>
      </div>

      {/* Performance Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="text-sm text-white600 font-medium">Total Return</div>
          <div className="text-2xl font-bold text-white900">
            {performanceData ? 
              `${performanceData.returnPercentage.toFixed(2)}%` : 
              `${metricsSummary.totalReturn.toFixed(2)}%`
            }
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 p-4 rounded-lg">
          <div className="text-sm text-cyan-600 font-medium">Annualized Return</div>
          <div className="text-2xl font-bold text-cyan-900">
            {performanceData ? 
              `${(performanceData.annualizedReturn || 0).toFixed(2)}%` : 
              `${metricsSummary.annualizedReturn.toFixed(2)}%`
            }
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Sharpe Ratio</div>
          <div className="text-2xl font-bold text-green-900">
            {performanceData ? 
              (performanceData.sharpeRatio || 0).toFixed(3) : 
              (metricsSummary.sharpeRatio || 0).toFixed(3)
            }
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="text-sm text-orange-600 font-medium">Max Drawdown</div>
          <div className="text-2xl font-bold text-orange-900">
            -{(metricsSummary.maxDrawdown || 0).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-500">Best Month</div>
          <div className="font-semibold text-green-600">
            +{metricsSummary.bestMonth.toFixed(2)}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-gray-500">Worst Month</div>
          <div className="font-semibold text-red-600">
            {metricsSummary.worstMonth.toFixed(2)}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-gray-500">Volatility</div>
          <div className="font-semibold text-gray-700">
            {(metricsSummary.volatility || 0).toFixed(2)}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-gray-500">Data Points</div>
          <div className="font-semibold text-gray-700">
            {returnData.length}
          </div>
        </div>
      </div>

      {/* Real Performance Data Display */}
      {performanceData && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Live Performance Data</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Absolute Return:</span>
              <span className="ml-2 font-medium">${performanceData.absoluteReturn.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500">IRR:</span>
              <span className="ml-2 font-medium">
                {performanceData.irr ? `${performanceData.irr.toFixed(2)}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
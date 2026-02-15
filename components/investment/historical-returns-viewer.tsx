'use client';

/**
 * Historical Returns Viewer Component
 * Task 4.2: Create return analysis components
 * 
 * Provides historical data query and display functionality
 * Requirements: 3.4, 3.5
 */

import React, { useState, useEffect } from 'react';
import { 
  TimePeriod,
  ReturnCalculationResponse
} from '@/types/investment-management';

interface HistoricalData {
  date: string;
  value: number;
  return: number;
  cumulativeReturn: number;
}

interface HistoricalReturnsViewerProps {
  portfolioId?: string;
  investmentId?: string;
  className?: string;
}

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: '1D', label: '1 Day' },
  { value: '1W', label: '1 Week' },
  { value: '1M', label: '1 Month' },
  { value: '3M', label: '3 Months' },
  { value: '6M', label: '6 Months' },
  { value: '1Y', label: '1 Year' },
  { value: '3Y', label: '3 Years' },
  { value: '5Y', label: '5 Years' },
  { value: 'ALL', label: 'All Time' }
];

export default function HistoricalReturnsViewer({
  portfolioId,
  investmentId,
  className = ''
}: HistoricalReturnsViewerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1Y');
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'return' | 'value'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentMetrics, setCurrentMetrics] = useState<ReturnCalculationResponse | null>(null);

  useEffect(() => {
    fetchHistoricalData();
  }, [portfolioId, investmentId, selectedPeriod]);

  const fetchHistoricalData = async () => {
    if (!portfolioId && !investmentId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch current metrics
      let metricsUrl: string;
      if (portfolioId) {
        metricsUrl = `/api/portfolios/${portfolioId}/performance?timeframe=${selectedPeriod}`;
      } else {
        metricsUrl = `/api/investments/${investmentId}/returns`;
      }

      const metricsResponse = await fetch(metricsUrl);
      const metricsResult = await metricsResponse.json();

      if (metricsResult.success) {
        const metrics = portfolioId ? metricsResult.data.performance : metricsResult.data.metrics;
        setCurrentMetrics(metrics);

        // Generate sample historical data based on the period
        const data = generateHistoricalData(selectedPeriod, metrics);
        setHistoricalData(data);
      } else {
        setError(metricsResult.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error while fetching historical data');
      console.error('Historical data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateHistoricalData = (period: TimePeriod, metrics: ReturnCalculationResponse): HistoricalData[] => {
    const data: HistoricalData[] = [];
    const endDate = new Date();
    let startDate = new Date();
    let dataPoints = 30;

    // Calculate start date and data points based on period
    switch (period) {
      case '1D':
        startDate.setDate(endDate.getDate() - 1);
        dataPoints = 24; // Hourly data
        break;
      case '1W':
        startDate.setDate(endDate.getDate() - 7);
        dataPoints = 7; // Daily data
        break;
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        dataPoints = 30; // Daily data
        break;
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3);
        dataPoints = 90; // Daily data
        break;
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6);
        dataPoints = 26; // Weekly data
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        dataPoints = 52; // Weekly data
        break;
      case '3Y':
        startDate.setFullYear(endDate.getFullYear() - 3);
        dataPoints = 36; // Monthly data
        break;
      case '5Y':
        startDate.setFullYear(endDate.getFullYear() - 5);
        dataPoints = 60; // Monthly data
        break;
      case 'ALL':
        startDate.setFullYear(endDate.getFullYear() - 10);
        dataPoints = 120; // Monthly data
        break;
    }

    const timeStep = (endDate.getTime() - startDate.getTime()) / dataPoints;
    let cumulativeReturn = 0;
    const initialValue = 100000; // Assume initial value

    for (let i = 0; i <= dataPoints; i++) {
      const date = new Date(startDate.getTime() + (i * timeStep));
      
      // Generate realistic return data with some volatility
      const baseReturn = (metrics.returnPercentage / 100) / dataPoints;
      const volatility = Math.random() * 0.02 - 0.01; // ±1% volatility
      const periodReturn = baseReturn + volatility;
      
      cumulativeReturn += periodReturn;
      const currentValue = initialValue * (1 + cumulativeReturn);

      data.push({
        date: date.toISOString().split('T')[0],
        value: currentValue,
        return: periodReturn * 100,
        cumulativeReturn: cumulativeReturn * 100
      });
    }

    return data;
  };

  const sortData = (data: HistoricalData[]) => {
    return [...data].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'return':
          aValue = a.return;
          bValue = b.return;
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getReturnColor = (value: number): string => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleSort = (column: 'date' | 'return' | 'value') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column: 'date' | 'return' | 'value') => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const sortedData = sortData(historicalData);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
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
          <div className="text-red-500 mb-2">⚠️ Error Loading Historical Data</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchHistoricalData}
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
        <h3 className="text-xl font-semibold text-gray-900">Historical Returns</h3>
        <button 
          onClick={fetchHistoricalData}
          className="px-3 py-1 text-sm bg-purple-100 text-white700 rounded hover:bg-purple-200"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Time Period Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {TIME_PERIODS.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {currentMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-600">Total Return</div>
            <div className={`text-lg font-bold ${getReturnColor(currentMetrics.returnPercentage)}`}>
              {formatPercentage(currentMetrics.returnPercentage)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Absolute Return</div>
            <div className={`text-lg font-bold ${getReturnColor(currentMetrics.absoluteReturn)}`}>
              {formatCurrency(currentMetrics.absoluteReturn)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Data Points</div>
            <div className="text-lg font-bold text-gray-700">
              {historicalData.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Period</div>
            <div className="text-lg font-bold text-gray-700">
              {TIME_PERIODS.find(p => p.value === selectedPeriod)?.label}
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('date')}
              >
                Date {getSortIcon('date')}
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('value')}
              >
                Value {getSortIcon('value')}
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('return')}
              >
                Period Return {getSortIcon('return')}
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                Cumulative Return
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr 
                key={index} 
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 text-gray-700">
                  {new Date(row.date).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-right font-medium">
                  {formatCurrency(row.value)}
                </td>
                <td className={`py-3 px-4 text-right font-medium ${getReturnColor(row.return)}`}>
                  {formatPercentage(row.return)}
                </td>
                <td className={`py-3 px-4 text-right font-medium ${getReturnColor(row.cumulativeReturn)}`}>
                  {formatPercentage(row.cumulativeReturn)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Historical data is generated for demonstration purposes. 
        In production, this would connect to real historical data sources.
      </div>
    </div>
  );
}
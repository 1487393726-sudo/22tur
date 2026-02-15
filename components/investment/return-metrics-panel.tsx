'use client';

/**
 * Return Metrics Panel Component
 * Task 4.2: Create return analysis components
 * 
 * Displays comprehensive return metrics and indicators
 * Requirements: 3.4, 3.5
 */

import React, { useState, useEffect } from 'react';
import { 
  ReturnCalculationResponse,
  TimePeriod,
  InvestmentBusinessError
} from '@/types/investment-management';

interface ReturnMetricsPanelProps {
  portfolioId?: string;
  investmentId?: string;
  timeframe?: TimePeriod;
  refreshInterval?: number;
  className?: string;
}

interface MetricCard {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description: string;
  icon: string;
}

export default function ReturnMetricsPanel({
  portfolioId,
  investmentId,
  timeframe = '1Y',
  refreshInterval = 300000, // 5 minutes
  className = ''
}: ReturnMetricsPanelProps) {
  const [metrics, setMetrics] = useState<ReturnCalculationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchMetrics();
    
    // Set up auto-refresh if interval is provided
    if (refreshInterval > 0) {
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [portfolioId, investmentId, timeframe, refreshInterval]);

  const fetchMetrics = async () => {
    if (!portfolioId && !investmentId) return;

    setLoading(true);
    setError(null);

    try {
      let url: string;
      if (portfolioId) {
        url = `/api/portfolios/${portfolioId}/performance?timeframe=${timeframe}`;
      } else {
        url = `/api/investments/${investmentId}/returns`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        const metricsData = portfolioId ? result.data.performance : result.data.metrics;
        setMetrics(metricsData);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Failed to fetch metrics');
      }
    } catch (err) {
      setError('Network error while fetching metrics');
      console.error('Metrics fetch error:', err);
    } finally {
      setLoading(false);
    }
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

  const getChangeType = (value: number): 'positive' | 'negative' | 'neutral' => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  const getMetricCards = (): MetricCard[] => {
    if (!metrics) return [];

    const cards: MetricCard[] = [
      {
        title: 'Absolute Return',
        value: formatCurrency(metrics.absoluteReturn),
        changeType: getChangeType(metrics.absoluteReturn),
        description: 'Total profit/loss in currency terms',
        icon: '💰'
      },
      {
        title: 'Return Percentage',
        value: formatPercentage(metrics.returnPercentage),
        changeType: getChangeType(metrics.returnPercentage),
        description: 'Return as percentage of initial investment',
        icon: '📈'
      }
    ];

    if (metrics.annualizedReturn !== undefined) {
      cards.push({
        title: 'Annualized Return',
        value: formatPercentage(metrics.annualizedReturn),
        changeType: getChangeType(metrics.annualizedReturn),
        description: 'Return rate adjusted for time period',
        icon: '📅'
      });
    }

    if (metrics.irr !== undefined) {
      cards.push({
        title: 'Internal Rate of Return',
        value: formatPercentage(metrics.irr),
        changeType: getChangeType(metrics.irr),
        description: 'Discount rate that makes NPV equal to zero',
        icon: '🎯'
      });
    }

    if (metrics.sharpeRatio !== undefined) {
      cards.push({
        title: 'Sharpe Ratio',
        value: metrics.sharpeRatio.toFixed(3),
        changeType: metrics.sharpeRatio > 1 ? 'positive' : metrics.sharpeRatio > 0 ? 'neutral' : 'negative',
        description: 'Risk-adjusted return measure',
        icon: '⚖️'
      });
    }

    return cards;
  };

  const getColorClasses = (changeType: 'positive' | 'negative' | 'neutral') => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading && !metrics) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <div className="text-red-500 mb-2">⚠️ Error Loading Metrics</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchMetrics}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const metricCards = getMetricCards();

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Return Metrics</h3>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={fetchMetrics}
            disabled={loading}
            className="px-3 py-1 text-sm bg-purple-100 text-white700 rounded hover:bg-purple-200 disabled:opacity-50"
          >
            {loading ? '⟳' : '↻'} Refresh
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      {metricCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricCards.map((card, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getColorClasses(card.changeType || 'neutral')}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{card.icon}</span>
                {card.change && (
                  <span className={`text-sm font-medium ${
                    card.changeType === 'positive' ? 'text-green-600' : 
                    card.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {card.change}
                  </span>
                )}
              </div>
              
              <div className="mb-1">
                <div className="text-sm font-medium text-gray-700">{card.title}</div>
                <div className="text-2xl font-bold">{card.value}</div>
              </div>
              
              <div className="text-xs text-gray-500">{card.description}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No metrics available. Please check your data source.
        </div>
      )}

      {/* Performance Summary */}
      {metrics && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Performance Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-600">Calculation Date</div>
              <div className="font-medium">
                {new Date(metrics.calculationDate).toLocaleDateString()}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-600">Data Source</div>
              <div className="font-medium">Real-time</div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-600">Timeframe</div>
              <div className="font-medium">{timeframe}</div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-200 rounded mr-1"></div>
          Positive Return
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-200 rounded mr-1"></div>
          Negative Return
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-200 rounded mr-1"></div>
          Neutral/Ratio
        </div>
      </div>
    </div>
  );
}
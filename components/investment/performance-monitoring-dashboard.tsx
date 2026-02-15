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
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  HardDrive,
  MemoryStick,
  Network,
  RefreshCw,
  Server,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Shield,
  Target,
  BarChart3,
  Settings,
  Download,
  Bell,
  X
} from 'lucide-react';

interface PerformanceMetrics {
  averageCalculationTime: number;
  averageDataRefreshTime: number;
  averageOptimizationTime: number;
  activeOperations: number;
  totalOperationsToday: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface PerformanceAlert {
  id: string;
  type: 'SLOW_CALCULATION' | 'DATA_REFRESH_TIMEOUT' | 'HIGH_MEMORY_USAGE' | 'CONCURRENT_LIMIT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  resolved: boolean;
}

interface SystemHealth {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  issues: string[];
  recommendations: string[];
}

interface PerformanceTrends {
  calculationTimes: { timestamp: Date; value: number }[];
  dataRefreshTimes: { timestamp: Date; value: number }[];
  optimizationTimes: { timestamp: Date; value: number }[];
  errorRates: { timestamp: Date; value: number }[];
}

export function PerformanceMonitoringDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [trends, setTrends] = useState<PerformanceTrends | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(24);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchPerformanceData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedTimeRange]);

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);

      // Fetch current metrics
      const metricsResponse = await fetch('/api/investment-performance/metrics?type=current');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.metrics);
      }

      // Fetch alerts
      const alertsResponse = await fetch('/api/investment-performance/metrics?type=alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts);
      }

      // Fetch health status
      const healthResponse = await fetch('/api/investment-performance/metrics?type=health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealth(healthData.health);
      }

      // Fetch trends
      const trendsResponse = await fetch(`/api/investment-performance/metrics?type=trends&hours=${selectedTimeRange}`);
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        setTrends(trendsData.trends);
      }

    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/investment-performance/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'resolve_alert',
          data: { alertId }
        }),
      });

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading performance data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Investment Performance Monitor</h2>
          <p className="text-gray-600">Real-time monitoring of investment system performance</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 Hour</option>
              <option value={6}>6 Hours</option>
              <option value={24}>24 Hours</option>
              <option value={168}>7 Days</option>
            </select>
          </div>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium ${
              autoRefresh 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </button>
          
          <button
            onClick={fetchPerformanceData}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* System Health Status */}
      {health && (
        <div className={`p-4 rounded-lg border ${getHealthStatusColor(health.status)}`}>
          <div className="flex items-center gap-3 mb-3">
            {health.status === 'HEALTHY' ? (
              <CheckCircle className="w-6 h-6" />
            ) : health.status === 'WARNING' ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <X className="w-6 h-6" />
            )}
            <h3 className="text-lg font-semibold">System Status: {health.status}</h3>
          </div>
          
          {health.issues.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium mb-2">Issues:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {health.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          {health.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Recommendations:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {health.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">Avg Calculation Time</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatDuration(metrics.averageCalculationTime)}
            </p>
            <p className="text-sm text-gray-600">Response time</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-700">Data Refresh Time</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatDuration(metrics.averageDataRefreshTime)}
            </p>
            <p className="text-sm text-gray-600">Average refresh</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-2">
              <MemoryStick className="w-5 h-5 text-white600" />
              <span className="font-medium text-gray-700">Memory Usage</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatPercentage(metrics.memoryUsage)}
            </p>
            <p className="text-sm text-gray-600">Current usage</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-red-600" />
              <span className="font-medium text-gray-700">Error Rate</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatPercentage(metrics.errorRate)}
            </p>
            <p className="text-sm text-gray-600">Today's errors</p>
          </div>
        </div>
      )}

      {/* Performance Trends */}
      {trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculation Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.calculationTimes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatTimestamp(new Date(value))}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => formatTimestamp(new Date(value))}
                    formatter={(value: number) => [formatDuration(value), 'Response Time']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Calculation Time"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Rate Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.errorRates}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatTimestamp(new Date(value))}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => formatTimestamp(new Date(value))}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Error Rate']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#EF4444" 
                    fill="#FEE2E2"
                    name="Error Rate %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {showAlerts && alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Performance Alerts</h3>
            <button
              onClick={() => setShowAlerts(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">{alert.type.replace(/_/g, ' ')}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAlertSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span>Threshold: {alert.threshold}</span>
                      <span>Current: {alert.currentValue}</span>
                      <span>Time: {formatTimestamp(alert.timestamp)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="ml-4 px-3 py-1 text-xs font-medium bg-white border border-current rounded hover:bg-gray-50"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional System Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operations Today</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Operations</span>
                <span className="font-semibold">{metrics.totalOperationsToday}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Operations</span>
                <span className="font-semibold">{metrics.activeOperations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">
                  {formatPercentage(100 - metrics.errorRate)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Resources</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">CPU Usage</span>
                <span className="font-semibold">{formatPercentage(metrics.cpuUsage)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Memory Usage</span>
                <span className="font-semibold">{formatPercentage(metrics.memoryUsage)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Optimization Time</span>
                <span className="font-semibold">{formatDuration(metrics.averageOptimizationTime)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Status</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {metrics.averageCalculationTime < 1000 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
                <span className="text-sm">Calculation Speed</span>
              </div>
              <div className="flex items-center gap-2">
                {metrics.memoryUsage < 80 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm">Memory Usage</span>
              </div>
              <div className="flex items-center gap-2">
                {metrics.errorRate < 5 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm">Error Rate</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
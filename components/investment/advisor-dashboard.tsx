"use client";

/**
 * Investment Advisor Dashboard Component
 * Task 7.2: Create advisor dashboard component
 * 
 * Requirements: 6.1, 6.2, 6.4
 */

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Shield,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  FileText,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Phone,
  Mail,
  Calendar,
  Target,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface ClientPortfolioSummary {
  clientId: string;
  clientName: string;
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  riskScore: number;
  portfolioCount: number;
  lastUpdated: Date;
}

interface AdvisorDashboardProps {
  advisorId: string;
  refreshInterval?: number;
}

export function AdvisorDashboard({
  advisorId,
  refreshInterval = 300000 // 5 minutes
}: AdvisorDashboardProps) {
  const { locale } = useLanguage();
  const [clients, setClients] = useState<ClientPortfolioSummary[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientPortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'return' | 'risk'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch advisor clients data
  const fetchClientsData = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/advisor/clients?advisorId=${advisorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setClients(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.message || 'Failed to fetch clients data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching clients data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [advisorId]);

  // Load client portfolio details
  const loadClientPortfolio = useCallback(async (clientId: string) => {
    try {
      const startTime = Date.now();
      
      const response = await fetch(`/api/advisor/clients/${clientId}/portfolio?advisorId=${advisorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const loadTime = Date.now() - startTime;
      
      if (result.success) {
        // Performance requirement: Should load within 2 seconds
        if (loadTime > 2000) {
          console.warn(`Client portfolio loaded in ${loadTime}ms, exceeding 2s target`);
        }
        
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to load client portfolio');
      }
    } catch (err) {
      console.error('Error loading client portfolio:', err);
      throw err;
    }
  }, [advisorId]);

  // Filter and sort clients
  const filteredAndSortedClients = useCallback(() => {
    let filtered = clients.filter(client =>
      client.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.clientName;
          bValue = b.clientName;
          break;
        case 'value':
          aValue = a.totalValue;
          bValue = b.totalValue;
          break;
        case 'return':
          aValue = a.returnPercentage;
          bValue = b.returnPercentage;
          break;
        case 'risk':
          aValue = a.riskScore;
          bValue = b.riskScore;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [clients, searchTerm, sortBy, sortOrder]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Get risk level color
  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 3) return 'text-green-600';
    if (riskScore <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Calculate summary statistics
  const summaryStats = useCallback(() => {
    if (clients.length === 0) return null;

    const totalValue = clients.reduce((sum, client) => sum + client.totalValue, 0);
    const totalInvested = clients.reduce((sum, client) => sum + client.totalInvested, 0);
    const totalReturn = clients.reduce((sum, client) => sum + client.totalReturn, 0);
    const avgReturnPercentage = clients.reduce((sum, client) => sum + client.returnPercentage, 0) / clients.length;
    const avgRiskScore = clients.reduce((sum, client) => sum + client.riskScore, 0) / clients.length;

    return {
      totalClients: clients.length,
      totalValue,
      totalInvested,
      totalReturn,
      avgReturnPercentage,
      avgRiskScore
    };
  }, [clients]);

  // Initial data load
  useEffect(() => {
    fetchClientsData();
  }, [fetchClientsData]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchClientsData(true);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [fetchClientsData, refreshInterval]);

  const stats = summaryStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-medium text-red-800">加载错误</h3>
            </div>
            <p className="mt-2 text-red-700">{error}</p>
            <button
              onClick={() => fetchClientsData()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">投资顾问仪表板</h1>
            <p className="text-gray-600 mt-1">管理您的客户投资组合</p>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                最后更新: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={() => fetchClientsData(true)}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </div>

        {/* Summary Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-white600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">客户总数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">管理资产总值</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                {stats.avgReturnPercentage >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">平均收益率</p>
                  <p className={`text-2xl font-bold ${stats.avgReturnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(stats.avgReturnPercentage)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">平均风险评分</p>
                  <p className={`text-2xl font-bold ${getRiskColor(stats.avgRiskScore)}`}>
                    {stats.avgRiskScore.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Client List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">客户列表</h2>
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索客户..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Sort */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as any);
                    setSortOrder(order as any);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="name-asc">姓名 (A-Z)</option>
                  <option value="name-desc">姓名 (Z-A)</option>
                  <option value="value-desc">资产价值 (高到低)</option>
                  <option value="value-asc">资产价值 (低到高)</option>
                  <option value="return-desc">收益率 (高到低)</option>
                  <option value="return-asc">收益率 (低到高)</option>
                  <option value="risk-asc">风险评分 (低到高)</option>
                  <option value="risk-desc">风险评分 (高到低)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    客户
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    投资组合
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    总价值
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    收益率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    风险评分
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最后更新
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedClients().map((client) => (
                  <tr key={client.clientId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-white600">
                              {client.clientName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.clientName}</div>
                          <div className="text-sm text-gray-500">ID: {client.clientId.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.portfolioCount} 个组合</div>
                      <div className="text-sm text-gray-500">已投资: {formatCurrency(client.totalInvested)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(client.totalValue)}</div>
                      <div className="text-sm text-gray-500">收益: {formatCurrency(client.totalReturn)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm font-medium ${client.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {client.returnPercentage >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                        )}
                        {formatPercentage(client.returnPercentage)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(client.riskScore)} bg-gray-100`}>
                        {client.riskScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => loadClientPortfolio(client.clientId)}
                          className="text-white600 hover:text-white900 p-1 rounded"
                          title="查看详情"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="发送消息"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="生成报告"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedClients().length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">没有找到客户</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? '尝试调整搜索条件' : '还没有分配的客户'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
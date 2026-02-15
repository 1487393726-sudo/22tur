"use client";

// Portfolio Dashboard Component
// Phase 3, Task 3.2: Create portfolio dashboard component

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { 
  TrendingUp, 
  TrendingDown,
  PieChart, 
  BarChart3, 
  DollarSign,
  Shield,
  AlertTriangle,
  RefreshCw,
  Download,
  Calendar,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Zap
} from 'lucide-react';
import { 
  Portfolio,
  PortfolioAnalysis,
  InvestmentRecommendation,
  PortfolioDashboardProps,
  TimePeriod
} from '@/types/investment-management';

export function PortfolioDashboard({
  portfolioId,
  refreshInterval = 300000, // 5 minutes
  showRecommendations = true
}: PortfolioDashboardProps) {
  const { locale } = useLanguage();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<InvestmentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimePeriod>('1Y');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch portfolio data
  const fetchPortfolioData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch portfolio details
      const portfolioResponse = await fetch(`/api/portfolios/${portfolioId}`, {
        headers: {
          'x-user-id': 'demo-user-id', // TODO: Get from auth
          'x-user-role': 'INVESTOR'
        }
      });

      if (!portfolioResponse.ok) {
        throw new Error('Failed to fetch portfolio data');
      }

      const portfolioData = await portfolioResponse.json();
      setPortfolio(portfolioData);

      // Fetch analysis
      const analysisResponse = await fetch(
        `/api/portfolios/${portfolioId}/analysis?timeframe=${selectedTimeframe}&includeProjections=true`,
        {
          headers: {
            'x-user-id': 'demo-user-id', // TODO: Get from auth
            'x-user-role': 'INVESTOR'
          }
        }
      );

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setAnalysis(analysisData.analysis);
        setRecommendations(analysisData.recommendations || []);
      }

      setLastUpdated(new Date());

    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [portfolioId, selectedTimeframe]);

  // Initial load
  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchPortfolioData();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [fetchPortfolioData, refreshInterval]);

  // Handle timeframe change
  const handleTimeframeChange = (timeframe: TimePeriod) => {
    setSelectedTimeframe(timeframe);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchPortfolioData(true);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number, decimals = 2) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  };

  // Get risk level color
  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 3) return 'text-green-400';
    if (riskScore <= 6) return 'text-yellow-400';
    if (riskScore <= 8) return 'text-orange-400';
    return 'text-red-400';
  };

  // Get recommendation priority color
  const getRecommendationColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'border-red-500 bg-red-500/10';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-500/10';
      case 'LOW': return 'border-green-500 bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-3 text-white">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>{locale === "en" ? "Loading portfolio..." : "加载投资组合中..."}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {locale === "en" ? "Error Loading Portfolio" : "加载投资组合失败"}
          </h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => fetchPortfolioData()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
          >
            {locale === "en" ? "Try Again" : "重试"}
          </button>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center text-gray-300">
          <PieChart className="w-12 h-12 mx-auto mb-4" />
          <p>{locale === "en" ? "Portfolio not found" : "未找到投资组合"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {portfolio.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {locale === "en" ? "Last updated" : "最后更新"}: {lastUpdated?.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              {portfolio.investments?.length || 0} {locale === "en" ? "investments" : "项投资"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <select
            value={selectedTimeframe}
            onChange={(e) => handleTimeframeChange(e.target.value as TimePeriod)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="1D">1D</option>
            <option value="1W">1W</option>
            <option value="1M">1M</option>
            <option value="3M">3M</option>
            <option value="6M">6M</option>
            <option value="1Y">1Y</option>
            <option value="3Y">3Y</option>
            <option value="5Y">5Y</option>
            <option value="ALL">ALL</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Export Button */}
          <button className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-blue-400" />
            <span className="text-xs text-gray-300">
              {locale === "en" ? "Total Value" : "总价值"}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(portfolio.totalValue)}
          </p>
          <p className="text-sm text-gray-300">
            {locale === "en" ? "Invested" : "已投资"}: {formatCurrency(portfolio.totalInvested)}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <span className="text-xs text-gray-300">
              {locale === "en" ? "Total Return" : "总收益"}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(portfolio.totalReturn)}
          </p>
          <p className={`text-sm flex items-center gap-1 ${portfolio.returnPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {portfolio.returnPercentage >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {formatPercentage(portfolio.returnPercentage)}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 text-yellow-400" />
            <span className="text-xs text-gray-300">
              {locale === "en" ? "Risk Score" : "风险评分"}
            </span>
          </div>
          <p className={`text-2xl font-bold ${getRiskColor(portfolio.riskScore)}`}>
            {portfolio.riskScore.toFixed(1)}/10
          </p>
          <p className="text-sm text-gray-300">
            {portfolio.riskScore <= 3 ? (locale === "en" ? "Low Risk" : "低风险") :
             portfolio.riskScore <= 6 ? (locale === "en" ? "Medium Risk" : "中等风险") :
             portfolio.riskScore <= 8 ? (locale === "en" ? "High Risk" : "高风险") :
             (locale === "en" ? "Very High Risk" : "极高风险")}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-white400" />
            <span className="text-xs text-gray-300">
              {locale === "en" ? "Performance" : "表现"}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">
            {analysis?.performanceMetrics?.annualizedReturn ? 
              formatPercentage(analysis.performanceMetrics.annualizedReturn) : 
              'N/A'
            }
          </p>
          <p className="text-sm text-gray-300">
            {locale === "en" ? "Annualized" : "年化收益"}
          </p>
        </div>
      </div>

      {/* Analysis Charts */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Allocation */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              {locale === "en" ? "Asset Allocation" : "资产配置"}
            </h3>
            
            <div className="space-y-3">
              {analysis.assetAllocation.categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-white">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {formatPercentage(category.percentage, 1)}
                    </p>
                    <p className="text-xs text-gray-300">
                      {formatCurrency(category.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  {locale === "en" ? "Diversification Score" : "多元化评分"}
                </span>
                <span className="text-white font-medium">
                  {analysis.assetAllocation.diversificationScore.toFixed(0)}/100
                </span>
              </div>
            </div>
          </div>

          {/* Sector Distribution */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {locale === "en" ? "Sector Distribution" : "行业分布"}
            </h3>
            
            <div className="space-y-3">
              {analysis.sectorDistribution.sectors.map((sector, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white">{sector.sector}</span>
                    <div className="text-right">
                      <span className="text-white font-medium">
                        {formatPercentage(sector.percentage, 1)}
                      </span>
                      <span className={`ml-2 text-xs ${sector.performance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercentage(sector.performance, 1)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(sector.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  {locale === "en" ? "Concentration Risk" : "集中度风险"}
                </span>
                <span className={`font-medium ${analysis.sectorDistribution.concentrationRisk > 40 ? 'text-red-400' : 'text-green-400'}`}>
                  {analysis.sectorDistribution.concentrationRisk.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            {locale === "en" ? "Investment Recommendations" : "投资建议"}
          </h3>
          
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${getRecommendationColor(recommendation.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <h4 className="font-medium text-white">{recommendation.title}</h4>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    recommendation.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                    recommendation.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {recommendation.priority}
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm mb-3">
                  {recommendation.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {locale === "en" ? "Expected Impact" : "预期影响"}: {formatPercentage(recommendation.expectedImpact, 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {locale === "en" ? "Risk Impact" : "风险影响"}: {formatPercentage(recommendation.riskImpact, 0)}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-300">
                    {locale === "en" ? "Action Items:" : "行动项目："}
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {recommendation.actionItems.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <span className="text-white400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {analysis?.performanceMetrics && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {locale === "en" ? "Performance Metrics" : "表现指标"}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {formatPercentage(analysis.performanceMetrics.annualizedReturn || 0)}
              </p>
              <p className="text-xs text-gray-300">
                {locale === "en" ? "Annualized Return" : "年化收益率"}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {(analysis.performanceMetrics.sharpeRatio || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-300">
                {locale === "en" ? "Sharpe Ratio" : "夏普比率"}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {formatPercentage(analysis.performanceMetrics.volatility || 0)}
              </p>
              <p className="text-xs text-gray-300">
                {locale === "en" ? "Volatility" : "波动率"}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {formatPercentage(analysis.performanceMetrics.maxDrawdown || 0)}
              </p>
              <p className="text-xs text-gray-300">
                {locale === "en" ? "Max Drawdown" : "最大回撤"}
              </p>
            </div>
          </div>

          {analysis.performanceMetrics.benchmarkComparison && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  {locale === "en" ? "vs" : "相比"} {analysis.performanceMetrics.benchmarkComparison.benchmarkName}
                </span>
                <span className={`font-medium ${
                  analysis.performanceMetrics.benchmarkComparison.outperformance >= 0 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {formatPercentage(analysis.performanceMetrics.benchmarkComparison.outperformance)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
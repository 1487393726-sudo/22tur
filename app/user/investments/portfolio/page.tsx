"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Eye,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Building2,
  Cpu,
  Leaf,
  Heart,
  Car,
  ChevronRight,
  Sparkles,
  Crown,
  Shield,
  Award,
  Filter,
  Calendar,
  LayoutGrid,
  List,
} from "lucide-react";

interface PortfolioAsset {
  id: string;
  name: string;
  industry: string;
  ownership: number;
  invested: number;
  currentValue: number;
  return: number;
  returnPercentage: number;
  status: "CONTROLLING" | "MAJORITY" | "SIGNIFICANT" | "MINOR";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  lastUpdate: string;
  riskLevel: "low" | "medium" | "high";
}

const portfolioAssets: PortfolioAsset[] = [
  {
    id: "1",
    name: "城市综合体开发项目",
    industry: "房地产开发",
    ownership: 85,
    invested: 800000,
    currentValue: 1100000,
    return: 300000,
    returnPercentage: 37.5,
    status: "CONTROLLING",
    icon: Building2,
    color: "blue",
    lastUpdate: "2024-01-08",
    riskLevel: "medium",
  },
  {
    id: "2",
    name: "AI智能制造平台",
    industry: "科技创新",
    ownership: 82,
    invested: 600000,
    currentValue: 850000,
    return: 250000,
    returnPercentage: 41.7,
    status: "CONTROLLING",
    icon: Cpu,
    color: "purple",
    lastUpdate: "2024-01-07",
    riskLevel: "high",
  },
  {
    id: "3",
    name: "太阳能发电站",
    industry: "可再生能源",
    ownership: 65,
    invested: 500000,
    currentValue: 620000,
    return: 120000,
    returnPercentage: 24,
    status: "MAJORITY",
    icon: Leaf,
    color: "green",
    lastUpdate: "2024-01-06",
    riskLevel: "low",
  },
  {
    id: "4",
    name: "医疗器械研发中心",
    industry: "医疗健康",
    ownership: 45,
    invested: 400000,
    currentValue: 480000,
    return: 80000,
    returnPercentage: 20,
    status: "SIGNIFICANT",
    icon: Heart,
    color: "red",
    lastUpdate: "2024-01-05",
    riskLevel: "medium",
  },
  {
    id: "5",
    name: "新能源汽车电池",
    industry: "新能源汽车",
    ownership: 38,
    invested: 200000,
    currentValue: 150000,
    return: -50000,
    returnPercentage: -25,
    status: "SIGNIFICANT",
    icon: Car,
    color: "indigo",
    lastUpdate: "2024-01-04",
    riskLevel: "high",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusConfig = (status: string) => {
  const configs = {
    CONTROLLING: { label: "控股", icon: Crown, color: "from-yellow-500 to-amber-500" },
    MAJORITY: { label: "主要股东", icon: Shield, color: "from-blue-500 to-cyan-500" },
    SIGNIFICANT: { label: "重要股东", icon: Award, color: "from-green-500 to-emerald-500" },
    MINOR: { label: "少数股东", icon: Briefcase, color: "from-gray-500 to-slate-500" },
  };
  return configs[status as keyof typeof configs] || configs.MINOR;
};

export default function InvestmentPortfolioPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("value");

  const totalInvested = portfolioAssets.reduce((sum, a) => sum + a.invested, 0);
  const totalValue = portfolioAssets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalReturn = portfolioAssets.reduce((sum, a) => sum + a.return, 0);
  const avgReturnPercentage = ((totalValue - totalInvested) / totalInvested) * 100;

  const stats = [
    { label: "总投资额", value: formatCurrency(totalInvested), icon: DollarSign, gradient: "from-blue-500 to-cyan-500" },
    { label: "当前价值", value: formatCurrency(totalValue), icon: TrendingUp, gradient: "from-green-500 to-emerald-500" },
    { label: "总收益", value: `${totalReturn >= 0 ? '+' : ''}${formatCurrency(totalReturn)}`, icon: totalReturn >= 0 ? ArrowUpRight : ArrowDownRight, gradient: totalReturn >= 0 ? "from-green-500 to-emerald-500" : "from-red-500 to-pink-500" },
    { label: "平均收益率", value: `${avgReturnPercentage >= 0 ? '+' : ''}${avgReturnPercentage.toFixed(1)}%`, icon: Target, gradient: "from-purple-500 to-pink-500" },
  ];

  const filteredAssets = portfolioAssets.filter(asset => {
    if (activeTab === "all") return true;
    if (activeTab === "controlling") return asset.status === "CONTROLLING";
    if (activeTab === "profitable") return asset.return > 0;
    if (activeTab === "loss") return asset.return < 0;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-blue-600/20 to-pink-600/30" />
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg shadow-purple-500/30">
                  <PieChart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-200 bg-clip-text text-transparent">
                      投资组合
                    </h1>
                    <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      PRO
                    </Badge>
                  </div>
                  <p className="text-slate-300 mt-1">管理和分析您的投资组合配置</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-6">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新数据
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-purple-500/30">
                <Download className="w-4 h-4 mr-2" />
                导出报告
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg px-4">
                全部资产
              </TabsTrigger>
              <TabsTrigger value="controlling" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-amber-500 data-[state=active]:text-white rounded-lg px-4">
                控股项目
              </TabsTrigger>
              <TabsTrigger value="profitable" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg px-4">
                盈利资产
              </TabsTrigger>
              <TabsTrigger value="loss" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg px-4">
                亏损资产
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>
            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-slate-400'}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-slate-400'}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Assets */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredAssets.map((asset) => {
          const statusConfig = getStatusConfig(asset.status);
          const StatusIcon = statusConfig.icon;
          const AssetIcon = asset.icon;
          const isPositive = asset.return >= 0;
          
          return (
            <div
              key={asset.id}
              className={`group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Header */}
              <div className={`p-6 ${viewMode === 'list' ? 'flex items-center gap-6 flex-1' : ''}`}>
                <div className={`flex items-start justify-between ${viewMode === 'list' ? 'flex-1' : 'mb-4'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-${asset.color}-500/20 to-${asset.color}-600/20 border border-${asset.color}-500/30`}>
                      <AssetIcon className={`w-6 h-6 text-${asset.color}-400`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {asset.name}
                      </h3>
                      <p className="text-sm text-slate-400">{asset.industry}</p>
                    </div>
                  </div>
                  <Badge className={`bg-gradient-to-r ${statusConfig.color} text-white border-0`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Metrics */}
                <div className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-4 flex-1' : 'grid-cols-2 mb-4'}`}>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">持股比例</p>
                    <p className="text-lg font-bold text-white">{asset.ownership}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">投资额</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(asset.invested)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">当前价值</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(asset.currentValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">收益</p>
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                      )}
                      <p className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{asset.returnPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className={`flex items-center justify-between pt-4 border-t border-white/5 ${viewMode === 'list' ? 'w-48' : ''}`}>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3 h-3" />
                    更新于 {asset.lastUpdate}
                  </div>
                  <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
                    详情
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Portfolio Distribution Chart Placeholder */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            资产配置分布
          </h2>
          <Button variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
            查看详细分析
          </Button>
        </div>
        <div className="text-center py-12">
          <PieChart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">资产配置图表</h3>
          <p className="text-slate-400 mb-6">详细的图表和分析将在完整版本中提供</p>
        </div>
      </div>
    </div>
  );
}

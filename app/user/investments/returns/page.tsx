"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  Sparkles,
  Activity,
  Percent,
  Clock,
  ChevronRight,
  LineChart,
  Wallet,
  Coins,
  Award,
} from "lucide-react";

interface ReturnData {
  period: string;
  invested: number;
  currentValue: number;
  return: number;
  returnPercentage: number;
  benchmark: number;
}

interface AssetReturn {
  id: string;
  name: string;
  industry: string;
  invested: number;
  currentValue: number;
  return: number;
  returnPercentage: number;
  monthlyReturn: number;
  yearlyReturn: number;
  color: string;
}

const periodReturns: ReturnData[] = [
  { period: "本月", invested: 2500000, currentValue: 2580000, return: 80000, returnPercentage: 3.2, benchmark: 2.1 },
  { period: "本季度", invested: 2500000, currentValue: 2720000, return: 220000, returnPercentage: 8.8, benchmark: 5.5 },
  { period: "本年度", invested: 2500000, currentValue: 3200000, return: 700000, returnPercentage: 28, benchmark: 15.2 },
  { period: "累计", invested: 2500000, currentValue: 3200000, return: 700000, returnPercentage: 28, benchmark: 18.5 },
];

const assetReturns: AssetReturn[] = [
  {
    id: "1",
    name: "城市综合体开发项目",
    industry: "房地产开发",
    invested: 800000,
    currentValue: 1100000,
    return: 300000,
    returnPercentage: 37.5,
    monthlyReturn: 2.8,
    yearlyReturn: 37.5,
    color: "blue",
  },
  {
    id: "2",
    name: "AI智能制造平台",
    industry: "科技创新",
    invested: 600000,
    currentValue: 850000,
    return: 250000,
    returnPercentage: 41.7,
    monthlyReturn: 3.5,
    yearlyReturn: 41.7,
    color: "purple",
  },
  {
    id: "3",
    name: "太阳能发电站",
    industry: "可再生能源",
    invested: 500000,
    currentValue: 620000,
    return: 120000,
    returnPercentage: 24,
    monthlyReturn: 1.8,
    yearlyReturn: 24,
    color: "green",
  },
  {
    id: "4",
    name: "医疗器械研发中心",
    industry: "医疗健康",
    invested: 400000,
    currentValue: 480000,
    return: 80000,
    returnPercentage: 20,
    monthlyReturn: 1.5,
    yearlyReturn: 20,
    color: "red",
  },
  {
    id: "5",
    name: "新能源汽车电池",
    industry: "新能源汽车",
    invested: 200000,
    currentValue: 150000,
    return: -50000,
    returnPercentage: -25,
    monthlyReturn: -2.1,
    yearlyReturn: -25,
    color: "indigo",
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

export default function ReturnsAnalysisPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("本年度");

  const currentPeriod = periodReturns.find(p => p.period === selectedPeriod) || periodReturns[2];
  const totalReturn = assetReturns.reduce((sum, a) => sum + a.return, 0);
  const avgReturnPercentage = assetReturns.reduce((sum, a) => sum + a.returnPercentage, 0) / assetReturns.length;
  const profitableAssets = assetReturns.filter(a => a.return > 0).length;
  const bestPerformer = assetReturns.reduce((best, a) => a.returnPercentage > best.returnPercentage ? a : best);

  const stats = [
    { label: "总收益", value: formatCurrency(totalReturn), icon: DollarSign, gradient: totalReturn >= 0 ? "from-green-500 to-emerald-500" : "from-red-500 to-pink-500" },
    { label: "平均收益率", value: `${avgReturnPercentage >= 0 ? '+' : ''}${avgReturnPercentage.toFixed(1)}%`, icon: Percent, gradient: "from-blue-500 to-cyan-500" },
    { label: "盈利资产", value: `${profitableAssets}/${assetReturns.length}`, icon: Award, gradient: "from-purple-500 to-pink-500" },
    { label: "最佳表现", value: `+${bestPerformer.returnPercentage.toFixed(1)}%`, icon: TrendingUp, gradient: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/30 via-emerald-600/20 to-teal-600/30" />
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg shadow-green-500/30">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-green-100 to-emerald-200 bg-clip-text text-transparent">
                      收益分析
                    </h1>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      实时更新
                    </Badge>
                  </div>
                  <p className="text-slate-300 mt-1">深入分析您的投资收益表现</p>
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
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg shadow-green-500/30">
                <Download className="w-4 h-4 mr-2" />
                导出报告
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex flex-wrap gap-3">
          {periodReturns.map((period) => (
            <Button
              key={period.period}
              variant={selectedPeriod === period.period ? "default" : "outline"}
              onClick={() => setSelectedPeriod(period.period)}
              className={selectedPeriod === period.period 
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0" 
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }
            >
              <Calendar className="w-4 h-4 mr-2" />
              {period.period}
            </Button>
          ))}
        </div>
      </div>

      {/* Period Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-400">投资本金</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(currentPeriod.invested)}</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-400">当前价值</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(currentPeriod.currentValue)}</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${currentPeriod.return >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500'}`}>
              {currentPeriod.return >= 0 ? <ArrowUpRight className="w-5 h-5 text-white" /> : <ArrowDownRight className="w-5 h-5 text-white" />}
            </div>
            <span className="text-slate-400">收益金额</span>
          </div>
          <p className={`text-2xl font-bold ${currentPeriod.return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {currentPeriod.return >= 0 ? '+' : ''}{formatCurrency(currentPeriod.return)}
          </p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${currentPeriod.returnPercentage >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500'}`}>
              <Percent className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-400">收益率</span>
          </div>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${currentPeriod.returnPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {currentPeriod.returnPercentage >= 0 ? '+' : ''}{currentPeriod.returnPercentage}%
            </p>
            <Badge className={currentPeriod.returnPercentage > currentPeriod.benchmark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
              vs 基准 {currentPeriod.benchmark}%
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-lg px-6">
            <BarChart3 className="w-4 h-4 mr-2" />
            收益概览
          </TabsTrigger>
          <TabsTrigger value="assets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg px-6">
            <PieChart className="w-4 h-4 mr-2" />
            资产收益
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg px-6">
            <LineChart className="w-4 h-4 mr-2" />
            历史趋势
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Chart Placeholder */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <LineChart className="w-5 h-5 text-green-400" />
                收益走势图
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                  1月
                </Button>
                <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                  3月
                </Button>
                <Button variant="outline" size="sm" className="bg-green-500/20 border-green-500/50 text-green-300">
                  1年
                </Button>
                <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                  全部
                </Button>
              </div>
            </div>
            <div className="text-center py-16">
              <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">收益趋势图表</h3>
              <p className="text-slate-400">详细的图表和分析将在完整版本中提供</p>
            </div>
          </div>

          {/* Performance Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                与基准对比
              </h3>
              <div className="space-y-4">
                {periodReturns.map((period) => (
                  <div key={period.period} className="flex items-center justify-between">
                    <span className="text-slate-400">{period.period}</span>
                    <div className="flex items-center gap-4">
                      <span className={`font-semibold ${period.returnPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {period.returnPercentage >= 0 ? '+' : ''}{period.returnPercentage}%
                      </span>
                      <span className="text-slate-500">vs</span>
                      <span className="text-slate-400">{period.benchmark}%</span>
                      <Badge className={period.returnPercentage > period.benchmark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                        {period.returnPercentage > period.benchmark ? '超越' : '落后'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                最佳表现资产
              </h3>
              <div className="space-y-4">
                {assetReturns
                  .sort((a, b) => b.returnPercentage - a.returnPercentage)
                  .slice(0, 3)
                  .map((asset, index) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-amber-500/20 text-amber-400' :
                          index === 1 ? 'bg-slate-400/20 text-slate-300' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-white font-medium">{asset.name}</p>
                          <p className="text-xs text-slate-400">{asset.industry}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${asset.returnPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.returnPercentage >= 0 ? '+' : ''}{asset.returnPercentage}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assetReturns.map((asset) => {
              const isPositive = asset.return >= 0;
              
              return (
                <div key={asset.id} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{asset.name}</h3>
                      <p className="text-sm text-slate-400">{asset.industry}</p>
                    </div>
                    <Badge className={isPositive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                      {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {isPositive ? '+' : ''}{asset.returnPercentage}%
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">投资额</p>
                      <p className="text-lg font-bold text-white">{formatCurrency(asset.invested)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">当前价值</p>
                      <p className="text-lg font-bold text-white">{formatCurrency(asset.currentValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">收益金额</p>
                      <p className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(asset.return)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">月收益率</p>
                      <p className={`text-lg font-bold ${asset.monthlyReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.monthlyReturn >= 0 ? '+' : ''}{asset.monthlyReturn}%
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                    查看详情
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <div className="text-center py-16">
              <LineChart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">历史收益趋势</h3>
              <p className="text-slate-400 mb-6">详细的历史数据和趋势分析将在完整版本中提供</p>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                查看完整历史
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

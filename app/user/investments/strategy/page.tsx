"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  TrendingUp,
  Shield,
  Zap,
  Download,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Lightbulb,
  BarChart3,
  PieChart,
  Settings,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Compass,
  Layers,
  Scale,
  Rocket,
  Brain,
  Eye,
  Edit,
  Plus,
} from "lucide-react";

interface Strategy {
  id: string;
  name: string;
  description: string;
  riskLevel: "conservative" | "moderate" | "aggressive";
  expectedReturn: number;
  timeHorizon: string;
  allocation: { category: string; percentage: number; color: string }[];
  status: "active" | "draft" | "archived";
  lastUpdated: string;
}

interface Recommendation {
  id: string;
  type: "buy" | "sell" | "hold" | "rebalance";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  potentialReturn: number;
  risk: string;
  deadline?: string;
}

const strategies: Strategy[] = [
  {
    id: "1",
    name: "稳健增长策略",
    description: "以稳定收益为主，适度配置成长型资产，追求长期稳健增值",
    riskLevel: "moderate",
    expectedReturn: 12,
    timeHorizon: "3-5年",
    allocation: [
      { category: "房地产", percentage: 35, color: "blue" },
      { category: "科技", percentage: 25, color: "purple" },
      { category: "新能源", percentage: 20, color: "green" },
      { category: "医疗健康", percentage: 15, color: "red" },
      { category: "现金", percentage: 5, color: "gray" },
    ],
    status: "active",
    lastUpdated: "2024-01-08",
  },
  {
    id: "2",
    name: "高成长策略",
    description: "重点配置高成长行业，追求超额收益，适合风险承受能力较强的投资者",
    riskLevel: "aggressive",
    expectedReturn: 25,
    timeHorizon: "5-10年",
    allocation: [
      { category: "科技", percentage: 40, color: "purple" },
      { category: "新能源", percentage: 30, color: "green" },
      { category: "医疗健康", percentage: 20, color: "red" },
      { category: "房地产", percentage: 10, color: "blue" },
    ],
    status: "draft",
    lastUpdated: "2024-01-05",
  },
  {
    id: "3",
    name: "保守防御策略",
    description: "以资产保值为首要目标，配置低风险资产，适合风险厌恶型投资者",
    riskLevel: "conservative",
    expectedReturn: 6,
    timeHorizon: "1-3年",
    allocation: [
      { category: "房地产", percentage: 50, color: "blue" },
      { category: "现金", percentage: 30, color: "gray" },
      { category: "医疗健康", percentage: 15, color: "red" },
      { category: "其他", percentage: 5, color: "slate" },
    ],
    status: "archived",
    lastUpdated: "2023-12-15",
  },
];

const recommendations: Recommendation[] = [
  {
    id: "1",
    type: "rebalance",
    title: "建议调整科技板块配置",
    description: "当前科技板块占比偏高，建议适当减持以降低集中度风险",
    priority: "high",
    potentialReturn: 5,
    risk: "降低组合波动性",
    deadline: "2024-01-15",
  },
  {
    id: "2",
    type: "buy",
    title: "增持新能源板块",
    description: "新能源行业政策利好，建议适当增加配置",
    priority: "medium",
    potentialReturn: 15,
    risk: "行业周期性风险",
  },
  {
    id: "3",
    type: "sell",
    title: "减持新能源汽车电池项目",
    description: "该项目持续亏损，建议止损或减持",
    priority: "high",
    potentialReturn: -5,
    risk: "继续持有可能扩大亏损",
    deadline: "2024-01-20",
  },
  {
    id: "4",
    type: "hold",
    title: "维持房地产配置",
    description: "房地产项目表现稳定，建议继续持有",
    priority: "low",
    potentialReturn: 8,
    risk: "市场波动风险可控",
  },
];

const getRiskConfig = (level: string) => {
  const configs = {
    conservative: { label: "保守型", color: "from-green-500 to-emerald-500", icon: Shield },
    moderate: { label: "稳健型", color: "from-blue-500 to-cyan-500", icon: Scale },
    aggressive: { label: "激进型", color: "from-red-500 to-orange-500", icon: Rocket },
  };
  return configs[level as keyof typeof configs] || configs.moderate;
};

const getTypeConfig = (type: string) => {
  const configs = {
    buy: { label: "买入", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: TrendingUp },
    sell: { label: "卖出", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertTriangle },
    hold: { label: "持有", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle },
    rebalance: { label: "调仓", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: RefreshCw },
  };
  return configs[type as keyof typeof configs] || configs.hold;
};

const getStatusConfig = (status: string) => {
  const configs = {
    active: { label: "执行中", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    draft: { label: "草稿", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    archived: { label: "已归档", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  };
  return configs[status as keyof typeof configs] || configs.draft;
};

export default function InvestmentStrategyPage() {
  const [activeTab, setActiveTab] = useState("strategies");
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(strategies[0]);

  const activeStrategies = strategies.filter(s => s.status === "active").length;
  const highPriorityRecs = recommendations.filter(r => r.priority === "high").length;

  const stats = [
    { label: "执行中策略", value: `${activeStrategies}`, icon: Target, gradient: "from-blue-500 to-cyan-500" },
    { label: "待处理建议", value: `${recommendations.length}`, icon: Lightbulb, gradient: "from-amber-500 to-orange-500" },
    { label: "高优先级", value: `${highPriorityRecs}`, icon: Zap, gradient: "from-red-500 to-pink-500" },
    { label: "预期收益", value: `${selectedStrategy?.expectedReturn || 0}%`, icon: TrendingUp, gradient: "from-green-500 to-emerald-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-pink-600/30" />
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent">
                      投资策略
                    </h1>
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      智能推荐
                    </Badge>
                  </div>
                  <p className="text-slate-300 mt-1">制定和管理您的投资策略</p>
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
                <Brain className="w-4 h-4 mr-2" />
                AI分析
              </Button>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/30">
                <Plus className="w-4 h-4 mr-2" />
                新建策略
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="strategies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg px-6">
            <Compass className="w-4 h-4 mr-2" />
            我的策略
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-lg px-6">
            <Lightbulb className="w-4 h-4 mr-2" />
            智能建议
            {highPriorityRecs > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{highPriorityRecs}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="allocation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg px-6">
            <PieChart className="w-4 h-4 mr-2" />
            资产配置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Strategy List */}
            <div className="lg:col-span-1 space-y-4">
              {strategies.map((strategy) => {
                const riskConfig = getRiskConfig(strategy.riskLevel);
                const statusConfig = getStatusConfig(strategy.status);
                const RiskIcon = riskConfig.icon;
                
                return (
                  <div
                    key={strategy.id}
                    onClick={() => setSelectedStrategy(strategy)}
                    className={`bg-white/5 backdrop-blur-sm rounded-2xl border p-4 cursor-pointer transition-all hover:border-indigo-500/30 ${
                      selectedStrategy?.id === strategy.id ? 'border-indigo-500/50 ring-2 ring-indigo-500/20' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${riskConfig.color}`}>
                          <RiskIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{strategy.name}</h3>
                          <p className="text-xs text-slate-400">{riskConfig.label}</p>
                        </div>
                      </div>
                      <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{strategy.description}</p>
                    <div className="flex items-center justify-between mt-3 text-sm">
                      <span className="text-slate-400">预期收益</span>
                      <span className="text-green-400 font-semibold">+{strategy.expectedReturn}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Strategy Detail */}
            <div className="lg:col-span-2">
              {selectedStrategy ? (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedStrategy.name}</h2>
                      <p className="text-slate-400 mt-1">{selectedStrategy.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                        <Edit className="w-4 h-4 mr-1" />
                        编辑
                      </Button>
                      <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                        <Eye className="w-4 h-4 mr-1" />
                        预览
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-slate-400 mb-1">风险等级</p>
                      <p className="text-lg font-bold text-white">{getRiskConfig(selectedStrategy.riskLevel).label}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-slate-400 mb-1">预期收益</p>
                      <p className="text-lg font-bold text-green-400">+{selectedStrategy.expectedReturn}%</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-slate-400 mb-1">投资周期</p>
                      <p className="text-lg font-bold text-white">{selectedStrategy.timeHorizon}</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    资产配置
                  </h3>
                  <div className="space-y-3">
                    {selectedStrategy.allocation.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full bg-${item.color}-500`} />
                        <span className="text-slate-300 flex-1">{item.category}</span>
                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-${item.color}-500`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-white font-semibold w-12 text-right">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      最后更新: {selectedStrategy.lastUpdated}
                    </div>
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
                      应用策略
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
                  <Compass className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-semibold mb-2">选择一个策略</h3>
                  <p className="text-slate-400">点击左侧策略卡片查看详情</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.map((rec) => {
            const typeConfig = getTypeConfig(rec.type);
            const TypeIcon = typeConfig.icon;
            
            return (
              <div key={rec.id} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-amber-500/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${typeConfig.color}`}>
                    <TypeIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{rec.title}</h3>
                          <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                          {rec.priority === "high" && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              <Zap className="w-3 h-3 mr-1" />
                              高优先级
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">{rec.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                      <div>
                        <p className="text-xs text-slate-400">潜在收益</p>
                        <p className={`font-semibold ${rec.potentialReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {rec.potentialReturn >= 0 ? '+' : ''}{rec.potentialReturn}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">风险提示</p>
                        <p className="text-slate-300">{rec.risk}</p>
                      </div>
                      {rec.deadline && (
                        <div>
                          <p className="text-xs text-slate-400">建议期限</p>
                          <p className="text-amber-400">{rec.deadline}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
                        执行建议
                      </Button>
                      <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                        稍后处理
                      </Button>
                      <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                        忽略
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <div className="text-center py-12">
              <PieChart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">资产配置分析</h3>
              <p className="text-slate-400 mb-6">详细的资产配置图表和优化建议将在完整版本中提供</p>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                查看完整分析
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

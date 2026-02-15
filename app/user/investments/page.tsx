"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/user/page-header";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Plus,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Crown,
  Shield,
  Award,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
} from "lucide-react";

interface InvestmentSummary {
  totalInvested: number;
  totalValue: number;
  totalReturn: number;
  returnPercentage: number;
  activeInvestments: number;
  controllingStakes: number;
}

interface IndustryHolding {
  industry: string;
  industryEn: string;
  ownership: number;
  invested: number;
  currentValue: number;
  return: number;
  status: "CONTROLLING" | "MAJORITY" | "SIGNIFICANT" | "MINOR";
  color: string;
}

interface Investment {
  id: string;
  name: string;
  type: "stock" | "bond" | "fund" | "crypto" | "real_estate";
  amount: number;
  currentValue: number;
  purchaseDate: string;
  status: "active" | "sold" | "pending";
  riskLevel: "low" | "medium" | "high";
  expectedReturn: number;
  actualReturn: number;
  maturityDate?: string;
}

// 投资者门户级别的数据
const investorSummary: InvestmentSummary = {
  totalInvested: 2500000,
  totalValue: 3200000,
  totalReturn: 700000,
  returnPercentage: 28,
  activeInvestments: 7,
  controllingStakes: 2
};

const industryHoldings: IndustryHolding[] = [
  {
    industry: "房地产开发",
    industryEn: "Real Estate",
    ownership: 85,
    invested: 800000,
    currentValue: 1100000,
    return: 300000,
    status: "CONTROLLING",
    color: "blue"
  },
  {
    industry: "科技创新",
    industryEn: "Technology",
    ownership: 82,
    invested: 600000,
    currentValue: 850000,
    return: 250000,
    status: "CONTROLLING",
    color: "purple"
  },
  {
    industry: "可再生能源",
    industryEn: "Renewable Energy",
    ownership: 65,
    invested: 500000,
    currentValue: 620000,
    return: 120000,
    status: "MAJORITY",
    color: "green"
  },
  {
    industry: "医疗健康",
    industryEn: "Healthcare",
    ownership: 45,
    invested: 400000,
    currentValue: 480000,
    return: 80000,
    status: "SIGNIFICANT",
    color: "red"
  },
  {
    industry: "新能源汽车",
    industryEn: "Electric Vehicles",
    ownership: 38,
    invested: 200000,
    currentValue: 150000,
    return: -50000,
    status: "SIGNIFICANT",
    color: "indigo"
  }
];

const mockInvestments: Investment[] = [
  {
    id: "1",
    name: "科技股票基金",
    type: "fund",
    amount: 50000,
    currentValue: 58500,
    purchaseDate: "2023-06-15T10:00:00",
    status: "active",
    riskLevel: "high",
    expectedReturn: 12,
    actualReturn: 17,
  },
  {
    id: "2",
    name: "政府债券",
    type: "bond",
    amount: 100000,
    currentValue: 103200,
    purchaseDate: "2023-03-20T14:30:00",
    status: "active",
    riskLevel: "low",
    expectedReturn: 4,
    actualReturn: 3.2,
    maturityDate: "2025-03-20T14:30:00",
  },
  {
    id: "3",
    name: "房地产投资信托",
    type: "real_estate",
    amount: 200000,
    currentValue: 215000,
    purchaseDate: "2023-01-10T09:00:00",
    status: "active",
    riskLevel: "medium",
    expectedReturn: 8,
    actualReturn: 7.5,
  },
  {
    id: "4",
    name: "比特币",
    type: "crypto",
    amount: 30000,
    currentValue: 25800,
    purchaseDate: "2023-11-05T16:20:00",
    status: "active",
    riskLevel: "high",
    expectedReturn: 20,
    actualReturn: -14,
  },
];

const typeConfig = {
  stock: { label: "股票", color: "bg-blue-500", icon: TrendingUp },
  bond: { label: "债券", color: "bg-green-500", icon: Target },
  fund: { label: "基金", color: "bg-purple-500", icon: PieChart },
  crypto: { label: "加密货币", color: "bg-orange-500", icon: TrendingUp },
  real_estate: { label: "房地产", color: "bg-yellow-500", icon: BarChart3 },
};

const riskConfig = {
  low: { label: "低风险", color: "bg-green-500" },
  medium: { label: "中风险", color: "bg-yellow-500" },
  high: { label: "高风险", color: "bg-red-500" },
};

const statusConfig = {
  active: { label: "持有中", color: "bg-green-500", icon: CheckCircle },
  sold: { label: "已卖出", color: "bg-gray-500", icon: TrendingDown },
  pending: { label: "待确认", color: "bg-yellow-500", icon: AlertTriangle },
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "CONTROLLING": return Crown;
    case "MAJORITY": return Shield;
    case "SIGNIFICANT": return Award;
    default: return Users;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "CONTROLLING": return "text-yellow-500";
    case "MAJORITY": return "text-blue-500";
    case "SIGNIFICANT": return "text-green-500";
    default: return "text-gray-500";
  }
};

const getStatusLabel = (status: string) => {
  const labels = {
    "CONTROLLING": "控股",
    "MAJORITY": "主要股东",
    "SIGNIFICANT": "重要股东",
    "MINOR": "少数股东"
  };
  return labels[status as keyof typeof labels] || status;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>(mockInvestments);
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview");

  // 使用投资者门户级别的统计数据
  const stats = [
    {
      label: "总投资金额",
      value: formatCurrency(investorSummary.totalInvested),
      icon: DollarSign,
      color: "bg-blue-500",
    },
    {
      label: "当前价值",
      value: formatCurrency(investorSummary.totalValue),
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      label: "总收益",
      value: `+${formatCurrency(investorSummary.totalReturn)}`,
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      label: "控股项目",
      value: `${investorSummary.controllingStakes}`,
      icon: Crown,
      color: "bg-yellow-500",
    },
  ];

  const filteredInvestments = investments.filter(investment => {
    return selectedType === "all" || investment.type === selectedType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateReturn = (investment: Investment) => {
    const returnAmount = investment.currentValue - investment.amount;
    const returnPercentage = (returnAmount / investment.amount) * 100;
    return { amount: returnAmount, percentage: returnPercentage };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="投资管理"
        description="管理您的投资组合，跟踪各行业的投资表现"
        icon={TrendingUp}
        stats={stats}
        actions={
          <>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              <Download className="w-4 h-4 mr-2" />
              导出报告
            </Button>
            <Link href="/investment-opportunities">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Target className="w-4 h-4 mr-2" />
                新投资机会
              </Button>
            </Link>
          </>
        }
      />

      {/* 视图模式切换 */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            variant={viewMode === "overview" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("overview")}
            className={
              viewMode === "overview"
                ? "bg-blue-600 hover:bg-blue-700"
                : "border-slate-600 text-slate-300 hover:bg-slate-800"
            }
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            投资概览
          </Button>
          <Button
            variant={viewMode === "detailed" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("detailed")}
            className={
              viewMode === "detailed"
                ? "bg-blue-600 hover:bg-blue-700"
                : "border-slate-600 text-slate-300 hover:bg-slate-800"
            }
          >
            <Eye className="w-4 h-4 mr-1" />
            详细列表
          </Button>
        </div>
        
        <div className="text-sm text-slate-400">
          总收益率: <span className="text-green-400 font-semibold">+{investorSummary.returnPercentage}%</span>
        </div>
      </div>

      {viewMode === "overview" ? (
        <>
          {/* 行业投资持仓概览 */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                行业投资持仓
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {industryHoldings.map((holding, index) => {
                  const StatusIcon = getStatusIcon(holding.status);
                  const isPositive = holding.return >= 0;
                  
                  return (
                    <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-${holding.color}-500/20 rounded-lg flex items-center justify-center`}>
                            <Briefcase className={`w-5 h-5 text-${holding.color}-400`} />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">
                              {holding.industry}
                            </h3>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`w-4 h-4 ${getStatusColor(holding.status)}`} />
                              <span className={`text-xs font-medium ${getStatusColor(holding.status)}`}>
                                {holding.ownership}% • {getStatusLabel(holding.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Link href={`/investment-opportunities/${holding.industry.toLowerCase()}`}>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-slate-400 text-xs mb-1">投资额</p>
                          <p className="text-white font-semibold">
                            {formatCurrency(holding.invested)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs mb-1">当前价值</p>
                          <p className="text-white font-semibold">
                            {formatCurrency(holding.currentValue)}
                          </p>
                        </div>
                      </div>

                      {/* Return */}
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-400 text-sm">收益</span>
                        <div className="flex items-center gap-2">
                          {isPositive ? (
                            <ArrowUpRight className="w-4 h-4 text-green-400" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                          )}
                          <span className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{formatCurrency(holding.return)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 投资组合表现图表 */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                投资组合表现
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <PieChart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-white text-xl font-semibold mb-2">
                  表现分析
                </h3>
                <p className="text-slate-400 mb-6">
                  详细的图表和分析将在完整版本中提供
                </p>
                <div className="flex justify-center space-x-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    查看完整分析
                  </Button>
                  <Link href="/user/investments/portfolio">
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                      投资组合详情
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  投资组合分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(typeConfig).map(([type, config]) => {
                    const typeInvestments = investments.filter(inv => inv.type === type);
                    const typeAmount = typeInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
                    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
                    const percentage = totalCurrentValue > 0 ? (typeAmount / totalCurrentValue) * 100 : 0;
                    
                    if (typeAmount === 0) return null;
                    
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${config.color}`}></div>
                          <span className="text-slate-300">{config.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">¥{typeAmount.toLocaleString()}</div>
                          <div className="text-slate-400 text-sm">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  风险分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(riskConfig).map(([risk, config]) => {
                    const riskInvestments = investments.filter(inv => inv.riskLevel === risk);
                    const riskAmount = riskInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
                    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
                    const percentage = totalCurrentValue > 0 ? (riskAmount / totalCurrentValue) * 100 : 0;
                    
                    if (riskAmount === 0) return null;
                    
                    return (
                      <div key={risk} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${config.color}`}></div>
                          <span className="text-slate-300">{config.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">¥{riskAmount.toLocaleString()}</div>
                          <div className="text-slate-400 text-sm">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("all")}
              className={
                selectedType === "all"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "border-slate-600 text-slate-300 hover:bg-slate-800"
              }
            >
              全部投资
            </Button>
            {Object.entries(typeConfig).map(([type, config]) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
                className={
                  selectedType === type
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "border-slate-600 text-slate-300 hover:bg-slate-800"
                }
              >
                <config.icon className="w-4 h-4 mr-1" />
                {config.label}
              </Button>
            ))}
          </div>

          {/* Investments List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredInvestments.map((investment) => {
              const returnData = calculateReturn(investment);
              const TypeIcon = typeConfig[investment.type].icon;
              const StatusIcon = statusConfig[investment.status].icon;
              
              return (
                <Card key={investment.id} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${typeConfig[investment.type].color}`}>
                          <TypeIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{investment.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={`${typeConfig[investment.type].color} text-white text-xs`}>
                              {typeConfig[investment.type].label}
                            </Badge>
                            <Badge className={`${riskConfig[investment.riskLevel].color} text-white text-xs`}>
                              {riskConfig[investment.riskLevel].label}
                            </Badge>
                            <Badge className={`${statusConfig[investment.status].color} text-white text-xs`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[investment.status].label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 text-sm">投资金额</p>
                        <p className="text-white font-semibold">¥{investment.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">当前价值</p>
                        <p className="text-white font-semibold">¥{investment.currentValue.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 text-sm">收益金额</p>
                        <p className={`font-semibold ${returnData.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {returnData.amount >= 0 ? "+" : ""}¥{returnData.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">收益率</p>
                        <p className={`font-semibold ${returnData.percentage >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {returnData.percentage >= 0 ? "+" : ""}{returnData.percentage.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-slate-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>购买日期:</span>
                        <span>{formatDate(investment.purchaseDate)}</span>
                      </div>
                      {investment.maturityDate && (
                        <div className="flex items-center justify-between">
                          <span>到期日期:</span>
                          <span>{formatDate(investment.maturityDate)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>预期收益:</span>
                        <span>{investment.expectedReturn}%</span>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Eye className="w-4 h-4 mr-1" />
                        详情
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        更新
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Performance Summary */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                投资表现总结
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {investments.filter(inv => calculateReturn(inv).percentage > 0).length}
                  </div>
                  <div className="text-slate-400">盈利投资</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {investments.filter(inv => calculateReturn(inv).percentage < 0).length}
                  </div>
                  <div className="text-slate-400">亏损投资</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {investments.filter(inv => inv.status === "active").length}
                  </div>
                  <div className="text-slate-400">持有中</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* 快速操作 */}
      <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30">
        <CardContent className="p-6 text-center">
          <h2 className="text-white text-xl font-bold mb-4">
            准备扩展您的投资组合？
          </h2>
          <p className="text-slate-300 mb-6">
            探索新的投资机会，增强您的市场影响力
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/investment-opportunities">
              <Button className="bg-blue-600 hover:bg-blue-700">
                探索投资机会
              </Button>
            </Link>
            <Link href="/brand-consistency">
              <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400/10">
                我们的服务
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
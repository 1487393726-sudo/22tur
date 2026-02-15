"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Smartphone, 
  ArrowRight,
  Crown,
  Shield,
  Users,
  Factory,
  Leaf,
  Heart,
  Car,
  Plane,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Target
} from "lucide-react";
import { useDashboardTranslations } from "@/lib/i18n/use-dashboard-translations";
import { cn } from "@/lib/utils";

interface IndustryOpportunity {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: any;
  minInvestment: number;
  expectedReturn: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  currentOwnership: number;
  totalInvestors: number;
  marketSize: string;
  marketSizeEn: string;
  growthRate: string;
  timeframe: string;
  timeframeEn: string;
  highlights: string[];
  highlightsEn: string[];
  color: string;
  gradient: string;
}

const industryOpportunities: IndustryOpportunity[] = [
  {
    id: "real-estate",
    name: "房地产开发",
    nameEn: "Real Estate Development",
    description: "商业地产和住宅项目开发，稳定收益的传统投资领域",
    descriptionEn: "Commercial and residential property development with stable returns",
    icon: Building2,
    minInvestment: 100000,
    expectedReturn: "8-12%",
    riskLevel: "MEDIUM",
    currentOwnership: 15,
    totalInvestors: 245,
    marketSize: "¥50万亿",
    marketSizeEn: "$7.5T",
    growthRate: "6.5%",
    timeframe: "3-5年",
    timeframeEn: "3-5 years",
    highlights: ["稳定现金流", "资产增值", "抗通胀", "政策支持"],
    highlightsEn: ["Stable Cash Flow", "Asset Appreciation", "Inflation Hedge", "Policy Support"],
    color: "blue",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    id: "technology",
    name: "科技创新",
    nameEn: "Technology Innovation",
    description: "人工智能、区块链、物联网等前沿科技投资机会",
    descriptionEn: "Investment opportunities in AI, blockchain, IoT and cutting-edge technologies",
    icon: Smartphone,
    minInvestment: 50000,
    expectedReturn: "15-25%",
    riskLevel: "HIGH",
    currentOwnership: 32,
    totalInvestors: 189,
    marketSize: "¥30万亿",
    marketSizeEn: "$4.5T",
    growthRate: "18.2%",
    timeframe: "2-4年",
    timeframeEn: "2-4 years",
    highlights: ["高增长潜力", "创新驱动", "数字化转型", "全球市场"],
    highlightsEn: ["High Growth Potential", "Innovation Driven", "Digital Transformation", "Global Market"],
    color: "purple",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    id: "manufacturing",
    name: "智能制造",
    nameEn: "Smart Manufacturing",
    description: "工业4.0、自动化生产线、智能工厂投资项目",
    descriptionEn: "Industry 4.0, automated production lines, and smart factory investments",
    icon: Factory,
    minInvestment: 200000,
    expectedReturn: "10-16%",
    riskLevel: "MEDIUM",
    currentOwnership: 28,
    totalInvestors: 156,
    marketSize: "¥25万亿",
    marketSizeEn: "$3.8T",
    growthRate: "12.8%",
    timeframe: "3-6年",
    timeframeEn: "3-6 years",
    highlights: ["产业升级", "效率提升", "成本优化", "出口导向"],
    highlightsEn: ["Industrial Upgrade", "Efficiency Boost", "Cost Optimization", "Export Oriented"],
    color: "orange",
    gradient: "from-orange-500 to-orange-600"
  },
  {
    id: "renewable-energy",
    name: "可再生能源",
    nameEn: "Renewable Energy",
    description: "太阳能、风能、储能技术等清洁能源投资",
    descriptionEn: "Solar, wind, energy storage and clean energy investments",
    icon: Leaf,
    minInvestment: 150000,
    expectedReturn: "12-18%",
    riskLevel: "MEDIUM",
    currentOwnership: 41,
    totalInvestors: 203,
    marketSize: "¥15万亿",
    marketSizeEn: "$2.3T",
    growthRate: "22.5%",
    timeframe: "5-8年",
    timeframeEn: "5-8 years",
    highlights: ["政策扶持", "环保趋势", "技术成熟", "长期收益"],
    highlightsEn: ["Policy Support", "Environmental Trend", "Mature Technology", "Long-term Returns"],
    color: "green",
    gradient: "from-green-500 to-green-600"
  },
  {
    id: "healthcare",
    name: "医疗健康",
    nameEn: "Healthcare",
    description: "生物医药、医疗器械、数字医疗投资机会",
    descriptionEn: "Biopharmaceuticals, medical devices, and digital health investments",
    icon: Heart,
    minInvestment: 80000,
    expectedReturn: "14-20%",
    riskLevel: "HIGH",
    currentOwnership: 25,
    totalInvestors: 178,
    marketSize: "¥12万亿",
    marketSizeEn: "$1.8T",
    growthRate: "16.3%",
    timeframe: "4-7年",
    timeframeEn: "4-7 years",
    highlights: ["人口老龄化", "健康意识", "技术创新", "刚性需求"],
    highlightsEn: ["Aging Population", "Health Awareness", "Tech Innovation", "Rigid Demand"],
    color: "red",
    gradient: "from-red-500 to-red-600"
  },
  {
    id: "automotive",
    name: "新能源汽车",
    nameEn: "Electric Vehicles",
    description: "电动汽车、自动驾驶、充电基础设施投资",
    descriptionEn: "Electric vehicles, autonomous driving, and charging infrastructure",
    icon: Car,
    minInvestment: 120000,
    expectedReturn: "13-19%",
    riskLevel: "MEDIUM",
    currentOwnership: 38,
    totalInvestors: 167,
    marketSize: "¥8万亿",
    marketSizeEn: "$1.2T",
    growthRate: "28.7%",
    timeframe: "3-5年",
    timeframeEn: "3-5 years",
    highlights: ["碳中和目标", "技术突破", "基础设施", "消费升级"],
    highlightsEn: ["Carbon Neutral", "Tech Breakthrough", "Infrastructure", "Consumption Upgrade"],
    color: "indigo",
    gradient: "from-indigo-500 to-indigo-600"
  },
  {
    id: "aviation",
    name: "航空航天",
    nameEn: "Aerospace",
    description: "商业航天、无人机、卫星通信投资项目",
    descriptionEn: "Commercial space, drones, and satellite communication investments",
    icon: Plane,
    minInvestment: 300000,
    expectedReturn: "16-24%",
    riskLevel: "HIGH",
    currentOwnership: 22,
    totalInvestors: 89,
    marketSize: "¥5万亿",
    marketSizeEn: "$750B",
    growthRate: "35.2%",
    timeframe: "5-10年",
    timeframeEn: "5-10 years",
    highlights: ["国家战略", "技术前沿", "军民融合", "国际合作"],
    highlightsEn: ["National Strategy", "Cutting Edge", "Military-Civilian Integration", "International Cooperation"],
    color: "cyan",
    gradient: "from-cyan-500 to-cyan-600"
  }
];

export default function InvestmentOpportunitiesPage() {
  const router = useRouter();
  const { t, isRTL } = useDashboardTranslations();

  const handleInvestment = (industryId: string) => {
    router.push(`/investment-opportunities/${industryId}`);
  };

  const getOwnershipStatus = (ownership: number) => {
    if (ownership >= 80) {
      return {
        status: "CONTROLLING",
        label: "控股地位",
        icon: Crown,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/20"
      };
    } else if (ownership >= 50) {
      return {
        status: "MAJORITY",
        label: "主要股东",
        icon: Shield,
        color: "text-blue-500",
        bgColor: "bg-blue-500/20"
      };
    } else {
      return {
        status: "MINOR",
        label: "少数股东",
        icon: Users,
        color: "text-gray-500",
        bgColor: "bg-gray-500/20"
      };
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW": return { text: "text-green-600", bg: "bg-green-500/20", border: "border-green-500/30" };
      case "MEDIUM": return { text: "text-yellow-600", bg: "bg-yellow-500/20", border: "border-yellow-500/30" };
      case "HIGH": return { text: "text-red-600", bg: "bg-red-500/20", border: "border-red-500/30" };
      default: return { text: "text-gray-600", bg: "bg-gray-500/20", border: "border-gray-500/30" };
    }
  };

  const getRiskLabel = (risk: string) => {
    const labels = {
      "LOW": "低风险",
      "MEDIUM": "中等风险",
      "HIGH": "高风险"
    };
    return labels[risk as keyof typeof labels] || risk;
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `¥${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `¥${(amount / 1000).toFixed(0)}K`;
    }
    return `¥${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Section */}
      <Card className="purple-gradient-card">
        <CardContent className="p-6">
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <div className={`p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl`}>
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="purple-gradient-title text-3xl font-bold mb-2">
                投资机会
              </h1>
              <p className="purple-gradient-text">
                选择您感兴趣的行业，投资未来。当您持股超过80%时，您将获得控股权和行业主导地位。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Opportunities Grid */}
      <div>
        <h2 className="purple-gradient-title text-xl font-semibold mb-4">
          行业投资机会
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industryOpportunities.map((industry) => {
            const IconComponent = industry.icon;
            const ownershipStatus = getOwnershipStatus(industry.currentOwnership);
            const StatusIcon = ownershipStatus.icon;
            const riskColors = getRiskColor(industry.riskLevel);

            return (
              <Card
                key={industry.id}
                className="purple-gradient-card group cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleInvestment(industry.id)}
              >
                <CardHeader>
                  <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                    <div className={`w-12 h-12 bg-gradient-to-br ${industry.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <Badge className={`${ownershipStatus.bgColor} ${ownershipStatus.color} border-0`}>
                      <StatusIcon className={`w-3 h-3 mr-1 ${ownershipStatus.color}`} />
                      {industry.currentOwnership}%
                    </Badge>
                  </div>
                  <CardTitle className="purple-gradient-title text-lg font-bold mb-1">
                    {industry.name}
                  </CardTitle>
                  <p className="purple-gradient-text text-sm">
                    {industry.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="purple-gradient-text text-sm">最低投资</span>
                      </div>
                      <span className="purple-gradient-title font-semibold">
                        {formatAmount(industry.minInvestment)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="purple-gradient-text text-sm">预期回报</span>
                      </div>
                      <span className="text-green-600 font-semibold">
                        {industry.expectedReturn}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <span className="purple-gradient-text text-sm">风险等级</span>
                      </div>
                      <Badge className={`${riskColors.bg} ${riskColors.text} ${riskColors.border} border`}>
                        {getRiskLabel(industry.riskLevel)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="purple-gradient-text text-sm">市场规模</span>
                      </div>
                      <span className="purple-gradient-text font-semibold">
                        {industry.marketSize}
                      </span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <h4 className="purple-gradient-text text-xs font-medium mb-2">
                      核心亮点
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {industry.highlights.slice(0, 3).map((highlight, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full group-hover:bg-primary/90 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInvestment(industry.id);
                    }}
                  >
                    立即投资
                    <ArrowRight className={cn("h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform", isRTL && "mr-2 ml-0 rotate-180")} />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <Card className="purple-gradient-card">
        <CardContent className="p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="purple-gradient-title text-2xl md:text-3xl font-bold mb-4">
              准备构建您的投资组合了吗？
            </h2>
            <p className="purple-gradient-text mb-6">
              从您感兴趣的任何行业开始。我们的专家将指导您完成投资流程。
            </p>
            <Button
              onClick={() => router.push("/dashboard/investment")}
              className="gap-2"
            >
              查看我的投资
              <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

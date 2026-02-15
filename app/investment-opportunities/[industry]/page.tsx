"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import { 
  TrendingUp, 
  Building2, 
  Smartphone, 
  Car, 
  Zap, 
  Leaf, 
  Gamepad2, 
  ShoppingBag,
  DollarSign,
  Users,
  Calendar,
  Target,
  ArrowRight,
  Crown,
  Shield,
  Award,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  TrendingDown
} from "lucide-react";
import Link from "next/link";

interface IndustryDetails {
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
  detailedInfo: {
    marketAnalysis: string;
    marketAnalysisEn: string;
    competitiveAdvantage: string[];
    competitiveAdvantageEn: string[];
    riskFactors: string[];
    riskFactorsEn: string[];
    investmentStrategy: string;
    investmentStrategyEn: string;
    exitStrategy: string;
    exitStrategyEn: string;
  };
  projects: Array<{
    id: string;
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    targetAmount: number;
    raisedAmount: number;
    investors: number;
    expectedReturn: string;
    timeline: string;
    status: string;
  }>;
}

const industryData: Record<string, IndustryDetails> = {
  "real-estate": {
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
    totalInvestors: 234,
    marketSize: "5000亿市场",
    marketSizeEn: "$500B Market",
    growthRate: "6.5%",
    timeframe: "3-5年",
    timeframeEn: "3-5 Years",
    highlights: ["稳定现金流", "资产增值", "抗通胀"],
    highlightsEn: ["Stable Cash Flow", "Asset Appreciation", "Inflation Hedge"],
    color: "blue",
    gradient: "from-blue-500 to-blue-600",
    detailedInfo: {
      marketAnalysis: "房地产市场正在经历结构性调整，高品质项目仍有良好投资价值。城市化进程和人口增长为房地产提供长期支撑。",
      marketAnalysisEn: "Real estate market is undergoing structural adjustment, high-quality projects still have good investment value. Urbanization and population growth provide long-term support.",
      competitiveAdvantage: ["地段优势", "开发经验", "政策支持", "融资能力"],
      competitiveAdvantageEn: ["Location Advantage", "Development Experience", "Policy Support", "Financing Capability"],
      riskFactors: ["政策变化", "市场波动", "资金链风险", "建设周期"],
      riskFactorsEn: ["Policy Changes", "Market Volatility", "Capital Chain Risk", "Construction Timeline"],
      investmentStrategy: "重点投资一线城市核心地段和新兴城市优质项目，平衡收益与风险。",
      investmentStrategyEn: "Focus on prime locations in tier-1 cities and quality projects in emerging cities, balancing returns and risks.",
      exitStrategy: "项目完工后通过销售或持有出租实现退出，预计3-5年完整投资周期。",
      exitStrategyEn: "Exit through sales or rental after project completion, expected 3-5 year complete investment cycle."
    },
    projects: [
      {
        id: "re-001",
        name: "CBD商业综合体",
        nameEn: "CBD Commercial Complex",
        description: "位于市中心CBD核心区域的大型商业综合体项目",
        descriptionEn: "Large commercial complex project in the core CBD area of city center",
        targetAmount: 50000000,
        raisedAmount: 32000000,
        investors: 156,
        expectedReturn: "10-12%",
        timeline: "4年",
        status: "ACTIVE"
      }
    ]
  },
  "technology": {
    id: "technology",
    name: "科技创新",
    nameEn: "Technology Innovation",
    description: "AI、区块链、物联网等前沿科技项目投资",
    descriptionEn: "Investment in AI, blockchain, IoT and cutting-edge technology projects",
    icon: Smartphone,
    minInvestment: 50000,
    expectedReturn: "15-25%",
    riskLevel: "HIGH",
    currentOwnership: 32,
    totalInvestors: 567,
    marketSize: "8000亿市场",
    marketSizeEn: "$800B Market",
    growthRate: "18.2%",
    timeframe: "2-4年",
    timeframeEn: "2-4 Years",
    highlights: ["高增长潜力", "技术壁垒", "市场领先"],
    highlightsEn: ["High Growth Potential", "Technology Moat", "Market Leadership"],
    color: "purple",
    gradient: "from-purple-500 to-purple-600",
    detailedInfo: {
      marketAnalysis: "科技行业正处于快速发展期，AI和数字化转型推动巨大市场机遇。新兴技术应用场景不断扩大。",
      marketAnalysisEn: "Technology industry is in rapid development, AI and digital transformation drive huge market opportunities. Emerging technology applications continue to expand.",
      competitiveAdvantage: ["技术创新", "人才团队", "市场先发", "资本支持"],
      competitiveAdvantageEn: ["Technology Innovation", "Talent Team", "Market First-mover", "Capital Support"],
      riskFactors: ["技术风险", "市场竞争", "监管变化", "人才流失"],
      riskFactorsEn: ["Technology Risk", "Market Competition", "Regulatory Changes", "Talent Loss"],
      investmentStrategy: "聚焦具有核心技术和清晰商业模式的项目，重视团队和市场验证。",
      investmentStrategyEn: "Focus on projects with core technology and clear business models, emphasizing team and market validation.",
      exitStrategy: "通过IPO、并购或战略投资实现退出，预计2-4年投资周期。",
      exitStrategyEn: "Exit through IPO, M&A or strategic investment, expected 2-4 year investment cycle."
    },
    projects: [
      {
        id: "tech-001",
        name: "AI智能平台",
        nameEn: "AI Intelligence Platform",
        description: "企业级人工智能解决方案平台",
        descriptionEn: "Enterprise-level artificial intelligence solution platform",
        targetAmount: 20000000,
        raisedAmount: 15000000,
        investors: 89,
        expectedReturn: "20-25%",
        timeline: "3年",
        status: "ACTIVE"
      }
    ]
  }
};

export default function IndustryInvestmentPage() {
  const params = useParams();
  const { locale } = useLanguage();
  const [industry, setIndustry] = useState<IndustryDetails | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    const industryId = params.industry as string;
    const industryInfo = industryData[industryId];
    if (industryInfo) {
      setIndustry(industryInfo);
      setInvestmentAmount(industryInfo.minInvestment);
    }
  }, [params.industry]);

  if (!industry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">
            {locale === "en" ? "Industry Not Found" : "未找到该行业"}
          </h1>
          <Link href="/investment-opportunities" className="text-primary hover:underline">
            {locale === "en" ? "Back to Investment Opportunities" : "返回投资机会"}
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = industry.icon;

  const handleInvestment = async () => {
    try {
      const response = await fetch("/api/investments/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          industryId: industry.id,
          amount: investmentAmount,
          paymentMethod: "BANK_TRANSFER"
        })
      });

      if (response.ok) {
        alert(locale === "en" ? "Investment submitted successfully!" : "投资提交成功！");
        setShowInvestmentForm(false);
      } else {
        alert(locale === "en" ? "Investment failed. Please try again." : "投资失败，请重试。");
      }
    } catch (error) {
      console.error("Investment error:", error);
      alert(locale === "en" ? "Investment failed. Please try again." : "投资失败，请重试。");
    }
  };

  const getOwnershipStatus = (ownership: number) => {
    if (ownership >= 80) {
      return {
        status: "CONTROLLING",
        label: locale === "en" ? "Controlling Stake" : "控股地位",
        icon: Crown,
        color: "text-yellow-500",
        description: locale === "en" ? "You have controlling rights in this industry" : "您在该行业拥有控股权"
      };
    } else if (ownership >= 50) {
      return {
        status: "MAJORITY",
        label: locale === "en" ? "Majority Stake" : "主要股东",
        icon: Shield,
        color: "text-blue-500",
        description: locale === "en" ? "You are a major stakeholder" : "您是主要股东"
      };
    } else {
      return {
        status: "MINOR",
        label: locale === "en" ? "Minor Stake" : "少数股东",
        icon: Users,
        color: "text-gray-500",
        description: locale === "en" ? "You have a minority stake" : "您持有少数股权"
      };
    }
  };

  const ownershipStatus = getOwnershipStatus(industry.currentOwnership);
  const StatusIcon = ownershipStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="relative z-10 container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className={`inline-flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r ${industry.gradient} mb-6`}>
                <IconComponent className="w-8 h-8 text-white" />
                <h1 className="text-3xl font-bold text-white">
                  {locale === "en" ? industry.nameEn : industry.name}
                </h1>
              </div>
              
              <p className="text-xl text-gray-300 mb-8">
                {locale === "en" ? industry.descriptionEn : industry.description}
              </p>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">{industry.expectedReturn}</div>
                  <div className="text-gray-300 text-sm">
                    {locale === "en" ? "Expected Return" : "预期收益"}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">{industry.growthRate}</div>
                  <div className="text-gray-300 text-sm">
                    {locale === "en" ? "Growth Rate" : "增长率"}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">
                    {locale === "en" ? industry.marketSizeEn : industry.marketSize}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {locale === "en" ? "Market Size" : "市场规模"}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">
                    {locale === "en" ? industry.timeframeEn : industry.timeframe}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {locale === "en" ? "Investment Period" : "投资周期"}
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Panel */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <div className={`flex items-center justify-center gap-2 ${ownershipStatus.color} mb-2`}>
                  <StatusIcon className="w-6 h-6" />
                  <span className="text-lg font-semibold">{industry.currentOwnership}%</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {ownershipStatus.label}
                </h3>
                <p className="text-gray-300 text-sm">
                  {ownershipStatus.description}
                </p>
              </div>

              {/* Ownership Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 text-sm">
                    {locale === "en" ? "Ownership Progress" : "持股进度"}
                  </span>
                  <span className="text-white text-sm font-medium">
                    {industry.currentOwnership}% / 80%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full bg-gradient-to-r ${industry.gradient}`}
                    style={{ width: `${Math.min(industry.currentOwnership / 80 * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {locale === "en" 
                    ? `${80 - industry.currentOwnership}% more to gain controlling stake`
                    : `还需 ${80 - industry.currentOwnership}% 获得控股权`
                  }
                </div>
              </div>

              {/* Investment Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    {locale === "en" ? "Investment Amount" : "投资金额"}
                  </label>
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    min={industry.minInvestment}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    placeholder={`Minimum: $${industry.minInvestment.toLocaleString()}`}
                  />
                </div>

                <button
                  onClick={() => setShowInvestmentForm(true)}
                  disabled={investmentAmount < industry.minInvestment}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {locale === "en" ? "Invest Now" : "立即投资"}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="text-center text-gray-400 text-xs">
                  {locale === "en" 
                    ? `Minimum investment: $${industry.minInvestment.toLocaleString()}`
                    : `最低投资金额：$${industry.minInvestment.toLocaleString()}`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Information */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-6">
            {/* Market Analysis */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <button
                onClick={() => setExpandedSection(expandedSection === "market" ? null : "market")}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold text-white">
                    {locale === "en" ? "Market Analysis" : "市场分析"}
                  </h3>
                </div>
                {expandedSection === "market" ? 
                  <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                }
              </button>
              {expandedSection === "market" && (
                <div className="px-6 pb-6">
                  <p className="text-gray-300 leading-relaxed">
                    {locale === "en" ? industry.detailedInfo.marketAnalysisEn : industry.detailedInfo.marketAnalysis}
                  </p>
                </div>
              )}
            </div>

            {/* Competitive Advantage */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <button
                onClick={() => setExpandedSection(expandedSection === "advantage" ? null : "advantage")}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-bold text-white">
                    {locale === "en" ? "Competitive Advantages" : "竞争优势"}
                  </h3>
                </div>
                {expandedSection === "advantage" ? 
                  <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                }
              </button>
              {expandedSection === "advantage" && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(locale === "en" ? industry.detailedInfo.competitiveAdvantageEn : industry.detailedInfo.competitiveAdvantage).map((advantage, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{advantage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Risk Factors */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <button
                onClick={() => setExpandedSection(expandedSection === "risks" ? null : "risks")}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">
                    {locale === "en" ? "Risk Factors" : "风险因素"}
                  </h3>
                </div>
                {expandedSection === "risks" ? 
                  <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                }
              </button>
              {expandedSection === "risks" && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(locale === "en" ? industry.detailedInfo.riskFactorsEn : industry.detailedInfo.riskFactors).map((risk, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <span className="text-gray-300">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Investment Confirmation Modal */}
      {showInvestmentForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              {locale === "en" ? "Confirm Investment" : "确认投资"}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-300">
                  {locale === "en" ? "Industry:" : "行业："}
                </span>
                <span className="text-white font-semibold">
                  {locale === "en" ? industry.nameEn : industry.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">
                  {locale === "en" ? "Amount:" : "金额："}
                </span>
                <span className="text-white font-semibold">
                  ${investmentAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">
                  {locale === "en" ? "Expected Return:" : "预期收益："}
                </span>
                <span className="text-green-400 font-semibold">
                  {industry.expectedReturn}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowInvestmentForm(false)}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                {locale === "en" ? "Cancel" : "取消"}
              </button>
              <button
                onClick={handleInvestment}
                className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                {locale === "en" ? "Confirm" : "确认"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
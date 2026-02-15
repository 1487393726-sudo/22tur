"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Building2,
  Rocket,
  Crown,
  ArrowRight,
  Star,
  Shield,
  Target,
  ChartBar,
  Wallet,
  Users,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import "@/styles/user-pages.css";

// 投资机会数据
const investmentOpportunities = [
  {
    id: 1,
    title: "科技创新基金",
    category: "科技",
    minInvestment: "¥10,000",
    expectedReturn: "15-25%",
    risk: "中等",
    status: "开放中",
    progress: 68,
    investors: 156,
    description: "投资于人工智能、云计算、物联网等前沿科技领域",
    tags: ["AI", "云计算", "物联网"],
  },
  {
    id: 2,
    title: "绿色能源项目",
    category: "新能源",
    minInvestment: "¥50,000",
    expectedReturn: "12-18%",
    risk: "低",
    status: "开放中",
    progress: 45,
    investors: 89,
    description: "专注于太阳能、风能等可再生能源项目投资",
    tags: ["太阳能", "风能", "环保"],
  },
  {
    id: 3,
    title: "医疗健康产业",
    category: "医疗",
    minInvestment: "¥30,000",
    expectedReturn: "18-28%",
    risk: "中高",
    status: "即将开放",
    progress: 0,
    investors: 0,
    description: "投资于生物医药、医疗器械、健康服务等领域",
    tags: ["生物医药", "医疗器械", "健康"],
  },
  {
    id: 4,
    title: "房地产信托",
    category: "房地产",
    minInvestment: "¥100,000",
    expectedReturn: "8-12%",
    risk: "低",
    status: "开放中",
    progress: 82,
    investors: 234,
    description: "投资于优质商业地产和住宅项目",
    tags: ["商业地产", "住宅", "稳定收益"],
  },
];

// 投资者权益
const investorBenefits = [
  {
    icon: Crown,
    title: "专属客户中心",
    description: "成为投资者后，解锁高级客户中心，享受专属投资管理功能",
  },
  {
    icon: ChartBar,
    title: "专业投资分析",
    description: "获取专业的投资组合分析、风险评估和收益报告",
  },
  {
    icon: Shield,
    title: "资金安全保障",
    description: "多重安全机制保护您的投资资金，专业团队全程监管",
  },
  {
    icon: Users,
    title: "专属投资顾问",
    description: "一对一专属投资顾问服务，提供个性化投资建议",
  },
];

export default function InvestPage() {
  const [activeTab, setActiveTab] = useState("opportunities");

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "低":
        return "text-green-400 bg-green-500/20";
      case "中等":
        return "text-yellow-400 bg-yellow-500/20";
      case "中高":
        return "text-orange-400 bg-orange-500/20";
      case "高":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "开放中":
        return "text-green-400 bg-green-500/20";
      case "即将开放":
        return "text-blue-400 bg-blue-500/20";
      case "已满额":
        return "text-gray-400 bg-gray-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  return (
    <div className="user-page-container">
      {/* Hero Section */}
      <div className="user-page-hero">
        <div className="user-page-hero-content">
          <div className="user-page-hero-icon">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <h1 className="user-page-hero-title">投资入口</h1>
            <p className="user-page-hero-subtitle">
              探索优质投资机会，开启您的财富增值之旅
            </p>
          </div>
        </div>
        <div className="user-page-hero-stats">
          <div className="user-page-stat">
            <span className="user-page-stat-value">4</span>
            <span className="user-page-stat-label">投资项目</span>
          </div>
          <div className="user-page-stat">
            <span className="user-page-stat-value">479</span>
            <span className="user-page-stat-label">活跃投资者</span>
          </div>
          <div className="user-page-stat">
            <span className="user-page-stat-value">15%+</span>
            <span className="user-page-stat-label">平均收益</span>
          </div>
        </div>
      </div>

      {/* 升级提示 */}
      <div className="user-page-upgrade-banner">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              成为投资者，解锁高级功能
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </h3>
            <p className="text-white/70 text-sm">
              投资成功后，您将自动升级为高级用户，获得专属客户中心访问权限
            </p>
          </div>
        </div>
        <Link
          href="/user/invest/apply"
          className="user-page-btn-primary flex items-center gap-2"
        >
          立即申请
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="user-page-tabs">
        <button
          onClick={() => setActiveTab("opportunities")}
          className={`user-page-tab ${activeTab === "opportunities" ? "active" : ""}`}
        >
          <Rocket className="w-4 h-4" />
          投资机会
        </button>
        <button
          onClick={() => setActiveTab("benefits")}
          className={`user-page-tab ${activeTab === "benefits" ? "active" : ""}`}
        >
          <Star className="w-4 h-4" />
          投资者权益
        </button>
        <button
          onClick={() => setActiveTab("process")}
          className={`user-page-tab ${activeTab === "process" ? "active" : ""}`}
        >
          <Target className="w-4 h-4" />
          投资流程
        </button>
      </div>

      {/* Content */}
      <div className="user-page-content">
        {activeTab === "opportunities" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {investmentOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="user-page-card group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                        {opportunity.title}
                      </h3>
                      <span className="text-sm text-white/60">{opportunity.category}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
                    {opportunity.status}
                  </span>
                </div>

                <p className="text-white/70 text-sm mb-4">{opportunity.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {opportunity.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-white/50 mb-1">最低投资</p>
                    <p className="text-lg font-bold text-white">{opportunity.minInvestment}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-white/50 mb-1">预期收益</p>
                    <p className="text-lg font-bold text-green-400">{opportunity.expectedReturn}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">风险等级:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(opportunity.risk)}`}>
                      {opportunity.risk}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Users className="w-4 h-4" />
                    {opportunity.investors} 位投资者
                  </div>
                </div>

                {opportunity.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-white/60">募集进度</span>
                      <span className="text-purple-400 font-medium">{opportunity.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${opportunity.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <Link
                  href="/user/invest/apply"
                  className="user-page-btn-primary w-full flex items-center justify-center gap-2"
                >
                  {opportunity.status === "开放中" ? "立即投资" : "预约投资"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === "benefits" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {investorBenefits.map((benefit, index) => (
              <div key={index} className="user-page-card group">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-white/70">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="md:col-span-2 user-page-card bg-gradient-to-r from-purple-600/30 to-indigo-600/30">
              <div className="text-center">
                <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">准备好开始投资了吗？</h3>
                <p className="text-white/70 mb-6">
                  立即申请成为投资者，解锁所有高级功能和专属权益
                </p>
                <Link
                  href="/user/invest/apply"
                  className="user-page-btn-primary inline-flex items-center gap-2"
                >
                  申请成为投资者
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "process" && (
          <div className="user-page-card">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-400" />
              投资流程
            </h3>
            <div className="space-y-6">
              {[
                { step: 1, title: "提交申请", desc: "填写投资者申请表，提供基本信息和投资意向" },
                { step: 2, title: "资质审核", desc: "我们的团队将审核您的申请，通常在1-3个工作日内完成" },
                { step: 3, title: "签署协议", desc: "审核通过后，在线签署投资协议和相关文件" },
                { step: 4, title: "资金入账", desc: "完成投资款项转账，资金到账后开始计息" },
                { step: 5, title: "升级权限", desc: "投资成功后，自动升级为高级用户，解锁客户中心" },
              ].map((item, index) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{item.step}</span>
                  </div>
                  <div className="flex-1 pb-6 border-b border-white/10 last:border-0">
                    <h4 className="text-lg font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-white/60">{item.desc}</p>
                  </div>
                  {index < 4 && (
                    <CheckCircle className="w-5 h-5 text-green-400 opacity-30" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/user/invest/apply"
                className="user-page-btn-primary inline-flex items-center gap-2"
              >
                开始申请
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

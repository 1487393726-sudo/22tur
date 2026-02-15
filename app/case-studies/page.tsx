 "use client";

import { useState } from "react";
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
  ArrowRight,
  Calendar,
  DollarSign,
  Users,
  Target,
  Award,
  BarChart3,
  PieChart,
  Eye,
  ExternalLink,
  CheckCircle,
  Star,
  Clock
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";


interface CaseStudy {
  id: string;
  title: string;
  titleEn: string;
  client: string;
  clientEn: string;
  industry: string;
  industryEn: string;
  description: string;
  descriptionEn: string;
  challenge: string;
  challengeEn: string;
  solution: string;
  solutionEn: string;
  results: {
    metric: string;
    metricEn: string;
    value: string;
    improvement: string;
  }[];
  timeline: string;
  timelineEn: string;
  investment: number;
  roi: string;
  services: string[];
  servicesEn: string[];
  image: string;
  icon: any;
  color: string;
  featured: boolean;
  completedDate: string;
  testimonial?: {
    quote: string;
    quoteEn: string;
    author: string;
    position: string;
    positionEn: string;
  };
}

const caseStudies: CaseStudy[] = [
  {
    id: "tech-startup-brand",
    title: "AI科技公司完整品牌体系",
    titleEn: "AI Tech Company Complete Brand System",
    client: "智能科技解决方案",
    clientEn: "IntelliTech Solutions",
    industry: "科技",
    industryEn: "Technology",
    description: "为AI科技初创公司从零开始打造完整的品牌识别系统和数字化平台",
    descriptionEn: "Built a complete brand identity system and digital platform from scratch for an AI tech startup",
    challenge: "客户是新成立的AI科技公司，缺乏品牌认知度，需要快速建立专业形象并进入市场",
    challengeEn: "Client was a newly established AI tech company lacking brand recognition, needed to establish professional image and quickly enter the market",
    solution: "提供端到端解决方案：品牌VI设计、网站开发、移动应用、营销物料，确保品牌在所有触点的一致性",
    solutionEn: "We provided end-to-end solutions: brand VI design, website development, mobile app, marketing materials, ensuring brand consistency across all touchpoints",
    results: [
      {
        metric: "",
        metricEn: "Brand Recognition",
        value: "85%",
        improvement: "+85%"
      },
      {
        metric: "",
        metricEn: "Website Conversion",
        value: "12.3%",
        improvement: "+340%"
      },
      {
        metric: "",
        metricEn: "User Growth",
        value: "250%",
        improvement: "+250%"
      },
      {
        metric: "",
        metricEn: "ROI",
        value: "420%",
        improvement: "+420%"
      }
    ],
    timeline: "6",
    timelineEn: "6 months",
    investment: 180000,
    roi: "420%",
    services: ["VI", "", "", "", ""],
    servicesEn: ["Brand VI Design", "Website Development", "Mobile App", "Marketing Materials", "Brand Guidelines"],
    image: "/case-studies/tech-startup.jpg",
    icon: Smartphone,
    color: "purple",
    featured: true,
    completedDate: "2023-12-15",
    testimonial: {
      quote: "",
      quoteEn: "They not only created an outstanding brand image for us, but more importantly established a complete brand management system that helped us stand out in a competitive market.",
      author: "",
      position: "CEO",
      positionEn: "CEO"
    }
  },
  {
    id: "ecommerce-platform",
    title: "",
    titleEn: "E-commerce Platform Brand Consistency Transformation",
    client: "",
    clientEn: "Premium Mall",
    industry: "",
    industryEn: "E-commerce",
    description: "",
    descriptionEn: "Brand consistency transformation for large e-commerce platform, unifying cross-platform user experience",
    challenge: "APP",
    challengeEn: "Client's e-commerce platform had inconsistent brand image across different channels (website, app, social media), affecting user trust",
    solution: "",
    solutionEn: "Established unified brand standards, redesigned all digital touchpoints, built brand management system, trained team to execute brand standards",
    results: [
      {
        metric: "",
        metricEn: "User Trust",
        value: "92%",
        improvement: "+45%"
      },
      {
        metric: "",
        metricEn: "Repeat Purchase",
        value: "68%",
        improvement: "+28%"
      },
      {
        metric: "",
        metricEn: "Brand Consistency",
        value: "95%",
        improvement: "+65%"
      },
      {
        metric: "",
        metricEn: "Sales Growth",
        value: "156%",
        improvement: "+156%"
      }
    ],
    timeline: "8",
    timelineEn: "8 months",
    investment: 320000,
    roi: "280%",
    services: ["", "", "", "", ""],
    servicesEn: ["Brand Audit", "Visual Redesign", "Platform Transformation", "Training Services", "Quality Monitoring"],
    image: "/case-studies/ecommerce-platform.jpg",
    icon: ShoppingBag,
    color: "blue",
    featured: true,
    completedDate: "2023-11-20",
    testimonial: {
      quote: "",
      quoteEn: "The brand consistency transformation has qualitatively improved our user experience, and the sales data growth proves the value of this investment.",
      author: "",
      position: "",
      positionEn: "Marketing Director"
    }
  },
  {
    id: "restaurant-chain",
    title: "",
    titleEn: "Restaurant Chain Brand System Development",
    client: "",
    clientEn: "Flavor Workshop",
    industry: "",
    industryEn: "Food Service",
    description: "",
    descriptionEn: "Established unified brand identity system and digital management platform for restaurant chain",
    challenge: "",
    challengeEn: "Chain restaurants had inconsistent store images across different cities, lacked digital management tools, and had limited brand influence",
    solution: "VI",
    solutionEn: "Designed unified VI system, developed store management system, established brand standard manual, provided staff training and ongoing support",
    results: [
      {
        metric: "",
        metricEn: "Store Consistency",
        value: "98%",
        improvement: "+78%"
      },
      {
        metric: "",
        metricEn: "Customer Satisfaction",
        value: "4.8/5",
        improvement: "+35%"
      },
      {
        metric: "",
        metricEn: "Revenue Growth",
        value: "89%",
        improvement: "+89%"
      },
      {
        metric: "",
        metricEn: "Brand Awareness",
        value: "76%",
        improvement: "+56%"
      }
    ],
    timeline: "10",
    timelineEn: "10 months",
    investment: 450000,
    roi: "320%",
    services: ["VI", "", "", "", ""],
    servicesEn: ["VI Design", "System Development", "Store Renovation", "Staff Training", "Brand Management"],
    image: "/case-studies/restaurant-chain.jpg",
    icon: Building2,
    color: "orange",
    featured: false,
    completedDate: "2023-10-10",
    testimonial: {
      quote: "",
      quoteEn: "The unified brand image makes our chain stores look more professional, customer recognition has greatly improved, and revenue has grown accordingly.",
      author: "",
      position: "",
      positionEn: "Founder"
    }
  },
  {
    id: "clean-energy-investment",
    title: "",
    titleEn: "Clean Energy Project Investment Case",
    client: "",
    clientEn: "Green Energy Group",
    industry: "清洁能源",
    industryEn: "Clean Energy",
    description: "参与清洁能源项目投资，实现可持续发展和财务回报的双重目标",
    descriptionEn: "Participated in clean energy project investment, achieving dual goals of sustainable development and financial returns",
    challenge: "寻找符合ESG投资理念且能提供稳定回报的清洁能源投资机会",
    challengeEn: "Finding clean energy investment opportunities that align with ESG investment philosophy while providing stable returns",
    solution: "深入研究太阳能和风能项目，评估技术可行性和市场前景，制定长期投资策略",
    solutionEn: "Conducted in-depth research on solar and wind energy projects, assessed technical feasibility and market prospects, developed long-term investment strategy",
    results: [
      {
        metric: "",
        metricEn: "Annual Return",
        value: "14.2%",
        improvement: "+14.2%"
      },
      {
        metric: "",
        metricEn: "Carbon Reduction",
        value: "50,000 tons",
        improvement: "50,000 tons"
      },
      {
        metric: "",
        metricEn: "Ownership",
        value: "65%",
        improvement: "+65%"
      },
      {
        metric: "",
        metricEn: "Project Value",
        value: "$2.8M",
        improvement: "+180%"
      }
    ],
    timeline: "3年",
    timelineEn: "3 years",
    investment: 1200000,
    roi: "180%",
    services: ["投资分析", "尽职调查", "风险评估", "项目管理", "退出策略"],
    servicesEn: ["Investment Analysis", "Due Diligence", "Risk Assessment", "Project Management", "Exit Strategy"],
    image: "/case-studies/clean-energy.jpg",
    icon: Zap,
    color: "green",
    featured: true,
    completedDate: "2023-09-30"
  }
];

const industries = [
  { id: "all", name: "", nameEn: "All Industries" },
  { id: "technology", name: "", nameEn: "Technology" },
  { id: "ecommerce", name: "", nameEn: "E-commerce" },
  { id: "food-service", name: "", nameEn: "Food Service" },
  { id: "clean-energy", name: "", nameEn: "Clean Energy" }
];

export default function CaseStudiesPage() {
  const { locale } = useLanguage();
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);

  const filteredCases = caseStudies.filter(caseStudy => {
    return selectedIndustry === "all" || 
      caseStudy.industry.includes(selectedIndustry) ||
      caseStudy.industryEn.toLowerCase().includes(selectedIndustry);
  });

  const featuredCases = caseStudies.filter(c => c.featured);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 全站统一导航菜单 */}
      <Navbar />

      <div className="purple-gradient-page purple-gradient-content space-y-6 p-6 pt-24">
      {/* Header */}
      <section className="purple-gradient-hero py-16 px-4 rounded-2xl">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="purple-gradient-title text-4xl md:text-5xl font-bold mb-6">
              {locale === "en" ? "Success Stories" : ""}
            </h1>
            <p className="purple-gradient-subtitle text-xl max-w-3xl mx-auto">
              {locale === "en" 
                ? "Discover how we've helped businesses achieve remarkable results through strategic investments and comprehensive brand solutions"
                : "了解我们如何通过战略投资和全面的品牌解决方案帮助企业取得卓越成果"
              }
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="purple-gradient-stat">
              <div className="text-3xl font-bold purple-gradient-title mb-2">50+</div>
              <div className="purple-gradient-text text-sm">
                {locale === "en" ? "Successful Projects" : "成功项目"}
              </div>
            </div>
            <div className="purple-gradient-stat">
              <div className="text-3xl font-bold purple-gradient-title mb-2">$12M+</div>
              <div className="purple-gradient-text text-sm">
                {locale === "en" ? "Total Investment" : "总投资额"}
              </div>
            </div>
            <div className="purple-gradient-stat">
              <div className="text-3xl font-bold purple-gradient-title mb-2">285%</div>
              <div className="purple-gradient-text text-sm">
                {locale === "en" ? "Average ROI" : "平均投资回报率"}
              </div>
            </div>
            <div className="purple-gradient-stat">
              <div className="text-3xl font-bold purple-gradient-title mb-2">98%</div>
              <div className="purple-gradient-text text-sm">
                {locale === "en" ? "Client Satisfaction" : "客户满意度"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cases */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">
          {locale === "en" ? "Featured Case Studies" : "精选案例研究"}
        </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredCases.slice(0, 2).map((caseStudy) => {
                const IconComponent = caseStudy.icon;
                return (
                  <div
                    key={caseStudy.id}
                    className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-white/30 transition-all group cursor-pointer"
                    onClick={() => setSelectedCase(caseStudy)}
                  >
                    {/* Image */}
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
                      <IconComponent className="w-16 h-16 text-white/50" />
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                          {locale === "en" ? "Featured" : "精选"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 bg-${caseStudy.color}-500/20 text-${caseStudy.color}-400 text-xs rounded-full`}>
                          {locale === "en" ? caseStudy.industryEn : caseStudy.industry}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(caseStudy.completedDate).toLocaleDateString(locale === "en"  "en-US" : "zh-CN")}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">
                        {locale === "en"  caseStudy.titleEn : caseStudy.title}
                      </h3>

                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {locale === "en"  caseStudy.descriptionEn : caseStudy.description}
                      </p>

                      {/* Key Results */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {caseStudy.results.slice(0, 2).map((result, index) => (
                          <div key={index} className="text-center">
                            <div className="text-lg font-bold text-white">
                              {result.value}
                            </div>
                            <div className="text-xs text-gray-400">
                              {locale === "en"  result.metricEn : result.metric}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          ROI: <span className="text-green-400 font-semibold">{caseStudy.roi}</span>
                        </div>
                        <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                          <span className="text-sm font-medium">
                            {locale === "en"  "View Details" : ""}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Industry Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            {industries.map((industry) => (
              <button
                key={industry.id}
                onClick={() => setSelectedIndustry(industry.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedIndustry === industry.id
                     "bg-gradient-to-r from-primary to-secondary text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {locale === "en"  industry.nameEn : industry.name}
              </button>
            ))}
          </div>

          {/* All Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCases.map((caseStudy) => {
              const IconComponent = caseStudy.icon;
              return (
                <div
                  key={caseStudy.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-white/30 transition-all group cursor-pointer"
                  onClick={() => setSelectedCase(caseStudy)}
                >
                  {/* Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-${caseStudy.color}-500/20`}>
                        <IconComponent className={`w-6 h-6 text-${caseStudy.color}-400`} />
                      </div>
                      {caseStudy.featured && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                          {locale === "en"  "Featured" : ""}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                      {locale === "en"  caseStudy.titleEn : caseStudy.title}
                    </h3>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {locale === "en"  caseStudy.descriptionEn : caseStudy.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {locale === "en"  caseStudy.clientEn : caseStudy.client}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {locale === "en"  caseStudy.timelineEn : caseStudy.timeline}
                      </div>
                    </div>
                  </div>

                  {/* Results Preview */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {caseStudy.results.slice(0, 2).map((result, index) => (
                        <div key={index} className="text-center">
                          <div className="text-lg font-bold text-white">
                            {result.value}
                          </div>
                          <div className="text-xs text-gray-400">
                            {locale === "en"  result.metricEn : result.metric}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        ROI: <span className="text-green-400 font-semibold">{caseStudy.roi}</span>
                      </div>
                      <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                        <span className="text-sm font-medium">
                          {locale === "en"  "Read More" : ""}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              {locale === "en"  "Ready to Create Your Success Story"" : ""}
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              {locale === "en" 
                 "Let's discuss how our investment expertise and brand solutions can help your business achieve similar remarkable results."
                : ""
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/consultation"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {locale === "en"  "Schedule Consultation" : ""}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/investment-opportunities"
                className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
              >
                {locale === "en"  "Explore Investments" : ""}
                <TrendingUp className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

      {/* Case Study Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {locale === "en"  selectedCase.titleEn : selectedCase.title}
              </h2>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {locale === "en"  "Project Overview" : ""}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{locale === "en"  "Client:" : ""}</span>
                      <span className="text-white">{locale === "en"  selectedCase.clientEn : selectedCase.client}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{locale === "en"  "Industry:" : ""}</span>
                      <span className="text-white">{locale === "en"  selectedCase.industryEn : selectedCase.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{locale === "en"  "Timeline:" : ""}</span>
                      <span className="text-white">{locale === "en"  selectedCase.timelineEn : selectedCase.timeline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{locale === "en"  "Investment:" : ""}</span>
                      <span className="text-white">${selectedCase.investment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ROI:</span>
                      <span className="text-green-400 font-semibold">{selectedCase.roi}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {locale === "en"  "Services Provided" : ""}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(locale === "en"  selectedCase.servicesEn : selectedCase.services).map((service, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-white/10 text-white text-sm rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Challenge & Solution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {locale === "en"  "Challenge" : ""}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {locale === "en"  selectedCase.challengeEn : selectedCase.challenge}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {locale === "en"  "Solution" : ""}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {locale === "en"  selectedCase.solutionEn : selectedCase.solution}
                  </p>
                </div>
              </div>

              {/* Results */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {locale === "en"  "Results Achieved" : ""}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedCase.results.map((result, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {result.value}
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        {locale === "en"  result.metricEn : result.metric}
                      </div>
                      <div className="text-xs text-green-400">
                        {result.improvement}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              {selectedCase.testimonial && (
                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {locale === "en"  "Client Testimonial" : ""}
                  </h3>
                  <blockquote className="text-gray-300 italic mb-4">
                    "{locale === "en"  selectedCase.testimonial.quoteEn : selectedCase.testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedCase.testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {selectedCase.testimonial.author}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {locale === "en"  selectedCase.testimonial.positionEn : selectedCase.testimonial.position}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
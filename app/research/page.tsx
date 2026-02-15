"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

import { 
  Download,
  FileText,
  BookOpen,
  BarChart3,
  Target,
  Briefcase,
  PieChart,
  TrendingUp,
  Shield,
  Award,
  CheckCircle,
  Star,
  Calendar,
  Eye,
  Search,
  Filter,
  ArrowRight,
  Users,
  Clock,
  Globe,
  Lightbulb,
  Brain,
  Zap
} from "lucide-react";

interface ResearchReport {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  category: string;
  categoryEn: string;
  type: "Market Analysis" | "Industry Report" | "Trend Study" | "White Paper";
  fileSize: string;
  downloadCount: number;
  rating: number;
  publishDate: string;
  tags: string[];
  tagsEn: string[];
  isPremium: boolean;
  previewAvailable: boolean;
  icon: any;
  color: string;
  readTime: string;
}

const researchReports: ResearchReport[] = [
  {
    id: "ai-investment-trends-2024",
    title: "2024AI",
    titleEn: "AI Investment Trends Report 2024",
    description: "",
    descriptionEn: "In-depth analysis of investment opportunities, risk assessment and future trends in artificial intelligence",
    category: "",
    categoryEn: "Tech Investment",
    type: "Industry Report",
    fileSize: "4.2 MB",
    downloadCount: 3247,
    rating: 4.9,
    publishDate: "2024-01-15",
    tags: ["", "", "", ""],
    tagsEn: ["Artificial Intelligence", "Investment Trends", "Technology", "Future Forecast"],
    isPremium: true,
    previewAvailable: true,
    icon: Brain,
    color: "blue",
    readTime: "25"
  },
  {
    id: "sustainable-investing-guide",
    title: "可持续投资指南",
    titleEn: "Sustainable Investing Guide",
    description: "ESG投资策略、绿色金融产品分析及可持续发展投资机会",
    descriptionEn: "ESG investment strategies, green financial products analysis and sustainable development investment opportunities",
    category: "投资策略",
    categoryEn: "Sustainable Investment",
    type: "White Paper",
    fileSize: "3.8 MB",
    downloadCount: 2156,
    rating: 4.8,
    publishDate: "2024-01-10",
    tags: ["ESG", "绿色金融", "可持续发展", "环保"],
    tagsEn: ["ESG Investment", "Green Finance", "Sustainable Development", "Environmental"],
    isPremium: false,
    previewAvailable: true,
    icon: Shield,
    color: "green",
    readTime: "20"
  },
  {
    id: "crypto-market-analysis",
    title: "",
    titleEn: "Cryptocurrency Market Analysis",
    description: "",
    descriptionEn: "In-depth analysis of digital currency markets including price forecasts, risk assessment and investment strategies",
    category: "",
    categoryEn: "Digital Assets",
    type: "Market Analysis",
    fileSize: "2.9 MB",
    downloadCount: 4123,
    rating: 4.7,
    publishDate: "2024-01-05",
    tags: ["加密货币", "区块链", "数字资产", "市场分析"],
    tagsEn: ["Cryptocurrency", "Blockchain", "Digital Assets", "Market Analysis"],
    isPremium: true,
    previewAvailable: false,
    icon: Zap,
    color: "yellow",
    readTime: "18"
  },
  {
    id: "global-economy-outlook",
    title: "",
    titleEn: "Global Economic Outlook Report",
    description: "2024年全球经济形势分析",
    descriptionEn: "2024 global economic situation analysis, major economies development forecast and investment recommendations",
    category: "",
    categoryEn: "Macroeconomics",
    type: "Trend Study",
    fileSize: "5.1 MB",
    downloadCount: 1876,
    rating: 4.8,
    publishDate: "2023-12-28",
    tags: ["", "", "", ""],
    tagsEn: ["Global Economy", "Macro Analysis", "Economic Forecast", "Investment Advice"],
    isPremium: false,
    previewAvailable: true,
    icon: Globe,
    color: "purple",
    readTime: "30"
  }
];

const categories = [
  { id: "all", name: "", nameEn: "All Research" },
  { id: "tech-investment", name: "", nameEn: "Tech Investment" },
  { id: "sustainable-investment", name: "可持续投资", nameEn: "Sustainable Investment" },
  { id: "digital-assets", name: "", nameEn: "Digital Assets" },
  { id: "macroeconomics", name: "", nameEn: "Macroeconomics" }
];

const reportTypes = [
  { id: "all", name: "", nameEn: "All Types" },
  { id: "Market Analysis", name: "", nameEn: "Market Analysis" },
  { id: "Industry Report", name: "", nameEn: "Industry Report" },
  { id: "Trend Study", name: "", nameEn: "Trend Study" },
  { id: "White Paper", name: "白皮书", nameEn: "White Paper" }
];

export default function ResearchPage() {
  const { locale } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  const filteredReports = researchReports.filter(report => {
    const matchesCategory = selectedCategory === "all" || 
      report.category.toLowerCase().includes(selectedCategory) ||
      report.categoryEn.toLowerCase().includes(selectedCategory);
    
    const matchesType = selectedType === "all" || report.type === selectedType;
    
    const matchesSearch = searchQuery === "" ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPremium = !showPremiumOnly || report.isPremium;
    
    return matchesCategory && matchesType && matchesSearch && matchesPremium;
  });

  const handleDownload = async (reportId: string) => {
    console.log(`Downloading report: ${reportId}`);
    const reportIndex = researchReports.findIndex(r => r.id === reportId);
    if (reportIndex !== -1) {
      researchReports[reportIndex].downloadCount += 1;
    }
  };

  return (
    <div className="purple-gradient-page">
      <div className="purple-gradient-content space-y-6 p-6">
        {/* Header */}
        <section className="relative py-16 px-4">
          <div className="container mx-auto max-w-7xl">
              <div className="text-center mb-12">
                <h1 className="purple-gradient-title text-4xl md:text-5xl font-bold mb-6">
                  {locale === "en" ? "Research Center" : ""}
                </h1>
                <p className="purple-gradient-subtitle text-xl max-w-3xl mx-auto">
                  {locale === "en" 
                    ? "Access cutting-edge research reports, market analysis, and investment insights from our expert team"
                    : ""
                  }
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="purple-gradient-stat">
                  <div className="text-3xl font-bold purple-gradient-title mb-2">25+</div>
                  <div className="purple-gradient-text text-sm">
                    {locale === "en" ? "Research Reports" : ""}
                  </div>
                </div>
                <div className="purple-gradient-stat">
                  <div className="text-3xl font-bold purple-gradient-title mb-2">12K+</div>
                  <div className="purple-gradient-text text-sm">
                    {locale === "en" ? "Total Downloads" : ""}
                  </div>
                </div>
                <div className="purple-gradient-stat">
                  <div className="text-3xl font-bold purple-gradient-title mb-2">4.8</div>
                  <div className="purple-gradient-text text-sm">
                    {locale === "en" ? "Average Rating" : ""}
                  </div>
                </div>
                <div className="purple-gradient-stat">
                  <div className="text-3xl font-bold purple-gradient-title mb-2">Weekly</div>
                  <div className="purple-gradient-text text-sm">
                    {locale === "en" ? "New Updates" : ""}
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="purple-gradient-card p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={locale === "en" ? "Search reports..." : "..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="purple-gradient-input w-full pl-10"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="purple-gradient-input"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {locale === "en" ? category.nameEn : category.name}
                      </option>
                    ))}
                  </select>

                  {/* Type Filter */}
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="purple-gradient-input"
                  >
                    {reportTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {locale === "en" ? type.nameEn : type.name}
                      </option>
                    ))}
                  </select>

                  {/* Premium Filter */}
                  <label className="flex items-center gap-2 purple-gradient-text">
                    <input
                      type="checkbox"
                      checked={showPremiumOnly}
                      onChange={(e) => setShowPremiumOnly(e.target.checked)}
                      className="rounded"
                    />
                    {locale === "en" ? "Premium Only" : ""}
                  </label>
                </div>
              </div>

              {/* Research Reports Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredReports.map((report) => {
                  const IconComponent = report.icon;
                  return (
                    <div key={report.id} className="purple-gradient-card overflow-hidden">
                      {/* Header */}
                      <div className="p-6 border-b border-white/10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-lg bg-${report.color}-500/20`}>
                            <IconComponent className={`w-6 h-6 text-${report.color}-400`} />
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="purple-gradient-text text-sm">{report.rating}</span>
                          </div>
                        </div>
                        
                        <h3 className="purple-gradient-title text-xl font-semibold mb-2">
                          {locale === "en" ? report.titleEn : report.title}
                        </h3>
                        
                        <p className="purple-gradient-text text-sm mb-4">
                          {locale === "en" ? report.descriptionEn : report.description}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 mb-4 text-xs purple-gradient-text opacity-75">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {report.readTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {report.publishDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {report.downloadCount}
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {(locale === "en" ? report.tagsEn : report.tags).slice(0, 3).map((tag, index) => (
                            <span key={index} className="purple-gradient-badge text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="purple-gradient-text text-sm">
                            {locale === "en" ? "File Size:" : "文件大小:"} {report.fileSize}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            report.isPremium 
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : "bg-green-500/20 text-green-400 border border-green-500/30"
                          }`}>
                            {report.isPremium 
                              ? (locale === "en" ? "Premium" : "")
                              : (locale === "en" ? "Free" : "")
                            }
                          </span>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDownload(report.id)}
                            className="purple-gradient-button flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            {locale === "en" ? "Download" : ""}
                          </button>
                          {report.previewAvailable && (
                            <button className="px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* No Results */}
              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <div className="purple-gradient-text mb-4">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">
                      {locale === "en" ? "No reports found" : ""}
                    </h3>
                    <p>
                      {locale === "en" 
                        ? "Try adjusting your search criteria or browse all categories"
                        : ""
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedType("all");
                      setShowPremiumOnly(false);
                    }}
                    className="purple-gradient-button px-6 py-2 rounded-lg"
                  >
                    {locale === "en" ? "Clear Filters" : "清除筛选"}
                  </button>
                </div>
              )}

              {/* CTA Section */}
              <div className="mt-16 purple-gradient-hero rounded-xl p-8 text-center">
                <h2 className="purple-gradient-title text-2xl font-bold mb-4">
                  {locale === "en" ? "Need Custom Research?" : ""}
                </h2>
                <p className="purple-gradient-subtitle mb-6 max-w-2xl mx-auto">
                  {locale === "en" 
                    ? "Our research team can conduct custom studies and analysis tailored to your specific investment needs and market interests."
                    : "我们的研究团队可以根据您的具体投资需求和市场兴趣进行定制研究和分析。"
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="purple-gradient-button inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold">
                    {locale === "en" ? "Request Custom Research" : "申请定制研究"}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button className="inline-flex items-center gap-2 bg-transparent border-2 border-white/20 purple-gradient-text px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                    {locale === "en" ? "Subscribe to Updates" : ""}
                    <Lightbulb className="w-5 h-5" />
                  </button>
                </div>
              </div>
          </div>
        </section>
      </div>
    </div>
  );
}
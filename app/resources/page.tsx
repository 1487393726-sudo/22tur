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
  Globe
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  category: string;
  categoryEn: string;
  type: "PDF" | "Excel" | "PowerPoint" | "Template" | "Checklist";
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
}

const resources: Resource[] = [
  {
    id: "investment-guide-2024",
    title: "2024年投资指南",
    titleEn: "2024 Investment Guide",
    description: "全面的投资策略指南，包括风险评估、资产配置和市场分析",
    descriptionEn: "Comprehensive investment strategy guide including risk assessment, asset allocation and market analysis",
    category: "投资指南",
    categoryEn: "Investment Guides",
    type: "PDF",
    fileSize: "3.2 MB",
    downloadCount: 2847,
    rating: 4.8,
    publishDate: "2024-01-15",
    tags: ["", "", "", ""],
    tagsEn: ["Investment Strategy", "Risk Management", "Asset Allocation", "Market Analysis"],
    isPremium: false,
    previewAvailable: true,
    icon: TrendingUp,
    color: "blue"
  },
  {
    id: "brand-consistency-checklist",
    title: "品牌一致性检查清单",
    titleEn: "Brand Consistency Checklist",
    description: "确保所有接触点品牌一致性的详细检查清单",
    descriptionEn: "Detailed checklist to ensure brand consistency across all touchpoints",
    category: "品牌管理",
    categoryEn: "Brand Management",
    type: "Checklist",
    fileSize: "1.1 MB",
    downloadCount: 1923,
    rating: 4.9,
    publishDate: "2024-01-10",
    tags: ["", "", "?, "?],
    tagsEn: ["Brand Management", "Quality Control", "Checklist", "Standardization"],
    isPremium: false,
    previewAvailable: true,
    icon: CheckCircle,
    color: "green"
  },
  {
    id: "roi-calculator-template",
    title: "",
    titleEn: "ROI Calculator Template",
    description: "Excel",
    descriptionEn: "Excel template to help calculate and analyze returns for different investment projects",
    category: "",
    categoryEn: "Calculation Tools",
    type: "Excel",
    fileSize: "0.8 MB",
    downloadCount: 3156,
    rating: 4.7,
    publishDate: "2024-01-05",
    tags: ["ROI", "", "Excel", ""],
    tagsEn: ["ROI Calculation", "Investment Analysis", "Excel Template", "Financial Tools"],
    isPremium: true,
    previewAvailable: false,
    icon: BarChart3,
    color: "purple"
  },
  {
    id: "market-research-template",
    title: "",
    titleEn: "Market Research Report Template",
    description: "PowerPoint",
    descriptionEn: "Professional market research report PowerPoint template with complete analysis framework",
    category: "",
    categoryEn: "Report Templates",
    type: "PowerPoint",
    fileSize: "2.5 MB",
    downloadCount: 1654,
    rating: 4.6,
    publishDate: "2023-12-28",
    tags: ["", "", "", "PPT"],
    tagsEn: ["Market Research", "Report Template", "Analysis Framework", "PPT Template"],
    isPremium: true,
    previewAvailable: true,
    icon: PieChart,
    color: "orange"
  }
];

const categories = [
  { id: "all", name: "", nameEn: "All Resources" },
  { id: "investment-guides", name: "", nameEn: "Investment Guides" },
  { id: "brand-management", name: "", nameEn: "Brand Management" },
  { id: "calculation-tools", name: "", nameEn: "Calculation Tools" },
  { id: "report-templates", name: "", nameEn: "Report Templates" }
];

const fileTypes = [
  { id: "all", name: "", nameEn: "All Types" },
  { id: "PDF", name: "PDF", nameEn: "PDF Documents" },
  { id: "Excel", name: "Excel", nameEn: "Excel Spreadsheets" },
  { id: "PowerPoint", name: "PPT", nameEn: "PowerPoint Presentations" },
  { id: "Template", name: "", nameEn: "Template Files" },
  { id: "Checklist", name: "?, nameEn: "Checklists" }
];

export default function ResourcesPage() {
  const { locale } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === "all" || 
      resource.category.toLowerCase().includes(selectedCategory) ||
      resource.categoryEn.toLowerCase().includes(selectedCategory);
    
    const matchesType = selectedType === "all" || resource.type === selectedType;
    
    const matchesSearch = searchQuery === "" ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPremium = !showPremiumOnly || resource.isPremium;
    
    return matchesCategory && matchesType && matchesSearch && matchesPremium;
  });

  const handleDownload = async (resourceId: string) => {
    console.log(`Downloading resource: ${resourceId}`);
    const resourceIndex = resources.findIndex(r => r.id === resourceId);
    if (resourceIndex !== -1) {
      resources[resourceIndex].downloadCount += 1;
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
                  {locale === "en" ? "Resource Center" : ""}
                </h1>
                <p className="purple-gradient-subtitle text-xl max-w-3xl mx-auto">
                  {locale === "en" 
                    ? "Download free and premium resources to help you make better investment decisions and build stronger brands"
                    : ""
                  }
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="purple-gradient-stat">
                  <div className="text-3xl font-bold purple-gradient-title mb-2">50+</div>
                  <div className="purple-gradient-text text-sm">
                    {locale === "en" ? "Resources Available" : ""}
                  </div>
                </div>
                <div className="purple-gradient-stat">
                  <div className="text-3xl font-bold purple-gradient-title mb-2">15K+</div>
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
                  <div className="text-3xl font-bold purple-gradient-title mb-2">24/7</div>
                  <div className="purple-gradient-text text-sm">
                    {locale === "en" ? "Access Available" : "?}
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
                      placeholder={locale === "en" ? "Search resources..." : "..."}
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
                    {fileTypes.map(type => (
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

              {/* Resources Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredResources.map((resource) => {
                  const IconComponent = resource.icon;
                  return (
                    <div key={resource.id} className="purple-gradient-card overflow-hidden">
                      {/* Header */}
                      <div className="p-6 border-b border-white/10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-lg bg-${resource.color}-500/20`}>
                            <IconComponent className={`w-6 h-6 text-${resource.color}-400`} />
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="purple-gradient-text text-sm">{resource.rating}</span>
                          </div>
                        </div>
                        
                        <h3 className="purple-gradient-title text-xl font-semibold mb-2">
                          {locale === "en" ? resource.titleEn : resource.title}
                        </h3>
                        
                        <p className="purple-gradient-text text-sm mb-4">
                          {locale === "en" ? resource.descriptionEn : resource.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {(locale === "en" ? resource.tagsEn : resource.tags).slice(0, 3).map((tag, index) => (
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
                            {locale === "en" ? "File Size:" : "?} {resource.fileSize}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            resource.isPremium 
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : "bg-green-500/20 text-green-400 border border-green-500/30"
                          }`}>
                            {resource.isPremium 
                              ? (locale === "en" ? "Premium" : "")
                              : (locale === "en" ? "Free" : "")
                            }
                          </span>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDownload(resource.id)}
                            className="purple-gradient-button flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            {locale === "en" ? "Download" : ""}
                          </button>
                          {resource.previewAvailable && (
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
              {filteredResources.length === 0 && (
                <div className="text-center py-12">
                  <div className="purple-gradient-text mb-4">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">
                      {locale === "en" ? "No resources found" : ""}
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
                    {locale === "en" ? "Clear Filters" : "?}
                  </button>
                </div>
              )}

              {/* CTA Section */}
              <div className="mt-16 purple-gradient-hero rounded-xl p-8 text-center">
                <h2 className="purple-gradient-title text-2xl font-bold mb-4">
                  {locale === "en" ? "Need Custom Resources?" : ""}
                </h2>
                <p className="purple-gradient-subtitle mb-6 max-w-2xl mx-auto">
                  {locale === "en" 
                    ? "Our team can create custom templates, tools, and guides tailored to your specific business needs and industry requirements."
                    : "?
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="purple-gradient-button inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold">
                    {locale === "en" ? "Request Custom Resource" : ""}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button className="inline-flex items-center gap-2 bg-transparent border-2 border-white/20 purple-gradient-text px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                    {locale === "en" ? "Join Premium" : ""}
                    <Star className="w-5 h-5" />
                  </button>
                </div>
              </div>
          </div>
        </section>
      </div>
    </div>
  );
}
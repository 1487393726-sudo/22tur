"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { 
  Building2, 
  Users, 
  Globe, 
  Award, 
  Calendar,
  ExternalLink,
  Search,
  Filter,
  Star,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { CardGrid3D } from "@/components/website/3d/CardGrid3D";
import { Card3D } from "@/components/website/3d/Card3D";
import { PartnerHoverPopup } from "@/components/website/ui/PartnerHoverPopup";


// 合作伙伴数据
const partnersData = [
  {
    id: 1,
    name: "Microsoft Corporation",
    nameZh: "微软公司",
    logo: "/logos/microsoft.svg",
    category: "Technology",
    categoryZh: "科技",
    industry: "Cloud Computing & Software",
    industryZh: "云计算与软件",
    location: "Seattle, USA",
    locationZh: "美国西雅图",
    website: "https://microsoft.com",
    email: "partnerships@microsoft.com",
    phone: "+1-425-882-8080",
    partnerSince: "2019",
    employees: "221,000+",
    revenue: "$211.9B",
    description: "Global leader in cloud computing, productivity software, and enterprise solutions.",
    descriptionZh: "云计算、生产力软件和企业解决方案的全球领导者。",
    projects: [
      {
        name: "Azure Integration Platform",
        nameZh: "Azure集成平台",
        year: "2023",
        value: "$2.5M"
      },
      {
        name: "Office 365 Migration",
        nameZh: "Office 365迁移",
        year: "2022",
        value: "$1.8M"
      }
    ],
    rating: 4.9,
    status: "Active",
    featured: true
  },
  {
    id: 2,
    name: "Google LLC",
    nameZh: "谷歌公司",
    logo: "/logos/google.svg",
    category: "Technology",
    categoryZh: "科技",
    industry: "Search & AI Technology",
    industryZh: "搜索与AI技术",
    location: "Mountain View, USA",
    locationZh: "美国山景城",
    website: "https://google.com",
    email: "partners@google.com",
    phone: "+1-650-253-0000",
    partnerSince: "2020",
    employees: "174,000+",
    revenue: "$307.4B",
    description: "Leading technology company specializing in search, advertising, and cloud services.",
    descriptionZh: "专注于搜索、广告和云服务的领先技术公司。",
    projects: [
      {
        name: "Google Cloud Migration",
        nameZh: "Google云迁移",
        year: "2023",
        value: "$3.2M"
      }
    ],
    rating: 4.8,
    status: "Active",
    featured: true
  },
  {
    id: 3,
    name: "Amazon Web Services",
    nameZh: "亚马逊网络服务",
    logo: "/logos/amazon.svg",
    category: "Technology",
    categoryZh: "科技",
    industry: "Cloud Computing & E-commerce",
    industryZh: "云计算与电子商务",
    location: "Seattle, USA",
    locationZh: "美国西雅图",
    website: "https://aws.amazon.com",
    email: "partners@aws.amazon.com",
    phone: "+1-206-266-1000",
    partnerSince: "2018",
    employees: "1,500,000+",
    revenue: "$514.0B",
    description: "World's most comprehensive and broadly adopted cloud platform.",
    descriptionZh: "世界上最全面、应用最广泛的云平台。",
    projects: [
      {
        name: "AWS Infrastructure Setup",
        nameZh: "AWS基础设施搭建",
        year: "2023",
        value: "$4.1M"
      }
    ],
    rating: 4.7,
    status: "Active",
    featured: false
  },
  {
    id: 4,
    name: "Apple Inc.",
    nameZh: "苹果公司",
    logo: "/logos/apple.svg",
    category: "Technology",
    categoryZh: "科技",
    industry: "Consumer Electronics",
    industryZh: "消费电子产品",
    location: "Cupertino, USA",
    locationZh: "美国库比蒂诺",
    website: "https://apple.com",
    email: "partnerships@apple.com",
    phone: "+1-408-996-1010",
    partnerSince: "2021",
    employees: "164,000+",
    revenue: "$394.3B",
    description: "Innovative technology company known for premium consumer electronics.",
    descriptionZh: "以高端消费电子产品闻名的创新技术公司。",
    projects: [
      {
        name: "iOS App Development",
        nameZh: "iOS应用开发",
        year: "2023",
        value: "$1.9M"
      }
    ],
    rating: 4.9,
    status: "Active",
    featured: false
  },
  {
    id: 5,
    name: "Meta Platforms",
    nameZh: "Meta平台",
    logo: "/logos/meta.svg",
    category: "Technology",
    categoryZh: "科技",
    industry: "Social Media & VR",
    industryZh: "社交媒体与虚拟现实",
    location: "Menlo Park, USA",
    locationZh: "美国门洛帕克",
    website: "https://meta.com",
    email: "partnerships@meta.com",
    phone: "+1-650-543-4800",
    partnerSince: "2022",
    employees: "77,000+",
    revenue: "$134.9B",
    description: "Leading social technology company building the next generation of social connection.",
    descriptionZh: "构建下一代社交连接的领先社交技术公司。",
    projects: [
      {
        name: "VR Experience Platform",
        nameZh: "VR体验平台",
        year: "2023",
        value: "$2.8M"
      }
    ],
    rating: 4.6,
    status: "Active",
    featured: false
  },
  {
    id: 6,
    name: "Tesla Inc.",
    nameZh: "特斯拉公司",
    logo: "/logos/tesla.svg",
    category: "Automotive",
    categoryZh: "汽车",
    industry: "Electric Vehicles & Energy",
    industryZh: "电动汽车与能源",
    location: "Austin, USA",
    locationZh: "美国奥斯汀",
    website: "https://tesla.com",
    email: "partnerships@tesla.com",
    phone: "+1-512-516-8177",
    partnerSince: "2021",
    employees: "127,000+",
    revenue: "$96.8B",
    description: "Leading electric vehicle and clean energy company.",
    descriptionZh: "领先的电动汽车和清洁能源公司。",
    projects: [
      {
        name: "Charging Network Integration",
        nameZh: "充电网络集成",
        year: "2023",
        value: "$3.5M"
      }
    ],
    rating: 4.8,
    status: "Active",
    featured: true
  }
];

const categories = [
  { value: "all", label: "All Categories", labelZh: "所有类别" },
  { value: "Technology", label: "Technology", labelZh: "科技" },
  { value: "Automotive", label: "Automotive", labelZh: "汽车" },
  { value: "Finance", label: "Finance", labelZh: "金融" },
  { value: "Healthcare", label: "Healthcare", labelZh: "医疗" }
];

// 霓虹色彩数组
const neonColors = [
  { bg: "rgba(176, 38, 255, 0.15)", border: "#b026ff", glow: "rgba(176, 38, 255, 0.4)" },
  { bg: "rgba(0, 240, 255, 0.15)", border: "#00f0ff", glow: "rgba(0, 240, 255, 0.4)" },
  { bg: "rgba(255, 42, 109, 0.15)", border: "#ff2a6d", glow: "rgba(255, 42, 109, 0.4)" },
  { bg: "rgba(204, 255, 0, 0.15)", border: "#ccff00", glow: "rgba(204, 255, 0, 0.4)" },
];

export default function PartnersPage() {
  const { locale } = useLanguage();
  const [partners, setPartners] = useState(partnersData);
  const [filteredPartners, setFilteredPartners] = useState(partnersData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState<typeof partnersData[0] | null>(null);

  // 搜索和筛选逻辑
  useEffect(() => {
    let filtered = partners;

    // 按类别筛选
    if (selectedCategory !== "all") {
      filtered = filtered.filter(partner => partner.category === selectedCategory);
    }

    // 按搜索词筛选
    if (searchTerm) {
      filtered = filtered.filter(partner =>
        partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.nameZh.includes(searchTerm) ||
        partner.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.industryZh.includes(searchTerm)
      );
    }

    setFilteredPartners(filtered);
  }, [partners, searchTerm, selectedCategory]);

  const getContent = (zh: string, en: string) => {
    return locale === "en" ? en : zh;
  };

  const featuredPartners = filteredPartners.filter(p => p.featured);
  const regularPartners = filteredPartners.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-[#0a0a0f] artistic-theme artistic-bg">
      {/* 霓虹网格背景 */}
      <div className="fixed inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(176, 38, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(176, 38, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
      }} />
      
      {/* 动态光斑 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#b026ff]/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-[#ff2a6d]/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* 徽章 */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b026ff]/10 border border-[#b026ff]/50 backdrop-blur-sm mb-6">
              <Building2 className="w-4 h-4 text-[#b026ff]" />
              <span className="text-sm font-medium text-white">
                {locale === "en" ? "Our Partners" : "我们的合作伙伴"}
              </span>
            </div>
            
            {/* 标题 - 渐变效果 */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#b026ff] via-[#00f0ff] to-[#ff2a6d] bg-clip-text text-transparent">
              {locale === "en" ? "Trusted Partners" : "信任的合作伙伴"}
            </h1>
            
            {/* 霓虹装饰点 */}
            <div className="flex justify-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#b026ff] shadow-[0_0_10px_#b026ff]" />
              <div className="w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />
              <div className="w-2 h-2 rounded-full bg-[#ff2a6d] shadow-[0_0_10px_#ff2a6d]" />
            </div>
            
            {/* 副标题 */}
            <p className="text-lg text-[#9ca3af] max-w-3xl mx-auto mb-12">
              {locale === "en"
                ? "We collaborate with industry leaders to deliver exceptional solutions and drive innovation together."
                : "我们与行业领导者合作，共同提供卓越的解决方案并推动创新。"
              }
            </p>

            {/* 统计数据 - 霓虹发光 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#b026ff]/50 transition-all duration-300 group">
                <div className="text-3xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(176,38,255,0.8)] group-hover:drop-shadow-[0_0_20px_rgba(176,38,255,1)] transition-all">500+</div>
                <div className="text-sm text-[#9ca3af]">
                  {locale === "en" ? "Global Partners" : "全球合作伙伴"}
                </div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#00f0ff]/50 transition-all duration-300 group">
                <div className="text-3xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] group-hover:drop-shadow-[0_0_20px_rgba(0,240,255,1)] transition-all">50+</div>
                <div className="text-sm text-[#9ca3af]">
                  {locale === "en" ? "Countries" : "个国家"}
                </div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#ff2a6d]/50 transition-all duration-300 group">
                <div className="text-3xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(255,42,109,0.8)] group-hover:drop-shadow-[0_0_20px_rgba(255,42,109,1)] transition-all">$2.5B+</div>
                <div className="text-sm text-[#9ca3af]">
                  {locale === "en" ? "Project Value" : "项目价值"}
                </div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#ccff00]/50 transition-all duration-300 group">
                <div className="text-3xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(204,255,0,0.8)] group-hover:drop-shadow-[0_0_20px_rgba(204,255,0,1)] transition-all">99%</div>
                <div className="text-sm text-[#9ca3af]">
                  {locale === "en" ? "Success Rate" : "成功率"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 搜索和筛选 */}
      <section className="relative py-12 border-b border-white/10">
        <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00f0ff]" />
              <input
                type="text"
                placeholder={locale === "en" ? "Search partners..." : "搜索合作伙伴..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-[#9ca3af]/60 focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all duration-300"
              />
            </div>

            {/* 类别筛选 */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#b026ff]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#b026ff] focus:shadow-[0_0_20px_rgba(176,38,255,0.3)] transition-all duration-300 cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value} className="bg-[#0a0a0f]">
                    {getContent(category.labelZh, category.label)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 霓虹分隔线 */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-[#b026ff] to-transparent opacity-50" />

      {/* 特色合作伙伴 */}
      {featuredPartners.length > 0 && (
        <section className="relative py-16">
          <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-12">
              <Award className="w-5 h-5 text-[#b026ff] drop-shadow-[0_0_10px_rgba(176,38,255,0.8)]" />
              <h2 className="text-2xl font-bold text-white">
                {locale === "en" ? "Featured Partners" : "特色合作伙伴"}
              </h2>
            </div>

            <CardGrid3D
              columns={{ mobile: 1, tablet: 2, desktop: 3 }}
              gap="8"
              staggerDelay={0.15}
              ariaLabel={locale === "en" ? "Featured partners grid" : "特色合作伙伴网格"}
            >
              {featuredPartners.map((partner, index) => {
                const color = neonColors[index % neonColors.length];
                return (
                  <PartnerHoverPopup key={partner.id} partner={partner} locale={locale}>
                    <Card3D
                      intensity="medium"
                      depth="medium"
                      glassEffect="light"
                      onClick={() => setSelectedPartner(partner)}
                      className="p-6 rounded-2xl cursor-pointer bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#b026ff]/50 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(176,38,255,0.3)]"
                      ariaLabel={`${locale === "en" ? "View details for" : "查看详情"} ${getContent(partner.nameZh, partner.name)}`}
                    >
                      {/* 合作伙伴头部 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                            style={{ 
                              backgroundColor: color.bg,
                              boxShadow: `0 0 20px ${color.glow}`
                            }}
                          >
                            <Building2 className="w-6 h-6" style={{ color: color.border }} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-[#00f0ff] transition-colors">
                              {getContent(partner.nameZh, partner.name)}
                            </h3>
                            <p className="text-sm text-[#9ca3af]">
                              {getContent(partner.industryZh, partner.industry)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-[#ccff00] fill-current drop-shadow-[0_0_6px_rgba(204,255,0,0.8)]" />
                          <span className="text-sm font-medium text-white">{partner.rating}</span>
                        </div>
                      </div>

                      {/* 合作伙伴信息 */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                          <MapPin className="w-4 h-4 text-[#00f0ff]" />
                          <span>{getContent(partner.locationZh, partner.location)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                          <Calendar className="w-4 h-4 text-[#ff2a6d]" />
                          <span>
                            {locale === "en" ? "Partner since" : "合作始于"} {partner.partnerSince}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                          <Users className="w-4 h-4 text-[#ccff00]" />
                          <span>{partner.employees} {locale === "en" ? "employees" : "员工"}</span>
                        </div>
                      </div>

                      {/* 描述 */}
                      <p className="text-sm text-[#9ca3af] mb-4 line-clamp-2">
                        {getContent(partner.descriptionZh, partner.description)}
                      </p>

                      {/* 项目统计 */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="text-sm">
                          <span className="font-medium text-[#b026ff]">{partner.projects.length}</span>
                          <span className="text-[#9ca3af] ml-1">
                            {locale === "en" ? "projects" : "个项目"}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#9ca3af] group-hover:text-[#00f0ff] group-hover:translate-x-1 transition-all" />
                      </div>
                    </Card3D>
                  </PartnerHoverPopup>
                );
              })}
            </CardGrid3D>
          </div>
        </section>
      )}

      {/* 霓虹分隔线 */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-50" />

      {/* 所有合作伙伴 */}
      <section className="relative py-16">
        <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-12">
            {locale === "en" ? "All Partners" : "所有合作伙伴"}
            <span className="text-[#9ca3af] ml-2">({filteredPartners.length})</span>
          </h2>

          <CardGrid3D
            columns={{ mobile: 1, tablet: 2, desktop: 4 }}
            gap="6"
            staggerDelay={0.1}
            ariaLabel={locale === "en" ? "All partners grid" : "所有合作伙伴网格"}
          >
            {regularPartners.map((partner, index) => {
              const color = neonColors[(index + 2) % neonColors.length];
              return (
                <PartnerHoverPopup key={partner.id} partner={partner} locale={locale}>
                  <Card3D
                    intensity="light"
                    depth="shallow"
                    glassEffect="light"
                    onClick={() => setSelectedPartner(partner)}
                    className="p-4 rounded-xl cursor-pointer bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#00f0ff]/50 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,240,255,0.3)]"
                    ariaLabel={`${locale === "en" ? "View details for" : "查看详情"} ${getContent(partner.nameZh, partner.name)}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300"
                        style={{ 
                          backgroundColor: color.bg,
                          boxShadow: `0 0 15px ${color.glow}`
                        }}
                      >
                        <Building2 className="w-5 h-5" style={{ color: color.border }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate text-white group-hover:text-[#00f0ff] transition-colors">
                          {getContent(partner.nameZh, partner.name)}
                        </h3>
                        <p className="text-xs text-[#9ca3af] truncate">
                          {getContent(partner.categoryZh, partner.category)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#9ca3af]">
                      <span>{partner.partnerSince}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#ccff00] fill-current drop-shadow-[0_0_4px_rgba(204,255,0,0.8)]" />
                        <span className="text-white">{partner.rating}</span>
                      </div>
                    </div>
                  </Card3D>
                </PartnerHoverPopup>
              );
            })}
          </CardGrid3D>

          {filteredPartners.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-[#b026ff] mx-auto mb-4 drop-shadow-[0_0_20px_rgba(176,38,255,0.5)]" />
              <h3 className="text-lg font-medium text-white mb-2">
                {locale === "en" ? "No partners found" : "未找到合作伙伴"}
              </h3>
              <p className="text-[#9ca3af]">
                {locale === "en" 
                  ? "Try adjusting your search or filter criteria"
                  : "请尝试调整搜索或筛选条件"
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 合作伙伴详情模态框 */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div 
            className="rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-[#0a0a0f] border border-white/20 shadow-[0_0_60px_rgba(176,38,255,0.3)]"
            style={{
              background: 'linear-gradient(135deg, rgba(176,38,255,0.1) 0%, rgba(0,240,255,0.05) 50%, rgba(255,42,109,0.1) 100%)'
            }}
          >
            <div className="p-6">
              {/* 头部 */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{ 
                      backgroundColor: 'rgba(176, 38, 255, 0.2)',
                      boxShadow: '0 0 30px rgba(176, 38, 255, 0.4)'
                    }}
                  >
                    <Building2 className="w-8 h-8 text-[#b026ff]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {getContent(selectedPartner.nameZh, selectedPartner.name)}
                    </h2>
                    <p className="text-[#9ca3af]">
                      {getContent(selectedPartner.industryZh, selectedPartner.industry)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-[#ccff00] fill-current drop-shadow-[0_0_6px_rgba(204,255,0,0.8)]" />
                      <span className="text-sm font-medium text-white">{selectedPartner.rating}</span>
                      <span className="text-sm text-[#9ca3af] ml-2">
                        {locale === "en" ? "Partner since" : "合作始于"} {selectedPartner.partnerSince}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white hover:text-[#ff2a6d]"
                >
                  ✕
                </button>
              </div>

              {/* 详细信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 基本信息 */}
                <div>
                  <h3 className="font-semibold text-white mb-4">
                    {locale === "en" ? "Company Information" : "公司信息"}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#00f0ff]" />
                      <span className="text-sm text-[#9ca3af]">
                        {getContent(selectedPartner.locationZh, selectedPartner.location)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#b026ff]" />
                      <span className="text-sm text-[#9ca3af]">{selectedPartner.employees} {locale === "en" ? "employees" : "员工"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#ff2a6d]" />
                      <span className="text-sm text-[#9ca3af]">{selectedPartner.revenue} {locale === "en" ? "revenue" : "营收"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#ccff00]" />
                      <a 
                        href={selectedPartner.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-[#00f0ff] hover:text-[#b026ff] flex items-center gap-1 transition-colors"
                      >
                        {locale === "en" ? "Visit Website" : "访问网站"}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-white mb-2">
                      {locale === "en" ? "Contact Information" : "联系信息"}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#00f0ff]" />
                        <span className="text-sm text-[#9ca3af]">{selectedPartner.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#ff2a6d]" />
                        <span className="text-sm text-[#9ca3af]">{selectedPartner.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 项目信息 */}
                <div>
                  <h3 className="font-semibold text-white mb-4">
                    {locale === "en" ? "Recent Projects" : "近期项目"}
                  </h3>
                  <div className="space-y-4">
                    {selectedPartner.projects.map((project, index) => (
                      <div 
                        key={index} 
                        className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-[#b026ff]/50 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white">
                            {getContent(project.nameZh, project.name)}
                          </h4>
                          <span className="text-sm text-[#9ca3af]">{project.year}</span>
                        </div>
                        <div className="text-sm text-[#00f0ff] font-medium">{project.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 描述 */}
              <div className="mt-8">
                <h3 className="font-semibold text-white mb-4">
                  {locale === "en" ? "About" : "关于"}
                </h3>
                <p className="text-[#9ca3af] leading-relaxed">
                  {getContent(selectedPartner.descriptionZh, selectedPartner.description)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

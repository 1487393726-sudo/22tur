"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { 
  Palette, 
  Code, 
  Smartphone, 
  Monitor, 
  Layers, 
  Target,
  CheckCircle,
  ArrowRight,
  Star,
  Award,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Eye,
  Lightbulb,
  Briefcase,
  Globe
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ServiceCategory {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: any;
  services: string[];
  servicesEn: string[];
  color: string;
  gradient: string;
}

const serviceCategories: ServiceCategory[] = [
  {
    id: "development",
    name: "项目开发",
    nameEn: "Project Development",
    description: "从概念到上线的完整开发服务，确保技术实现与品牌理念完美融合",
    descriptionEn: "Complete development services from concept to launch, ensuring perfect integration of technology and brand vision",
    icon: Code,
    services: [
      "网站开发", "移动应用", "企业系统", "电商平台", 
      "API接口", "数据库设计", "云端部署", "性能优化"
    ],
    servicesEn: [
      "Website Development", "Mobile Apps", "Enterprise Systems", "E-commerce Platforms",
      "API Integration", "Database Design", "Cloud Deployment", "Performance Optimization"
    ],
    color: "blue",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    id: "design",
    name: "VI设计",
    nameEn: "Visual Identity Design",
    description: "专业的视觉识别系统设计，建立统一的品牌形象和视觉语言",
    descriptionEn: "Professional visual identity system design, establishing unified brand image and visual language",
    icon: Palette,
    services: [
      "LOGO设计", "品牌色彩", "字体系统", "图标设计",
      "名片设计", "宣传物料", "包装设计", "标识系统"
    ],
    servicesEn: [
      "Logo Design", "Brand Colors", "Typography System", "Icon Design",
      "Business Cards", "Marketing Materials", "Packaging Design", "Signage System"
    ],
    color: "purple",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    id: "consistency",
    name: "品牌一致性",
    nameEn: "Brand Consistency",
    description: "确保所有平台和触点的品牌表现统一，提供完整的品牌管理解决方案",
    descriptionEn: "Ensure unified brand presentation across all platforms and touchpoints with complete brand management solutions",
    icon: Target,
    services: [
      "品牌指南", "模板系统", "质量控制", "培训服务",
      "监督执行", "定期审核", "更新维护", "合规检查"
    ],
    servicesEn: [
      "Brand Guidelines", "Template Systems", "Quality Control", "Training Services",
      "Implementation Oversight", "Regular Audits", "Updates & Maintenance", "Compliance Checks"
    ],
    color: "green",
    gradient: "from-green-500 to-green-600"
  }
];

const portfolioItems = [
  {
    id: 1,
    title: "科技公司完整品牌系统",
    titleEn: "Tech Company Complete Brand System",
    category: "Technology",
    image: "/portfolio/tech-brand.jpg",
    description: "为AI科技公司打造的完整品牌识别系统，包含网站开发、移动应用和所有营销物料的统一设计",
    descriptionEn: "Complete brand identity system for AI tech company, including website development, mobile app and unified design for all marketing materials"
  },
  {
    id: 2,
    title: "电商平台品牌一致性",
    titleEn: "E-commerce Platform Brand Consistency",
    category: "E-commerce",
    image: "/portfolio/ecommerce-brand.jpg",
    description: "跨平台电商品牌统一管理，确保在网站、APP、社交媒体等所有渠道的视觉一致性",
    descriptionEn: "Cross-platform e-commerce brand unified management, ensuring visual consistency across website, app, social media and all channels"
  },
  {
    id: 3,
    title: "餐饮连锁品牌系统",
    titleEn: "Restaurant Chain Brand System",
    category: "F&B",
    image: "/portfolio/restaurant-brand.jpg",
    description: "餐饮连锁品牌的完整VI设计和数字化系统开发，实现线上线下品牌体验的完美统一",
    descriptionEn: "Complete VI design and digital system development for restaurant chain, achieving perfect unity of online and offline brand experience"
  }
];

const benefits = [
  {
    icon: Shield,
    title: "品牌保护",
    titleEn: "Brand Protection",
    description: "统一的品牌标准确保品牌价值不被稀释",
    descriptionEn: "Unified brand standards ensure brand value is not diluted"
  },
  {
    icon: TrendingUp,
    title: "提升认知",
    titleEn: "Enhanced Recognition",
    description: "一致的视觉表现提高品牌识别度和记忆度",
    descriptionEn: "Consistent visual presentation improves brand recognition and memorability"
  },
  {
    icon: Users,
    title: "用户信任",
    titleEn: "User Trust",
    description: "专业统一的形象建立用户信任和忠诚度",
    descriptionEn: "Professional unified image builds user trust and loyalty"
  },
  {
    icon: Zap,
    title: "效率提升",
    titleEn: "Efficiency Boost",
    description: "标准化流程和模板提高工作效率",
    descriptionEn: "Standardized processes and templates improve work efficiency"
  }
];

export default function BrandConsistencyPage() {
  const { locale } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("development");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 全站统一导航菜单 */}
      <Navbar />

      <div className="space-y-6 p-6 pt-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20 px-4 rounded-2xl">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-foreground text-4xl md:text-6xl font-bold mb-6">
            {locale === "en" ? "Brand Consistency Services" : "品牌一致性服务"}
          </h1>
          <p className="text-muted-foreground text-xl mb-8 max-w-3xl mx-auto">
            {locale === "en" 
              ? "Complete end-to-end solutions: Project Development + VI Design + Brand Consistency across all platforms and touchpoints"
              : "完整的端到端解决方案：项目开发 + VI设计 + 全平台品牌一致性管理"
            }
          </p>
          
          {/* Service Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-card border border-border p-6 rounded-lg">
              <Code className="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-foreground text-lg font-semibold mb-2">
                {locale === "en" ? "Development" : "项目开发"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {locale === "en" ? "Full-stack development services" : "全栈开发服务"}
              </p>
            </div>
            <div className="bg-card border border-border p-6 rounded-lg">
              <Palette className="w-8 h-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-foreground text-lg font-semibold mb-2">
                {locale === "en" ? "VI Design" : "VI设计"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {locale === "en" ? "Visual identity systems" : "视觉识别系统"}
              </p>
            </div>
            <div className="bg-card border border-border p-6 rounded-lg">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-4" />
              <h3 className="text-foreground text-lg font-semibold mb-2">
                {locale === "en" ? "Consistency" : "一致性管理"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {locale === "en" ? "Brand management across platforms" : "跨平台品牌管理"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-foreground text-3xl md:text-4xl font-bold mb-4">
              {locale === "en" ? "Our Complete Service Suite" : "我们的完整服务套件"}
            </h2>
            <p className="text-muted-foreground text-lg">
              {locale === "en" 
                ? "Three integrated service categories for complete brand consistency"
                : "三大集成服务类别，实现完整的品牌一致性"
              }
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {serviceCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    activeCategory === category.id
                      ? `bg-primary text-primary-foreground`
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {locale === "en" ? category.nameEn : category.name}
                </button>
              );
            })}
          </div>

          {/* Active Category Details */}
          {serviceCategories.map((category) => {
            if (category.id !== activeCategory) return null;
            
            const IconComponent = category.icon;
            return (
              <div key={category.id} className="bg-card border border-border p-8 rounded-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-3 p-3 rounded-lg bg-primary mb-6">
                      <IconComponent className="w-8 h-8 text-primary-foreground" />
                      <h3 className="text-2xl font-bold text-primary-foreground">
                        {locale === "en" ? category.nameEn : category.name}
                      </h3>
                    </div>
                    
                    <p className="text-muted-foreground text-lg mb-6">
                      {locale === "en" ? category.descriptionEn : category.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {(locale === "en" ? category.servicesEn : category.services).map((service, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-foreground text-sm">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="bg-card border border-border p-8 rounded-lg">
                      <div className="text-center">
                        <IconComponent className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h4 className="text-foreground text-xl font-bold mb-2">
                          {locale === "en" ? "Professional Excellence" : "专业卓越"}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {locale === "en" 
                            ? "Industry-leading expertise with proven track record"
                            : "行业领先的专业技能和成功记录"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-foreground text-3xl md:text-4xl font-bold mb-4">
              {locale === "en" ? "Why Brand Consistency Matters" : "为什么品牌一致性很重要"}
            </h2>
            <p className="text-muted-foreground text-lg">
              {locale === "en" 
                ? "The strategic advantages of unified brand management"
                : "统一品牌管理的战略优势"
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="bg-card border border-border p-6 text-center rounded-lg">
                  <div className="bg-primary p-3 rounded-lg w-fit mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-foreground text-lg font-semibold mb-2">
                    {locale === "en" ? benefit.titleEn : benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {locale === "en" ? benefit.descriptionEn : benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-foreground text-3xl md:text-4xl font-bold mb-4">
              {locale === "en" ? "Success Stories" : "成功案例"}
            </h2>
            <p className="text-muted-foreground text-lg">
              {locale === "en" 
                ? "Real projects showcasing our brand consistency expertise"
                : "展示我们品牌一致性专业能力的真实项目"
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portfolioItems.map((item) => (
              <div key={item.id} className="bg-card border border-border overflow-hidden group cursor-pointer rounded-lg">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Briefcase className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-foreground text-lg font-semibold mb-2">
                    {locale === "en" ? item.titleEn : item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {locale === "en" ? item.descriptionEn : item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-foreground text-3xl md:text-4xl font-bold mb-6">
              {locale === "en" ? "Ready to Build Your Brand?" : "准备建立您的品牌了吗？"}
            </h2>
            <p className="text-muted-foreground text-xl mb-8">
              {locale === "en" 
                ? "Let's create a unified brand experience that drives results and builds lasting relationships with your customers."
                : "让我们创建统一的品牌体验，推动业务成果并与客户建立持久关系。"
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-primary text-primary-foreground inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold"
              >
                {locale === "en" ? "Start Your Project" : "开始您的项目"}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/investment-opportunities"
                className="inline-flex items-center gap-2 bg-transparent border-2 border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                {locale === "en" ? "Explore Investments" : "探索投资机会"}
                <TrendingUp className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* 全站统一页脚 */}
      <Footer />
    </div>
  );
}

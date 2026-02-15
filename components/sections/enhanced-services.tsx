"use client";

import { useState, useEffect } from "react";
import { 
  Palette, 
  Code, 
  Lightbulb, 
  Zap,
  ArrowRight,
  Check,
  Award
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";

interface Service {
  id: string;
  icon: React.ReactNode;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  features: string[];
  featuresEn: string[];
  goal: string;
  goalEn: string;
  popular?: boolean;
}

export function EnhancedServicesSection() {
  const { locale } = useLanguage();
  const [activeService, setActiveService] = useState<string | null>(null);
  const [servicesData, setServicesData] = useState<Service[]>([]);

  const defaultServices: Service[] = [
    {
      id: "design-services",
      icon: <Palette className="w-8 h-8" />,
      title: "设计服务",
      titleEn: "Design Services",
      description: "专业的品牌设计和视觉识别系统，打造独特的品牌形象",
      descriptionEn: "Professional brand design and visual identity systems to create unique brand image",
      features: [
        "品牌识别设计", 
        "网站界面设计", 
        "移动应用设计", 
        "印刷品设计", 
        "商店设计", 
        "公司设计", 
        "内部外部设计", 
        "工作服装设计", 
        "3D设计", 
        "模型设计"
      ],
      featuresEn: [
        "Brand Identity Design", 
        "Website UI Design", 
        "Mobile App Design", 
        "Print Design", 
        "Store Design", 
        "Company Design", 
        "Interior & Exterior Design", 
        "Work Uniform Design", 
        "3D Design", 
        "Model Design"
      ],
      goal: "为客户打造完整的视觉识别系统和品牌形象",
      goalEn: "Create comprehensive visual identity systems and brand image for clients",
      popular: true
    },
    {
      id: "development-services",
      icon: <Code className="w-8 h-8" />,
      title: "开发服务",
      titleEn: "Development Services",
      description: "全栈开发解决方案，从网站到移动应用的完整技术实现",
      descriptionEn: "Full-stack development solutions from websites to mobile applications",
      features: [
        "网站开发",
        "移动应用开发", 
        "电商平台开发",
        "小程序开发",
        "电脑桌面应用开发",
        "SAAS平台开发",
        "企业系统开发",
        "定制开发项目",
        "3D产品界面开发",
        "行业全面完整开发"
      ],
      featuresEn: [
        "Website Development",
        "Mobile App Development", 
        "E-commerce Platform Development",
        "Mini Program Development",
        "Desktop Application Development",
        "SAAS Platform Development",
        "Enterprise System Development",
        "Custom Development Projects",
        "3D Product Interface Development",
        "Complete Industry Development"
      ],
      goal: "提供完整的技术解决方案，实现客户的数字化转型",
      goalEn: "Provide complete technical solutions for clients' digital transformation"
    },
    {
      id: "startup-services",
      icon: <Lightbulb className="w-8 h-8" />,
      title: "创业服务",
      titleEn: "Startup Services",
      description: "一站式创业支持服务，从商业计划到市场推广的全方位指导",
      descriptionEn: "One-stop startup support services from business planning to market promotion",
      features: [
        "商业计划定制",
        "创业新项目",
        "投资项目",
        "定制规划项目",
        "定制营销项目",
        "定制管理项目",
        "新的商业模式",
        "维护设计",
        "维护开发",
        "维护项目"
      ],
      featuresEn: [
        "Custom Business Planning",
        "New Startup Projects",
        "Investment Projects",
        "Custom Planning Projects",
        "Custom Marketing Projects",
        "Custom Management Projects",
        "New Business Models",
        "Design Maintenance",
        "Development Maintenance",
        "Project Maintenance"
      ],
      goal: "帮助创业者实现从想法到成功企业的完整转变",
      goalEn: "Help entrepreneurs transform ideas into successful businesses"
    }
  ];

  useEffect(() => {
    // 尝试从API获取服务数据
    fetch("/api/services")
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setServicesData(result.data);
        } else {
          setServicesData(defaultServices);
        }
      })
      .catch(() => {
        setServicesData(defaultServices);
      });
  }, []);

  const getContent = (zh: string, en: string) => {
    return locale === "en" ? en : zh;
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {locale === "en" ? "Our Services" : "我们的服务"}
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {locale === "en" ? "Professional Solutions" : "专业解决方案"}
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {locale === "en" 
              ? "Comprehensive digital services tailored to your business needs with proven results"
              : "为您的业务需求量身定制的全面数字化服务，效果有保障"
            }
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {servicesData.map((service) => (
            <div
              key={service.id}
              className={`group relative p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 cursor-pointer ${
                service.popular 
                  ? 'border-primary bg-gradient-to-br from-primary/5 to-secondary/5' 
                  : 'border-border bg-card/50 backdrop-blur-sm hover:border-primary/50'
              } ${
                activeService === service.id ? 'ring-2 ring-primary' : ''
              }`}
              onMouseEnter={() => setActiveService(service.id)}
              onMouseLeave={() => setActiveService(null)}
            >
              {/* Popular Badge */}
              {service.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold rounded-full">
                  {locale === "en" ? "Most Popular" : "最受欢迎"}
                </div>
              )}

              {/* Service Icon */}
              <div className={`inline-flex p-3 rounded-xl mb-6 transition-colors duration-300 ${
                service.popular 
                  ? 'bg-gradient-to-br from-primary to-secondary text-white' 
                  : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
              }`}>
                {service.icon}
              </div>

              {/* Service Title */}
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                {getContent(service.title, service.titleEn)}
              </h3>

              {/* Service Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {getContent(service.description, service.descriptionEn)}
              </p>

              {/* Service Features */}
              <ul className="space-y-2 mb-6">
                {(locale === "en" ? service.featuresEn : service.features).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Service Goal */}
              <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="text-sm font-semibold text-primary mb-2">
                  {locale === "en" ? "Core Goal" : "核心目标"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {getContent(service.goal, service.goalEn)}
                </p>
              </div>

              {/* CTA */}
              <div className="flex justify-center">
                <Link
                  href={`/services/${service.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-300 text-sm font-medium w-full justify-center"
                >
                  {locale === "en" ? "Learn More" : "了解更多"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Services Overview */}
        <div className="bg-card/30 backdrop-blur-sm border border-border rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-bold mb-6 text-center">
            {locale === "en" ? "Service Overview" : "服务概览"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicesData.map((service) => (
              <div key={service.id} className="text-center p-6 rounded-xl bg-card/50 border border-border/50">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    {service.icon}
                  </div>
                </div>
                <h4 className="font-bold text-lg mb-2">
                  {getContent(service.title, service.titleEn)}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {getContent(service.goal, service.goalEn)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl p-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="w-6 h-6 text-primary" />
            <span className="text-primary font-semibold">
              {locale === "en" ? "Quality Guaranteed" : "品质保证"}
            </span>
          </div>
          
          <h3 className="text-3xl font-bold mb-4">
            {locale === "en" ? "Ready to Start Your Project?" : "准备开始您的项目了吗？"}
          </h3>
          
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {locale === "en" 
              ? "Get a free consultation and detailed project proposal within 24 hours"
              : "24小时内获得免费咨询和详细项目方案"
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 font-semibold"
            >
              {locale === "en" ? "Get Free Quote" : "获取免费报价"}
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-8 py-4 bg-card/50 backdrop-blur-sm border border-border text-foreground rounded-full hover:bg-card hover:border-primary/50 transition-all duration-300 font-semibold"
            >
              {locale === "en" ? "View Portfolio" : "查看作品集"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
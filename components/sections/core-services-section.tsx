"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Palette, Code, Rocket, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { SectionWrapper, SectionTitle } from "./section-wrapper";
import type { ServiceCard } from "@/types/navigation";

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  Code,
  Rocket,
};

// 默认服务数据
const defaultServices: ServiceCard[] = [
  {
    id: "design",
    icon: "Palette",
    title: "设计服务",
    titleEn: "Design Services",
    titleUg: "لايىھەلەش مۇلازىمىتى",
    description: "从品牌标识到用户界面，我们提供全方位的设计解决方案",
    descriptionEn: "From brand identity to user interface, we provide comprehensive design solutions",
    descriptionUg: "ماركا بەلگىسىدىن ئىشلەتكۈچى كۆرۈنمىسىگىچە، بىز ھەر تەرەپلىمە لايىھەلەش يېشىلىشى تەمىنلەيمىز",
    features: ["品牌设计", "UI/UX设计", "视觉设计", "动效设计"],
    featuresEn: ["Brand Design", "UI/UX Design", "Visual Design", "Motion Design"],
    featuresUg: ["ماركا لايىھەلەش", "UI/UX لايىھەلەش", "كۆرۈنۈش لايىھەلەش", "ھەرىكەت لايىھەلەش"],
    href: "/services/design",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "development",
    icon: "Code",
    title: "开发服务",
    titleEn: "Development Services",
    titleUg: "ئىجرا قىلىش مۇلازىمىتى",
    description: "专业的网站和应用开发，让您的想法变为现实",
    descriptionEn: "Professional website and app development to bring your ideas to life",
    descriptionUg: "كەسپىي توربېت ۋە ئەپ ئىجرا قىلىش، ئويلىرىڭىزنى ھەقىقەتكە ئايلاندۇرۇش",
    features: ["网站开发", "移动应用", "系统定制", "API开发"],
    featuresEn: ["Web Development", "Mobile Apps", "Custom Systems", "API Development"],
    featuresUg: ["توربېت ئىجرا قىلىش", "كۆچمە ئەپلەر", "خاس سىستېما", "API ئىجرا قىلىش"],
    href: "/services/development",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "startup",
    icon: "Rocket",
    title: "创业投资",
    titleEn: "Startup & Investment",
    titleUg: "كارخانا قۇرۇش ۋە مەبلەغ سېلىش",
    description: "为创业者和投资者搭建桥梁，共创价值",
    descriptionEn: "Building bridges between entrepreneurs and investors to create value together",
    descriptionUg: "كارخانا قۇرغۇچىلار ۋە مەبلەغ سالغۇچىلار ئارىسىدا كۆۋرۈك قۇرۇپ، بىللە قىممەت يارىتىش",
    features: ["投资机会", "创业孵化", "商业咨询", "资源对接"],
    featuresEn: ["Investment Opportunities", "Startup Incubation", "Business Consulting", "Resource Connection"],
    featuresUg: ["مەبلەغ سېلىش پۇرسىتى", "كارخانا ئېچىش", "سودا مەسلىھەت", "بايلىق ئۇلىنىشى"],
    href: "/investment-opportunities",
    color: "from-purple-500 to-violet-500",
  },
];

interface ServiceCardComponentProps {
  service: ServiceCard;
  index: number;
  language: string;
}

function ServiceCardComponent({ service, index, language }: ServiceCardComponentProps) {
  const Icon = iconMap[service.icon] || Palette;
  
  // Helper function to get text based on language
  const getText = (zh: string, en?: string, ug?: string) => {
    if (language === "en" && en) return en;
    if (language === "ug" && ug) return ug;
    return zh;
  };
  
  const title = getText(service.title, service.titleEn, service.titleUg);
  const description = getText(service.description, service.descriptionEn, service.descriptionUg);
  const features = language === "en" && service.featuresEn 
    ? service.featuresEn 
    : language === "ug" && service.featuresUg 
      ? service.featuresUg 
      : service.features;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={service.href}
        className={cn(
          "group relative block p-6 md:p-8 rounded-2xl",
          "bg-gradient-to-br from-background to-muted/30",
          "border border-border/50 hover:border-primary/30",
          "transition-all duration-300",
          "hover:shadow-xl hover:shadow-primary/5",
          "hover:-translate-y-1"
        )}
      >
        {/* 图标 */}
        <div
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center mb-6",
            "bg-gradient-to-br",
            service.color,
            "shadow-lg"
          )}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* 标题 */}
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* 描述 */}
        <p className="text-muted-foreground mb-6 line-clamp-2">
          {description}
        </p>

        {/* 特性列表 */}
        <ul className="space-y-2 mb-6">
          {features.slice(0, 4).map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={cn("w-1.5 h-1.5 rounded-full bg-gradient-to-r", service.color)} />
              {feature}
            </li>
          ))}
        </ul>

        {/* 了解更多 */}
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <span>{language === "en" ? "Learn More" : language === "ug" ? "تېخىمۇ كۆپ بىلىش" : "了解更多"}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* 悬停装饰 */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            "bg-gradient-to-br",
            service.color,
            "blur-xl -z-10"
          )}
          style={{ transform: "scale(0.9)", filter: "blur(40px)", opacity: 0.1 }}
        />
      </Link>
    </motion.div>
  );
}

interface CoreServicesSectionProps {
  services?: ServiceCard[];
  className?: string;
}

export function CoreServicesSection({ services = defaultServices, className }: CoreServicesSectionProps) {
  const { language } = useLanguage();

  // Helper function to get text based on language
  const getText = (zh: string, en: string, ug: string) => {
    if (language === "en") return en;
    if (language === "ug") return ug;
    return zh;
  };

  return (
    <SectionWrapper id="services" background="default" className={className}>
      <SectionTitle
        title={getText("核心服务", "Our Core Services", "يادرولۇق مۇلازىمەت")}
        subtitle={getText(
          "我们提供全方位的解决方案，助力您的业务增长",
          "We provide comprehensive solutions to help your business grow",
          "بىز سىزنىڭ سودىڭىزنىڭ ئۆسۈشىگە ياردەم قىلىدىغان ھەر تەرەپلىمە يېشىلىش تەمىنلەيمىز"
        )}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {services.map((service, index) => (
          <ServiceCardComponent
            key={service.id}
            service={service}
            index={index}
            language={language}
          />
        ))}
      </div>

      {/* 底部 CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 text-center"
      >
        <Link
          href="/services"
          className={cn(
            "inline-flex items-center gap-2 px-6 py-3 rounded-lg",
            "bg-muted/50 hover:bg-muted",
            "text-foreground font-medium",
            "transition-colors duration-200"
          )}
        >
          {getText("查看全部服务", "View All Services", "بارلىق مۇلازىمەتلەرنى كۆرۈش")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </SectionWrapper>
  );
}

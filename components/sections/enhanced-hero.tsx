"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Play } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";
import { VisitorStats } from "@/components/analytics/visitor-stats";

interface HeroData {
  title?: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
}

export function EnhancedHeroSection() {
  const { locale } = useLanguage();
  const [heroData, setHeroData] = useState<HeroData | null>(null);

  useEffect(() => {
    fetch("/api/homepage/hero")
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setHeroData(result.data);
        }
      })
      .catch(() => {
        // Fallback to static content on error
      });
  }, []);

  const getContent = (zh: string | null | undefined, en: string | null | undefined, fallback: string) => {
    if (locale === "en") {
      return en || zh || fallback;
    }
    return zh || en || fallback;
  };

  const title = heroData 
    ? getContent(heroData.title, heroData.titleEn, locale === "en" ? "Professional Web Development Services" : "专业的网站开发服务")
    : (locale === "en" ? "Professional Web Development Services" : "专业的网站开发服务");
  
  const subtitle = heroData 
    ? getContent(heroData.subtitle, heroData.subtitleEn, locale === "en" ? "We create quality websites and applications for businesses. Clear pricing, honest communication, reliable delivery." : "我们为企业创建优质的网站和应用程序。透明定价，诚实沟通，可靠交付。")
    : (locale === "en" ? "We create quality websites and applications for businesses. Clear pricing, honest communication, reliable delivery." : "我们为企业创建优质的网站和应用程序。透明定价，诚实沟通，可靠交付。");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 md:py-0">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background pointer-events-none" />

      <div className="relative z-10 container px-4 md:px-6 flex flex-col items-center text-center max-w-4xl mx-auto">
        
        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-8 animate-in fade-in zoom-in duration-1000">
          <span className="block bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent text-balance">
            {title}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-[700px] leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 text-balance">
          {subtitle}
        </p>

        {/* Live Stats Bar */}
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <VisitorStats />
        </div>

        {/* CTA Buttons */}
        <div className="mt-16 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
          <Link
            href="/portfolio"
            className="group relative px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
          >
            <span className="relative z-10 font-medium tracking-wide flex items-center gap-2 justify-center">
              {locale === "en" ? "View Our Work" : "查看我们的作品"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/contact"
            className="group relative px-8 py-4 bg-card/50 backdrop-blur-sm border border-border text-foreground rounded-lg transition-all duration-300 hover:bg-card hover:border-primary/50"
          >
            <span className="relative z-10 font-medium tracking-wide">
              {locale === "en" ? "Get in Touch" : "联系我们"}
            </span>
          </Link>
        </div>

        {/* Simple Contact Info */}
        <div className="mt-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <p className="text-sm text-muted-foreground mb-2">
            {locale === "en" ? "Ready to discuss your project?" : "准备讨论您的项目了吗？"}
          </p>
          <p className="text-sm text-muted-foreground">
            {locale === "en" ? "We respond to all inquiries within 24 hours" : "我们会在24小时内回复所有咨询"}
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-gradient-to-b from-primary to-transparent rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
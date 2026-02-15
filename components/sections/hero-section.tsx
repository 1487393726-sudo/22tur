"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import type { HeroConfig } from "@/types/navigation";

// 默认配置
const defaultHeroConfig: HeroConfig = {
  title: "创意驱动增长",
  titleEn: "Creativity Drives Growth",
  subtitle: "我们为企业提供专业的设计、开发和数字化转型服务，助力品牌在数字时代脱颖而出",
  subtitleEn: "We provide professional design, development and digital transformation services to help brands stand out in the digital age",
  primaryCTA: {
    text: "立即咨询",
    textEn: "Get Started",
    href: "/contact",
  },
  secondaryCTA: {
    text: "了解更多",
    textEn: "Learn More",
    href: "/about",
  },
  backgroundType: "gradient",
};

interface HeroSectionProps {
  config?: Partial<HeroConfig>;
  className?: string;
}

export function HeroSection({ config, className }: HeroSectionProps) {
  const { language } = useLanguage();
  const [heroData, setHeroData] = useState<HeroConfig>(defaultHeroConfig);

  // 从 API 获取数据
  useEffect(() => {
    fetch("/api/homepage/hero")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          setHeroData({
            ...defaultHeroConfig,
            title: result.data.title || defaultHeroConfig.title,
            titleEn: result.data.titleEn || defaultHeroConfig.titleEn,
            subtitle: result.data.subtitle || defaultHeroConfig.subtitle,
            subtitleEn: result.data.subtitleEn || defaultHeroConfig.subtitleEn,
            primaryCTA: {
              text: result.data.ctaText || defaultHeroConfig.primaryCTA.text,
              textEn: result.data.ctaTextEn || defaultHeroConfig.primaryCTA.textEn,
              href: result.data.ctaLink || defaultHeroConfig.primaryCTA.href,
            },
            secondaryCTA: result.data.ctaSecondaryText
              ? {
                  text: result.data.ctaSecondaryText,
                  textEn: result.data.ctaSecondaryTextEn,
                  href: result.data.ctaSecondaryLink || "/about",
                }
              : defaultHeroConfig.secondaryCTA,
          });
        }
      })
      .catch(() => {
        // 使用默认配置
      });
  }, []);

  // 合并配置
  const finalConfig = { ...heroData, ...config };

  // 获取本地化文本
  const getText = (zh: string, en?: string, ug?: string) => {
    if (language === "en" && en) return en;
    if (language === "ug" && ug) return ug;
    return zh;
  };

  const title = getText(finalConfig.title, finalConfig.titleEn);
  const subtitle = getText(finalConfig.subtitle, finalConfig.subtitleEn);
  const primaryText = getText(
    finalConfig.primaryCTA.text,
    finalConfig.primaryCTA.textEn
  );
  const secondaryText = finalConfig.secondaryCTA
    ? getText(finalConfig.secondaryCTA.text, finalConfig.secondaryCTA.textEn)
    : null;

  return (
    <section
      className={cn(
        "relative min-h-screen flex items-center justify-center overflow-hidden",
        className
      )}
    >
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      {/* 装饰性元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* 内容区域 */}
      <div className="relative z-10 container px-4 md:px-6 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* 左侧文字内容 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center lg:text-left"
          >
            {/* 标签 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {getText("专业服务", "Professional Services", "كەسپىي مۇلازىمەت")}
              </span>
            </motion.div>

            {/* 主标题 */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              <span className="text-foreground">
                {title.split(" ").slice(0, -1).join(" ")}{" "}
              </span>
              <span className="text-primary">
                {title.split(" ").slice(-1)}
              </span>
            </motion.h1>

            {/* 副标题 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8"
            >
              {subtitle}
            </motion.p>

            {/* CTA 按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                asChild
                size="lg"
                className="group bg-primary hover:bg-primary/90 text-white px-8"
              >
                <Link href={finalConfig.primaryCTA.href}>
                  {primaryText}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              {secondaryText && finalConfig.secondaryCTA && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="group px-8"
                >
                  <Link href={finalConfig.secondaryCTA.href}>
                    <Play className="mr-2 w-4 h-4" />
                    {secondaryText}
                  </Link>
                </Button>
              )}
            </motion.div>

            {/* 统计数据 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap gap-8 justify-center lg:justify-start mt-12 pt-8 border-t border-border/50"
            >
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary">
                  100+
                </div>
                <div className="text-sm text-muted-foreground">
                  {getText("满意客户", "Happy Clients", "قانائەتلەنگەن خېرىدارلار")}
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary">
                  200+
                </div>
                <div className="text-sm text-muted-foreground">
                  {getText("完成项目", "Projects Completed", "تامامالنغان تۈرلەر")}
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary">
                  5+
                </div>
                <div className="text-sm text-muted-foreground">
                  {getText("年经验", "Years Experience", "يىللىق تەجرىبە")}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* 右侧视觉区域 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* 装饰性圆环 */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-spin-slow" />
              <div className="absolute inset-8 rounded-full border-2 border-dashed border-secondary/20 animate-spin-slow-reverse" />
              
              {/* 中心内容 */}
              <div className="absolute inset-16 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary">
                    C
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    CREATIVE
                  </div>
                </div>
              </div>

              {/* 浮动卡片 */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 p-4 rounded-xl bg-background/80 backdrop-blur-sm border border-border shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {getText("在线", "Online", "توردا")}
                    </div>
                    <div className="text-sm font-medium">
                      {getText("全天候支持", "24/7 Support", "24/7 قوللاش")}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-0 left-0 p-4 rounded-xl bg-background/80 backdrop-blur-sm border border-border shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {getText("品质", "Quality", "سۈپەت")}
                    </div>
                    <div className="text-sm font-medium">
                      {getText("优质服务", "Premium Service", "ئالىي مۇلازىمەت")}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 滚动指示器 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {getText("向下滚动探索", "Scroll to explore", "تۆۋەنگە سىيرىلىپ ئىزدەڭ")}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-3 rounded-full bg-primary" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import type { CTAConfig } from "@/types/navigation";

// 默认配置
const defaultCTAConfig: CTAConfig = {
  title: "准备好开始您的项目了吗？",
  titleEn: "Ready to Start Your Project?",
  subtitle: "让我们一起将您的想法变为现实，打造独特的数字体验",
  subtitleEn: "Let's turn your ideas into reality and create unique digital experiences together",
  primaryButton: {
    text: "免费咨询",
    textEn: "Free Consultation",
    href: "/contact",
  },
  secondaryButton: {
    text: "查看定价",
    textEn: "View Pricing",
    href: "/pricing",
  },
  background: "gradient",
};

interface CTASectionNewProps {
  config?: Partial<CTAConfig>;
  className?: string;
}

export function CTASectionNew({ config, className }: CTASectionNewProps) {
  const { language } = useLanguage();
  const finalConfig = { ...defaultCTAConfig, ...config };

  // 获取本地化文本
  const getText = (zh: string, en?: string, ug?: string) => {
    if (language === "en" && en) return en;
    if (language === "ug" && ug) return ug;
    return zh;
  };

  const title = getText(
    finalConfig.title, 
    finalConfig.titleEn,
    "تۈرىڭىزنى باشلاشقا تەييارمۇ؟"
  );
  const subtitle = getText(
    finalConfig.subtitle || "", 
    finalConfig.subtitleEn,
    "ئويلىرىڭىزنى ھەقىقەتكە ئايلاندۇرۇپ، ئالاھىدە رەقەملىك تەجرىبە يارىتايلى"
  );
  const primaryText = getText(
    finalConfig.primaryButton.text,
    finalConfig.primaryButton.textEn || "",
    "ھەقسىز مەسلىھەت"
  );
  const secondaryText = finalConfig.secondaryButton
    ? getText(
        finalConfig.secondaryButton.text, 
        finalConfig.secondaryButton.textEn,
        "باھانى كۆرۈش"
      )
    : null;

  return (
    <section
      className={cn(
        "relative py-20 md:py-28 overflow-hidden",
        className
      )}
    >
      {/* 背景 */}
      <div className="absolute inset-0 bg-primary" />
      
      {/* 装饰性元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        {/* 网格图案 */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* 内容 */}
      <div className="relative z-10 container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* 图标 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-8"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>

          {/* 标题 */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            {title}
          </motion.h2>

          {/* 副标题 */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
            >
              {subtitle}
            </motion.p>
          )}

          {/* 按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 px-8 shadow-xl"
            >
              <Link href={finalConfig.primaryButton.href}>
                {primaryText}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>

            {secondaryText && finalConfig.secondaryButton && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8"
              >
                <Link href={finalConfig.secondaryButton.href}>
                  {secondaryText}
                </Link>
              </Button>
            )}
          </motion.div>

          {/* 信任标识 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-white/20"
          >
            <p className="text-sm text-white/60 mb-4">
              {getText("受到领先企业的信赖", "Trusted by leading companies", "ئالدىنقى كارخانىلارنىڭ ئىشەنچىسىگە ئېرىشتى")}
            </p>
            <div className="flex flex-wrap justify-center gap-8 opacity-60">
              {/* 这里可以添加客户 Logo */}
              <div className="text-white font-bold">Company A</div>
              <div className="text-white font-bold">Company B</div>
              <div className="text-white font-bold">Company C</div>
              <div className="text-white font-bold">Company D</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

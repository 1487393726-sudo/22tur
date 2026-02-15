"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { SectionWrapper } from "./section-wrapper";
import { AnimatedCounter, StatsRow } from "@/components/ui/animated-counter";
import { LazyImage } from "@/components/ui/lazy-image";
import type { AboutConfig, StatItem } from "@/types/navigation";

// 默认配置
const defaultAboutConfig: AboutConfig = {
  title: "关于我们",
  titleEn: "About Us",
  description: "我们是一支充满激情的创意团队，致力于为客户提供卓越的设计和开发服务。凭借多年的行业经验，我们帮助众多企业实现数字化转型，打造独特的品牌形象。",
  descriptionEn: "We are a passionate creative team dedicated to providing excellent design and development services. With years of industry experience, we help businesses achieve digital transformation and build unique brand identities.",
  stats: [
    { id: "1", value: 100, label: "满意客户", labelEn: "Happy Clients", labelUg: "قانائەتلەنگەن خېرىدارلار", suffix: "+" },
    { id: "2", value: 200, label: "完成项目", labelEn: "Projects Done", labelUg: "تامامالنغان تۈرلەر", suffix: "+" },
    { id: "3", value: 5, label: "年经验", labelEn: "Years Experience", labelUg: "يىللىق تەجرىبە", suffix: "+" },
    { id: "4", value: 98, label: "客户满意度", labelEn: "Satisfaction Rate", labelUg: "قانائەتلىنىش نىسبىتى", suffix: "%" },
  ],
};

// 特性列表
const features = [
  { zh: "专业的设计团队", en: "Professional Design Team", ug: "كەسپىي لايىھەلەش گۇرۇپپىسى" },
  { zh: "敏捷的开发流程", en: "Agile Development Process", ug: "چاققان ئىجرا قىلىش جەريانى" },
  { zh: "全程项目跟踪", en: "Full Project Tracking", ug: "تولۇق تۈر ئىز قوغلاش" },
  { zh: "7x24小时支持", en: "24/7 Support", ug: "7x24 سائەت قوللاش" },
];

interface AboutSectionNewProps {
  config?: Partial<AboutConfig>;
  className?: string;
}

export function AboutSectionNew({ config, className }: AboutSectionNewProps) {
  const { language } = useLanguage();
  const [aboutData, setAboutData] = useState<AboutConfig>(defaultAboutConfig);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // 从 API 获取数据
  useEffect(() => {
    fetch("/api/homepage/about")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          const data = result.data;
          setAboutData({
            title: data.title || defaultAboutConfig.title,
            titleEn: data.titleEn || defaultAboutConfig.titleEn,
            description: data.description || defaultAboutConfig.description,
            descriptionEn: data.descriptionEn || defaultAboutConfig.descriptionEn,
            image: data.image,
            video: data.video,
            stats: data.stats?.length > 0
              ? data.stats.map((s: any) => ({
                  id: s.id,
                  value: parseInt(s.value) || s.value,
                  label: s.label,
                  labelEn: s.labelEn,
                  suffix: s.value.includes("+") ? "+" : s.value.includes("%") ? "%" : "",
                }))
              : defaultAboutConfig.stats,
          });
        }
      })
      .catch(() => {
        // 使用默认配置
      });
  }, []);

  // 合并配置
  const finalConfig = { ...aboutData, ...config };

  // 获取本地化文本
  const getText = (zh: string, en?: string, ug?: string) => {
    if (language === "en" && en) return en;
    if (language === "ug" && ug) return ug;
    return zh;
  };

  const title = getText(finalConfig.title, finalConfig.titleEn);
  const description = getText(finalConfig.description, finalConfig.descriptionEn);

  return (
    <SectionWrapper id="about" background="gradient" className={className}>
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* 左侧媒体区域 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            {/* 图片/视频 */}
            {finalConfig.video && isVideoPlaying ? (
              <video
                src={finalConfig.video}
                autoPlay
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-primary/20" />
                {finalConfig.image && (
                  <LazyImage
                    src={finalConfig.image}
                    alt={title}
                    fill
                    className="absolute inset-0"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                )}
                
                {/* 播放按钮 */}
                {finalConfig.video && (
                  <button
                    onClick={() => setIsVideoPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-primary ml-1" />
                    </div>
                  </button>
                )}
              </>
            )}
          </div>

          {/* 装饰元素 */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-2xl -z-10" />
          <div className="absolute -top-6 -left-6 w-24 h-24 border-2 border-primary/30 rounded-2xl -z-10" />
        </motion.div>

        {/* 右侧内容区域 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* 标签 */}
          <span className="inline-block px-4 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-full mb-4">
            {getText("关于我们", "Who We Are", "بىز ھەققىدە")}
          </span>

          {/* 标题 */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>

          {/* 描述 */}
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {description}
          </p>

          {/* 特性列表 */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">
                  {getText(feature.zh, feature.en, feature.ug)}
                </span>
              </motion.div>
            ))}
          </div>

          {/* 统计数据 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="pt-8 border-t border-border"
          >
            <StatsRow
              stats={finalConfig.stats.map((stat) => ({
                value: stat.value,
                label: getText(stat.label, stat.labelEn, stat.labelUg),
                suffix: stat.suffix,
                prefix: stat.prefix,
              }))}
            />
          </motion.div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

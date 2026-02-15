"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Users, Target, Zap, Heart, Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import type { AboutSection as AboutData } from "@/types/homepage";

const defaultValues = [
  {
    icon: Target,
    title: "Innovation First",
    titleZh: "创新优先",
    description: "We push boundaries and embrace cutting-edge technologies to deliver solutions that set new standards.",
    descriptionZh: "我们突破边界，拥抱前沿技术，提供设定新标准的解决方案。",
  },
  {
    icon: Users,
    title: "Client-Centric",
    titleZh: "以客户为中心",
    description: "Your success is our success. We build lasting partnerships based on trust, transparency, and results.",
    descriptionZh: "您的成功就是我们的成功。我们建立基于信任、透明和成果的持久合作关系。",
  },
  {
    icon: Zap,
    title: "Agile Excellence",
    titleZh: "敏捷卓越",
    description: "Fast iteration, continuous improvement, and adaptability drive our development process.",
    descriptionZh: "快速迭代、持续改进和适应性驱动我们的开发流程。",
  },
  {
    icon: Heart,
    title: "Passionate Craft",
    titleZh: "匠心精神",
    description: "We love what we do, and it shows in every pixel, every line of code, and every user interaction.",
    descriptionZh: "我们热爱我们所做的事情，这体现在每一个像素、每一行代码和每一次用户交互中。",
  },
];

const defaultAchievements = [
  { number: "99%", label: "Client Satisfaction", labelZh: "客户满意度" },
  { number: "5★", label: "Average Rating", labelZh: "平均评分" },
  { number: "24/7", label: "Support Available", labelZh: "全天候支持" },
  { number: "100%", label: "On-Time Delivery", labelZh: "准时交付" },
];

export function AboutSection() {
  const { t, locale } = useLanguage();
  const [aboutData, setAboutData] = useState<AboutData | null>(null);

  useEffect(() => {
    fetch("/api/homepage/about")
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setAboutData(result.data);
        }
      })
      .catch(() => {
        // Fallback to static content on error
      });
  }, []);

  // Helper to get localized content
  const getContent = (zh: string | null | undefined, en: string | null | undefined, fallback: string) => {
    if (locale === "en") {
      return en || zh || fallback;
    }
    return zh || en || fallback;
  };

  const title = aboutData 
    ? getContent(aboutData.title, aboutData.titleEn, t.about.title)
    : t.about.title;
  const description = aboutData 
    ? getContent(aboutData.description, aboutData.descriptionEn, t.about.subtitle)
    : t.about.subtitle;

  // Use API stats or default achievements
  const stats = aboutData?.stats && aboutData.stats.length > 0
    ? aboutData.stats.map(stat => ({
        number: stat.value,
        label: locale === "en" ? (stat.labelEn || stat.label) : stat.label,
      }))
    : defaultAchievements.map(a => ({
        number: a.number,
        label: locale === "en" ? a.label : a.labelZh,
      }));

  // Use API features or default values
  const features = aboutData?.features && aboutData.features.length > 0
    ? aboutData.features.map((feature, index) => ({
        icon: defaultValues[index % defaultValues.length].icon,
        title: locale === "en" ? (feature.titleEn || feature.title) : feature.title,
        description: locale === "en" 
          ? (feature.descriptionEn || feature.description || "") 
          : (feature.description || feature.descriptionEn || ""),
      }))
    : defaultValues.map(v => ({
        icon: v.icon,
        title: locale === "en" ? v.title : v.titleZh,
        description: locale === "en" ? v.description : v.descriptionZh,
      }));

  return (
    <section
      id="about"
      className="relative py-24 md:py-40 overflow-hidden bg-gradient-to-b from-muted/10 to-background"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="relative container px-4 md:px-6 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-6">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {t.about.badge}
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent text-balance">
              {title}
            </span>
          </h2>

          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed text-balance max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-24">
          <div className="space-y-8">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              {t.about.storyTitle}
            </h3>
            <div className="space-y-6 text-muted-foreground leading-relaxed text-base md:text-lg">
              {t.about.storyParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Key Points */}
            <div className="space-y-4 mt-10">
              {t.about.keyPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievement Stats */}
          <div className="grid grid-cols-2 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group p-8 bg-card/60 backdrop-blur-sm border border-border rounded-2xl hover:bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-2"
              >
                <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="text-center mb-16">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            {t.about.valuesTitle}
          </h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t.about.valuesSubtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl hover:bg-card transition-all duration-300 hover:border-primary/40 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="inline-flex p-4 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>

                <h4 className="text-lg md:text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h4>

                <p className="text-sm md:text-base text-muted-foreground leading-relaxed group-hover:text-foreground/90 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:shadow-xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300 cursor-pointer group">
            <span className="font-semibold">{t.about.cta}</span>
            <Users className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </section>
  );
}

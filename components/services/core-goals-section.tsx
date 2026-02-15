"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Palette,
  Code,
  Rocket,
  ArrowRight,
  Zap,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { SectionWrapper, SectionTitle } from "@/components/sections/section-wrapper";

interface CoreGoal {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  titleUg: string;
  description: string;
  descriptionEn: string;
  descriptionUg: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGradient: string;
  features: string[];
  featuresEn: string[];
  featuresUg: string[];
  href: string;
}

const coreGoals: CoreGoal[] = [
  {
    id: "design",
    slug: "design",
    title: "设计服务",
    titleEn: "Design Services",
    titleUg: "لايىھەلەش مۇلازىمىتى",
    description: "从品牌视觉到用户体验，打造令人印象深刻的设计作品",
    descriptionEn: "From brand visuals to user experience, creating impressive design works",
    descriptionUg: "ماركا كۆرۈنۈشىدىن ئىشلەتكۈچى تەجرىبىسىگىچە، ھەيرانلىق قوزغايدىغان لايىھەلەش ئەسەرلىرىنى يارىتىش",
    icon: Palette,
    color: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-500/10 to-rose-500/10",
    features: ["UI/UX设计", "品牌设计", "平面设计", "3D设计"],
    featuresEn: ["UI/UX Design", "Brand Design", "Graphic Design", "3D Design"],
    featuresUg: ["UI/UX لايىھەلەش", "ماركا لايىھەلەش", "گرافىك لايىھەلەش", "3D لايىھەلەش"],
    href: "/services/design",
  },
  {
    id: "development",
    slug: "development",
    title: "开发服务",
    titleEn: "Development Services",
    titleUg: "ئىجرا قىلىش مۇلازىمىتى",
    description: "专业的技术团队，为您构建高性能、可扩展的数字产品",
    descriptionEn: "Professional tech team building high-performance, scalable digital products",
    descriptionUg: "كەسپىي تېخنىكا گۇرۇپپىسى سىز ئۈچۈن يۇقىرى ئىقتىدارلىق، كېڭەيتىشچان رەقەملىك مەھسۇلاتلارنى قۇرىدۇ",
    icon: Code,
    color: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
    features: ["Web开发", "移动应用", "小程序", "企业系统"],
    featuresEn: ["Web Development", "Mobile Apps", "Mini Programs", "Enterprise Systems"],
    featuresUg: ["توربېت ئىجرا قىلىش", "كۆچمە ئەپلەر", "كىچىك پروگراممىلار", "كارخانا سىستېمىسى"],
    href: "/services/development",
  },
  {
    id: "startup",
    slug: "startup",
    title: "创业服务",
    titleEn: "Startup Services",
    titleUg: "كارخانا قۇرۇش مۇلازىمىتى",
    description: "从想法到产品，全方位支持您的创业之旅",
    descriptionEn: "From idea to product, comprehensive support for your entrepreneurial journey",
    descriptionUg: "ئويدىن مەھسۇلاتقىچە، كارخانا قۇرۇش سەپىرىڭىزنى ھەر تەرەپلىمە قوللاش",
    icon: Rocket,
    color: "from-purple-500 to-violet-500",
    bgGradient: "from-purple-500/10 to-violet-500/10",
    features: ["商业计划", "MVP开发", "融资对接", "项目孵化"],
    featuresEn: ["Business Planning", "MVP Development", "Funding Connection", "Project Incubation"],
    featuresUg: ["سودا پىلانى", "MVP ئىجرا قىلىش", "مەبلەغ ئۇلىنىشى", "تۈر ئېچىش"],
    href: "/services/startup",
  },
];

export function CoreGoalsSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { language } = useLanguage();

  // Helper function to get text based on language
  const getText = (zh: string, en: string, ug: string) => {
    if (language === "en") return en;
    if (language === "ug") return ug;
    return zh;
  };

  return (
    <SectionWrapper id="core-goals" background="muted">
      {/* Section Header */}
      <SectionTitle
        title={getText("三大核心目标", "Three Core Goals", "ئۈچ يادرولۇق نىشان")}
        subtitle={getText(
          "无论您是需要设计、开发还是创业支持，我们都能为您提供专业的解决方案",
          "Whether you need design, development, or startup support, we provide professional solutions",
          "لايىھەلەش، ئىجرا قىلىش ياكى كارخانا قۇرۇش قوللىشىغا ئېھتىياجلىق بولسىڭىز، بىز سىزگە كەسپىي يېشىلىش تەمىنلەيمىز"
        )}
      />

      {/* Goals Grid */}
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {coreGoals.map((goal, index) => {
          const Icon = goal.icon;
          const isHovered = hoveredId === goal.id;
          const title = getText(goal.title, goal.titleEn, goal.titleUg);
          const description = getText(goal.description, goal.descriptionEn, goal.descriptionUg);
          const features = language === "en" ? goal.featuresEn : language === "ug" ? goal.featuresUg : goal.features;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredId(goal.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Link href={goal.href} className="block h-full">
                <div
                  className={cn(
                    "relative h-full p-6 md:p-8 rounded-2xl",
                    "bg-gradient-to-br from-background to-muted/30",
                    "border border-border/50 hover:border-primary/30",
                    "transition-all duration-300 group",
                    "hover:shadow-xl hover:shadow-primary/5",
                    "hover:-translate-y-1",
                    isHovered && "scale-[1.02]"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center mb-6",
                      "bg-gradient-to-br",
                      goal.color,
                      "shadow-lg"
                    )}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className={cn("w-1.5 h-1.5 rounded-full bg-gradient-to-r", goal.color)} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <span>{getText("了解更多", "Learn More", "تېخىمۇ كۆپ بىلىش")}</span>
                    <ArrowRight
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isHovered && "translate-x-1"
                      )}
                    />
                  </div>

                  {/* Hover Glow Effect */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      "bg-gradient-to-br",
                      goal.color,
                      "-z-10"
                    )}
                    style={{ transform: "scale(0.9)", filter: "blur(40px)", opacity: 0.1 }}
                  />

                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 opacity-10">
                    <Target className="w-20 h-20 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 text-center"
      >
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          asChild
        >
          <Link href="/services">
            <Zap className="w-5 h-5 mr-2" />
            {getText("查看全部服务", "View All Services", "بارلىق مۇلازىمەتلەرنى كۆرۈش")}
          </Link>
        </Button>
      </motion.div>
    </SectionWrapper>
  );
}

export default CoreGoalsSection;

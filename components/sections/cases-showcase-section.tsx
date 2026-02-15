"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LazyImage } from "@/components/ui/lazy-image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { SectionWrapper, SectionTitle } from "./section-wrapper";
import type { CaseItem } from "@/types/navigation";

// 默认案例数据
const defaultCases: CaseItem[] = [
  {
    id: "1",
    title: "品牌官网设计",
    titleEn: "Brand Website Design",
    category: "网站设计",
    categoryEn: "Web Design",
    thumbnail: "/images/cases/case-1.jpg",
    href: "/cases/1",
  },
  {
    id: "2",
    title: "电商平台开发",
    titleEn: "E-commerce Platform",
    category: "网站开发",
    categoryEn: "Web Development",
    thumbnail: "/images/cases/case-2.jpg",
    href: "/cases/2",
  },
  {
    id: "3",
    title: "移动应用设计",
    titleEn: "Mobile App Design",
    category: "UI/UX设计",
    categoryEn: "UI/UX Design",
    thumbnail: "/images/cases/case-3.jpg",
    href: "/cases/3",
  },
  {
    id: "4",
    title: "品牌视觉系统",
    titleEn: "Brand Visual System",
    category: "品牌设计",
    categoryEn: "Brand Design",
    thumbnail: "/images/cases/case-4.jpg",
    href: "/cases/4",
  },
];

interface CaseCardProps {
  caseItem: CaseItem;
  index: number;
  language: string;
}

function CaseCard({ caseItem, index, language }: CaseCardProps) {
  const title = language === "en" && caseItem.titleEn ? caseItem.titleEn : caseItem.title;
  const category = language === "en" && caseItem.categoryEn ? caseItem.categoryEn : caseItem.category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={caseItem.href}
        className="group relative block overflow-hidden rounded-xl aspect-[4/3]"
      >
        {/* 图片 */}
        <div className="absolute inset-0 bg-primary/10">
          {caseItem.thumbnail && (
            <LazyImage
              src={caseItem.thumbnail}
              alt={title}
              fill
              className="absolute inset-0"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={index < 2}
            />
          )}
        </div>

        {/* 遮罩层 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* 内容 */}
        <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
          {/* 分类标签 */}
          <span className="inline-block px-3 py-1 text-xs font-medium text-white/90 bg-white/20 backdrop-blur-sm rounded-full mb-3 w-fit">
            {category}
          </span>

          {/* 标题 */}
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* 查看详情 */}
          <div className="flex items-center gap-2 text-sm text-white/80 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <span>{language === "en" ? "View Details" : "查看详情"}</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

interface CasesShowcaseSectionProps {
  cases?: CaseItem[];
  showMoreLink?: string;
  className?: string;
}

export function CasesShowcaseSection({
  cases: propCases,
  showMoreLink = "/cases",
  className,
}: CasesShowcaseSectionProps) {
  const { language } = useLanguage();
  const [cases, setCases] = useState<CaseItem[]>(propCases || defaultCases);

  // 从 API 获取案例数据
  useEffect(() => {
    if (propCases) return;

    fetch("/api/cases?limit=4")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data && result.data.length > 0) {
          setCases(
            result.data.map((item: any) => ({
              id: item.id,
              title: item.title,
              titleEn: item.titleEn,
              category: item.category,
              categoryEn: item.categoryEn,
              thumbnail: item.thumbnail || item.image,
              href: `/cases/${item.id}`,
            }))
          );
        }
      })
      .catch(() => {
        // 使用默认数据
      });
  }, [propCases]);

  return (
    <SectionWrapper id="cases" background="muted" className={className}>
      <SectionTitle
        title={language === "en" ? "Featured Cases" : "精选案例"}
        subtitle={
          language === "en"
            ? "Explore our latest projects and success stories"
            : "探索我们最新的项目和成功案例"
        }
      />

      {/* 桌面端网格布局 */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cases.slice(0, 4).map((caseItem, index) => (
          <CaseCard
            key={caseItem.id}
            caseItem={caseItem}
            index={index}
            language={language}
          />
        ))}
      </div>

      {/* 移动端横向滚动 */}
      <div className="md:hidden -mx-4 px-4">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {cases.map((caseItem, index) => (
            <div
              key={caseItem.id}
              className="flex-shrink-0 w-[280px] snap-start"
            >
              <CaseCard
                caseItem={caseItem}
                index={index}
                language={language}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 查看更多按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12 text-center"
      >
        <Link
          href={showMoreLink}
          className={cn(
            "inline-flex items-center gap-2 px-8 py-4 rounded-lg",
            "bg-primary",
            "text-white font-medium",
            "hover:bg-primary/90 transition-colors",
            "shadow-lg shadow-primary/25"
          )}
        >
          {language === "en" ? "View All Cases" : "查看更多案例"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </SectionWrapper>
  );
}

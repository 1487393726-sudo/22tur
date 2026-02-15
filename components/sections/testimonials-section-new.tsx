"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { SectionWrapper, SectionTitle } from "./section-wrapper";
import type { TestimonialItem } from "@/types/navigation";

// 默认评价数据
const defaultTestimonials: TestimonialItem[] = [
  {
    id: "1",
    content: "与Creative团队合作是一次非常愉快的体验。他们不仅专业，而且非常注重细节，最终交付的产品超出了我们的预期。",
    contentEn: "Working with the Creative team was a wonderful experience. They are not only professional but also very detail-oriented. The final product exceeded our expectations.",
    author: "张明",
    authorEn: "Zhang Ming",
    role: "CEO",
    roleEn: "CEO",
    company: "科技创新公司",
    companyEn: "Tech Innovation Co.",
    rating: 5,
  },
  {
    id: "2",
    content: "他们的设计团队非常有创意，能够准确理解我们的需求并提供出色的解决方案。强烈推荐！",
    contentEn: "Their design team is very creative and can accurately understand our needs and provide excellent solutions. Highly recommended!",
    author: "李华",
    authorEn: "Li Hua",
    role: "市场总监",
    roleEn: "Marketing Director",
    company: "品牌营销集团",
    companyEn: "Brand Marketing Group",
    rating: 5,
  },
  {
    id: "3",
    content: "从项目启动到交付，整个过程都非常顺畅。团队的沟通效率很高，问题响应也很及时。",
    contentEn: "From project kickoff to delivery, the entire process was very smooth. The team's communication efficiency is high and problem response is timely.",
    author: "王芳",
    authorEn: "Wang Fang",
    role: "产品经理",
    roleEn: "Product Manager",
    company: "互联网科技",
    companyEn: "Internet Technology",
    rating: 5,
  },
];

interface TestimonialCardProps {
  testimonial: TestimonialItem;
  language: string;
}

function TestimonialCard({ testimonial, language }: TestimonialCardProps) {
  const content = language === "en" && testimonial.contentEn ? testimonial.contentEn : testimonial.content;
  const author = language === "en" && testimonial.authorEn ? testimonial.authorEn : testimonial.author;
  const role = language === "en" && testimonial.roleEn ? testimonial.roleEn : testimonial.role;
  const company = language === "en" && testimonial.companyEn ? testimonial.companyEn : testimonial.company;

  return (
    <div className="relative px-4 md:px-8">
      {/* 引号装饰 */}
      <Quote className="absolute top-0 left-0 w-12 h-12 text-primary/20 -translate-x-2 -translate-y-2" />

      {/* 评价内容 */}
      <blockquote className="text-lg md:text-xl lg:text-2xl text-foreground leading-relaxed mb-8 relative z-10">
        "{content}"
      </blockquote>

      {/* 星级评分 */}
      {testimonial.rating && (
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-5 h-5",
                i < testimonial.rating! ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}

      {/* 作者信息 */}
      <div className="flex items-center gap-4">
        {testimonial.avatar ? (
          <Image
            src={testimonial.avatar}
            alt={author}
            width={56}
            height={56}
            className="rounded-full"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-semibold text-foreground">{author}</div>
          <div className="text-sm text-muted-foreground">
            {role}, {company}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TestimonialsSectionNewProps {
  testimonials?: TestimonialItem[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export function TestimonialsSectionNew({
  testimonials: propTestimonials,
  autoPlay = true,
  interval = 5000,
  className,
}: TestimonialsSectionNewProps) {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(
    propTestimonials || defaultTestimonials
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // 从 API 获取数据
  useEffect(() => {
    if (propTestimonials) return;

    fetch("/api/homepage/testimonials")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data && result.data.length > 0) {
          setTestimonials(
            result.data.map((item: any) => ({
              id: item.id,
              content: item.content,
              contentEn: item.contentEn,
              author: item.name,
              authorEn: item.nameEn,
              role: item.position,
              roleEn: item.positionEn,
              company: item.company,
              companyEn: item.companyEn,
              avatar: item.avatar,
              rating: item.rating,
            }))
          );
        }
      })
      .catch(() => {
        // 使用默认数据
      });
  }, [propTestimonials]);

  // 自动播放
  useEffect(() => {
    if (!autoPlay || testimonials.length <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, testimonials.length]);

  // 导航函数
  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const goToIndex = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  // 动画变体
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <SectionWrapper id="testimonials" background="default" className={className}>
      <SectionTitle
        title={language === "en" ? "What Our Clients Say" : "客户评价"}
        subtitle={
          language === "en"
            ? "Hear from our satisfied clients about their experience working with us"
            : "听听我们满意的客户分享他们与我们合作的体验"
        }
      />

      <div className="relative max-w-4xl mx-auto">
        {/* 轮播内容 */}
        <div className="relative overflow-hidden py-8">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <TestimonialCard
                testimonial={testimonials[currentIndex]}
                language={language}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 导航按钮 */}
        {testimonials.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-2 rounded-full bg-background border border-border hover:border-primary/50 hover:bg-accent transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-2 rounded-full bg-background border border-border hover:border-primary/50 hover:bg-accent transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* 指示点 */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SectionProps, SectionBackground } from "@/types/navigation";

// 背景样式映射
const backgroundStyles: Record<SectionBackground, string> = {
  default: "bg-background",
  gradient: "bg-gradient-to-br from-primary/5 via-background to-secondary/5",
  muted: "bg-muted/30",
  dark: "bg-slate-900 text-white",
};

// 间距规范
const SECTION_SPACING = "py-16 px-4 md:py-20 md:px-6 lg:py-24 lg:px-8";
const SECTION_MAX_WIDTH = "max-w-7xl mx-auto";

// 动画变体
const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const, // easeOut cubic-bezier
    },
  },
};

export function SectionWrapper({
  id,
  className,
  children,
  animate = true,
  background = "default",
}: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const content = (
    <div className={SECTION_MAX_WIDTH}>{children}</div>
  );

  if (!animate) {
    return (
      <section
        id={id}
        ref={ref}
        className={cn(
          SECTION_SPACING,
          backgroundStyles[background],
          className
        )}
      >
        {content}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
      className={cn(
        SECTION_SPACING,
        backgroundStyles[background],
        className
      )}
    >
      {content}
    </motion.section>
  );
}

// Section 标题组件
interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SectionTitle({
  title,
  subtitle,
  align = "center",
  className,
}: SectionTitleProps) {
  const alignStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className={cn("mb-12 md:mb-16", alignStyles[align], className)}>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// 渐变标题组件
export function GradientTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-primary",
        className
      )}
    >
      {children}
    </span>
  );
}

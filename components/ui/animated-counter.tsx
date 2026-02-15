"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

/**
 * 动画计数器组件
 * 当元素进入视口时，数字从0递增到目标值
 */
export function AnimatedCounter({
  value,
  duration = 2000,
  prefix = "",
  suffix = "",
  className,
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  // 解析目标值
  const targetValue = typeof value === "string" ? parseFloat(value) || 0 : value;

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 使用 easeOutExpo 缓动函数
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      const currentValue = startValue + (targetValue - startValue) * easeOutExpo;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, targetValue, duration]);

  // 格式化显示值
  const formattedValue = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

/**
 * 统计数据卡片组件
 */
interface StatCardProps {
  value: number | string;
  label: string;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  value,
  label,
  prefix,
  suffix,
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center p-6 rounded-2xl",
        "bg-gradient-to-br from-background to-muted/30",
        "border border-border/50",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-300",
        className
      )}
    >
      {icon && (
        <div className="mb-3 p-3 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div className="text-3xl md:text-4xl font-bold text-foreground">
        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
        />
      </div>
      <p className="mt-2 text-sm text-muted-foreground text-center">{label}</p>
    </div>
  );
}

/**
 * 统计数据行组件
 */
interface StatsRowProps {
  stats: Array<{
    value: number | string;
    label: string;
    prefix?: string;
    suffix?: string;
  }>;
  className?: string;
}

export function StatsRow({ stats, className }: StatsRowProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        stats.length === 2 && "grid-cols-2",
        stats.length === 3 && "grid-cols-3",
        stats.length === 4 && "grid-cols-2 md:grid-cols-4",
        stats.length > 4 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
        className
      )}
    >
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
            <AnimatedCounter
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
            />
          </div>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

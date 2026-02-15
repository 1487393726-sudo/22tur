"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { HighlightConfig } from "./widgets/types";

interface DataHighlightProps {
  value: number;
  previousValue?: number;
  config?: HighlightConfig;
  children: React.ReactNode;
  className?: string;
}

// 默认高亮配置
const DEFAULT_HIGHLIGHT_CONFIG: HighlightConfig = {
  enabled: true,
  threshold: 5, // 5% 变化阈值
  duration: 2000, // 2秒高亮持续时间
  upColor: "#22c55e", // 绿色 - 上涨
  downColor: "#ef4444", // 红色 - 下跌
};

/**
 * 数据变化高亮组件
 * 当数据变化超过阈值时，显示高亮动画效果
 */
export function DataHighlight({
  value,
  previousValue,
  config = DEFAULT_HIGHLIGHT_CONFIG,
  children,
  className,
}: DataHighlightProps) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [highlightDirection, setHighlightDirection] = useState<"up" | "down" | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevValueRef = useRef<number>(previousValue ?? value);

  // 检测数据变化并触发高亮
  useEffect(() => {
    if (!config.enabled) return;

    const prev = previousValue ?? prevValueRef.current;
    
    // 计算变化百分比
    const changePercent = prev !== 0 
      ? Math.abs((value - prev) / prev) * 100 
      : value !== 0 ? 100 : 0;

    // 如果变化超过阈值，触发高亮
    if (changePercent >= config.threshold) {
      const direction = value > prev ? "up" : "down";
      setHighlightDirection(direction);
      setIsHighlighted(true);

      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 设置高亮持续时间
      timeoutRef.current = setTimeout(() => {
        setIsHighlighted(false);
        setHighlightDirection(null);
      }, config.duration);
    }

    // 更新前一个值
    prevValueRef.current = value;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, previousValue, config]);

  // 获取高亮颜色
  const highlightColor = highlightDirection === "up" 
    ? config.upColor 
    : highlightDirection === "down" 
      ? config.downColor 
      : undefined;

  return (
    <div
      className={cn(
        "relative transition-all duration-300",
        isHighlighted && "animate-pulse",
        className
      )}
      style={{
        boxShadow: isHighlighted 
          ? `0 0 20px ${highlightColor}40, 0 0 40px ${highlightColor}20` 
          : undefined,
        borderColor: isHighlighted ? highlightColor : undefined,
      }}
    >
      {/* 高亮指示器 */}
      {isHighlighted && (
        <div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping"
          style={{ backgroundColor: highlightColor }}
        />
      )}
      
      {children}
    </div>
  );
}

/**
 * 数据变化高亮 Hook
 * 用于在自定义组件中检测数据变化
 */
export function useDataHighlight(
  value: number,
  config: HighlightConfig = DEFAULT_HIGHLIGHT_CONFIG
) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const [changePercent, setChangePercent] = useState(0);
  const prevValueRef = useRef<number>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!config.enabled) return;

    const prev = prevValueRef.current;
    const percent = prev !== 0 
      ? ((value - prev) / prev) * 100 
      : value !== 0 ? 100 : 0;

    setChangePercent(percent);

    if (Math.abs(percent) >= config.threshold) {
      setDirection(percent > 0 ? "up" : "down");
      setIsHighlighted(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsHighlighted(false);
        setDirection(null);
      }, config.duration);
    }

    prevValueRef.current = value;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, config]);

  return {
    isHighlighted,
    direction,
    changePercent,
    highlightColor: direction === "up" 
      ? config.upColor 
      : direction === "down" 
        ? config.downColor 
        : undefined,
  };
}

/**
 * 批量数据变化检测
 * 用于检测多个数据点的变化
 */
export function useMultiDataHighlight(
  data: Record<string, number>,
  config: HighlightConfig = DEFAULT_HIGHLIGHT_CONFIG
) {
  const [highlights, setHighlights] = useState<Record<string, {
    isHighlighted: boolean;
    direction: "up" | "down" | null;
    changePercent: number;
  }>>({});
  
  const prevDataRef = useRef<Record<string, number>>(data);
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    if (!config.enabled) return;

    const newHighlights: typeof highlights = {};
    const prevData = prevDataRef.current;

    Object.entries(data).forEach(([key, value]) => {
      const prev = prevData[key] ?? value;
      const percent = prev !== 0 
        ? ((value - prev) / prev) * 100 
        : value !== 0 ? 100 : 0;

      if (Math.abs(percent) >= config.threshold) {
        newHighlights[key] = {
          isHighlighted: true,
          direction: percent > 0 ? "up" : "down",
          changePercent: percent,
        };

        // 清除之前的定时器
        if (timeoutsRef.current[key]) {
          clearTimeout(timeoutsRef.current[key]);
        }

        // 设置新的定时器
        timeoutsRef.current[key] = setTimeout(() => {
          setHighlights(prev => ({
            ...prev,
            [key]: {
              ...prev[key],
              isHighlighted: false,
              direction: null,
            },
          }));
        }, config.duration);
      }
    });

    if (Object.keys(newHighlights).length > 0) {
      setHighlights(prev => ({ ...prev, ...newHighlights }));
    }

    prevDataRef.current = data;

    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, [data, config]);

  return highlights;
}

/**
 * 阈值检测组件
 * 当数值超过或低于阈值时显示警告
 */
interface ThresholdAlertProps {
  value: number;
  thresholds: Array<{
    value: number;
    type: "above" | "below";
    severity: "info" | "warning" | "critical";
    message?: string;
  }>;
  children: React.ReactNode;
  className?: string;
}

const SEVERITY_COLORS = {
  info: "#3b82f6",
  warning: "#f59e0b",
  critical: "#ef4444",
};

export function ThresholdAlert({
  value,
  thresholds,
  children,
  className,
}: ThresholdAlertProps) {
  const [activeAlert, setActiveAlert] = useState<{
    severity: "info" | "warning" | "critical";
    message?: string;
  } | null>(null);

  useEffect(() => {
    // 检查所有阈值，找到最高严重级别的告警
    let highestAlert: typeof activeAlert = null;
    const severityOrder = { info: 0, warning: 1, critical: 2 };

    for (const threshold of thresholds) {
      const isTriggered = threshold.type === "above" 
        ? value > threshold.value 
        : value < threshold.value;

      if (isTriggered) {
        if (!highestAlert || severityOrder[threshold.severity] > severityOrder[highestAlert.severity]) {
          highestAlert = {
            severity: threshold.severity,
            message: threshold.message,
          };
        }
      }
    }

    setActiveAlert(highestAlert);
  }, [value, thresholds]);

  const alertColor = activeAlert ? SEVERITY_COLORS[activeAlert.severity] : undefined;

  return (
    <div
      className={cn(
        "relative transition-all duration-300",
        activeAlert && "ring-2",
        className
      )}
      style={{
        // @ts-expect-error ringColor is a valid CSS custom property
        "--tw-ring-color": alertColor,
        boxShadow: activeAlert 
          ? `0 0 15px ${alertColor}30` 
          : undefined,
      } as React.CSSProperties}
    >
      {/* 告警标签 */}
      {activeAlert && (
        <div
          className="absolute -top-2 -right-2 px-2 py-0.5 rounded text-xs text-white font-medium"
          style={{ backgroundColor: alertColor }}
        >
          {activeAlert.severity === "critical" ? "严重" : 
           activeAlert.severity === "warning" ? "警告" : "提示"}
        </div>
      )}

      {/* 告警消息 */}
      {activeAlert?.message && (
        <div
          className="absolute -bottom-6 left-0 right-0 text-xs text-center truncate"
          style={{ color: alertColor }}
        >
          {activeAlert.message}
        </div>
      )}

      {children}
    </div>
  );
}

/**
 * 数据变化动画数字组件
 * 显示数字变化的动画效果
 */
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  highlightConfig?: HighlightConfig;
}

export function AnimatedNumber({
  value,
  duration = 500,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  highlightConfig,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);
  const animationRef = useRef<number | null>(null);

  const { isHighlighted, direction, highlightColor } = useDataHighlight(
    value,
    highlightConfig
  );

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    const startTime = performance.now();

    setIsAnimating(true);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用 easeOutQuart 缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      const currentValue = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        prevValueRef.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <span
      className={cn(
        "tabular-nums transition-colors duration-300",
        isAnimating && "font-medium",
        className
      )}
      style={{
        color: isHighlighted ? highlightColor : undefined,
      }}
    >
      {prefix}
      {formattedValue}
      {suffix}
      {isHighlighted && direction && (
        <span className="ml-1 text-sm">
          {direction === "up" ? "↑" : "↓"}
        </span>
      )}
    </span>
  );
}

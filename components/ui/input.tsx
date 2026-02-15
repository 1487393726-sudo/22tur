/**
 * Input Component with Glass Effects
 * 带玻璃态效果的输入框组件
 * 
 * Enhanced input component with glassmorphism effects including:
 * - Semi-transparent background with backdrop blur (Req 4.1, 4.2)
 * - Enhanced focus state with glow effect (Req 4.3)
 * - Maintains all existing functionality
 * 
 * Validates Requirements: 4.1, 4.2, 4.3
 */

import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles with mobile touch target - 基础样式（含移动端触摸目标）
        "h-9 w-full min-w-0 rounded-md px-3 py-1 text-base md:text-sm outline-none",
        // Mobile touch target size (Req 6.4) - 移动端触摸目标尺寸
        "min-h-[44px] md:min-h-0",
        // Glass effect styles (Req 4.1, 4.2) - 玻璃效果样式
        "glass-light",
        "backdrop-blur-[10px]",
        "border border-white/10 dark:border-white/8",
        "will-change-[backdrop-filter,border-color]",
        // Text and placeholder styles - 文本和占位符样式
        "placeholder:text-white/40 dark:placeholder:text-white/30",
        "text-foreground",
        // Focus state with enhanced glow (Req 4.3) - 焦点状态增强发光效果
        "focus-visible:border-white/30 dark:focus-visible:border-white/25",
        "focus-visible:ring-[3px] focus-visible:ring-white/20 dark:focus-visible:ring-white/15",
        "focus-visible:backdrop-blur-[12px]",
        // Selection styles - 选择样式
        "selection:bg-primary selection:text-primary-foreground",
        // File input styles - 文件输入样式
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Transition - 过渡效果
        "transition-all duration-200",
        // Invalid state - 无效状态
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        // Disabled state - 禁用状态
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
      data-oid="kg_00kt"
    />
  );
}

export { Input };

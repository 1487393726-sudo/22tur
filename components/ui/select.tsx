/**
 * Select Component with Glass Effects
 * 带玻璃态效果的选择框组件
 * 
 * Enhanced select component with glassmorphism effects including:
 * - Semi-transparent background with backdrop blur (Req 4.1, 4.2)
 * - Enhanced focus state with glow effect (Req 4.3)
 * - Consistent glass effect patterns matching input component (Req 4.4)
 * - Glass effects applied to both trigger and dropdown content
 * 
 * Validates Requirements: 4.1, 4.2, 4.3, 4.4
 */

"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return (
    <SelectPrimitive.Root data-slot="select" {...props} data-oid=":j3l-af" />
  );
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      {...props}
      data-oid="evczfhg"
    />
  );
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      {...props}
      data-oid="vwxc8pv"
    />
  );
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        // Base styles with mobile touch target - 基础样式（含移动端触摸目标）
        "flex w-fit items-center justify-between gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap outline-none",
        // Mobile touch target size (Req 6.4) - 移动端触摸目标尺寸
        "min-h-[44px] md:min-h-0",
        // Glass effect styles (Req 4.1, 4.2, 4.4) - 玻璃效果样式
        "glass-light",
        "backdrop-blur-[10px]",
        "border border-white/10 dark:border-white/8",
        "will-change-[backdrop-filter,border-color]",
        // Text and placeholder styles - 文本和占位符样式
        "data-[placeholder]:text-white/40 dark:data-[placeholder]:text-white/30",
        "[&_svg:not([class*='text-'])]:text-muted-foreground",
        // Focus state with enhanced glow (Req 4.3) - 焦点状态增强发光效果
        "focus-visible:border-white/30 dark:focus-visible:border-white/25",
        "focus-visible:ring-[3px] focus-visible:ring-white/20 dark:focus-visible:ring-white/15",
        "focus-visible:backdrop-blur-[12px]",
        // Transition - 过渡效果
        "transition-all duration-200",
        // Invalid state - 无效状态
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        // Disabled state - 禁用状态
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Size variants - 尺寸变体
        "data-[size=default]:h-9 data-[size=sm]:h-8",
        // Select value styles - 选择值样式
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
        // Icon styles - 图标样式
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
      data-oid="ozx0:g2"
    >
      {children}
      <SelectPrimitive.Icon asChild data-oid="qkl7l74">
        <ChevronDownIcon className="size-4 opacity-50" data-oid="ivy0ohp" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal data-oid="v47fkut">
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          // Base styles - 基础样式
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md",
          // Glass effect styles (Req 4.4) - 玻璃效果样式
          "glass-light",
          "backdrop-blur-[12px]",
          "border border-white/10 dark:border-white/8",
          "shadow-md",
          // Animation - 动画
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
        data-oid="71xr5l:"
      >
        <SelectScrollUpButton data-oid="_rvg.-8" />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
          )}
          data-oid="-wf0rxa"
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton data-oid="_akksr8" />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
      data-oid="sa38bl6"
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
      data-oid="b6s4gge"
    >
      <span
        className="absolute right-2 flex size-3.5 items-center justify-center"
        data-oid="qee0jq."
      >
        <SelectPrimitive.ItemIndicator data-oid="s7wsxum">
          <CheckIcon className="size-4" data-oid="4ah:1_r" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText data-oid="to5wird">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
      data-oid="nmrox_0"
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
      data-oid="l-3byz3"
    >
      <ChevronUpIcon className="size-4" data-oid="mm3o6bg" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
      data-oid="v5zewzm"
    >
      <ChevronDownIcon className="size-4" data-oid="qc9nm5q" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

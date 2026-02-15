"use client";

import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { dashboardStyles } from "@/lib/dashboard-styles";

/**
 * 页面标题组件
 * 
 * 统一页面标题和描述的样式
 */

interface PageHeaderProps {
  /** 页面标题 */
  title: string;
  /** 页面描述 */
  description?: string;
  /** 标题前的图标或emoji */
  icon?: ReactNode;
  /** 是否显示返回按钮 */
  showBack?: boolean;
  /** 返回按钮点击回调 */
  onBack?: () => void;
  /** 右侧操作区域 */
  actions?: ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 标题类名 */
  titleClassName?: string;
  /** 描述类名 */
  descriptionClassName?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  showBack = false,
  onBack,
  actions,
  className,
  titleClassName,
  descriptionClassName,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={cn("flex items-start justify-between gap-4 mb-6 md:mb-8", className)}>
      <div className="flex items-start gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mt-1 hover:bg-muted/50 shrink-0"
            aria-label="返回"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="space-y-1">
          <h1 className={cn(
            dashboardStyles.page.title,
            "flex items-center gap-2",
            titleClassName
          )}>
            {icon && <span className="shrink-0">{icon}</span>}
            {title}
          </h1>
          {description && (
            <p className={cn(
              dashboardStyles.page.description,
              "text-sm md:text-base",
              descriptionClassName
            )}>
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * 页面区块标题组件
 */
interface SectionHeaderProps {
  /** 区块标题 */
  title: string;
  /** 区块描述 */
  description?: string;
  /** 右侧操作区域 */
  actions?: ReactNode;
  /** 自定义类名 */
  className?: string;
}

export function SectionHeader({
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * 面包屑导航组件
 */
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const router = useRouter();

  return (
    <nav className={cn("flex items-center text-sm text-muted-foreground mb-4", className)}>
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          {index > 0 && <span className="mx-2">/</span>}
          {item.href ? (
            <button
              type="button"
              onClick={() => router.push(item.href!)}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default PageHeader;

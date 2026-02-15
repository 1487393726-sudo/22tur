"use client";

import { Check, Star, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { dashboardStyles } from "@/lib/dashboard-styles";

interface ServicePackage {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  originalPrice: number;
  packagePrice: number;
  savings: number;
  highlights?: string | string[];
  isPopular?: boolean;
  items?: {
    service: {
      id: string;
      name: string;
      nameEn: string;
    };
  }[];
  category?: {
    name: string;
    slug: string;
  } | null;
}

interface DashboardPackageCardProps {
  pkg: ServicePackage;
  onSelect?: () => void;
}

export function DashboardPackageCard({ pkg, onSelect }: DashboardPackageCardProps) {
  // 解析highlights
  const highlights = typeof pkg.highlights === "string"
    ? JSON.parse(pkg.highlights)
    : pkg.highlights || [];

  // 计算折扣百分比
  const discountPercent = Math.round((pkg.savings / pkg.originalPrice) * 100);

  return (
    <div
      className={cn(
        "relative rounded-xl p-6 border transition-colors",
        dashboardStyles.card.base,
        pkg.isPopular && "border-primary/50"
      )}
    >
      {pkg.isPopular && (
        <div className="absolute -top-3 -right-3">
          <div className="flex items-center gap-1 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
            <Star className="w-3 h-3 fill-current" />
            热门套餐
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-foreground">{pkg.name}</h3>
      </div>

      <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>

      {/* 价格展示 */}
      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-foreground">
            ￥{pkg.packagePrice.toLocaleString()}
          </span>
          <span className="text-base text-muted-foreground line-through">
            ￥{pkg.originalPrice.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-green-500/20 text-green-600 text-xs font-medium rounded">
            节省 ￥{pkg.savings.toLocaleString()}
          </span>
          <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded">
            {discountPercent}% OFF
          </span>
        </div>
      </div>

      {/* 包含的服务 */}
      {pkg.items && pkg.items.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">包含服务：</h4>
          <ul className="space-y-1.5">
            {pkg.items.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="w-3 h-3 text-green-500" />
                <span className="text-xs text-foreground">{item.service.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 亮点 */}
      {highlights.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {highlights.map((highlight: string, index: number) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href={`/pricing/packages/${pkg.slug}`}
          className={cn(
            "flex-1 py-2 text-center text-sm rounded-lg transition-colors font-medium",
            dashboardStyles.button.primary
          )}
        >
          查看详情
          <ArrowRight className="w-3 h-3 inline ml-1" />
        </Link>
        {onSelect && (
          <button
            onClick={onSelect}
            className={cn(
              "px-4 py-2 text-sm rounded-lg transition-colors",
              dashboardStyles.button.secondary
            )}
          >
            立即咨询
          </button>
        )}
      </div>
    </div>
  );
}

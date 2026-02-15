"use client";

import { Check, Star, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

interface PackageCardProps {
  pkg: ServicePackage;
  onSelect?: () => void;
}

export function PackageCard({ pkg, onSelect }: PackageCardProps) {
  // 解析highlights
  const highlights = typeof pkg.highlights === "string"
    ? JSON.parse(pkg.highlights)
    : pkg.highlights || [];

  // 计算折扣百分比
  const discountPercent = Math.round((pkg.savings / pkg.originalPrice) * 100);

  return (
    <div
      className={cn(
        "relative glass-card rounded-2xl p-8 border hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-2",
        pkg.isPopular
          ? "border-primary/50 shadow-2xl shadow-primary/20"
          : "border-border hover:border-primary/30"
      )}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {pkg.isPopular && (
          <div className="absolute -top-4 -right-4">
            <div className="flex items-center gap-1 px-4 py-1 bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium rounded-full shadow-lg animate-pulse">
              <Star className="w-4 h-4 fill-current" />
              热门套餐
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary group-hover:animate-spin" />
          <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{pkg.name}</h3>
        </div>

        <p className="text-muted-foreground mb-6">{pkg.description}</p>

        {/* 价格展示 */}
        <div className="mb-6 p-4 glass-card rounded-xl border border-border/50">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold text-foreground group-hover:text-primary transition-colors">
              ￥{pkg.packagePrice.toLocaleString()}
            </span>
            <span className="text-lg text-muted-foreground line-through">
              ￥{pkg.originalPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-500/20 text-green-600 text-sm font-medium rounded">
              节省 ￥{pkg.savings.toLocaleString()}
            </span>
            <span className="px-2 py-1 bg-primary/20 text-primary text-sm font-medium rounded">
              {discountPercent}% OFF
            </span>
          </div>
        </div>

        {/* 包含的服务 */}
        {pkg.items && pkg.items.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">包含服务：</h4>
            <ul className="space-y-2">
              {pkg.items.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-foreground">{item.service.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 亮点 */}
        {highlights.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {highlights.map((highlight: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full hover:bg-primary/20 transition-colors"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            href={`/pricing/packages/${pkg.slug}`}
            className="flex-1 py-3 text-center bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all font-medium hover:scale-105 shadow-lg hover:shadow-xl"
          >
            查看详情
            <ArrowRight className="w-4 h-4 inline ml-2" />
          </Link>
          {onSelect && (
            <button
              onClick={onSelect}
              className="px-6 py-3 border border-border rounded-lg hover:bg-muted/50 transition-all hover:scale-105"
            >
              立即咨询
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Check, Star, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { dashboardStyles } from "@/lib/dashboard-styles";

interface ServiceItem {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  priceType: string;
  basePrice?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  unit?: string | null;
  deliveryDays?: number | null;
  features?: string | string[];
  isPopular?: boolean;
  isFeatured?: boolean;
  category?: {
    name: string;
    slug: string;
  };
}

interface DashboardPricingCardProps {
  service: ServiceItem;
  showPrice?: boolean;
  onSelect?: () => void;
}

export function DashboardPricingCard({ service, showPrice = true, onSelect }: DashboardPricingCardProps) {
  // 解析features
  const features = typeof service.features === "string"
    ? JSON.parse(service.features)
    : service.features || [];

  // 格式化价格
  const formatPrice = () => {
    if (service.priceType === "QUOTE") {
      return "询价";
    }
    if (service.priceType === "RANGE" && service.minPrice && service.maxPrice) {
      return `￥${service.minPrice.toLocaleString()} - ￥${service.maxPrice.toLocaleString()}`;
    }
    if (service.basePrice) {
      return `￥${service.basePrice.toLocaleString()}`;
    }
    return "询价";
  };

  return (
    <div
      className={cn(
        "relative rounded-xl p-6 border transition-colors",
        dashboardStyles.card.base,
        service.isPopular && "border-primary/50"
      )}
    >
      {service.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
            <Star className="w-3 h-3 fill-current" />
            热门推荐
          </div>
        </div>
      )}

      {service.isFeatured && !service.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
            精选服务
          </div>
        </div>
      )}

      <h3 className="text-lg font-bold text-foreground mb-2">{service.name}</h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{service.description}</p>

      {showPrice && (
        <div className="mb-4">
          <span className="text-2xl font-bold text-foreground">{formatPrice()}</span>
          {service.unit && (
            <span className="text-muted-foreground text-sm ml-1">/{service.unit}</span>
          )}
        </div>
      )}

      {service.deliveryDays && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Clock className="w-3 h-3" />
          <span>预计 {service.deliveryDays} 天交付</span>
        </div>
      )}

      {features.length > 0 && (
        <ul className="space-y-2 mb-6">
          {features.slice(0, 5).map((feature: string, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Link
          href={`/services/${service.category?.slug || "all"}/${service.slug}`}
          className={cn(
            "flex-1 py-2 text-center text-sm rounded-lg transition-colors",
            dashboardStyles.button.primary
          )}
        >
          了解详情
          <ArrowRight className="w-3 h-3 inline ml-1" />
        </Link>
        {onSelect && (
          <button
            onClick={onSelect}
            className={cn(
              "px-3 py-2 text-sm rounded-lg transition-colors",
              dashboardStyles.button.secondary
            )}
          >
            咨询
          </button>
        )}
      </div>
    </div>
  );
}

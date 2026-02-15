"use client";

import { Check, Star, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

interface PricingCardProps {
  service: ServiceItem;
  showPrice?: boolean;
  onSelect?: () => void;
}

export function PricingCard({ service, showPrice = true, onSelect }: PricingCardProps) {
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
        "relative glass-card rounded-2xl p-8 border hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2",
        service.isPopular
          ? "border-primary/50 shadow-2xl shadow-primary/20 scale-105"
          : "border-border hover:border-primary/30"
      )}
      style={{
        transform: service.isPopular ? 'translateY(-8px)' : undefined,
      }}
    >
      {service.isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 px-4 py-1 bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium rounded-full shadow-lg animate-pulse">
            <Star className="w-4 h-4 fill-current" />
            热门推荐
          </div>
        </div>
      )}

      {service.isFeatured && !service.isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1 px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-full shadow-lg">
            精选服务
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{service.name}</h3>
      <p className="text-muted-foreground mb-6 line-clamp-2">{service.description}</p>

      {showPrice && (
        <div className="mb-6">
          <span className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">{formatPrice()}</span>
          {service.unit && (
            <span className="text-muted-foreground ml-1">/{service.unit}</span>
          )}
        </div>
      )}

      {service.deliveryDays && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Clock className="w-4 h-4" />
          <span>预计 {service.deliveryDays} 天交付</span>
        </div>
      )}

      {features.length > 0 && (
        <ul className="space-y-3 mb-8">
          {features.slice(0, 5).map((feature: string, index: number) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-3">
        <Link
          href={`/services/${service.category?.slug || "all"}/${service.slug}`}
          className="flex-1 py-3 text-center bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
        >
          了解详情
          <ArrowRight className="w-4 h-4 inline ml-2" />
        </Link>
        {onSelect && (
          <button
            onClick={onSelect}
            className="px-4 py-3 border border-border rounded-lg hover:bg-muted/50 transition-all hover:scale-105"
          >
            咨询
          </button>
        )}
      </div>
    </div>
  );
}

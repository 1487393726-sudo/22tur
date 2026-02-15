"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PricingCard } from "@/components/pricing/PricingCard";
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
  features?: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  category?: {
    name: string;
    slug: string;
  };
}

export default function HRServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services/items?categorySlug=hr&limit=50");
        if (res.ok) {
          const data = await res.json();
          setServices(data.data || []);
        }
      } catch (error) {
        console.error("加载服务失败:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-16">
        {/* Header */}
        <div className="container mx-auto px-4 md:px-6 mb-12">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            返回定价页面
          </Link>

          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full text-green-500 text-sm font-medium">
                👥 人力资源服务
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              专业
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                人力资源服务
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              提供专业人才外派、营销策划、市场分析等人力资源服务，按月/半年/年计费
            </p>
          </div>
        </div>

        {/* Billing Info */}
        <div className="container mx-auto px-4 md:px-6 mb-12">
          <div className="bg-muted/50 rounded-2xl p-6 max-w-3xl mx-auto">
            <h3 className="font-semibold mb-4">💡 计费方式说明</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-card rounded-lg">
                <div className="font-medium mb-1">月度服务</div>
                <div className="text-muted-foreground">灵活短期合作，按月计费</div>
              </div>
              <div className="p-4 bg-card rounded-lg">
                <div className="font-medium mb-1">半年服务</div>
                <div className="text-muted-foreground">中期合作，享9折优惠</div>
              </div>
              <div className="p-4 bg-card rounded-lg">
                <div className="font-medium mb-1">年度服务</div>
                <div className="text-muted-foreground">长期合作，享8折优惠</div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="container mx-auto px-4 md:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">加载中...</span>
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <PricingCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">暂无人力资源服务</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

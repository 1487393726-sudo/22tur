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

export default function DesignServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services/items?categorySlug=design&limit=50");
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
              <div className="px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full text-pink-500 text-sm font-medium">
                🎨 设计服务
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              专业
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                设计服务
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              提供UI/UX设计、品牌设计、视觉识别系统设计等专业服务，打造独特的品牌形象
            </p>
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
            <>
              {/* UI/UX 设计 */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-8">💻 UI/UX 设计</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {services
                    .filter((s) => s.slug.includes("ui") || s.slug.includes("ux"))
                    .map((service) => (
                      <PricingCard key={service.id} service={service} />
                    ))}
                </div>
              </div>

              {/* 品牌设计 */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-8">🏢 品牌设计</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {services
                    .filter(
                      (s) =>
                        s.slug.includes("brand") ||
                        s.slug.includes("logo") ||
                        s.slug.includes("vi")
                    )
                    .map((service) => (
                      <PricingCard key={service.id} service={service} />
                    ))}
                </div>
              </div>

              {/* 其他设计服务 */}
              <div>
                <h2 className="text-2xl font-bold mb-8">🎯 其他设计服务</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {services
                    .filter(
                      (s) =>
                        !s.slug.includes("ui") &&
                        !s.slug.includes("ux") &&
                        !s.slug.includes("brand") &&
                        !s.slug.includes("logo") &&
                        !s.slug.includes("vi")
                    )
                    .map((service) => (
                      <PricingCard key={service.id} service={service} />
                    ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">暂无设计服务</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

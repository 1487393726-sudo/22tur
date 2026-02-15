"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Mail, MessageCircle, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dashboardStyles } from "@/lib/dashboard-styles";
import { ServiceCategoryNav } from "@/components/pricing/ServiceCategoryNav";
import { PricingCard } from "@/components/pricing/PricingCard";
import { PackageCard } from "@/components/pricing/PackageCard";
import { DashboardPricingCard } from "@/components/pricing/DashboardPricingCard";
import { DashboardPackageCard } from "@/components/pricing/DashboardPackageCard";

interface ServiceCategory {
  id: string; name: string; nameEn: string; slug: string; icon?: string;
  _count?: { services: number; packages: number; };
}

interface ServiceItem {
  id: string; name: string; nameEn: string; slug: string; description: string;
  priceType: string; basePrice?: number | null; minPrice?: number | null;
  maxPrice?: number | null; unit?: string | null; deliveryDays?: number | null;
  features?: string; isPopular?: boolean; isFeatured?: boolean;
  category?: { name: string; slug: string; };
}

interface ServicePackage {
  id: string; name: string; nameEn: string; slug: string; description: string;
  originalPrice: number; packagePrice: number; savings: number;
  highlights?: string; isPopular?: boolean;
  items?: { service: { id: string; name: string; nameEn: string; }; }[];
  category?: { name: string; slug: string; } | null;
}

export default function PricingPage() {
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/services/categories");
        if (res.ok) setCategories(await res.json());
      } catch (error) { console.error("加载类目失败:", error); }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const categoryParam = activeCategory !== "all" ? `categorySlug=${activeCategory}` : "";
        const [servicesRes, packagesRes] = await Promise.all([
          fetch(`/api/services/items?${categoryParam}&limit=50`),
          fetch(`/api/services/packages?${activeCategory !== "all" ? `categoryId=${categories.find(c => c.slug === activeCategory)?.id}` : ""}`),
        ]);
        if (servicesRes.ok) setServices((await servicesRes.json()).data || []);
        if (packagesRes.ok) setPackages((await packagesRes.json()) || []);
      } catch (error) { console.error("加载数据失败:", error); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [activeCategory, categories]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const PricingContent = ({ isDashboard = false }: { isDashboard?: boolean }) => (
    <>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-foreground">加载中...</span>
        </div>
      ) : (
        <>
          {packages.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-center mb-8 text-foreground">🎁 超值套餐</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {packages.map((pkg) => 
                  isDashboard ? (
                    <DashboardPackageCard key={pkg.id} pkg={pkg} />
                  ) : (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  )
                )}
              </div>
            </div>
          )}
          {services.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
                {activeCategory === "all" ? "🌟 全部服务" : categories.find(c => c.slug === activeCategory)?.name || "服务"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => 
                  isDashboard ? (
                    <DashboardPricingCard key={service.id} service={service} />
                  ) : (
                    <PricingCard key={service.id} service={service} />
                  )
                )}
              </div>
            </div>
          )}
          {services.length === 0 && packages.length === 0 && (
            <div className="text-center py-20"><p className="text-muted-foreground">暂无服务数据</p></div>
          )}
        </>
      )}
    </>
  );

  if (session) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-8">
            <div className="space-y-6">
              <PageHeader title="服务定价" description="选择最适合您的专业服务" icon="💰" />
              
              <Card className={dashboardStyles.card.base}>
                <CardContent className="p-4 md:p-6">
                  <ServiceCategoryNav categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} isDashboard />
                  <div className="mt-8">
                    <PricingContent isDashboard />
                  </div>
                </CardContent>
              </Card>

              <Card className={`${dashboardStyles.card.base} border-primary/20`}>
                <CardContent className="p-8 text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-4">需要定制化解决方案？</h2>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">我们的专业团队随时为您提供个性化咨询服务</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className={`${dashboardStyles.button.primary} gap-2`}>
                      <Mail className="w-4 h-4" />邮件咨询
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <MessageCircle className="w-4 h-4" />在线客服
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        {/* Hero Section */}
        <div className="container mx-auto px-4 md:px-6 text-center mb-16">
          <div className="flex justify-center mb-6 animate-fade-in">
            <div className="px-4 py-2 glass-card text-primary text-sm font-medium rounded-full">
              💰 透明定价 · 超值服务
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-slide-up">
            选择最适合你的<span className="text-primary">专业服务</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            我们提供设计、开发、制作、人力资源等综合服务，从个人项目到企业级解决方案
          </p>
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <ServiceCategoryNav categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          </div>
        </div>

        {/* Pricing Content */}
        <div className="container mx-auto px-4 md:px-6">
          <PricingContent />
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 md:px-6 mt-20">
          <div className="glass-card rounded-2xl p-12 text-center max-w-4xl mx-auto border border-primary/20 animate-fade-in hover:shadow-2xl transition-all duration-500">
            <h2 className="text-3xl font-bold text-foreground mb-4">需要定制化解决方案？</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">我们的专业团队随时为您提供个性化咨询服务</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button type="button" className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-lg hover:shadow-xl">
                <Mail className="w-5 h-5" />邮件咨询
              </button>
              <button type="button" className="flex items-center justify-center gap-2 px-6 py-3 glass-card border border-border rounded-lg hover:bg-muted transition-all hover:scale-105">
                <MessageCircle className="w-5 h-5" />在线客服
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

"use client";

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Tags, Palette, Video, Code, ShoppingCart } from 'lucide-react';
import { PageHeader } from "@/components/dashboard/page-header";
import { dashboardStyles } from "@/lib/dashboard-styles";
import { formatAmount } from "@/lib/dashboard-utils";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { useDashboardTranslations } from "@/lib/i18n/use-dashboard-translations";
import { cn } from "@/lib/utils";

const services = [
  { id: 'srv-001', titleKey: 'logoDesign', title: 'Brand Logo and VI System Design', category: 'brandDesign', price: 1500, descKey: 'logoDesignDesc', description: 'Create impressive brand identity from scratch, including complete visual identification system.', icon: Palette },
  { id: 'srv-002', titleKey: 'videoProduction', title: 'Premium Marketing Video Production', category: 'videoProduction', price: 5000, descKey: 'videoProductionDesc', description: 'Professional filming, editing and post-production effects to create cinematic promotional videos.', icon: Video },
  { id: 'srv-003', titleKey: 'webDevelopment', title: 'Enterprise Website and Mini Program Development', category: 'webDevelopment', price: 25000, descKey: 'webDevelopmentDesc', description: 'Responsive design and excellent performance, customized digital presence for your business needs.', icon: Code },
  { id: 'srv-004', titleKey: 'marketingMaterials', title: 'Complete Marketing Materials Design', category: 'brandDesign', price: 2800, descKey: 'marketingMaterialsDesc', description: 'Includes posters, brochures, business cards and other online and offline marketing materials.', icon: Palette },
  { id: 'srv-005', titleKey: 'productAnimation', title: 'Product Introduction Animation', category: 'videoProduction', price: 8000, descKey: 'productAnimationDesc', description: 'Showcase your product core features dynamically and interestingly through motion graphics and animation.', icon: Video },
  { id: 'srv-006', titleKey: 'ecommerceSolution', title: 'E-commerce Solution', category: 'webDevelopment', price: 35000, descKey: 'ecommerceSolutionDesc', description: 'Integrated payment, logistics, and membership system for one-stop e-commerce platform development.', icon: Code },
];

const categoryKeys = ['all', 'brandDesign', 'videoProduction', 'webDevelopment'];

export default function MarketPage() {
  const { t, isRTL } = useDashboardTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const filteredServices = services.filter(service => {
    const matchCategory = category === 'all' || service.category === category;
    const matchSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) || service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleAddToCart = (service: typeof services[0]) => {
    addItem({
      serviceId: service.id,
      serviceName: service.title,
      serviceNameEn: service.title,
      categorySlug: service.category,
      quantity: 1,
      unitPrice: service.price,
    });
    toast({
      title: t("market.addedToCart", "Added to Cart"),
      description: `${service.title} ${t("market.addedToCartDesc", "has been added to your cart")}`,
    });
  };

  const getCategoryLabel = (key: string) => {
    const labels: Record<string, string> = {
      all: t("market.allServices", "All Services"),
      brandDesign: t("market.categories.brandDesign", "Brand Design"),
      videoProduction: t("market.categories.videoProduction", "Video Production"),
      webDevelopment: t("market.categories.webDevelopment", "Web Development"),
    };
    return labels[key] || key;
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        title={t("market.title", "Service Marketplace")}
        description={t("market.description", "Explore our professional services to inject creativity and vitality into your projects")}
        icon="🛍️"
      />

      <div className={cn("flex flex-col md:flex-row gap-4", isRTL && "md:flex-row-reverse")}>
        <div className="relative flex-1">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
          <Input
            placeholder={t("market.searchPlaceholder", "Search services...")}
            className={cn(isRTL ? "pr-10" : "pl-10")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[200px]" aria-label={t("market.selectCategory", "Select Category")}>
            <SelectValue placeholder={t("market.selectCategory", "Select Category")} />
          </SelectTrigger>
          <SelectContent>
            {categoryKeys.map(cat => (
              <SelectItem key={cat} value={cat}>{getCategoryLabel(cat)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map(service => {
          const Icon = service.icon;
          return (
            <Card key={service.id} className={`flex flex-col ${dashboardStyles.card.base} hover:shadow-lg`}>
              <CardHeader>
                <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                  <CardTitle className="text-lg font-semibold">{service.title}</CardTitle>
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardDescription className={cn("flex items-center text-sm pt-1", isRTL && "flex-row-reverse")}>
                  <Tags className={cn("h-3 w-3", isRTL ? "ml-1.5" : "mr-1.5")} /> {getCategoryLabel(service.category)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </CardContent>
              <CardFooter className={cn("flex items-center justify-between mt-4", isRTL && "flex-row-reverse")}>
                <div className="text-xl font-bold text-primary">
                  {formatAmount(service.price)}
                </div>
                <Button onClick={() => handleAddToCart(service)} className={cn("gap-2", isRTL && "flex-row-reverse")}>
                  <ShoppingCart className="h-4 w-4" />
                  {t("market.addToCart", "Add to Cart")}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
      {filteredServices.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>{t("market.noServicesFound", "No matching services found.")}</p>
        </div>
      )}
    </div>
  );
}

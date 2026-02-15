"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { 
  Palette,
  Smartphone,
  Monitor,
  Building2,
  ShoppingBag,
  Utensils,
  Car,
  Heart,
  GraduationCap,
  Plane,
  ArrowRight,
  CheckCircle,
  Eye,
  Download,
  Users,
  Award,
  Briefcase,
  Image,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function DesignServicesPage() {
  const { locale } = useLanguage();

  const designServices = [
    {
      id: "brand-identity",
      name: "",
      nameEn: "Brand Identity Design",
      description: "",
      descriptionEn: "Complete brand visual identity system including logo, colors, typography",
      icon: Palette,
      color: "purple"
    },
    {
      id: "web-design",
      name: "",
      nameEn: "Website Interface Design", 
      description: "",
      descriptionEn: "Modern website interface design to enhance user experience",
      icon: Monitor,
      color: "blue"
    },
    {
      id: "mobile-app-design",
      name: "",
      nameEn: "Mobile App Design",
      description: "",
      descriptionEn: "Interface design for iOS and Android applications",
      icon: Smartphone,
      color: "green"
    },
    {
      id: "print-design",
      name: "",
      nameEn: "Print Design",
      description: "",
      descriptionEn: "Design for brochures, posters, business cards and other print materials",
      icon: Image,
      color: "orange"
    },
    {
      id: "packaging-design",
      name: "",
      nameEn: "Packaging Design",
      description: "",
      descriptionEn: "Creative and structural design for product packaging",
      icon: ShoppingBag,
      color: "pink"
    },
    {
      id: "digital-marketing",
      name: "",
      nameEn: "Digital Marketing Design",
      description: "",
      descriptionEn: "Design for social media, ad banners and other marketing materials",
      icon: Sparkles,
      color: "indigo"
    }
  ];

  const industries = [
    { id: "tech", name: "", nameEn: "Technology", icon: Building2 },
    { id: "ecommerce", name: "", nameEn: "E-commerce", icon: ShoppingBag },
    { id: "food", name: "", nameEn: "Food & Beverage", icon: Utensils },
    { id: "automotive", name: "", nameEn: "Automotive", icon: Car },
    { id: "healthcare", name: "", nameEn: "Healthcare", icon: Heart },
    { id: "education", name: "", nameEn: "Education", icon: GraduationCap },
    { id: "travel", name: "", nameEn: "Travel", icon: Plane }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 全站统一导航菜单 */}
      <Navbar />

      <div className="purple-gradient-page purple-gradient-content space-y-6 p-6 pt-24">
        {/* Header */}
        <section className="purple-gradient-hero py-20 rounded-2xl">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="purple-gradient-title text-4xl md:text-6xl font-bold mb-6">
                {locale === "en" ? "Design Services" : "设计服务"}
              </h1>
              <p className="purple-gradient-subtitle text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                {locale === "en" 
                  ? "Professional design solutions for every industry. From brand identity to digital experiences, we create designs that drive business success."
                  : "为各行业提供专业设计解决方案。从品牌识别到数字体验，我们创造推动业务成功的设计。"
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="purple-gradient-button">
                  {locale === "en" ? "Get Quote" : "获取报价"}
                </button>
                <button className="purple-gradient-button bg-transparent border border-white/20 hover:bg-white/10">
                  {locale === "en" ? "View Portfolio" : "查看作品集"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Design Services Grid */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="purple-gradient-title text-3xl md:text-4xl font-bold mb-4">
                {locale === "en"  "Our Design Services" : ""}
              </h2>
              <p className="purple-gradient-subtitle text-lg max-w-2xl mx-auto">
                {locale === "en" 
                   "Comprehensive design solutions tailored to your business needs"
                  : ""
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {designServices.map((service) => {
                const IconComponent = service.icon;
                return (
                  <div key={service.id} className="purple-gradient-card group cursor-pointer">
                    <div className="p-8">
                      <div className={`w-16 h-16 bg-${service.color}-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <IconComponent className={`purple-gradient-icon w-8 h-8 text-${service.color}-400`} />
                      </div>
                      <h3 className="purple-gradient-title text-xl font-bold mb-4">
                        {locale === "en"  service.nameEn : service.name}
                      </h3>
                      <p className="purple-gradient-subtitle mb-6">
                        {locale === "en"  service.descriptionEn : service.description}
                      </p>
                      <div className="flex items-center purple-gradient-text font-medium">
                        {locale === "en"  "Learn More" : ""}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Industry Solutions */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="purple-gradient-title text-3xl md:text-4xl font-bold mb-4">
                {locale === "en"  "Industry Solutions" : ""}
              </h2>
              <p className="purple-gradient-subtitle text-lg max-w-2xl mx-auto">
                {locale === "en" 
                   "Specialized design expertise for different industries"
                  : ""
                }
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
              {industries.map((industry) => {
                const IconComponent = industry.icon;
                return (
                  <div key={industry.id} className="purple-gradient-card text-center group cursor-pointer">
                    <div className="p-6">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <IconComponent className="purple-gradient-icon w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="purple-gradient-text text-sm font-medium">
                        {locale === "en"  industry.nameEn : industry.name}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="purple-gradient-hero py-20 px-4 rounded-2xl">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="purple-gradient-title text-3xl md:text-4xl font-bold mb-6">
              {locale === "en"  "Ready to Start Your Project"" : ""}
            </h2>
            <p className="purple-gradient-subtitle text-lg mb-8">
              {locale === "en" 
                 "Let's discuss your design needs and create something amazing together"
                : ""
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="purple-gradient-button">
                {locale === "en"  "Get Started" : ""}
              </button>
              <button className="purple-gradient-button bg-transparent border border-white/20 hover:bg-white/10">
                {locale === "en"  "Contact Us" : ""}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 全站统一页脚 */}
      <Footer />
    </div>
  );
}
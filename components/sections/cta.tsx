"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  Sparkles,
  Rocket,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import type { CTASection as CTAData } from "@/types/homepage";

export function CTASection() {
  const { t, locale } = useLanguage();
  const [ctaData, setCtaData] = useState<CTAData | null>(null);

  useEffect(() => {
    fetch("/api/homepage/cta")
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setCtaData(result.data);
        }
      })
      .catch(() => {
        // Fallback to static content on error
      });
  }, []);

  // Helper to get localized content
  const getContent = (zh: string | null | undefined, en: string | null | undefined, fallback: string) => {
    if (locale === "en") {
      return en || zh || fallback;
    }
    return zh || en || fallback;
  };

  const title = ctaData 
    ? getContent(ctaData.title, ctaData.titleEn, t.cta.title1)
    : t.cta.title1;
  const description = ctaData 
    ? getContent(ctaData.description, ctaData.descriptionEn, t.cta.subtitle)
    : t.cta.subtitle;
  const primaryBtnText = ctaData 
    ? getContent(ctaData.primaryBtnText, ctaData.primaryBtnTextEn, t.cta.primaryButton)
    : t.cta.primaryButton;
  const secondaryBtnText = ctaData?.secondaryBtnText 
    ? getContent(ctaData.secondaryBtnText, ctaData.secondaryBtnTextEn, t.cta.secondaryButton)
    : t.cta.secondaryButton;
  const primaryBtnLink = ctaData?.primaryBtnLink || "#contact";
  const secondaryBtnLink = ctaData?.secondaryBtnLink || "/portfolio";

  return (
    <section className="relative py-24 md:py-40 overflow-hidden bg-gradient-to-b from-muted/20 to-background">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/8 to-background" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-96 bg-gradient-to-r from-primary/8 via-transparent to-secondary/8 rounded-full blur-3xl" />

      <div className="relative container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-10 animate-in fade-in zoom-in duration-700 hover:scale-105 transition-transform">
            <Rocket className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">
              {t.cta.badge}
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            <span className="block bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent text-balance">
              {title}
            </span>
            <span className="block mt-2 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse-glow">
              {t.cta.title2}
            </span>
          </h2>

          {/* Description */}
          <p className="mt-8 text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12 text-balance animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <a
              href={primaryBtnLink}
              className="group relative px-10 py-5 bg-gradient-to-r from-primary to-secondary text-white rounded-full transition-all duration-300 hover:shadow-2xl hover:shadow-primary/50 hover:scale-105 font-semibold text-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {primaryBtnText}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </a>

            <a
              href={secondaryBtnLink}
              className="group px-10 py-5 bg-card/60 backdrop-blur-sm border border-border text-foreground rounded-full transition-all duration-300 hover:bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 font-semibold text-lg"
            >
              <span className="flex items-center justify-center gap-2">
                {secondaryBtnText}
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </span>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="group flex flex-col items-center text-center p-6 bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl hover:bg-card/60 hover:border-primary/30 transition-all duration-300">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse mb-3" />
              <span className="text-foreground font-medium group-hover:text-primary transition-colors duration-300">
                {t.cta.trustIndicators.available.title}
              </span>
              <span className="text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">
                {t.cta.trustIndicators.available.subtitle}
              </span>
            </div>

            <div className="group flex flex-col items-center text-center p-6 bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl hover:bg-card/60 hover:border-primary/30 transition-all duration-300">
              <Calendar className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-foreground font-medium group-hover:text-primary transition-colors duration-300">
                {t.cta.trustIndicators.response.title}
              </span>
              <span className="text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">
                {t.cta.trustIndicators.response.subtitle}
              </span>
            </div>

            <div className="group flex flex-col items-center text-center p-6 bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl hover:bg-card/60 hover:border-primary/30 transition-all duration-300">
              <CheckCircle className="w-6 h-6 text-secondary mb-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-foreground font-medium group-hover:text-primary transition-colors duration-300">
                {t.cta.trustIndicators.consultation.title}
              </span>
              <span className="text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">
                {t.cta.trustIndicators.consultation.subtitle}
              </span>
            </div>
          </div>

          {/* Additional CTA */}
          <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20 backdrop-blur-sm">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                {t.cta.additionalCta.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t.cta.additionalCta.subtitle}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-primary">
                <CheckCircle className="w-4 h-4" />
                <span>{t.cta.additionalCta.features[0]}</span>
                <span className="mx-2">•</span>
                <CheckCircle className="w-4 h-4" />
                <span>{t.cta.additionalCta.features[1]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

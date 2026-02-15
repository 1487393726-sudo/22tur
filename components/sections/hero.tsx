"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import type { HeroSection as HeroData } from "@/types/homepage";

export function HeroSection() {
  const { t, locale } = useLanguage();
  const [heroData, setHeroData] = useState<HeroData | null>(null);

  useEffect(() => {
    fetch("/api/homepage/hero")
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setHeroData(result.data);
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Get title parts (split by newline or use as single title)
  const title = heroData 
    ? getContent(heroData.title, heroData.titleEn, t.hero.title1)
    : t.hero.title1;
  const subtitle = heroData 
    ? getContent(heroData.subtitle, heroData.subtitleEn, t.hero.subtitle)
    : t.hero.subtitle;
  const ctaText = heroData 
    ? getContent(heroData.ctaText, heroData.ctaTextEn, t.hero.viewWork)
    : t.hero.viewWork;
  const ctaSecondaryText = heroData?.ctaSecondaryText 
    ? getContent(heroData.ctaSecondaryText, heroData.ctaSecondaryTextEn, t.hero.getInTouch)
    : t.hero.getInTouch;
  const ctaLink = heroData?.ctaLink || "#portfolio";
  const ctaSecondaryLink = heroData?.ctaSecondaryLink || "#contact";

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 md:py-0"
      style={heroData?.backgroundImage ? { backgroundImage: `url(${heroData.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background pointer-events-none" />

      <div className="relative z-10 container px-4 md:px-6 flex flex-col items-center text-center max-w-6xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-10 animate-in fade-in zoom-in duration-700">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {t.hero.badge}
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tighter leading-none mb-8 animate-in fade-in zoom-in duration-1000 delay-100">
          <span className="block bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent text-balance">
            {title}
          </span>
          <span className="block mt-2 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse-glow">
            {t.hero.title2}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-8 text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-[800px] leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 text-balance">
          {subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <button
            onClick={() => ctaLink.startsWith('#') ? scrollToSection(ctaLink.slice(1)) : window.location.href = ctaLink}
            className="group relative px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 hover:scale-105"
          >
            <span className="relative z-10 font-semibold tracking-wide flex items-center gap-2 justify-center">
              {ctaText}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => ctaSecondaryLink.startsWith('#') ? scrollToSection(ctaSecondaryLink.slice(1)) : window.location.href = ctaSecondaryLink}
            className="group relative px-8 py-4 bg-card/50 backdrop-blur-sm border border-border text-foreground rounded-full transition-all duration-300 hover:bg-card hover:border-primary/50"
          >
            <span className="relative z-10 font-semibold tracking-wide">
              {ctaSecondaryText}
            </span>
          </button>
        </div>

        {/* Stats */}
        <div className="mt-24 grid grid-cols-3 gap-8 md:gap-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
          <div className="group flex flex-col items-center">
            <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              500+
            </div>
            <div className="mt-2 text-xs md:text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              {t.hero.stats.projects}
            </div>
          </div>
          <div className="group flex flex-col items-center">
            <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              200+
            </div>
            <div className="mt-2 text-xs md:text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              {t.hero.stats.clients}
            </div>
          </div>
          <div className="group flex flex-col items-center">
            <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              50+
            </div>
            <div className="mt-2 text-xs md:text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              {t.hero.stats.awards}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-gradient-to-b from-primary to-transparent rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ArrowRight, Briefcase, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface PortfolioItem {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  description: string;
  descriptionEn: string;
  image: string;
  category: string;
  tags: string[];
  client?: string;
  link?: string;
  featured: boolean;
}

export function PortfolioSection() {
  const { t, locale } = useLanguage();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolioItems() {
      try {
        const res = await fetch('/api/content/portfolio');
        if (res.ok) {
          const data = await res.json();
          setItems((data.items || []).slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch portfolio items:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPortfolioItems();
  }, []);

  const getLocalizedField = (item: PortfolioItem, field: 'title' | 'description') => {
    if (locale === 'en') {
      const enField = `${field}En` as keyof PortfolioItem;
      return (item[enField] as string) || item[field];
    }
    return item[field];
  };

  return (
    <section
      id="portfolio"
      className="relative py-24 md:py-40 overflow-hidden bg-gradient-to-b from-background to-muted/20"
    >
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-gradient-to-r from-primary/3 via-transparent to-secondary/3 rounded-full blur-3xl" />

      <div className="relative container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-8">
            <span className="text-sm font-medium text-primary">{t.portfolio.badge}</span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent text-balance">
              {t.portfolio.title}
            </span>
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed text-balance max-w-3xl mx-auto">
            {t.portfolio.subtitle}
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 overflow-x-auto pb-4 md:pb-0 justify-start items-stretch">
            {items.map((item, index) => (
              <Link
                key={item.id}
                href={item.link || `/portfolio/${item.slug}`}
                className="group relative bg-card/60 backdrop-blur-sm border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-2 hover:scale-[1.01] w-full max-w-xs flex-shrink-0 md:max-w-sm"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted rounded-t-2xl">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={getLocalizedField(item, 'title')}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                  {item.featured && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-primary to-secondary text-white text-xs font-medium rounded-full">
                      {t.portfolio.sortOptions.featured}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="p-4 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors group-hover:scale-110">
                      <ExternalLink className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="text-sm text-primary font-medium mb-2 capitalize">{item.category}</div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                    {getLocalizedField(item, 'title')}
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6 line-clamp-2 group-hover:text-foreground/80 transition-colors duration-300">
                    {getLocalizedField(item, 'description')}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(item.tags || []).slice(0, 3).map((tag) => (
                      <span key={tag} className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-4">
                    <span>{item.client || t.portfolio.projectDetail.client}</span>
                    <span className="group-hover:text-primary transition-colors duration-300">{t.portfolio.projectDetail.viewLive} →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{locale === 'zh' ? '暂无作品集项目' : locale === 'ug' ? 'ئەسەرلەر يوق' : 'No portfolio items'}</p>
          </div>
        )}

        <div className="text-center mt-20">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:shadow-xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300 group text-lg font-semibold"
          >
            <span>{t.portfolio.cta}</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
          <p className="text-sm text-muted-foreground mt-6 max-w-md mx-auto">
            {t.portfolio.ctaSubtitle}
          </p>
        </div>
      </div>
    </section>
  );
}

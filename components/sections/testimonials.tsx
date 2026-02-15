"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Quote, MessageSquare, ThumbsUp } from "lucide-react";
import { testimonials as defaultTestimonials } from "@/lib/data/testimonials";
import { useLanguage } from "@/lib/i18n/context";
import type { Testimonial as TestimonialData } from "@/types/homepage";

export function TestimonialsSection() {
  const { t, locale } = useLanguage();
  const [apiTestimonials, setApiTestimonials] = useState<TestimonialData[]>([]);

  useEffect(() => {
    fetch("/api/homepage/testimonials")
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data && result.data.length > 0) {
          setApiTestimonials(result.data);
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

  // Use API testimonials if available, otherwise use default
  const testimonials = apiTestimonials.length > 0
    ? apiTestimonials.map(t => ({
        name: getContent(t.name, t.nameEn, t.name),
        role: getContent(t.position, t.positionEn, ""),
        company: getContent(t.company, t.companyEn, ""),
        content: getContent(t.content, t.contentEn, t.content),
        image: t.avatar || "/placeholder.svg",
        rating: t.rating || 5,
      }))
    : defaultTestimonials;

  return (
    <section
      id="testimonials"
      className="relative py-24 md:py-40 overflow-hidden bg-gradient-to-b from-background to-muted/20"
    >
      {/* Background decoration */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-96 bg-gradient-to-r from-secondary/3 via-transparent to-primary/3 rounded-full blur-3xl" />

      <div className="relative container px-4 md:px-6 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-8">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {t.testimonials.badge}
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent text-balance">
              {t.testimonials.title}
            </span>
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed text-balance max-w-3xl mx-auto">
            {t.testimonials.subtitle}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 md:gap-10 lg:gap-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.name}-${index}`}
              className="group relative p-4 bg-card/60 backdrop-blur-sm border border-border rounded-2xl hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-2 hover:scale-[1.02]"
            >
              {/* Quote Icon */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Quote className="w-4 h-4 text-white" />
              </div>

              {/* Rating */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-primary text-primary group-hover:scale-110 transition-transform duration-300"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed mb-4 relative z-10 text-xs md:text-sm group-hover:text-foreground/90 transition-colors duration-300">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-2 border-t border-border/50 pt-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors duration-300">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">
                    {testimonial.role}
                  </div>
                  <div className="text-xs text-primary font-medium">
                    {testimonial.company}
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
              <div className="absolute top-1/2 -right-0.5 w-1.5 h-1.5 bg-secondary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200" />
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="group text-center p-8 bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl hover:bg-card/60 hover:border-primary/30 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <Star className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t.testimonials.trustBadges.rating.title}
            </div>
            <div className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
              {t.testimonials.trustBadges.rating.label}
            </div>
          </div>

          <div className="group text-center p-8 bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl hover:bg-card/60 hover:border-primary/30 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <ThumbsUp className="w-8 h-8 text-secondary" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              {t.testimonials.trustBadges.satisfaction.title}
            </div>
            <div className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
              {t.testimonials.trustBadges.satisfaction.label}
            </div>
          </div>

          <div className="group text-center p-8 bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl hover:bg-card/60 hover:border-primary/30 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t.testimonials.trustBadges.repeat.title}
            </div>
            <div className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
              {t.testimonials.trustBadges.repeat.label}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer group">
            <span className="text-lg font-semibold text-foreground">
              {t.testimonials.cta}
            </span>
            <ThumbsUp className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
          </div>
          <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
            {t.testimonials.ctaSubtitle}
          </p>
        </div>
      </div>
    </section>
  );
}

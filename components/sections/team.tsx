"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Linkedin, Twitter, Github, Users, Star, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface TeamMember {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  bio: string;
  bioEn: string;
  avatar: string;
}

export function TeamSection() {
  const { t, locale } = useLanguage();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const res = await fetch('/api/content/team');
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
        }
      } catch (error) {
        console.error('Failed to fetch team members:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTeamMembers();
  }, []);

  // Helper to get localized content
  const getLocalizedField = (member: TeamMember, field: 'name' | 'role' | 'bio') => {
    if (locale === 'en') {
      const enField = `${field}En` as keyof TeamMember;
      return member[enField] || member[field];
    }
    return member[field];
  };

  return (
    <section
      id="team"
      className="relative py-24 md:py-40 overflow-hidden bg-gradient-to-b from-muted/20 to-background"
    >
      {/* Background decoration */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-gradient-to-r from-primary/3 via-transparent to-secondary/3 rounded-full blur-3xl" />

      <div className="relative container px-4 md:px-6 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-8">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {t.team.badge}
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent text-balance">
              {t.team.expertTitle}
            </span>
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed text-balance max-w-3xl mx-auto">
            {t.team.subtitle}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Team Grid */}
        {!isLoading && members.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10 justify-items-center">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="group relative"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative bg-card/60 backdrop-blur-sm border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-2 hover:scale-[1.01] w-full max-w-xs">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={member.avatar || "/placeholder.svg"}
                      alt={getLocalizedField(member, 'name')}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/30 to-transparent group-hover:from-card/60" />

                    {/* Social Links */}
                    <div className="absolute bottom-4 left-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <a
                        href="#"
                        className="flex items-center justify-center p-3 bg-gradient-to-r from-primary to-secondary/80 rounded-xl hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-primary/50"
                      >
                        <Linkedin className="w-4 h-4 text-white" />
                      </a>
                      <a
                        href="#"
                        className="flex items-center justify-center p-3 bg-gradient-to-r from-secondary to-primary/80 rounded-xl hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-secondary/50"
                      >
                        <Twitter className="w-4 h-4 text-white" />
                      </a>
                      <a
                        href="#"
                        className="flex items-center justify-center p-3 bg-gradient-to-r from-primary to-secondary rounded-xl hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-primary/50"
                      >
                        <Github className="w-4 h-4 text-white" />
                      </a>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h3 className="text-xl md:text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                      {getLocalizedField(member, 'name')}
                    </h3>
                    <div className="text-sm font-medium mb-4 px-3 py-1 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary rounded-full inline-block border border-primary/30">
                      {getLocalizedField(member, 'role')}
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                      {getLocalizedField(member, 'bio')}
                    </p>

                    {/* Skills indicator */}
                    <div className="flex items-center gap-1 mt-4 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                      <Star className="w-3 h-3 text-primary" />
                      <Star className="w-3 h-3 text-primary" />
                      <Star className="w-3 h-3 text-primary" />
                      <Star className="w-3 h-3 text-primary" />
                      <Star className="w-3 h-3 text-primary" />
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 animate-pulse" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-secondary/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && members.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{locale === 'zh' ? '暂无团队成员' : locale === 'ug' ? 'گۇرۇپپا ئەزالىرى يوق' : 'No team members'}</p>
          </div>
        )}

        {/* Team Stats or Call to Action */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20 backdrop-blur-sm">
            <span className="text-lg font-semibold text-foreground">
              {t.team.cta}
            </span>
            <Users className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
          </div>
          <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
            {t.team.ctaSubtitle}
          </p>
        </div>
      </div>
    </section>
  );
}

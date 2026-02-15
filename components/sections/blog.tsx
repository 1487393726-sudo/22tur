"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface BlogPost {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  excerpt: string;
  excerptEn: string;
  image: string;
  category: string;
  author: string;
  readTime: string;
  publishedAt: string;
}

export function BlogSection() {
  const { t, locale } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        const res = await fetch('/api/content/blog?limit=6');
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBlogPosts();
  }, []);

  // Helper to get localized content
  const getLocalizedField = (post: BlogPost, field: 'title' | 'excerpt') => {
    if (locale === 'en') {
      const enField = `${field}En` as keyof BlogPost;
      return post[enField] || post[field];
    }
    return post[field];
  };

  return (
    <section
      id="blog"
      className="relative py-24 md:py-40 overflow-hidden bg-gradient-to-b from-background to-muted/10"
    >
      {/* Background decoration */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-96 bg-gradient-to-r from-secondary/3 via-transparent to-primary/3 rounded-full blur-3xl" />

      <div className="relative container px-4 md:px-6 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-8">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {t.blog.badge}
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent text-balance">
              {t.blog.title}
            </span>
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed text-balance max-w-3xl mx-auto mb-8">
            {t.blog.subtitle}
          </p>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/20 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
            <TrendingUp className="w-4 h-4" />
            {t.blog.viewAll}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Blog Grid */}
        {!isLoading && posts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {posts.map((post, index) => (
              <article
                key={post.id}
                className="group relative bg-card/60 backdrop-blur-sm border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-3 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={getLocalizedField(post, 'title')}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/20 to-transparent group-hover:from-card/60" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 text-xs font-medium bg-gradient-to-r from-primary to-secondary text-white rounded-full backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {post.category}
                    </span>
                  </div>

                  {/* Read More Indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 group-hover:text-foreground/80 transition-colors duration-300">
                    <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-full">
                      <Calendar className="w-3 h-3 text-primary" />
                      <time dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).toLocaleDateString(locale === 'en' ? "en-US" : "zh-CN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-full">
                      <Clock className="w-3 h-3 text-secondary" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
                    {getLocalizedField(post, 'title')}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 line-clamp-3 group-hover:text-foreground/80 transition-colors duration-300">
                    {getLocalizedField(post, 'excerpt')}
                  </p>

                  {/* Author */}
                  <div className="flex items-center justify-between pt-6 border-t border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                        <Image
                          src="/placeholder-user.jpg"
                          alt={post.author}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                          {post.author}
                        </div>
                        <div className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">
                          {t.blog.author}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {t.blog.readMore} →
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{locale === 'zh' ? '暂无博客文章' : locale === 'ug' ? 'بىلوگ ماقالىسى يوق' : 'No blog posts'}</p>
          </div>
        )}

        {/* Additional CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer group">
            <span className="text-lg font-semibold text-foreground">
              {t.blog.cta}
            </span>
            <BookOpen className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
          </div>
          <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
            {t.blog.ctaSubtitle}
          </p>
        </div>
      </div>
    </section>
  );
}

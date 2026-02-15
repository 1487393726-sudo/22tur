'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { CardGrid3D } from '@/components/website/3d/CardGrid3D';
import { Card3D } from '@/components/website/3d/Card3D';
import { FadeInView } from '@/components/website/animations/FadeInView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BlogPageProps {
  params: {
    locale: string;
  };
}

export default function BlogPage({ params: { locale: paramsLocale } }: BlogPageProps) {
  const { locale } = useLanguage();
  const isEn = locale === 'en';
  
  // State for search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // State for pagination/infinite scroll
  const [displayedCount, setDisplayedCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Categories
  const categories = [
    { key: 'all', label: isEn ? 'All' : '全部', color: '#b026ff' },
    { key: 'design', label: isEn ? 'Design' : '设计', color: '#00f0ff' },
    { key: 'development', label: isEn ? 'Development' : '开发', color: '#ff2a6d' },
    { key: 'marketing', label: isEn ? 'Marketing' : '营销', color: '#ccff00' },
    { key: 'branding', label: isEn ? 'Branding' : '品牌', color: '#b026ff' },
  ];

  // Article data
  const articles = useMemo(() => [
    {
      key: 'webDesignTrends',
      title: isEn ? '2024 Web Design Trends' : '2024年网页设计趋势',
      excerpt: isEn ? 'Discover the latest trends shaping modern web design and user experience.' : '发现塑造现代网页设计和用户体验的最新趋势。',
      date: '2024-01-15',
      readTime: 5,
      icon: '🎨',
      category: 'design',
      categoryLabel: isEn ? 'Design' : '设计',
      color: '#00f0ff',
    },
    {
      key: 'react19',
      title: isEn ? 'React 19 Features Guide' : 'React 19特性指南',
      excerpt: isEn ? 'A comprehensive look at new features in React 19 and how to use them.' : '全面了解React 19的新特性及其使用方法。',
      date: '2024-01-10',
      readTime: 8,
      icon: '💻',
      category: 'development',
      categoryLabel: isEn ? 'Development' : '开发',
      color: '#ff2a6d',
    },
    {
      key: 'seoGuide',
      title: isEn ? 'SEO Best Practices 2024' : '2024年SEO最佳实践',
      excerpt: isEn ? 'Essential SEO strategies to improve your website ranking.' : '提高网站排名的基本SEO策略。',
      date: '2024-01-05',
      readTime: 6,
      icon: '📈',
      category: 'marketing',
      categoryLabel: isEn ? 'Marketing' : '营销',
      color: '#ccff00',
    },
    {
      key: 'uiuxBestPractices',
      title: isEn ? 'UI/UX Design Principles' : 'UI/UX设计原则',
      excerpt: isEn ? 'Key principles for creating intuitive and beautiful user interfaces.' : '创建直观美观用户界面的关键原则。',
      date: '2023-12-28',
      readTime: 7,
      icon: '🎨',
      category: 'design',
      categoryLabel: isEn ? 'Design' : '设计',
      color: '#00f0ff',
    },
    {
      key: 'nextjsPerformance',
      title: isEn ? 'Next.js Performance Tips' : 'Next.js性能优化技巧',
      excerpt: isEn ? 'Optimize your Next.js application for maximum speed and efficiency.' : '优化Next.js应用程序以获得最大速度和效率。',
      date: '2023-12-20',
      readTime: 10,
      icon: '💻',
      category: 'development',
      categoryLabel: isEn ? 'Development' : '开发',
      color: '#ff2a6d',
    },
    {
      key: 'brandBuilding',
      title: isEn ? 'Building a Strong Brand' : '打造强大品牌',
      excerpt: isEn ? 'How to create a memorable brand identity that resonates with your audience.' : '如何创建与受众产生共鸣的难忘品牌形象。',
      date: '2023-12-15',
      readTime: 5,
      icon: '🏆',
      category: 'branding',
      categoryLabel: isEn ? 'Branding' : '品牌',
      color: '#b026ff',
    },
  ], [isEn]);

  // Filter articles based on search query and selected category
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  const displayedArticles = useMemo(() => {
    return filteredArticles.slice(0, displayedCount);
  }, [filteredArticles, displayedCount]);

  const hasMore = displayedCount < filteredArticles.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + 6, filteredArticles.length));
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore, filteredArticles.length]);

  useEffect(() => {
    setDisplayedCount(6);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  return (
    <main className="min-h-screen bg-[#0a0a0f] artistic-theme artistic-bg">
      {/* Hero Section with Artistic Style */}
      <section className="relative w-full py-20 md:py-32 overflow-hidden">
        {/* Neon Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(176, 38, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(176, 38, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>
        
        <FadeInView>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="flex justify-center gap-2 mb-6">
              <div className="neon-dot" style={{ animationDelay: '0s' }}></div>
              <div className="neon-dot" style={{ animationDelay: '0.2s', background: '#b026ff' }}></div>
              <div className="neon-dot" style={{ animationDelay: '0.4s', background: '#ff2a6d' }}></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#b026ff] to-[#00f0ff] bg-clip-text text-transparent">
                {isEn ? 'Blog' : '博客'}
              </span>
            </h1>
            <p className="text-xl text-[#9ca3af] max-w-3xl mx-auto">
              {isEn ? 'Insights, tips, and trends from our experts' : '来自我们专家的见解、技巧和趋势'}
            </p>
          </div>
        </FadeInView>
        
        {/* Decorative gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(176,38,255,0.15) 0%, transparent 50%)',
          }}
        />
      </section>

      {/* Search and Category Filter */}
      <section className="py-8 bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4">
          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-6">
            <Input
              type="text"
              placeholder={isEn ? 'Search articles...' : '搜索文章...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border-white/10 text-white placeholder:text-[#9ca3af] focus:border-[#b026ff]/50 focus:ring-[#b026ff]/50"
              aria-label={isEn ? 'Search articles' : '搜索文章'}
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
                  selectedCategory === category.key
                    ? 'text-white shadow-lg'
                    : 'bg-white/5 text-[#9ca3af] border border-white/10 hover:border-[#b026ff]/50'
                }`}
                style={selectedCategory === category.key ? { 
                  backgroundColor: category.color,
                  boxShadow: `0 0 20px ${category.color}50`,
                } : {}}
                aria-label={`${isEn ? 'Filter by' : '按'} ${category.label}`}
                aria-pressed={selectedCategory === category.key}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Articles Grid with 3D Cards */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          {filteredArticles.length > 0 ? (
            <>
              <CardGrid3D
                columns={{ mobile: 1, tablet: 2, desktop: 3 }}
                gap="8"
                staggerDelay={0.1}
                className="max-w-7xl mx-auto"
                ariaLabel={isEn ? 'Blog articles' : '博客文章'}
              >
                {displayedArticles.map((article) => (
                  <Card3D
                    key={article.key}
                    intensity="medium"
                    depth="medium"
                    glassEffect="heavy"
                    enableHover={true}
                    className="h-full bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#b026ff]/50 hover:shadow-[0_0_30px_rgba(176,38,255,0.2)] transition-all duration-300 group"
                    ariaLabel={article.title}
                    role="article"
                  >
                    {/* Article Icon/Image */}
                    <div 
                      className="h-48 flex items-center justify-center text-6xl relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${article.color}20 0%, ${article.color}05 100%)`,
                      }}
                    >
                      {/* Neon Glow */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `radial-gradient(circle at center, ${article.color}30 0%, transparent 70%)`,
                        }}
                      />
                      <span className="relative z-10">{article.icon}</span>
                    </div>
                    
                    {/* Article Content */}
                    <div className="p-6">
                      {/* Meta Information */}
                      <div className="flex items-center gap-4 mb-3 text-sm text-[#9ca3af]">
                        <span 
                          className="font-semibold px-2 py-1 rounded-full text-xs"
                          style={{ 
                            backgroundColor: `${article.color}20`,
                            color: article.color,
                          }}
                        >
                          {article.categoryLabel}
                        </span>
                        <span>{article.date}</span>
                        <span>{article.readTime} {isEn ? 'min read' : '分钟阅读'}</span>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00f0ff] transition-colors cursor-pointer">
                        {article.title}
                      </h3>
                      
                      {/* Excerpt */}
                      <p className="text-[#9ca3af] mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                      
                      {/* Read More Link */}
                      <a
                        href="#"
                        className="inline-flex items-center gap-2 font-semibold text-[#00f0ff] hover:text-[#b026ff] transition-all hover:gap-3"
                        aria-label={`${isEn ? 'Read more about' : '阅读更多关于'} ${article.title}`}
                      >
                        {isEn ? 'Read More' : '阅读更多'} →
                      </a>
                    </div>
                  </Card3D>
                ))}
              </CardGrid3D>

              {/* Infinite Scroll Trigger & Loading State */}
              {hasMore && (
                <div 
                  ref={loadMoreRef}
                  className="flex justify-center items-center mt-12 min-h-[100px]"
                  role="status"
                  aria-live="polite"
                  aria-label={isLoading ? (isEn ? 'Loading more articles' : '加载更多文章') : (isEn ? 'Scroll to load more' : '滚动加载更多')}
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-[#b026ff]/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#b026ff] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-[#9ca3af] font-medium">
                        {isEn ? 'Loading more articles...' : '加载更多文章...'}
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={loadMore}
                      variant="outline"
                      className="px-8 py-3 border-[#b026ff]/50 text-[#00f0ff] hover:bg-[#b026ff]/10 hover:shadow-[0_0_20px_rgba(176,38,255,0.3)] transition-all duration-300"
                      aria-label={isEn ? 'Load more articles' : '加载更多文章'}
                    >
                      {isEn ? 'Load More' : '加载更多'}
                    </Button>
                  )}
                </div>
              )}

              {/* End of Results Message */}
              {!hasMore && displayedArticles.length > 0 && (
                <div className="text-center mt-12">
                  <p className="text-[#9ca3af] text-lg">
                    {isEn ? "You've reached the end of the articles" : '您已浏览完所有文章'}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {isEn ? 'No results found' : '未找到结果'}
              </h3>
              <p className="text-[#9ca3af] mb-6">
                {isEn ? 'Try adjusting your search or filter criteria' : '尝试调整搜索或筛选条件'}
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                variant="outline"
                className="border-[#b026ff]/50 text-[#00f0ff] hover:bg-[#b026ff]/10"
                aria-label={isEn ? 'Reset filters' : '重置筛选'}
              >
                {isEn ? 'Reset Filters' : '重置筛选'}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Neon Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(176, 38, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <FadeInView delay={0.2}>
            <div className="max-w-2xl mx-auto p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
                {isEn ? 'Subscribe to Our Newsletter' : '订阅我们的新闻通讯'}
              </h2>
              <p className="text-[#9ca3af] mb-8 text-center">
                {isEn ? 'Get the latest articles and insights delivered to your inbox' : '获取最新文章和见解，直接发送到您的收件箱'}
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder={isEn ? 'Enter your email' : '输入您的邮箱'}
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-[#9ca3af] focus:border-[#b026ff]/50 focus:ring-[#b026ff]/50"
                  aria-label={isEn ? 'Email address' : '邮箱地址'}
                  required
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#b026ff] to-[#7c3aed] text-white hover:shadow-[0_0_30px_rgba(176,38,255,0.5)] transition-all duration-300 hover:scale-105"
                  aria-label={isEn ? 'Subscribe' : '订阅'}
                >
                  {isEn ? 'Subscribe' : '订阅'}
                </Button>
              </form>
            </div>
          </FadeInView>
        </div>
      </section>
    </main>
  );
}

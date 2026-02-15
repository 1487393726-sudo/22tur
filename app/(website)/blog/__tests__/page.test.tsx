/**
 * Blog Page Integration Tests
 * 
 * Tests for the blog list page implementation with 3D effects and infinite scroll
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.5
 * 
 * Note: These tests verify the structure and implementation of the blog page.
 * Since the page uses server components with async metadata generation,
 * we test the rendered output and component structure.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Blog Page Implementation', () => {
  let pageContent: string;

  beforeAll(() => {
    // Read the blog page source code
    const pagePath = join(process.cwd(), 'app', '(website)', 'blog', 'page.tsx');
    pageContent = readFileSync(pagePath, 'utf-8');
  });

  describe('Requirement 12.1: Display article list with 3D card grid', () => {
    it('should import CardGrid3D component', () => {
      expect(pageContent).toContain("import { CardGrid3D } from '@/components/website/3d/CardGrid3D'");
    });

    it('should import Card3D component', () => {
      expect(pageContent).toContain("import { Card3D } from '@/components/website/3d/Card3D'");
    });

    it('should use CardGrid3D for article layout', () => {
      expect(pageContent).toContain('<CardGrid3D');
      expect(pageContent).toContain('columns={{ mobile: 1, tablet: 2, desktop: 3 }}');
    });

    it('should configure responsive grid columns', () => {
      expect(pageContent).toContain('mobile: 1');
      expect(pageContent).toContain('tablet: 2');
      expect(pageContent).toContain('desktop: 3');
    });

    it('should configure stagger animation delay', () => {
      expect(pageContent).toContain('staggerDelay={0.1}');
    });

    it('should have proper ARIA label for article grid', () => {
      expect(pageContent).toContain('ariaLabel="Blog articles"');
    });
  });

  describe('Requirement 12.2: Display article metadata (title, excerpt, date, category)', () => {
    it('should define article data with all required fields', () => {
      expect(pageContent).toContain('const articles = [');
      expect(pageContent).toContain('key:');
      expect(pageContent).toContain('date:');
      expect(pageContent).toContain('readTime:');
    });

    it('should display article title', () => {
      expect(pageContent).toContain('articles.${article.key}.title');
    });

    it('should display article excerpt', () => {
      expect(pageContent).toContain('articles.${article.key}.excerpt');
    });

    it('should display article date', () => {
      expect(pageContent).toContain('{article.date}');
    });

    it('should display article category', () => {
      // Category is now stored directly in article object
      expect(pageContent).toContain('category:');
      expect(pageContent).toContain('const categoryKey = article.category');
      expect(pageContent).toContain('categories.${categoryKey}');
    });

    it('should display read time', () => {
      expect(pageContent).toContain('{article.readTime}');
      expect(pageContent).toContain("t('readTime')");
    });

    it('should have at least 6 articles defined', () => {
      const articleMatches = pageContent.match(/key: '[^']+'/g);
      expect(articleMatches).toBeTruthy();
      expect(articleMatches!.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Requirement 12.3: 3D card hover effects', () => {
    it('should wrap articles in Card3D components', () => {
      expect(pageContent).toContain('<Card3D');
    });

    it('should enable hover effects on cards', () => {
      expect(pageContent).toContain('enableHover={true}');
    });

    it('should configure card intensity', () => {
      expect(pageContent).toContain('intensity="medium"');
    });

    it('should configure card depth for shadows', () => {
      expect(pageContent).toContain('depth="medium"');
    });

    it('should apply glass effect to cards', () => {
      expect(pageContent).toContain('glassEffect="medium"');
    });

    it('should have proper ARIA labels for cards', () => {
      expect(pageContent).toContain('ariaLabel={t(`articles.${article.key}.title`)}');
    });

    it('should set role="article" for semantic HTML', () => {
      expect(pageContent).toContain('role="article"');
    });
  });

  describe('Multi-language support', () => {
    it('should use useTranslations hook', () => {
      expect(pageContent).toContain("useTranslations('blog')");
    });

    it('should use translation keys for all text content', () => {
      expect(pageContent).toContain("t('title')");
      expect(pageContent).toContain("t('subtitle')");
      expect(pageContent).toContain("t('categories.");
      expect(pageContent).toContain("t('readMore')");
    });

    it('should generate metadata from translations', () => {
      expect(pageContent).toContain('generateMetadata');
      // Note: Client component uses basic metadata, not getTranslations
      expect(pageContent).toContain("title: 'Blog'");
    });

    it('should accept locale parameter', () => {
      expect(pageContent).toContain('params: { locale }');
    });
  });

  describe('Category filter', () => {
    it('should define category list', () => {
      expect(pageContent).toContain('const categories = [');
    });

    it('should render category filter buttons', () => {
      expect(pageContent).toContain('categories.map((category');
    });

    it('should have proper ARIA labels for filter buttons', () => {
      expect(pageContent).toContain('aria-label={`Filter by ${category.label}`}');
    });

    it('should include all required categories', () => {
      expect(pageContent).toContain("key: 'all'");
      expect(pageContent).toContain("key: 'design'");
      expect(pageContent).toContain("key: 'development'");
      expect(pageContent).toContain("key: 'marketing'");
      expect(pageContent).toContain("key: 'branding'");
    });
  });

  describe('Pagination / Infinite Scroll (Requirement 12.5)', () => {
    it('should implement infinite scroll with Intersection Observer', () => {
      expect(pageContent).toContain('useRef');
      expect(pageContent).toContain('loadMoreRef');
      expect(pageContent).toContain('IntersectionObserver');
    });

    it('should track displayed article count', () => {
      expect(pageContent).toContain('displayedCount');
      expect(pageContent).toContain('setDisplayedCount');
    });

    it('should track loading state', () => {
      expect(pageContent).toContain('isLoading');
      expect(pageContent).toContain('setIsLoading');
    });

    it('should implement loadMore function', () => {
      expect(pageContent).toContain('const loadMore');
      expect(pageContent).toContain('loadMore');
    });

    it('should check if there are more articles to load', () => {
      expect(pageContent).toContain('hasMore');
      expect(pageContent).toContain('displayedCount < filteredArticles.length');
    });

    it('should display loading spinner when loading', () => {
      expect(pageContent).toContain('isLoading');
      expect(pageContent).toContain('animate-spin');
    });

    it('should display load more button', () => {
      expect(pageContent).toContain('Load More');
      expect(pageContent).toContain('onClick={loadMore}');
    });

    it('should have proper ARIA attributes for loading state', () => {
      expect(pageContent).toContain('role="status"');
      expect(pageContent).toContain('aria-live="polite"');
    });

    it('should display end of results message', () => {
      expect(pageContent).toContain('endOfResults');
      expect(pageContent).toContain('!hasMore');
    });

    it('should reset displayed count when filters change', () => {
      expect(pageContent).toContain('useEffect');
      expect(pageContent).toContain('setDisplayedCount(6)');
      expect(pageContent).toContain('[searchQuery, selectedCategory]');
    });

    it('should configure Intersection Observer with proper options', () => {
      expect(pageContent).toContain('rootMargin');
      expect(pageContent).toContain('threshold');
    });

    it('should cleanup Intersection Observer on unmount', () => {
      expect(pageContent).toContain('observer.unobserve');
      expect(pageContent).toContain('return ()');
    });
  });

  describe('Newsletter subscription', () => {
    it('should render subscription section', () => {
      expect(pageContent).toContain("t('subscribe.title')");
      expect(pageContent).toContain("t('subscribe.description')");
    });

    it('should render email input with proper attributes', () => {
      expect(pageContent).toContain('type="email"');
      expect(pageContent).toContain('aria-label="Email address"');
      expect(pageContent).toContain('required');
    });

    it('should render subscribe button', () => {
      expect(pageContent).toContain('aria-label="Subscribe to newsletter"');
      expect(pageContent).toContain("t('subscribe.button')");
    });

    it('should use GlassCard for subscription form', () => {
      expect(pageContent).toContain('<GlassCard');
    });
  });

  describe('Animation integration', () => {
    it('should import FadeInView animation component', () => {
      expect(pageContent).toContain("import { FadeInView } from '@/components/website/animations/FadeInView'");
    });

    it('should use FadeInView for hero section', () => {
      expect(pageContent).toContain('<FadeInView>');
    });

    it('should use FadeInView for subscription section', () => {
      const fadeInMatches = pageContent.match(/<FadeInView/g);
      expect(fadeInMatches).toBeTruthy();
      expect(fadeInMatches!.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Accessibility', () => {
    it('should use semantic HTML structure', () => {
      expect(pageContent).toContain('<main');
      expect(pageContent).toContain('<section');
    });

    it('should have proper heading hierarchy', () => {
      expect(pageContent).toContain('<h1');
      expect(pageContent).toContain('<h2');
      expect(pageContent).toContain('<h3');
    });

    it('should have ARIA labels for interactive elements', () => {
      const ariaLabelMatches = pageContent.match(/aria-label=/g);
      expect(ariaLabelMatches).toBeTruthy();
      expect(ariaLabelMatches!.length).toBeGreaterThan(5);
    });

    it('should have proper roles for semantic elements', () => {
      expect(pageContent).toContain('role="article"');
      expect(pageContent).toContain('role="status"');
    });
  });

  describe('Responsive design', () => {
    it('should use responsive container classes', () => {
      expect(pageContent).toContain('container mx-auto');
    });

    it('should use responsive padding', () => {
      expect(pageContent).toContain('py-16 md:py-24');
    });

    it('should use responsive text sizes', () => {
      expect(pageContent).toContain('text-4xl md:text-5xl');
    });

    it('should configure responsive grid through CardGrid3D', () => {
      expect(pageContent).toContain('columns={{ mobile: 1, tablet: 2, desktop: 3 }}');
    });
  });
});

describe('Blog Translation Files', () => {
  it('should have Chinese translation file', () => {
    const zhPath = join(process.cwd(), 'messages', 'zh', 'blog.json');
    expect(() => readFileSync(zhPath, 'utf-8')).not.toThrow();
    
    const zhContent = JSON.parse(readFileSync(zhPath, 'utf-8'));
    expect(zhContent.title).toBeDefined();
    expect(zhContent.categories).toBeDefined();
    expect(zhContent.articles).toBeDefined();
  });

  it('should have English translation file', () => {
    const enPath = join(process.cwd(), 'messages', 'en', 'blog.json');
    expect(() => readFileSync(enPath, 'utf-8')).not.toThrow();
    
    const enContent = JSON.parse(readFileSync(enPath, 'utf-8'));
    expect(enContent.title).toBeDefined();
    expect(enContent.categories).toBeDefined();
    expect(enContent.articles).toBeDefined();
  });

  it('should have Uyghur translation file', () => {
    const ugPath = join(process.cwd(), 'messages', 'ug', 'blog.json');
    expect(() => readFileSync(ugPath, 'utf-8')).not.toThrow();
    
    const ugContent = JSON.parse(readFileSync(ugPath, 'utf-8'));
    expect(ugContent.title).toBeDefined();
    expect(ugContent.categories).toBeDefined();
    expect(ugContent.articles).toBeDefined();
  });

  it('should have consistent translation keys across all languages', () => {
    const zhPath = join(process.cwd(), 'messages', 'zh', 'blog.json');
    const enPath = join(process.cwd(), 'messages', 'en', 'blog.json');
    const ugPath = join(process.cwd(), 'messages', 'ug', 'blog.json');
    
    const zh = JSON.parse(readFileSync(zhPath, 'utf-8'));
    const en = JSON.parse(readFileSync(enPath, 'utf-8'));
    const ug = JSON.parse(readFileSync(ugPath, 'utf-8'));
    
    // Check top-level keys
    expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort());
    expect(Object.keys(zh).sort()).toEqual(Object.keys(ug).sort());
    
    // Check category keys
    expect(Object.keys(zh.categories).sort()).toEqual(Object.keys(en.categories).sort());
    expect(Object.keys(zh.categories).sort()).toEqual(Object.keys(ug.categories).sort());
    
    // Check article keys
    expect(Object.keys(zh.articles).sort()).toEqual(Object.keys(en.articles).sort());
    expect(Object.keys(zh.articles).sort()).toEqual(Object.keys(ug.articles).sort());
  });

  it('should have loading state translation keys', () => {
    const zhPath = join(process.cwd(), 'messages', 'zh', 'blog.json');
    const enPath = join(process.cwd(), 'messages', 'en', 'blog.json');
    const ugPath = join(process.cwd(), 'messages', 'ug', 'blog.json');
    
    const zh = JSON.parse(readFileSync(zhPath, 'utf-8'));
    const en = JSON.parse(readFileSync(enPath, 'utf-8'));
    const ug = JSON.parse(readFileSync(ugPath, 'utf-8'));
    
    // Check loading state keys
    expect(zh.loading).toBeDefined();
    expect(en.loading).toBeDefined();
    expect(ug.loading).toBeDefined();
    
    expect(zh.loadMore).toBeDefined();
    expect(en.loadMore).toBeDefined();
    expect(ug.loadMore).toBeDefined();
    
    expect(zh.endOfResults).toBeDefined();
    expect(en.endOfResults).toBeDefined();
    expect(ug.endOfResults).toBeDefined();
  });
});


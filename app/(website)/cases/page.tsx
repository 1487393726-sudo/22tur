'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardGrid3D } from '@/components/website/3d/CardGrid3D';
import { Card3D } from '@/components/website/3d/Card3D';
import { FadeInView } from '@/components/website/animations/FadeInView';
import { CaseDetailModal, type CaseDetailData } from '@/components/website/ui/CaseDetailModal';
import { useLanguage } from '@/lib/i18n/context';

// Force dynamic rendering to avoid prerender errors
export const dynamic = 'force-dynamic';

interface CaseItem {
  title: string;
  client: string;
  category: string;
  description: string;
  results: string[];
  tags: string[];
}

// Static case data - TODO: Move to translations file
const staticCases: CaseItem[] = [
  {
    title: 'E-commerce Platform Redesign',
    client: 'TechMart Inc.',
    category: 'E-commerce',
    description: 'Complete redesign of an e-commerce platform to improve user experience and increase conversion rates.',
    results: ['50% increase in conversion rate', '35% reduction in cart abandonment', '2x faster page load times'],
    tags: ['UI/UX', 'React', 'Performance'],
  },
  {
    title: 'Brand Identity & Website',
    client: 'Creative Studio',
    category: 'Branding',
    description: 'Developed a comprehensive brand identity and modern website for a creative agency.',
    results: ['100+ new client inquiries', 'Award-winning design', '90% client satisfaction'],
    tags: ['Branding', 'Web Design', 'Next.js'],
  },
  {
    title: 'Mobile App Development',
    client: 'FinTech Solutions',
    category: 'Mobile',
    description: 'Built a secure mobile banking application with advanced features and seamless UX.',
    results: ['500K+ downloads', '4.8 star rating', 'Zero security incidents'],
    tags: ['React Native', 'Security', 'FinTech'],
  },
  {
    title: 'Enterprise Dashboard',
    client: 'DataCorp',
    category: 'Enterprise',
    description: 'Created a comprehensive analytics dashboard for enterprise data management.',
    results: ['40% faster data processing', 'Real-time insights', 'Scalable architecture'],
    tags: ['Dashboard', 'Analytics', 'TypeScript'],
  },
  {
    title: 'Marketing Campaign',
    client: 'Growth Agency',
    category: 'Marketing',
    description: 'Executed a multi-channel digital marketing campaign with measurable results.',
    results: ['300% ROI', '2M+ impressions', '50K+ conversions'],
    tags: ['SEO', 'Social Media', 'Content'],
  },
  {
    title: 'SaaS Platform',
    client: 'CloudTech',
    category: 'SaaS',
    description: 'Developed a scalable SaaS platform with subscription management and analytics.',
    results: ['1000+ active users', '99.9% uptime', 'Automated billing'],
    tags: ['SaaS', 'Cloud', 'Automation'],
  },
];

export default function CasesPage() {
  const { language } = useLanguage();
  const [selectedCase, setSelectedCase] = useState<CaseDetailData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  
  // Use static cases for now
  const allCases = staticCases;

  // Extract unique categories and tags
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(allCases.map(c => c.category)));
    return ['all', ...uniqueCategories];
  }, [allCases]);

  const allTags = useMemo(() => {
    const uniqueTags = Array.from(new Set(allCases.flatMap(c => c.tags)));
    return ['all', ...uniqueTags];
  }, [allCases]);

  // Filter cases based on selected category and tag
  const filteredCases = useMemo(() => {
    return allCases.filter(caseItem => {
      const categoryMatch = selectedCategory === 'all' || caseItem.category === selectedCategory;
      const tagMatch = selectedTag === 'all' || caseItem.tags.includes(selectedTag);
      return categoryMatch && tagMatch;
    });
  }, [allCases, selectedCategory, selectedTag]);

  // Static translations - TODO: Move to translations file
  const translations = {
    hero: {
      title: language === 'zh' ? '成功案例' : 'Success Cases',
      subtitle: language === 'zh' ? '探索我们为客户创造的卓越成果' : 'Explore the exceptional results we\'ve created for our clients',
    },
    filters: {
      category: language === 'zh' ? '分类' : 'Category',
      tag: language === 'zh' ? '标签' : 'Tags',
      all: language === 'zh' ? '全部' : 'All',
      showing: language === 'zh' ? `显示 ${filteredCases.length} 个案例` : `Showing ${filteredCases.length} cases`,
      noResults: language === 'zh' ? '未找到案例' : 'No Cases Found',
      noResultsDescription: language === 'zh' ? '请尝试调整筛选条件' : 'Try adjusting your filters',
      clearFilters: language === 'zh' ? '清除筛选' : 'Clear Filters',
    },
    resultsLabel: language === 'zh' ? '成果' : 'Results',
    detail: {
      viewDetails: language === 'zh' ? '查看详情' : 'View Details',
      timeline: language === 'zh' ? '时间线' : 'Timeline',
      duration: language === 'zh' ? '持续时间' : 'Duration',
      startDate: language === 'zh' ? '开始日期' : 'Start Date',
      endDate: language === 'zh' ? '结束日期' : 'End Date',
      keyMetrics: language === 'zh' ? '关键指标' : 'Key Metrics',
      results: language === 'zh' ? '成果' : 'Results',
      challenges: language === 'zh' ? '挑战' : 'Challenges',
      solution: language === 'zh' ? '解决方案' : 'Solution',
      technologies: language === 'zh' ? '技术' : 'Technologies',
      gallery: language === 'zh' ? '图库' : 'Gallery',
    },
    mockData: {
      timeline: {
        duration: '3 months',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
      },
      metrics: [
        { label: 'Performance', value: '+150%' },
        { label: 'User Satisfaction', value: '95%' },
        { label: 'ROI', value: '300%' },
      ],
      challenges: 'The main challenge was to balance performance with rich features while maintaining excellent user experience.',
      solution: 'We implemented a modern tech stack with optimized architecture and progressive enhancement strategies.',
    },
  };

  // Handle case card click to show details
  const handleCaseClick = (caseItem: CaseItem, index: number) => {
    // Create detailed case data with mock timeline and metrics
    const detailData: CaseDetailData = {
      ...caseItem,
      timeline: translations.mockData.timeline,
      metrics: translations.mockData.metrics,
      challenges: translations.mockData.challenges,
      solution: translations.mockData.solution,
      images: ['1', '2', '3', '4', '5', '6'], // Mock image placeholders
    };
    
    setSelectedCase(detailData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing selected case to allow modal close animation
    setTimeout(() => setSelectedCase(null), 300);
  };

  // Translation object for modal
  const modalTranslations = {
    timeline: translations.detail.timeline,
    duration: translations.detail.duration,
    startDate: translations.detail.startDate,
    endDate: translations.detail.endDate,
    keyMetrics: translations.detail.keyMetrics,
    results: translations.detail.results,
    challenges: translations.detail.challenges,
    solution: translations.detail.solution,
    technologies: translations.detail.technologies,
    gallery: translations.detail.gallery,
  };

  // Icon mapping for case categories
  const getCaseIcon = (index: number) => {
    const icons = ['🛒', '🎨', '📱', '💼', '📈', '⚙️'];
    return icons[index % icons.length];
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section with 3D gradient background */}
      <section 
        className="relative w-full py-20 md:py-32 overflow-hidden"
        style={{ background: 'var(--gradient-primary)' }}
      >
        <div className="container mx-auto px-4 text-center">
          <FadeInView>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {translations.hero.title}
            </h1>
          </FadeInView>
          <FadeInView delay={0.2}>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {translations.hero.subtitle}
            </p>
          </FadeInView>
        </div>
      </section>

      {/* Filter Section with Glass Effect */}
      <section className="py-8 bg-gradient-to-b from-white to-gray-50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Category Filter */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {translations.filters.category}
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'glass-medium shadow-lg scale-105'
                        : 'glass-light hover:glass-medium'
                    }`}
                    style={{
                      color: selectedCategory === category ? 'var(--color-primary-700)' : 'var(--color-gray-700)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: selectedCategory === category ? 'var(--color-primary-300)' : 'var(--color-gray-200)',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {category === 'all' ? translations.filters.all : category}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {translations.filters.tag}
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <motion.button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedTag === tag
                        ? 'glass-medium shadow-lg scale-105'
                        : 'glass-light hover:glass-medium'
                    }`}
                    style={{
                      color: selectedTag === tag ? 'var(--color-secondary-700)' : 'var(--color-gray-700)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: selectedTag === tag ? 'var(--color-secondary-300)' : 'var(--color-gray-200)',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tag === 'all' ? translations.filters.all : tag}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <motion.div 
              className="mt-4 text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={`${selectedCategory}-${selectedTag}`}
            >
              {translations.filters.showing}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cases Grid with 3D Cards and Animation */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${selectedTag}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {filteredCases.length > 0 ? (
                <CardGrid3D
                  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
                  gap="8"
                  staggerDelay={0.1}
                  className="max-w-7xl mx-auto"
                  ariaLabel="Case studies grid"
                >
                  {filteredCases.map((caseItem, index) => (
                    <motion.div
                      key={`${caseItem.title}-${index}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card3D
                        intensity="medium"
                        depth="medium"
                        glassEffect="light"
                        className="bg-white h-full cursor-pointer"
                        ariaLabel={`Case study: ${caseItem.title}`}
                        onClick={() => handleCaseClick(caseItem, index)}
                      >
                        {/* Case Image/Icon */}
                        <div 
                          className="h-48 flex items-center justify-center text-6xl relative overflow-hidden"
                          style={{ 
                            background: 'linear-gradient(135deg, var(--color-primary-100) 0%, var(--color-primary-200) 100%)'
                          }}
                        >
                          <span className="relative z-10">{getCaseIcon(index)}</span>
                          {/* Decorative gradient overlay */}
                          <div 
                            className="absolute inset-0 opacity-20"
                            style={{
                              background: 'radial-gradient(circle at 30% 50%, var(--color-secondary-300), transparent 70%)'
                            }}
                          />
                        </div>

                        {/* Case Content */}
                        <div className="p-6">
                          {/* Category Badge */}
                          <div 
                            className="inline-block text-sm font-semibold mb-3 px-3 py-1 rounded-full"
                            style={{ 
                              backgroundColor: 'var(--color-secondary-100)',
                              color: 'var(--color-secondary-700)'
                            }}
                          >
                            {caseItem.category}
                          </div>

                          {/* Title */}
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {caseItem.title}
                          </h3>

                          {/* Client */}
                          <p className="text-sm text-gray-600 mb-4">
                            {caseItem.client}
                          </p>

                          {/* Description */}
                          <p className="text-gray-700 mb-4 line-clamp-2">
                            {caseItem.description}
                          </p>

                          {/* Results */}
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                              {translations.resultsLabel}
                            </h4>
                            <ul className="space-y-1">
                              {caseItem.results.map((result, rIndex) => (
                                <li 
                                  key={rIndex} 
                                  className="text-sm text-gray-700 flex items-start gap-2"
                                >
                                  <span 
                                    className="mt-0.5 flex-shrink-0"
                                    style={{ color: 'var(--color-accent-500)' }}
                                  >
                                    ✓
                                  </span>
                                  <span>{result}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {caseItem.tags.map((tag, tIndex) => (
                              <span 
                                key={tIndex}
                                className="px-3 py-1 text-xs rounded-full transition-colors"
                                style={{ 
                                  backgroundColor: 'var(--color-primary-50)',
                                  color: 'var(--color-primary-700)',
                                  border: '1px solid var(--color-primary-200)'
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* View Details Button */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <span 
                              className="text-sm font-medium inline-flex items-center gap-2 transition-colors"
                              style={{ color: 'var(--color-primary-600)' }}
                            >
                              {translations.detail.viewDetails}
                              <svg 
                                className="w-4 h-4" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M9 5l7 7-7 7" 
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </Card3D>
                    </motion.div>
                  ))}
                </CardGrid3D>
              ) : (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {translations.filters.noResults}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {translations.filters.noResultsDescription}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedTag('all');
                    }}
                    className="glass-medium px-6 py-3 rounded-full font-medium transition-all hover:scale-105"
                    style={{
                      color: 'var(--color-primary-700)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--color-primary-300)',
                    }}
                  >
                    {translations.filters.clearFilters}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Case Detail Modal */}
      <CaseDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        caseData={selectedCase}
        translations={modalTranslations}
      />
    </main>
  );
}

'use client';

import { useLanguage } from '@/lib/i18n/context';
import { HeroSection3D } from '@/components/website/3d/HeroSection3D';
import { CardGrid3D } from '@/components/website/3d/CardGrid3D';
import { Card3D } from '@/components/website/3d/Card3D';

export default function ServicesPage() {
  const { locale } = useLanguage();
  const isEn = locale === 'en';

  const services = [
    {
      icon: '🎨',
      title: isEn ? 'Brand Design' : '品牌设计',
      description: isEn ? 'Unique visual identity that makes your brand stand out.' : '独特的视觉识别，让您的品牌脱颖而出。',
      color: '#b026ff',
    },
    {
      icon: '💻',
      title: isEn ? 'Web Development' : '网站开发',
      description: isEn ? 'High-performance, responsive modern web development.' : '高性能、响应式的现代网站开发。',
      color: '#00f0ff',
    },
    {
      icon: '📱',
      title: isEn ? 'Mobile Apps' : '移动应用',
      description: isEn ? 'Native and cross-platform mobile applications.' : '原生和跨平台移动应用开发。',
      color: '#ff2a6d',
    },
    {
      icon: '🚀',
      title: isEn ? 'Digital Marketing' : '数字营销',
      description: isEn ? 'Data-driven strategies to boost brand influence.' : '数据驱动的策略，提升品牌影响力。',
      color: '#ccff00',
    },
    {
      icon: '✨',
      title: isEn ? 'UI/UX Design' : 'UI/UX设计',
      description: isEn ? 'User-centered product design and optimization.' : '以用户为中心的产品设计和优化。',
      color: '#ff6b35',
    },
    {
      icon: '🎯',
      title: isEn ? 'Strategy' : '策略咨询',
      description: isEn ? 'Comprehensive digital strategy and consulting.' : '全面的数字战略和咨询服务。',
      color: '#b026ff',
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0f] artistic-theme artistic-bg">
      {/* Hero Section */}
      <HeroSection3D
        title={isEn ? 'Our Services' : '我们的服务'}
        subtitle={isEn ? 'We provide comprehensive digital solutions' : '我们提供全面的数字解决方案'}
        ctaText={isEn ? 'Contact Us' : '联系我们'}
        ctaLink="/contact"
        gradientScheme="purple"
        enableParallax={true}
        enableFloatingElements={true}
        className="artistic-hero"
        locale={locale}
      />

      {/* Services Grid */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center gap-2 mb-6">
              <div className="neon-dot" style={{ animationDelay: '0s' }}></div>
              <div className="neon-dot" style={{ animationDelay: '0.2s', background: '#b026ff' }}></div>
              <div className="neon-dot" style={{ animationDelay: '0.4s', background: '#ff2a6d' }}></div>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#b026ff] to-[#00f0ff] bg-clip-text text-transparent">
                {isEn ? 'What We Offer' : '我们提供的服务'}
              </span>
            </h2>
            <p className="text-lg text-[#9ca3af] max-w-2xl mx-auto">
              {isEn ? 'Comprehensive solutions for your digital needs' : '满足您数字需求的综合解决方案'}
            </p>
            <div className="neon-line max-w-md mx-auto mt-8"></div>
          </div>

          {/* Services Cards */}
          <CardGrid3D
            columns={{ mobile: 1, tablet: 2, desktop: 3 }}
            gap="8"
            staggerDelay={0.15}
            threshold={0.2}
            ariaLabel={isEn ? 'Services' : '服务'}
          >
            {services.map((service, index) => (
              <Card3D
                key={index}
                intensity="medium"
                depth="medium"
                glassEffect="heavy"
                className="feature-card-artistic h-full"
                ariaLabel={service.title}
              >
                {/* Neon Icon */}
                <div
                  className="w-14 h-14 rounded-xl mb-6 flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: service.color,
                    boxShadow: `0 0 30px ${service.color}80`,
                  }}
                >
                  <span className="text-white text-3xl">{service.icon}</span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#00f0ff] transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-[#9ca3af] leading-relaxed">{service.description}</p>

                {/* Learn More Link */}
                <div className="mt-6 flex items-center text-[#00f0ff] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {isEn ? 'Learn More' : '了解更多'} <span className="ml-2">→</span>
                </div>
              </Card3D>
            ))}
          </CardGrid3D>
        </div>
      </section>
    </main>
  );
}

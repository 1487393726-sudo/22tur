'use client';

import { useLanguage } from '@/lib/i18n/context';
import { HeroSection3D } from '@/components/website/3d/HeroSection3D';
import { CardGrid3D } from '@/components/website/3d/CardGrid3D';
import { Card3D } from '@/components/website/3d/Card3D';
import { StatsSection } from '@/components/website/sections/StatsSection';
import { CTASection } from '@/components/website/sections/CTASection';

/**
 * Homepage Component - Artistic Creative Theme
 * 
 * Features:
 * - Dark mysterious background with neon accents
 * - Bold color palette with high visual impact
 * - Glass morphism effects
 * - 3D elements with artistic flair
 * - Multi-language support (zh, en, ug)
 * 
 * Style: Dark Mystery + Artistic Creative
 */
export default function HomePage() {
  const { locale } = useLanguage();
  const isEn = locale === 'en';

  // Hero section text
  const heroTitle = isEn 
    ? 'Creative Design Studio' 
    : '创意设计工作室';
  const heroSubtitle = isEn 
    ? 'We transform your ideas into stunning digital experiences with cutting-edge design and technology' 
    : '我们将您的想法转化为令人惊叹的数字体验，融合前沿设计与技术';
  const heroCta = isEn 
    ? 'Start Your Project' 
    : '开始您的项目';

  // Services section text
  const servicesTitle = isEn 
    ? 'Our Services' 
    : '我们的服务';
  const servicesSubtitle = isEn 
    ? 'We provide comprehensive creative solutions to help your brand stand out' 
    : '我们提供全方位的创意解决方案，帮助您的品牌脱颖而出';
  const learnMore = isEn 
    ? 'Learn More' 
    : '了解更多';

  // Service data with neon colors and hardcoded text
  const services = [
    {
      icon: '🎨',
      title: isEn ? 'Brand Design' : '品牌设计',
      description: isEn 
        ? 'Create unique brand identities that resonate with your audience and leave lasting impressions' 
        : '创造与受众产生共鸣并留下持久印象的独特品牌形象',
      color: '#b026ff', // Neon Purple
    },
    {
      icon: '💻',
      title: isEn ? 'Web Development' : '网站开发',
      description: isEn 
        ? 'Build modern, responsive websites with cutting-edge technology and stunning visuals' 
        : '使用前沿技术和惊艳视觉效果构建现代响应式网站',
      color: '#00f0ff', // Electric Cyan
    },
    {
      icon: '🚀',
      title: isEn ? 'Digital Marketing' : '数字营销',
      description: isEn 
        ? 'Strategic marketing solutions to boost your online presence and drive business growth' 
        : '战略营销解决方案，提升您的在线影响力并推动业务增长',
      color: '#ff2a6d', // Fluorescent Pink
    },
  ];

  // Stats section text
  const statsTitle = isEn 
    ? 'Our Achievements' 
    : '我们的成就';
  const statsSubtitle = isEn 
    ? 'Numbers that reflect our commitment to excellence' 
    : '反映我们对卓越承诺的数字';

  // Stats data with hardcoded labels
  const statsData = [
    {
      value: 150,
      label: isEn ? 'Projects Completed' : '完成项目',
      suffix: '+',
      icon: '🚀',
      color: '#b026ff',
    },
    {
      value: 50,
      label: isEn ? 'Happy Clients' : '满意客户',
      suffix: '+',
      icon: '🎨',
      color: '#00f0ff',
    },
    {
      value: 8,
      label: isEn ? 'Years Experience' : '年经验',
      suffix: '+',
      icon: '⚡',
      color: '#ff2a6d',
    },
    {
      value: 99,
      label: isEn ? 'Client Satisfaction' : '客户满意度',
      suffix: '%',
      decimals: 0,
      icon: '💯',
      color: '#ccff00',
    },
  ];

  // CTA section text
  const ctaTitle = isEn 
    ? 'Ready to Start Your Project?' 
    : '准备好开始您的项目了吗？';
  const ctaDescription = isEn 
    ? 'Let\'s collaborate and bring your vision to life with our creative expertise' 
    : '让我们携手合作，用我们的创意专长得您的愿景变为现实';
  const contactButton = isEn 
    ? 'Contact Us' 
    : '联系我们';
  const servicesButton = isEn 
    ? 'Our Services' 
    : '我们的服务';

  return (
    <main className="min-h-screen bg-[#0a0a0f] artistic-theme artistic-bg">
      {/* Hero Section with Artistic Neon Effects */}
      <HeroSection3D
        title={heroTitle}
        subtitle={heroSubtitle}
        ctaText={heroCta}
        ctaLink="/contact"
        locale={locale}
        gradientScheme="purple"
        enableParallax={true}
        enableFloatingElements={true}
        className="artistic-hero"
      />

      {/* Services Section with Neon Cards */}
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
              <span className="text-white">{servicesTitle}</span>
            </h2>
            <p className="text-lg text-[#9ca3af] max-w-2xl mx-auto">
              {servicesSubtitle}
            </p>
            <div className="neon-line max-w-md mx-auto mt-8"></div>
          </div>
          
          {/* 3D Card Grid with Stagger Animation */}
          <CardGrid3D
            columns={{ mobile: 1, tablet: 2, desktop: 3 }}
            gap="8"
            staggerDelay={0.15}
            threshold={0.2}
            ariaLabel={servicesTitle}
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
                    boxShadow: `0 0 30px ${service.color}80`
                  }}
                >
                  <span className="text-white text-3xl">{service.icon}</span>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#00f0ff] transition-colors">
                  {service.title}
                </h3>
                
                {/* Description */}
                <p className="text-[#9ca3af] leading-relaxed">
                  {service.description}
                </p>
                
                {/* Learn More Link */}
                <div className="mt-6 flex items-center text-[#00f0ff] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {learnMore} <span className="ml-2">→</span>
                </div>
              </Card3D>
            ))}
          </CardGrid3D>
        </div>
      </section>

      {/* Stats Section with Neon Effects */}
      <StatsSection
        title={statsTitle}
        subtitle={statsSubtitle}
        stats={statsData}
        background="bg-[#0a0a0f]"
        glassIntensity="heavy"
        depth="medium"
        columns={{ mobile: 1, tablet: 2, desktop: 4 }}
        className="border-t border-b border-[#b026ff]/20"
      />

      {/* CTA Section with Glass Morphism */}
      <CTASection
        title={ctaTitle}
        description={ctaDescription}
        buttons={[
          {
            text: contactButton,
            href: '/contact',
            variant: 'primary',
            showArrow: true,
          },
          {
            text: servicesButton,
            href: '/services',
            variant: 'outline',
          },
        ]}
        gradientScheme="accent"
        glassIntensity="heavy"
        showSparkles={true}
        className="relative overflow-hidden"
      />
    </main>
  );
}

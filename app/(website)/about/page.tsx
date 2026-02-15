'use client';

import { useLanguage } from '@/lib/i18n/context';
import { Card3D } from '@/components/website/3d/Card3D';
import { CardGrid3D } from '@/components/website/3d/CardGrid3D';
import { FadeInView } from '@/components/website/animations/FadeInView';
import { SlideInView } from '@/components/website/animations/SlideInView';
import { StatsSection } from '@/components/website/sections/StatsSection';
import { Timeline, TimelineMilestone } from '@/components/website/sections/Timeline';

/**
 * About Us Page Component
 * 
 * Features:
 * - 3D card layouts for company information
 * - Multi-language support (zh, en, ug)
 * - Page entrance animations
 * - Glass morphism effects
 * - Responsive design
 * 
 * Requirements: 8.1
 */
export default function AboutPage() {
  const { locale } = useLanguage();

  const isEn = locale === 'en';

  // Timeline milestones data
  const milestones: TimelineMilestone[] = [
    {
      year: '2019',
      title: isEn ? 'Company Founded' : '公司成立',
      description: isEn ? 'Started with a vision to transform digital experiences' : '怀着改变数字体验的愿景开始创业',
      icon: '🚀',
      color: '#b026ff',
    },
    {
      year: '2020',
      title: isEn ? 'First Major Project' : '首个重大项目',
      description: isEn ? 'Delivered our first enterprise-level solution' : '交付首个企业级解决方案',
      icon: '🎯',
      color: '#00f0ff',
    },
    {
      year: '2021',
      title: isEn ? 'Team Expansion' : '团队扩张',
      description: isEn ? 'Grew our team to 20+ talented professionals' : '团队发展到20+优秀人才',
      icon: '✨',
      color: '#ff2a6d',
    },
    {
      year: '2022',
      title: isEn ? 'International Reach' : '国际拓展',
      description: isEn ? 'Expanded services to international clients' : '将服务扩展到国际客户',
      icon: '🌍',
      color: '#ccff00',
    },
    {
      year: '2023',
      title: isEn ? 'Industry Recognition' : '行业认可',
      description: isEn ? 'Received multiple industry awards and certifications' : '获得多项行业奖项和认证',
      icon: '🏆',
      color: '#b026ff',
    },
  ];

  // Core values data
  const values = [
    {
      icon: '🎯',
      title: isEn ? 'Target Oriented' : '目标导向',
      desc: isEn ? 'We focus on delivering results that matter to your business' : '我们专注于为您的业务交付重要的结果',
      color: '#b026ff',
    },
    {
      icon: '✨',
      title: isEn ? 'Quality First' : '品质至上',
      desc: isEn ? 'Excellence is our standard in every project we undertake' : '卓越是我们每个项目的标准',
      color: '#00f0ff',
    },
    {
      icon: '🚀',
      title: isEn ? 'Innovation' : '创新驱动',
      desc: isEn ? 'We embrace cutting-edge technologies to create unique solutions' : '我们拥抱前沿技术，创造独特解决方案',
      color: '#ff2a6d',
    },
  ];

  // Achievements data
  const achievements = [
    { key: 'iso9001', title: isEn ? 'ISO 9001 Certified' : 'ISO 9001认证', desc: isEn ? 'Quality management system certification' : '质量管理体系认证', icon: '🏅', color: '#b026ff' },
    { key: 'iso27001', title: isEn ? 'ISO 27001 Certified' : 'ISO 27001认证', desc: isEn ? 'Information security management' : '信息安全管理认证', icon: '🔒', color: '#00f0ff' },
    { key: 'bestAgency', title: isEn ? 'Best Agency Award' : '最佳代理商奖', desc: isEn ? 'Recognized as top digital agency' : '被评为顶级数字代理商', icon: '🏆', color: '#ff2a6d' },
    { key: 'topInnovator', title: isEn ? 'Top Innovator' : '顶级创新者', desc: isEn ? 'Leading innovation in digital solutions' : '数字解决方案领域的领先创新者', icon: '💡', color: '#ccff00' },
    { key: 'customerChoice', title: isEn ? 'Customer Choice' : '客户选择奖', desc: isEn ? 'Voted best by our clients' : '由客户投票选出的最佳', icon: '⭐', color: '#b026ff' },
    { key: 'greenBusiness', title: isEn ? 'Green Business' : '绿色企业', desc: isEn ? 'Committed to sustainable practices' : '致力于可持续发展实践', icon: '🌱', color: '#00f0ff' },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0f] artistic-theme artistic-bg">
      {/* Hero Section with Artistic Style */}
      <section 
        className="relative w-full py-20 md:py-32 overflow-hidden"
      >
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
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <FadeInView delay={0.1} duration={0.6}>
            <div className="flex justify-center gap-2 mb-6">
              <div className="neon-dot" style={{ animationDelay: '0s' }}></div>
              <div className="neon-dot" style={{ animationDelay: '0.2s', background: '#b026ff' }}></div>
              <div className="neon-dot" style={{ animationDelay: '0.4s', background: '#ff2a6d' }}></div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#b026ff] to-[#00f0ff] bg-clip-text text-transparent">
                {isEn ? 'About Us' : '关于我们'}
              </span>
            </h1>
          </FadeInView>
          
          <FadeInView delay={0.3} duration={0.6}>
            <p className="text-xl md:text-2xl text-[#9ca3af] max-w-3xl mx-auto">
              {isEn ? 'We are a passionate team dedicated to creating exceptional digital experiences' : '我们是一支充满激情的团队，致力于创造卓越的数字体验'}
            </p>
          </FadeInView>
        </div>
        
        {/* Decorative gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(176,38,255,0.15) 0%, transparent 50%)',
          }}
        />
      </section>

      {/* Stats Section */}
      <StatsSection
        title=""
        subtitle=""
        stats={[
          {
            value: 100,
            label: isEn ? 'Projects' : '项目',
            suffix: '+',
            icon: '🚀',
            color: '#b026ff',
          },
          {
            value: 50,
            label: isEn ? 'Clients' : '客户',
            suffix: '+',
            icon: '😊',
            color: '#00f0ff',
          },
          {
            value: 20,
            label: isEn ? 'Team Members' : '团队成员',
            suffix: '+',
            icon: '👥',
            color: '#ff2a6d',
          },
          {
            value: 10,
            label: isEn ? 'Years Experience' : '年经验',
            suffix: '+',
            icon: '⭐',
            color: '#ccff00',
          },
        ]}
        background="bg-[#0a0a0f]"
        glassIntensity="heavy"
        depth="medium"
        columns={{ mobile: 2, tablet: 4, desktop: 4 }}
      />

      {/* Company Story Section with 3D Card */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          <SlideInView direction="up" delay={0.2}>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                {isEn ? 'Our Story' : '我们的故事'}
              </h2>
              
              <Card3D
                intensity="light"
                depth="medium"
                glassEffect="heavy"
                className="p-8 md:p-12 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#b026ff]/50 hover:shadow-[0_0_30px_rgba(176,38,255,0.2)] transition-all duration-300"
              >
                <div className="prose prose-lg max-w-none text-[#9ca3af] space-y-6">
                  <p className="text-lg leading-relaxed">
                    {isEn 
                      ? 'Founded in 2019, we started with a simple mission: to help businesses succeed in the digital world. Our journey began with a small team of passionate developers and designers who believed in the power of technology to transform businesses.'
                      : '成立于2019年，我们的使命很简单：帮助企业在数字世界取得成功。我们的旅程始于一小群充满热情的开发者和设计师，他们相信技术能够改变企业。'}
                  </p>
                  <p className="text-lg leading-relaxed">
                    {isEn
                      ? 'Over the years, we have grown into a full-service digital agency, delivering innovative solutions to clients across the globe. Our team has expanded, but our core values remain the same: quality, innovation, and customer satisfaction.'
                      : '多年来，我们已发展成为一家全方位数字代理商，为全球客户提供创新解决方案。我们的团队不断壮大，但核心价值观始终不变：品质、创新和客户满意度。'}
                  </p>
                  <p className="text-lg leading-relaxed">
                    {isEn
                      ? 'Today, we continue to push the boundaries of what is possible in digital experiences, helping businesses of all sizes achieve their goals and reach new heights.'
                      : '今天，我们继续突破数字体验的边界，帮助各种规模的企业实现目标，达到新的高度。'}
                  </p>
                </div>
              </Card3D>
            </div>
          </SlideInView>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#b026ff]/50 to-transparent"></div>
      </div>

      {/* Company Timeline Section with 3D Effects */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <FadeInView delay={0.1}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {isEn ? 'Our Journey' : '我们的历程'}
              </h2>
              <p className="text-lg text-[#9ca3af] max-w-2xl mx-auto">
                {isEn ? 'Key milestones that shaped our growth' : '塑造我们成长的关键里程碑'}
              </p>
              <div className="neon-line max-w-md mx-auto mt-8"></div>
            </div>
          </FadeInView>
          
          {/* Timeline Component */}
          <Timeline
            milestones={milestones}
            isRTL={locale === 'ug'}
            staggerDelay={0.15}
            lineColor="rgba(176, 38, 255, 0.3)"
            markerColor="#b026ff"
          />
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent"></div>
      </div>

      {/* Core Values Section with 3D Cards */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <FadeInView delay={0.1}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {isEn ? 'Core Values' : '核心价值观'}
              </h2>
              <p className="text-lg text-[#9ca3af] max-w-2xl mx-auto">
                {isEn ? 'The principles that guide everything we do' : '指导我们一切工作的原则'}
              </p>
              <div className="neon-line max-w-md mx-auto mt-8"></div>
            </div>
          </FadeInView>
          
          {/* 3D Card Grid with Stagger Animation */}
          <CardGrid3D
            columns={{ mobile: 1, tablet: 2, desktop: 3 }}
            gap="8"
            staggerDelay={0.15}
            threshold={0.2}
            ariaLabel={isEn ? 'Core Values' : '核心价值观'}
          >
            {values.map((value, index) => (
              <Card3D
                key={index}
                intensity="medium"
                depth="medium"
                glassEffect="heavy"
                className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#b026ff]/50 hover:shadow-[0_0_30px_rgba(176,38,255,0.2)] transition-all duration-300 h-full group"
                ariaLabel={value.title}
              >
                {/* Icon */}
                <div 
                  className="w-16 h-16 rounded-xl mb-6 flex items-center justify-center shadow-lg"
                  style={{ 
                    backgroundColor: value.color,
                    boxShadow: `0 0 30px ${value.color}80`,
                  }}
                >
                  <span className="text-white text-3xl">{value.icon}</span>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#00f0ff] transition-colors">
                  {value.title}
                </h3>
                
                {/* Description */}
                <p className="text-[#9ca3af] text-lg leading-relaxed">
                  {value.desc}
                </p>
              </Card3D>
            ))}
          </CardGrid3D>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#ff2a6d]/50 to-transparent"></div>
      </div>

      {/* Achievements and Certifications Section with 3D Badge Effects */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <FadeInView delay={0.1}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {isEn ? 'Achievements & Certifications' : '成就与认证'}
              </h2>
              <p className="text-lg text-[#9ca3af] max-w-2xl mx-auto">
                {isEn ? 'Recognition of our commitment to excellence' : '对我们卓越承诺的认可'}
              </p>
              <div className="neon-line max-w-md mx-auto mt-8"></div>
            </div>
          </FadeInView>
          
          {/* 3D Badge Grid with Stagger Animation */}
          <CardGrid3D
            columns={{ mobile: 2, tablet: 3, desktop: 3 }}
            gap="6"
            staggerDelay={0.12}
            threshold={0.2}
            ariaLabel={isEn ? 'Achievements & Certifications' : '成就与认证'}
          >
            {achievements.map((achievement, index) => (
              <Card3D
                key={index}
                intensity="medium"
                depth="medium"
                glassEffect="heavy"
                className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#b026ff]/50 hover:shadow-[0_0_30px_rgba(176,38,255,0.2)] transition-all duration-300 h-full group"
                ariaLabel={achievement.title}
              >
                {/* Badge Icon with 3D Effect */}
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-20 h-20 rounded-full mb-4 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300"
                    style={{ 
                      backgroundColor: achievement.color,
                      boxShadow: `0 0 30px ${achievement.color}60`,
                      transform: 'translateZ(20px)',
                    }}
                  >
                    <span className="text-white text-4xl">{achievement.icon}</span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00f0ff] transition-colors">
                    {achievement.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-[#9ca3af] text-sm leading-relaxed">
                    {achievement.desc}
                  </p>
                </div>
              </Card3D>
            ))}
          </CardGrid3D>
        </div>
      </section>

      {/* Contact CTA Section with Artistic Style */}
      <section 
        className="py-16 md:py-24 relative overflow-hidden"
      >
        {/* Neon Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(176, 38, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <FadeInView delay={0.2}>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {isEn ? 'Ready to Work Together?' : '准备好一起合作了吗？'}
              </h2>
              <p className="text-xl text-[#9ca3af] mb-8">
                {isEn ? 'Let us bring your vision to life' : '让我们将您的愿景变为现实'}
              </p>
              
              <Card3D
                intensity="light"
                depth="shallow"
                glassEffect="medium"
                className="inline-block"
              >
                <a
                  href="/contact"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-[#b026ff] to-[#7c3aed] text-white font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(176,38,255,0.5)] transition-all duration-300 hover:scale-105"
                >
                  {isEn ? 'Contact Us' : '联系我们'} →
                </a>
              </Card3D>
            </div>
          </FadeInView>
        </div>
        
        {/* Decorative elements */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 70% 30%, rgba(176,38,255,0.2) 0%, transparent 50%)',
          }}
        />
      </section>
    </main>
  );
}

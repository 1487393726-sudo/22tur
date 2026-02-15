import { ParticleBackground } from "@/components/3d/particles";
import { Navbar } from "@/components/layout/navbar";
import { EnhancedHeroSection } from "@/components/sections/enhanced-hero";
import { AboutSection } from "@/components/sections/about";
import { EnhancedServicesSection } from "@/components/sections/enhanced-services";
import { VideoIntroduction } from "@/components/video-introduction";
import { ProjectInvestmentSection } from "@/components/sections/project-investment-section";
import { PortfolioSection } from "@/components/sections/portfolio";
import { TeamSection } from "@/components/sections/team";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { BlogSection } from "@/components/sections/blog";
import { EnhancedCTASection } from "@/components/sections/enhanced-cta";
import { ContactSection } from "@/components/sections/contact";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { CoreGoalsSection } from "@/components/services/core-goals-section";
import { InteractiveButton } from "@/components/website/InteractiveButton";
import { InteractiveCard } from "@/components/website/InteractiveCard";
import "@/styles/theme-fix.css";
import "@/styles/enhanced-components.css";


export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full">
        <main className="min-h-screen relative overflow-hidden" data-oid=":tfs8jc">
          <ParticleBackground data-oid="5.r5yhf" />
          <Navbar data-oid="2k6:dwm" />
          
          {/* Hero Section */}
          <EnhancedHeroSection data-oid="enhanced-hero" />
          
          {/* Core Services Goals */}
          <CoreGoalsSection />
          
          {/* Services Section */}
          <EnhancedServicesSection data-oid="enhanced-services" />
          
          {/* Value Showcase */}
          <VideoIntroduction data-oid="video-intro" />
          <PortfolioSection data-oid="yr6bn.m" />
          
          {/* About Section */}
          <AboutSection data-oid="r5oe6v5" />
          <TeamSection data-oid="n4.g_ot" />
          
          {/* Testimonials */}
          <TestimonialsSection data-oid="ez-8508" />
          <ProjectInvestmentSection data-oid="-sg_xju" />
          
          {/* CTA Section */}
          <EnhancedCTASection data-oid="enhanced-cta" />
          
          {/* Investment Quick Entry */}
          <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-bg-dark)' }}>
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                投资机会 & 品牌服务
              </h2>
              <p className="text-xl mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                选择您感兴趣的行业进行投资，或了解我们的完整品牌一致性服务
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <InteractiveButton href="/investment-opportunities" variant="primary">
                  探索投资机会
                </InteractiveButton>
                <InteractiveButton href="/brand-consistency" variant="outline">
                  品牌一致性服务
                </InteractiveButton>
              </div>
            </div>
          </section>

          {/* System Navigation */}
          <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-bg-light)' }}>
            <div className="container mx-auto max-w-6xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: 'var(--color-primary-900)' }}>
                系统功能导航
              </h2>
              <p className="text-xl mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                快速访问所有系统功能 - 投资管理、用户中心、业务服务等
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <InteractiveCard href="/navigation">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform"
                       style={{ backgroundColor: 'var(--color-primary-500)' }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>导航中心</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>浏览所有功能</p>
                </InteractiveCard>
                
                <InteractiveCard href="/investor-portal">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform"
                       style={{ backgroundColor: 'var(--color-secondary-500)' }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>投资门户</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>投资管理平台</p>
                </InteractiveCard>
                
                <InteractiveCard href="/user">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform"
                       style={{ backgroundColor: 'var(--color-accent-500)' }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>用户中心</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>个人管理中心</p>
                </InteractiveCard>
                
                <InteractiveCard href="/ai-assistant">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform"
                       style={{ backgroundColor: 'var(--color-primary-500)' }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>AI 助手</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>智能AI服务</p>
                </InteractiveCard>
              </div>
              
              {/* Livestream Equipment Entry */}
              <div className="mt-8 p-6 rounded-2xl" style={{ 
                backgroundColor: 'var(--color-bg-dark)',
                border: '1px solid var(--color-border-light)'
              }}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                         style={{ backgroundColor: 'var(--color-secondary-500)' }}>
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>直播设备专区</h3>
                      <p style={{ color: 'var(--color-text-secondary)' }}>从入门到专业，一站式直播解决方案</p>
                    </div>
                  </div>
                  <InteractiveButton href="/livestream-equipment" variant="secondary" size="small" className="whitespace-nowrap">
                    查看设备套餐
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </InteractiveButton>
                </div>
              </div>
              <InteractiveButton href="/navigation" className="mt-6 shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                查看完整导航
              </InteractiveButton>
            </div>
          </section>
          
          <BlogSection data-oid="24u-_el" />
          <ContactSection data-oid="qteds5t" />
          
          {/* Page Components */}
          <Footer data-oid=".xarrnd" />
          <ScrollToTop data-oid="dpt-bhz" />
          <PerformanceMonitor data-oid="zny3pr0" />
        </main>
      </div>
    </div>
  );
}

import { ParticleBackground } from "@/components/3d/particles";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { ArrowRight, Sparkles, Zap, Palette, Users, Rocket } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] artistic-theme">
      <div className="w-full">
        <main className="min-h-screen relative overflow-hidden artistic-bg">
          <ParticleBackground />
          
          {/* 导航栏 */}
          <nav className="fixed top-0 left-0 right-0 z-50 artistic-nav">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold gradient-text">
                  CREATIVE
                </Link>
                <div className="hidden md:flex items-center gap-8">
                  <Link href="/services" className="artistic-nav-link">服务</Link>
                  <Link href="/portfolio" className="artistic-nav-link">作品</Link>
                  <Link href="/about" className="artistic-nav-link">关于</Link>
                  <Link href="/contact" className="artistic-nav-link">联系</Link>
                </div>
                <button className="neon-button text-sm">
                  开始项目
                </button>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="artistic-hero pt-20">
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-5xl mx-auto text-center">
                {/* 霓虹装饰点 */}
                <div className="flex justify-center gap-2 mb-8">
                  <div className="neon-dot" style={{ animationDelay: '0s' }}></div>
                  <div className="neon-dot" style={{ animationDelay: '0.2s', background: '#b026ff' }}></div>
                  <div className="neon-dot" style={{ animationDelay: '0.4s', background: '#ff2a6d' }}></div>
                </div>

                {/* 主标题 */}
                <h1 className="artistic-hero-title mb-8 animate-fade-in-up">
                  创造非凡
                  <br />
                  <span className="text-[#00f0ff]">数字体验</span>
                </h1>

                {/* 副标题 */}
                <p className="text-xl md:text-2xl text-[#9ca3af] mb-12 max-w-3xl mx-auto leading-relaxed">
                  我们是一家前卫的数字创意工作室，
                  <br />
                  用<span className="neon-text">大胆</span>的设计和<span className="neon-text-purple">创新</span>的技术，
                  为品牌注入灵魂
                </p>

                {/* 霓虹线 */}
                <div className="neon-line max-w-md mx-auto mb-12"></div>

                {/* CTA 按钮组 */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/contact" className="neon-button flex items-center gap-2 text-lg">
                    开启创意之旅
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/portfolio" className="neon-button-outline">
                    查看作品
                  </Link>
                </div>

                {/* 实时数据 */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                  {[
                    { number: "150+", label: "完成项目" },
                    { number: "50+", label: "合作品牌" },
                    { number: "8+", label: "年经验" },
                    { number: "99%", label: "满意度" },
                  ].map((stat, index) => (
                    <div key={index} className="glass-card p-6">
                      <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                        {stat.number}
                      </div>
                      <div className="text-[#9ca3af] text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 霓虹分隔线 */}
          <div className="py-20">
            <div className="neon-line max-w-2xl mx-auto"></div>
          </div>

          {/* 核心服务 */}
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-7xl">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#b026ff]/30 bg-[#b026ff]/10 mb-6">
                  <Sparkles className="w-4 h-4 text-[#b026ff]" />
                  <span className="text-[#b026ff] text-sm font-medium">我们的服务</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="gradient-text">全方位</span>
                  <span className="text-white">数字解决方案</span>
                </h2>
                <p className="text-[#9ca3af] text-lg max-w-2xl mx-auto">
                  从概念到落地，我们提供一站式创意服务，让您的品牌在数字世界脱颖而出
                </p>
              </div>

              <div className="feature-grid">
                {[
                  {
                    icon: <Palette className="w-6 h-6 text-white" />,
                    title: "品牌设计",
                    description: "独特的视觉识别系统，让您的品牌与众不同",
                    color: "#b026ff"
                  },
                  {
                    icon: <Zap className="w-6 h-6 text-white" />,
                    title: "网站开发",
                    description: "高性能、响应式的现代网站开发",
                    color: "#00f0ff"
                  },
                  {
                    icon: <Rocket className="w-6 h-6 text-white" />,
                    title: "数字营销",
                    description: "数据驱动的营销策略，提升品牌影响力",
                    color: "#ff2a6d"
                  },
                  {
                    icon: <Users className="w-6 h-6 text-white" />,
                    title: "用户体验",
                    description: "以用户为中心的产品设计和优化",
                    color: "#ccff00"
                  }
                ].map((service, index) => (
                  <div key={index} className="feature-card-artistic group">
                    <div 
                      className="feature-icon-artistic"
                      style={{ background: `linear-gradient(135deg, ${service.color}, ${service.color}80)` }}
                    >
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00f0ff] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-[#9ca3af] leading-relaxed">
                      {service.description}
                    </p>
                    <div className="mt-6 flex items-center text-[#00f0ff] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      了解更多 <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 视觉冲击力区域 */}
          <section className="py-32 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#b026ff]/10 via-transparent to-[#00f0ff]/10"></div>
            <div className="container mx-auto max-w-6xl relative z-10">
              <div className="glass-card p-8 md:p-16 text-center">
                <div className="neon-dot mx-auto mb-8" style={{ width: '12px', height: '12px' }}></div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  准备好开启您的
                  <br />
                  <span className="gradient-text-secondary">数字创新之旅</span>了吗？
                </h2>
                <p className="text-[#9ca3af] text-lg mb-10 max-w-2xl mx-auto">
                  与我们的创意团队一起，将您的愿景转化为令人惊艳的数字体验
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact" className="neon-button">
                    立即开始
                  </Link>
                  <Link href="/consultation" className="neon-button-outline">
                    预约咨询
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 页脚 */}
          <Footer />
          <ScrollToTop />
        </main>
      </div>
    </div>
  );
}

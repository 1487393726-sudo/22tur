"use client";

import { 
  Copy, 
  Check, 
  Sparkles, 
  Zap, 
  Palette,
  ArrowRight,
  Star,
  Heart,
  Music
} from "lucide-react";
import { useState } from "react";

export default function ArtisticStyleGuide() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyColor = (color: string, name: string) => {
    navigator.clipboard.writeText(color);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  const colors = [
    { name: "霓虹紫 Neon Purple", hex: "#b026ff", glow: "rgba(176, 38, 255, 0.5)" },
    { name: "电光青 Electric Cyan", hex: "#00f0ff", glow: "rgba(0, 240, 255, 0.5)" },
    { name: "荧光粉 Fluorescent Pink", hex: "#ff2a6d", glow: "rgba(255, 42, 109, 0.5)" },
    { name: "酸性绿 Acid Lime", hex: "#ccff00", glow: "rgba(204, 255, 0, 0.5)" },
    { name: "熔岩橙 Lava Orange", hex: "#ff6b35", glow: "rgba(255, 107, 53, 0.5)" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] artistic-theme p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-16">
          <div className="flex justify-center gap-2 mb-6">
            <div className="neon-dot"></div>
            <div className="neon-dot" style={{ background: '#b026ff', animationDelay: '0.2s' }}></div>
            <div className="neon-dot" style={{ background: '#ff2a6d', animationDelay: '0.4s' }}></div>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">艺术创意</span>
            <span className="text-white">风格指南</span>
          </h1>
          <p className="text-[#9ca3af] text-xl">深色神秘 · 大胆配色 · 视觉冲击力</p>
        </div>

        {/* 配色展示 */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Palette className="text-[#b026ff]" />
            霓虹配色系统
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colors.map((color) => (
              <div 
                key={color.name}
                className="glass-card p-6 cursor-pointer group"
                onClick={() => copyColor(color.hex, color.name)}
              >
                <div 
                  className="w-full h-32 rounded-xl mb-4 transition-transform group-hover:scale-105"
                  style={{ 
                    backgroundColor: color.hex,
                    boxShadow: `0 0 30px ${color.glow}`
                  }}
                ></div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold mb-1">{color.name}</h3>
                    <p className="text-[#9ca3af] font-mono text-sm">{color.hex}</p>
                  </div>
                  {copied === color.name ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-[#9ca3af] group-hover:text-white" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 按钮展示 */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Zap className="text-[#00f0ff]" />
            霓虹按钮
          </h2>
          <div className="glass-card p-8">
            <div className="flex flex-wrap gap-6">
              <button className="neon-button">
                主要按钮
              </button>
              <button className="neon-button-outline">
                轮廓按钮
              </button>
              <button 
                className="neon-button"
                style={{ 
                  background: 'linear-gradient(135deg, #ff2a6d 0%, #b026ff 100%)',
                  boxShadow: '0 0 30px rgba(255, 42, 109, 0.4)'
                }}
              >
                粉紫渐变
              </button>
              <button 
                className="neon-button"
                style={{ 
                  background: 'linear-gradient(135deg, #00f0ff 0%, #ccff00 100%)',
                  boxShadow: '0 0 30px rgba(0, 240, 255, 0.4)'
                }}
              >
                青绿渐变
              </button>
            </div>
          </div>
        </section>

        {/* 文字效果 */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Sparkles className="text-[#ff2a6d]" />
            霓虹文字效果
          </h2>
          <div className="glass-card p-8 space-y-6">
            <h1 className="text-4xl font-bold neon-text text-center">
              电光青霓虹文字
            </h1>
            <h1 className="text-4xl font-bold neon-text-purple text-center">
              霓虹紫发光文字
            </h1>
            <h1 className="text-4xl font-bold neon-text-pink text-center">
              荧光粉发光文字
            </h1>
            <h1 className="text-4xl font-bold gradient-text text-center">
              紫青渐变文字
            </h1>
            <h1 className="text-4xl font-bold gradient-text-secondary text-center">
              青粉渐变文字
            </h1>
          </div>
        </section>

        {/* 卡片展示 */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Star className="text-[#ccff00]" />
            毛玻璃卡片
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#b026ff] to-[#7c3aed] flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">创意设计</h3>
              <p className="text-[#9ca3af]">独特的视觉风格，让您的品牌脱颖而出</p>
            </div>
            
            <div className="glass-card p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#00c896] flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">快速开发</h3>
              <p className="text-[#9ca3af]">高效的开发流程，快速交付高质量产品</p>
            </div>
            
            <div className="glass-card p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ff2a6d] to-[#ff6b35] flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">用户体验</h3>
              <p className="text-[#9ca3af]">以用户为中心的设计，打造极致体验</p>
            </div>
          </div>
        </section>

        {/* 特色卡片 */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">特色艺术卡片</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="feature-card-artistic">
              <div className="feature-icon-artistic">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">多媒体整合</h3>
              <p className="text-[#9ca3af] mb-4">融合音频、视频和动画，打造沉浸式数字体验</p>
              <div className="flex items-center text-[#00f0ff] text-sm font-medium">
                了解更多 <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
            
            <div className="feature-card-artistic">
              <div 
                className="feature-icon-artistic"
                style={{ background: 'linear-gradient(135deg, #ff2a6d, #ccff00)' }}
              >
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">品牌升级</h3>
              <p className="text-[#9ca3af] mb-4">全方位的品牌重塑服务，焕发品牌新生</p>
              <div className="flex items-center text-[#00f0ff] text-sm font-medium">
                了解更多 <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>
        </section>

        {/* 装饰元素 */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">装饰元素</h2>
          <div className="glass-card p-8 space-y-8">
            <div>
              <h3 className="text-white mb-4">霓虹分隔线</h3>
              <div className="neon-line"></div>
            </div>
            
            <div>
              <h3 className="text-white mb-4">霓虹点阵</h3>
              <div className="flex gap-4">
                <div className="neon-dot"></div>
                <div className="neon-dot" style={{ background: '#b026ff', animationDelay: '0.2s' }}></div>
                <div className="neon-dot" style={{ background: '#ff2a6d', animationDelay: '0.4s' }}></div>
                <div className="neon-dot" style={{ background: '#ccff00', animationDelay: '0.6s' }}></div>
              </div>
            </div>

            <div>
              <h3 className="text-white mb-4">扫描线效果</h3>
              <div className="scanline glass-card p-8 text-center">
                <p className="text-[#00f0ff] font-mono">CYBERPUNK AESTHETIC</p>
              </div>
            </div>
          </div>
        </section>

        {/* 动画展示 */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">动画效果</h2>
          <div className="glass-card p-8">
            <div className="flex flex-wrap gap-8 items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#b026ff] to-[#00f0ff] animate-float flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <p className="text-[#9ca3af] text-sm">浮动效果</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ff2a6d] to-[#ccff00] animate-neon-flicker flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <p className="text-[#9ca3af] text-sm">霓虹闪烁</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 rounded-full border-2 border-[#00f0ff] animate-rotate-glow flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-[#00f0ff]" />
                </div>
                <p className="text-[#9ca3af] text-sm">旋转光晕</p>
              </div>
            </div>
          </div>
        </section>

        {/* 应用示例 */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">实际应用示例</h2>
          <div className="glass-card p-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="gradient-text">准备开启</span>
                <br />
                <span className="text-white">您的创意之旅？</span>
              </h2>
              <p className="text-[#9ca3af] text-lg mb-8">
                与我们的创意团队一起，将您的愿景转化为令人惊艳的数字体验
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="neon-button">
                  立即开始
                </button>
                <button className="neon-button-outline">
                  了解更多
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 底部信息 */}
        <div className="text-center text-[#6b7280] py-8 border-t border-[#b026ff]/20">
          <p>艺术创意风格系统 v1.0 | 深色神秘主题</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

// 默认LOGO数据
const defaultLogos = [
  {
    id: 1,
    name: "Microsoft",
    logo: "/logos/microsoft.svg",
    url: "https://microsoft.com",
    description: "Cloud Computing & Software",
    descriptionZh: "云计算与软件",
  },
  {
    id: 2,
    name: "Google",
    logo: "/logos/google.svg",
    url: "https://google.com",
    description: "Search & AI Technology",
    descriptionZh: "搜索与AI技术",
  },
  {
    id: 3,
    name: "Amazon",
    logo: "/logos/amazon.svg",
    url: "https://amazon.com",
    description: "E-commerce & AWS",
    descriptionZh: "电子商务与云服务",
  },
  {
    id: 4,
    name: "Apple",
    logo: "/logos/apple.svg",
    url: "https://apple.com",
    description: "Consumer Electronics",
    descriptionZh: "消费电子产品",
  },
  {
    id: 5,
    name: "Meta",
    logo: "/logos/meta.svg",
    url: "https://meta.com",
    description: "Social Media & VR",
    descriptionZh: "社交媒体与虚拟现实",
  },
  {
    id: 6,
    name: "Netflix",
    logo: "/logos/netflix.svg",
    url: "https://netflix.com",
    description: "Streaming Entertainment",
    descriptionZh: "流媒体娱乐",
  },
  {
    id: 7,
    name: "Tesla",
    logo: "/logos/tesla.svg",
    url: "https://tesla.com",
    description: "Electric Vehicles",
    descriptionZh: "电动汽车",
  },
  {
    id: 8,
    name: "Spotify",
    logo: "/logos/spotify.svg",
    url: "https://spotify.com",
    description: "Music Streaming",
    descriptionZh: "音乐流媒体",
  },
];

export function LogoCarousel() {
  const { locale } = useLanguage();
  const [logos] = useState(defaultLogos);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredLogo, setHoveredLogo] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 自动播放逻辑
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % logos.length);
      }, 4000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, logos.length]);

  // 复制LOGO数组以实现无缝循环
  const duplicatedLogos = [...logos, ...logos, ...logos];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + logos.length) % logos.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % logos.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        
        {/* 标题部分 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              {locale === "en" ? "Trusted Partners" : "信任伙伴"}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === "en" 
              ? "Trusted by Industry Leaders" 
              : "受到行业领导者信任"
            }
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            {locale === "en"
              ? "We're proud to work with some of the world's most innovative companies."
              : "我们很自豪能与世界上一些最具创新性的公司合作。"
            }
          </p>
        </div>

        {/* LOGO轮播区域 */}
        <div className="relative">
          {/* 左右渐变遮罩 */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* 滚动容器 */}
          <div className="overflow-hidden" ref={carouselRef}>
            <div 
              className={`flex gap-8 transition-transform duration-1000 ease-out ${
                isPlaying ? 'animate-smooth-scroll' : ''
              }`}
              style={{
                transform: `translateX(-${currentIndex * 180}px)`,
                width: `${duplicatedLogos.length * 180}px`,
              }}
            >
              {duplicatedLogos.map((logo, index) => (
                <div
                  key={`${logo.id}-${index}`}
                  className="flex-shrink-0 group cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredLogo(logo.id);
                    setIsPlaying(false);
                  }}
                  onMouseLeave={() => {
                    setHoveredLogo(null);
                    setIsPlaying(true);
                  }}
                  onClick={() => window.open(logo.url, '_blank')}
                >
                  <div className="w-40 h-24 flex flex-col items-center justify-center p-4 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/60 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                    
                    {/* LOGO内容 */}
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors duration-300">
                        {logo.name}
                      </div>
                      
                      {/* 描述文字 */}
                      <div className={`text-xs text-muted-foreground transition-all duration-300 ${
                        hoveredLogo === logo.id ? 'opacity-100' : 'opacity-60'
                      }`}>
                        {locale === "en" ? logo.description : logo.descriptionZh}
                      </div>
                    </div>

                    {/* 悬停指示器 */}
                    <div className={`w-1 h-1 bg-primary rounded-full mt-2 transition-all duration-300 ${
                      hoveredLogo === logo.id ? 'opacity-100 scale-150' : 'opacity-0'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full border border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlayPause}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-full border border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 进度指示器 */}
        <div className="flex justify-center mt-8 gap-2">
          {logos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* 底部统计 */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-primary mb-1">500+</div>
            <div className="text-sm text-muted-foreground">
              {locale === "en" ? "Partners" : "合作伙伴"}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">50+</div>
            <div className="text-sm text-muted-foreground">
              {locale === "en" ? "Countries" : "国家"}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">99%</div>
            <div className="text-sm text-muted-foreground">
              {locale === "en" ? "Satisfaction" : "满意度"}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">24/7</div>
            <div className="text-sm text-muted-foreground">
              {locale === "en" ? "Support" : "支持"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
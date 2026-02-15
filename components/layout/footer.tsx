"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  ChevronDown,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

// 自定义社交媒体图标组件
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
    </svg>
  );
}
import { cn } from "@/lib/utils";

// 社交媒体图标映射
const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  twitter: XIcon,
  linkedin: LinkedInIcon,
  github: GitHubIcon,
  instagram: InstagramIcon,
  wechat: MessageCircle,
  weibo: MessageCircle,
};

// Footer 链接组配置
interface FooterLinkGroup {
  title: string;
  titleEn: string;
  links: {
    label: string;
    labelEn: string;
    href: string;
  }[];
}

// 社交媒体链接配置
interface SocialLinkConfig {
  platform: string;
  url: string;
  label: string;
}

// 默认配置
const defaultServiceLinks: FooterLinkGroup = {
  title: "服务",
  titleEn: "Services",
  links: [
    { label: "品牌设计", labelEn: "Brand Design", href: "/services/design" },
    { label: "UI/UX设计", labelEn: "UI/UX Design", href: "/services/uiux" },
    { label: "网站开发", labelEn: "Web Development", href: "/services/web" },
    { label: "移动应用", labelEn: "Mobile Apps", href: "/services/mobile" },
    { label: "系统定制", labelEn: "Custom Systems", href: "/services/custom" },
  ],
};

const defaultResourceLinks: FooterLinkGroup = {
  title: "资源",
  titleEn: "Resources",
  links: [
    { label: "案例展示", labelEn: "Case Studies", href: "/cases" },
    { label: "博客文章", labelEn: "Blog", href: "/blog" },
    { label: "帮助中心", labelEn: "Help Center", href: "/help" },
    { label: "定价方案", labelEn: "Pricing", href: "/pricing" },
    { label: "常见问题", labelEn: "FAQ", href: "/faq" },
  ],
};

const defaultQuickLinks: FooterLinkGroup = {
  title: "快速链接",
  titleEn: "Quick Links",
  links: [
    { label: "关于我们", labelEn: "About Us", href: "/about" },
    { label: "联系我们", labelEn: "Contact", href: "/contact" },
    { label: "隐私政策", labelEn: "Privacy Policy", href: "/privacy" },
    { label: "服务条款", labelEn: "Terms of Service", href: "/terms" },
  ],
};

const defaultSocialLinks: SocialLinkConfig[] = [
  { platform: "twitter", url: "https://twitter.com", label: "Twitter" },
  { platform: "linkedin", url: "https://linkedin.com", label: "LinkedIn" },
  { platform: "github", url: "https://github.com", label: "GitHub" },
  { platform: "instagram", url: "https://instagram.com", label: "Instagram" },
];

// 移动端折叠组件
function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/10 md:border-none">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 md:hidden group"
      >
        <span className="font-semibold text-white text-sm group-hover:text-[#00f0ff] transition-colors">{title}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[#9ca3af] transition-transform duration-200 group-hover:text-[#00f0ff]",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <h3 className="hidden md:block font-semibold text-white mb-4 text-sm tracking-wider uppercase">
        <span className="bg-gradient-to-r from-[#b026ff] to-[#00f0ff] bg-clip-text text-transparent">
          {title}
        </span>
      </h3>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 md:overflow-visible",
          isOpen ? "max-h-96 pb-4" : "max-h-0 md:max-h-none"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Footer() {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  // 获取本地化内容
  const getLocalizedText = (zh: string, en: string) => {
    return language === "en" ? en : zh;
  };

  // 联系信息
  const contactInfo = {
    email: "only3697@hotmail.com",
    phone: "13139675083",
    address: language === "en" ? "San Francisco, CA" : "旧金山, 加利福尼亚",
    workingHours: language === "en" ? "Mon - Fri: 9:00 - 18:00" : "周一至周五: 9:00 - 18:00",
  };

  return (
    <footer className="relative bg-[#0a0a0f] border-t border-[#b026ff]/20 overflow-hidden">
      {/* 霓虹背景效果 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#b026ff]/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#b026ff]/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-[128px] pointer-events-none" />
      
      {/* 网格装饰 */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(176, 38, 255, 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(176, 38, 255, 0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative container px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20 max-w-7xl mx-auto">
        {/* 主要内容区 - 五列布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 mb-12">
          {/* 第一列：公司信息 */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4 group">
              <span className="text-2xl font-bold bg-gradient-to-r from-[#b026ff] via-[#00f0ff] to-[#ff2a6d] bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 inline-block">
                CREATIVE
              </span>
            </Link>
            <p className="text-[#9ca3af] text-sm leading-relaxed mb-6">
              {language === "en"
                ? "We create innovative digital solutions that help businesses grow and succeed in the modern world."
                : "我们创造创新的数字解决方案，帮助企业在现代世界中成长和成功。"}
            </p>
            {/* 订阅表单 */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-white">
                {language === "en" ? "Stay Updated" : "订阅更新"}
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={language === "en" ? "Your email" : "您的邮箱"}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b026ff]/50 focus:border-[#b026ff]/50 text-sm text-white placeholder:text-[#6b7280] min-w-0 transition-all"
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-gradient-to-r from-[#b026ff] to-[#7c3aed] text-white rounded-lg hover:shadow-[0_0_20px_rgba(176,38,255,0.5)] hover:scale-105 transition-all shrink-0 font-medium text-sm"
                  title={language === "en" ? "Subscribe" : "订阅"}
                  aria-label={language === "en" ? "Subscribe" : "订阅"}
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 第二列：服务链接 */}
          <div className="lg:col-span-1">
            <CollapsibleSection
              title={getLocalizedText(defaultServiceLinks.title, defaultServiceLinks.titleEn)}
            >
              <ul className="space-y-3">
                {defaultServiceLinks.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group text-sm text-[#9ca3af] hover:text-[#00f0ff] transition-all duration-300 flex items-center gap-1"
                    >
                      <span className="w-0 group-hover:w-2 h-[1px] bg-[#00f0ff] transition-all duration-300"></span>
                      {getLocalizedText(link.label, link.labelEn)}
                    </Link>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          </div>

          {/* 第三列：资源链接 */}
          <div className="lg:col-span-1">
            <CollapsibleSection
              title={getLocalizedText(defaultResourceLinks.title, defaultResourceLinks.titleEn)}
            >
              <ul className="space-y-3">
                {defaultResourceLinks.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group text-sm text-[#9ca3af] hover:text-[#00f0ff] transition-all duration-300 flex items-center gap-1"
                    >
                      <span className="w-0 group-hover:w-2 h-[1px] bg-[#00f0ff] transition-all duration-300"></span>
                      {getLocalizedText(link.label, link.labelEn)}
                    </Link>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          </div>

          {/* 第四列：联系方式 */}
          <div className="lg:col-span-1">
            <CollapsibleSection
              title={language === "en" ? "Contact" : "联系方式"}
            >
              <div className="space-y-4">
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="group flex items-center gap-3 text-sm text-[#9ca3af] hover:text-[#00f0ff] transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#b026ff]/10 flex items-center justify-center group-hover:bg-[#b026ff]/20 transition-colors">
                    <Mail className="w-4 h-4 text-[#b026ff]" />
                  </div>
                  <span>{contactInfo.email}</span>
                </a>
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="group flex items-center gap-3 text-sm text-[#9ca3af] hover:text-[#00f0ff] transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#00f0ff]/10 flex items-center justify-center group-hover:bg-[#00f0ff]/20 transition-colors">
                    <Phone className="w-4 h-4 text-[#00f0ff]" />
                  </div>
                  <span>{contactInfo.phone}</span>
                </a>
                <div className="flex items-start gap-3 text-sm text-[#9ca3af]">
                  <div className="w-8 h-8 rounded-lg bg-[#ff2a6d]/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#ff2a6d]" />
                  </div>
                  <span>{contactInfo.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#9ca3af]">
                  <div className="w-8 h-8 rounded-lg bg-[#ccff00]/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#ccff00]" />
                  </div>
                  <span>{contactInfo.workingHours}</span>
                </div>
              </div>
            </CollapsibleSection>
          </div>

          {/* 第五列：社交媒体 */}
          <div className="lg:col-span-1">
            <CollapsibleSection
              title={language === "en" ? "Follow Us" : "关注我们"}
              defaultOpen={true}
            >
              <div className="flex flex-wrap gap-3">
                {defaultSocialLinks.map((social, index) => {
                  const IconComponent = socialIcons[social.platform] || Mail;
                  const colors = [
                    'from-[#b026ff] to-[#7c3aed]',
                    'from-[#00f0ff] to-[#00c896]',
                    'from-[#ff2a6d] to-[#ff6b35]',
                    'from-[#ccff00] to-[#00e5a8]'
                  ];
                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      title={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group p-3 rounded-xl bg-gradient-to-br ${colors[index % colors.length]} opacity-80 hover:opacity-100 hover:shadow-[0_0_20px_rgba(176,38,255,0.4)] hover:scale-110 transition-all duration-300`}
                    >
                      <IconComponent className="w-5 h-5 text-white" />
                    </a>
                  );
                })}
              </div>
              {/* 快速链接 */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <ul className="space-y-3">
                  {defaultQuickLinks.links.slice(0, 2).map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group text-sm text-[#9ca3af] hover:text-[#00f0ff] transition-all duration-300 flex items-center gap-2"
                      >
                        {getLocalizedText(link.label, link.labelEn)}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </CollapsibleSection>
          </div>
        </div>

        {/* 霓虹分隔线 */}
        <div className="h-[1px] w-full mb-8 bg-gradient-to-r from-transparent via-[#b026ff]/50 to-transparent" />

        {/* 底部栏 */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* 版权信息 */}
          <p className="text-sm text-[#6b7280] text-center md:text-left">
            &copy; {currentYear} Creative.{" "}
            {language === "en" ? "All rights reserved." : "保留所有权利。"}
          </p>

          {/* 法律链接 */}
          <div className="flex items-center gap-6 text-sm text-[#6b7280]">
            <Link href="/privacy" className="hover:text-[#00f0ff] transition-colors">
              {language === "en" ? "Privacy Policy" : "隐私政策"}
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/terms" className="hover:text-[#00f0ff] transition-colors">
              {language === "en" ? "Terms of Service" : "服务条款"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

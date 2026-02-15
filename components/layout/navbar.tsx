"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  Mail,
  Music2,
  BookOpen,
  Video,
  Camera,
  Linkedin,
  Github,
  Instagram,
  X,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTheme } from "@/lib/website/hooks/useTheme";
import { getThemeState, switchThemes } from "@/lib/theme-sync";
import { useLanguage } from "@/lib/i18n/context";
import type { NavbarConfig, NavbarSocial } from "@/types/homepage";

/**
 * NavbarThemeToggle
 * 简单的「浅色 / 深色」文字切换按钮
 */
const NavbarThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const applyUnifiedTheme = (nextTheme: "light" | "dark") => {
    // 1) 更新官网主题系统（dark 类和 CSS 变量）
    setTheme(nextTheme);

    // 2) 同步到全局深浅主题（data-theme），让所有页面（bg-background 等）保持一致
    const state = getThemeState();
    switchThemes(state.colorTheme, nextTheme);
  };

  return (
    <div className="flex items-center rounded-full bg-muted/60 p-0.5 text-xs font-medium">
      <button
        type="button"
        onClick={() => applyUnifiedTheme("light")}
        className={`px-2.5 py-1 rounded-full transition-colors ${
          theme === "light"
            ? "bg-white text-black shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        浅色
      </button>
      <button
        type="button"
        onClick={() => applyUnifiedTheme("dark")}
        className={`px-2.5 py-1 rounded-full transition-colors ${
          theme === "dark"
            ? "bg-white text-black shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        深色
      </button>
    </div>
  );
};

// 社交媒体平台图标映射
const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  github: Github,
  instagram: Instagram,
  wechat: Mail,
  weibo: BookOpen,
  bilibili: Video,
  douyin: Music2,
  xiaohongshu: Camera,

};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navbarData, setNavbarData] = useState<NavbarConfig | null>(null);
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/homepage/navbar")
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setNavbarData(result.data);
        }
      })
      .catch(() => {
        // Fallback to static content on error
      });
  }, []);

  // Helper to get localized content - uses fallback from translations for all languages
  const getContent = (zh: string | null | undefined, en: string | null | undefined, fallback: string) => {
    if (language === "en") {
      return en || fallback;
    }
    if (language === "ug") {
      return fallback; // Use translation fallback for Uyghur
    }
    return zh || fallback;
  };

  // Default nav items
  const defaultNavItems = [
    { label: t.nav.about, href: "/about" },
    { label: t.nav.services || "Services", href: "/services" },
    { label: t.nav.partners || "Partners", href: "/partners" },
    { label: t.nav.team, href: "/team" },
    { label: t.nav.blog, href: "/blog" },
    { label: t.nav.contact, href: "/contact" },
  ];

  // Use API menu items if available
  const navItems = navbarData?.menuItems && navbarData.menuItems.length > 0
    ? navbarData.menuItems
        .filter(item => item.isActive !== false)
        .map(item => ({
          label: getContent(item.label, item.labelEn, item.label),
          href: item.link,
        }))
    : defaultNavItems;

  const logoUrl = navbarData?.logoUrl;
  const logoAlt = navbarData ? getContent(navbarData.logoAlt, navbarData.logoAltEn, "CREATIVE") : "CREATIVE";
  const loginText = navbarData ? getContent(navbarData.loginText, navbarData.loginTextEn, t.nav.login) : t.nav.login;
  const loginLink = navbarData?.loginLink || "/login";
  const registerText = navbarData ? getContent(navbarData.registerText, navbarData.registerTextEn, t.nav.getStarted) : t.nav.getStarted;
  const registerLink = navbarData?.registerLink || "/register";

  // 社交媒体链接
  const socialLinks = navbarData?.socialLinks || [];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 will-change-[backdrop-filter] ${
        isScrolled
          ? theme === "dark"
            ? "bg-slate-900/15 dark:bg-slate-900/15 backdrop-blur-[20px] border-b border-white/10 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)] text-white"
            : "bg-white/15 backdrop-blur-[20px] border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)]"
          : "bg-transparent border-b border-transparent"
      }`}
      style={!isScrolled ? { 
        color: 'black',
        textShadow: '0 1px 2px rgba(255,255,255,0.3)'
      } : undefined}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {logoUrl ? (
              <Image src={logoUrl} alt={logoAlt} width={120} height={40} className="h-8 md:h-10 w-auto" />
            ) : (
              <span 
                className="text-xl md:text-2xl font-bold"
                style={!isScrolled ? {
                  backgroundImage: 'linear-gradient(135deg, #000000 0%, rgba(0,0,0,0.9) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                } : {
                  backgroundImage: 'linear-gradient(135deg, #5b7cff 0%, #00e5a8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                CREATIVE
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-sm font-medium hover:opacity-80 transition-colors"
                style={!isScrolled ? { color: 'black' } : undefined}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-4">
              <Link
                href={loginLink}
                className="text-sm font-medium hover:opacity-80 transition-colors"
                style={!isScrolled ? { color: 'black' } : undefined}
              >
                {loginText}
              </Link>
              <Link
                href={registerLink}
                className="text-sm font-medium hover:opacity-80 transition-colors"
                style={!isScrolled ? { color: 'black' } : undefined}
              >
                {registerText}
              </Link>
              <Link
                href="/admin-login"
                className="text-sm font-medium hover:opacity-80 transition-colors"
                style={!isScrolled ? { color: 'black' } : undefined}
              >
                {t.nav.admin}
              </Link>
            </div>
            {/* Social Media Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-1">
                {socialLinks.map((social, index) => {
                  const IconComponent = platformIcons[social.platform.toLowerCase()] || Mail;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.platform}
                      className="p-2 hover:bg-muted/50 rounded-lg transition-all"
                    >
                      <IconComponent className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
            {/* 语言切换 + 明暗主题切换（浅色 / 深色） */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <NavbarThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <LanguageSwitcher />
            <NavbarThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/15 dark:bg-slate-900/15 backdrop-blur-[16px] border-b border-white/10 dark:border-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.06)]">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={loginLink}
              className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {loginText}
            </Link>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "#contact")}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:opacity-90 transition-opacity font-medium text-sm mt-2"
            >
              {t.nav.getStarted}
            </a>
            {/* Mobile Social Media Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                {socialLinks.map((social, index) => {
                  const IconComponent = platformIcons[social.platform.toLowerCase()] || Mail;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.platform}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

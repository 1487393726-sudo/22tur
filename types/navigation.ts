/**
 * 官网导航系统类型定义
 * 支持 Mega Menu、移动端抽屉菜单、底部导航栏
 */

import type { LucideIcon } from "lucide-react";

// ============ 基础类型 ============

/** 导航链接项 */
export interface NavMenuLink {
  id: string;
  label: string;
  labelEn?: string;
  labelUg?: string;
  href: string;
  description?: string;
  descriptionEn?: string;
  descriptionUg?: string;
  icon?: string;
  isExternal?: boolean;
  requireAuth?: boolean;
  roles?: string[];
}

/** 导航菜单分组 */
export interface NavMenuGroup {
  id: string;
  title: string;
  titleEn?: string;
  titleUg?: string;
  items: NavMenuLink[];
}

/** 导航菜单项类型 */
export type NavMenuItemType = "link" | "mega-menu";

/** 导航菜单项 */
export interface NavMenuItem {
  id: string;
  label: string;
  labelEn?: string;
  labelUg?: string;
  href?: string;
  type: NavMenuItemType;
  children?: NavMenuGroup[];
  requireAuth?: boolean;
  roles?: string[];
  icon?: string;
}

// ============ 组件 Props ============

/** MainNavbar 组件属性 */
export interface MainNavbarProps {
  className?: string;
}

/** MegaMenu 组件属性 */
export interface MegaMenuProps {
  isOpen: boolean;
  groups: NavMenuGroup[];
  onClose: () => void;
  triggerRef?: { current: HTMLElement | null };
}

/** MobileDrawer 组件属性 */
export interface MobileDrawerProps {
  isOpen: boolean;
  menuItems: NavMenuItem[];
  onClose: () => void;
}

/** 底部导航项 */
export interface BottomNavItem {
  id: string;
  label: string;
  labelEn?: string;
  labelUg?: string;
  icon: string;
  href: string;
  activePattern?: string; // 用于匹配当前路由
}

/** MobileBottomNav 组件属性 */
export interface MobileBottomNavProps {
  className?: string;
}

// ============ 配置类型 ============

/** 社交媒体链接 */
export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon?: string;
}

/** 认证配置 */
export interface AuthConfig {
  loginText: string;
  loginTextEn: string;
  loginTextUg?: string;
  loginLink: string;
  registerText: string;
  registerTextEn: string;
  registerTextUg?: string;
  registerLink: string;
}

/** Logo 配置 */
export interface LogoConfig {
  url?: string;
  alt: string;
  altEn: string;
  altUg?: string;
}

/** 导航配置 */
export interface NavigationConfig {
  logo: LogoConfig;
  menuItems: NavMenuItem[];
  mobileBottomNav: BottomNavItem[];
  socialLinks: SocialLink[];
  auth: AuthConfig;
}

// ============ Section 组件类型 ============

/** Section 背景类型 */
export type SectionBackground = "default" | "gradient" | "muted" | "dark";

/** Section 基础属性 */
export interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  animate?: boolean;
  background?: SectionBackground;
}

/** 统计数据项 */
export interface StatItem {
  id: string;
  value: string | number;
  label: string;
  labelEn?: string;
  labelUg?: string;
  suffix?: string;
  prefix?: string;
}

/** 服务卡片 */
export interface ServiceCard {
  id: string;
  icon: string;
  title: string;
  titleEn?: string;
  titleUg?: string;
  description: string;
  descriptionEn?: string;
  descriptionUg?: string;
  features: string[];
  featuresEn?: string[];
  featuresUg?: string[];
  href: string;
  color: string;
}

/** 案例项 */
export interface CaseItem {
  id: string;
  title: string;
  titleEn?: string;
  category: string;
  categoryEn?: string;
  thumbnail: string;
  href: string;
}

/** 客户评价 */
export interface TestimonialItem {
  id: string;
  content: string;
  contentEn?: string;
  author: string;
  authorEn?: string;
  role: string;
  roleEn?: string;
  company: string;
  companyEn?: string;
  avatar?: string;
  rating?: number;
}

// ============ 首页配置类型 ============

/** Hero 配置 */
export interface HeroConfig {
  title: string;
  titleEn?: string;
  subtitle: string;
  subtitleEn?: string;
  primaryCTA: {
    text: string;
    textEn?: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    textEn?: string;
    href: string;
  };
  backgroundType: "particles" | "video" | "gradient" | "image";
  backgroundConfig?: {
    videoUrl?: string;
    imageUrl?: string;
    gradientColors?: string[];
  };
}

/** 核心服务配置 */
export interface CoreServicesConfig {
  title: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  services: ServiceCard[];
}

/** 案例展示配置 */
export interface CasesConfig {
  title: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  cases: CaseItem[];
  showMoreLink: string;
}

/** 关于我们配置 */
export interface AboutConfig {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  image?: string;
  video?: string;
  stats: StatItem[];
}

/** 客户评价配置 */
export interface TestimonialsConfig {
  title: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  testimonials: TestimonialItem[];
  autoPlay?: boolean;
  interval?: number;
}

/** CTA 配置 */
export interface CTAConfig {
  title: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  primaryButton: {
    text: string;
    textEn?: string;
    href: string;
  };
  secondaryButton?: {
    text: string;
    textEn?: string;
    href: string;
  };
  background: "gradient" | "solid" | "image";
}

/** 联系方式配置 */
export interface ContactConfig {
  title: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  contactInfo: {
    address: string;
    addressEn?: string;
    phone: string;
    email: string;
    workingHours?: string;
    workingHoursEn?: string;
  };
  socialLinks: SocialLink[];
  showMap?: boolean;
  mapConfig?: {
    lat: number;
    lng: number;
    zoom: number;
  };
}

/** 首页区块配置 */
export interface HomepageSections {
  hero: HeroConfig;
  coreServices: CoreServicesConfig;
  cases: CasesConfig;
  about: AboutConfig;
  testimonials: TestimonialsConfig;
  cta: CTAConfig;
  contact: ContactConfig;
}

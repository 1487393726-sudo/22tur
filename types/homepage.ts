// 首页区块编辑系统类型定义

// Hero区块
export interface HeroSection {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  backgroundImage: string | null;
  ctaText: string;
  ctaTextEn: string;
  ctaLink: string;
  ctaSecondaryText: string | null;
  ctaSecondaryTextEn: string | null;
  ctaSecondaryLink: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HeroSectionInput {
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  backgroundImage?: string | null;
  ctaText: string;
  ctaTextEn: string;
  ctaLink: string;
  ctaSecondaryText?: string | null;
  ctaSecondaryTextEn?: string | null;
  ctaSecondaryLink?: string | null;
  isActive?: boolean;
}

// 关于我们区块
export interface AboutStat {
  id: string;
  aboutId: string;
  label: string;
  labelEn: string;
  value: string;
  icon: string | null;
  order: number;
}

export interface AboutStatInput {
  id?: string;
  label: string;
  labelEn: string;
  value: string;
  icon?: string | null;
  order?: number;
}

export interface AboutFeature {
  id: string;
  aboutId: string;
  title: string;
  titleEn: string;
  description: string | null;
  descriptionEn: string | null;
  icon: string | null;
  order: number;
}


export interface AboutFeatureInput {
  id?: string;
  title: string;
  titleEn: string;
  description?: string | null;
  descriptionEn?: string | null;
  icon?: string | null;
  order?: number;
}

export interface AboutSection {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats: AboutStat[];
  features: AboutFeature[];
}

export interface AboutSectionInput {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  image?: string | null;
  isActive?: boolean;
  stats?: AboutStatInput[];
  features?: AboutFeatureInput[];
}

// 视频介绍区块
export interface VideoSection {
  id: string;
  videoUrl: string;
  title: string;
  titleEn: string;
  description: string | null;
  descriptionEn: string | null;
  thumbnail: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoSectionInput {
  videoUrl: string;
  title: string;
  titleEn: string;
  description?: string | null;
  descriptionEn?: string | null;
  thumbnail?: string | null;
  isActive?: boolean;
}

// 客户评价
export interface Testimonial {
  id: string;
  name: string;
  nameEn: string | null;
  avatar: string | null;
  company: string | null;
  companyEn: string | null;
  position: string | null;
  positionEn: string | null;
  content: string;
  contentEn: string;
  rating: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestimonialInput {
  name: string;
  nameEn?: string | null;
  avatar?: string | null;
  company?: string | null;
  companyEn?: string | null;
  position?: string | null;
  positionEn?: string | null;
  content: string;
  contentEn: string;
  rating?: number;
  order?: number;
  isActive?: boolean;
}

// CTA区块
export interface CTASection {
  id: string;
  title: string;
  titleEn: string;
  description: string | null;
  descriptionEn: string | null;
  primaryBtnText: string;
  primaryBtnTextEn: string;
  primaryBtnLink: string;
  primaryBtnVariant: string;
  secondaryBtnText: string | null;
  secondaryBtnTextEn: string | null;
  secondaryBtnLink: string | null;
  secondaryBtnVariant: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CTASectionInput {
  title: string;
  titleEn: string;
  description?: string | null;
  descriptionEn?: string | null;
  primaryBtnText: string;
  primaryBtnTextEn: string;
  primaryBtnLink: string;
  primaryBtnVariant?: string;
  secondaryBtnText?: string | null;
  secondaryBtnTextEn?: string | null;
  secondaryBtnLink?: string | null;
  secondaryBtnVariant?: string | null;
  isActive?: boolean;
}

// 联系方式区块
export interface ContactSocial {
  id: string;
  contactId: string;
  platform: string;
  url: string;
  icon: string | null;
  order: number;
}

export interface ContactSocialInput {
  id?: string;
  platform: string;
  url: string;
  icon?: string | null;
  order?: number;
}

export interface ContactSection {
  id: string;
  address: string | null;
  addressEn: string | null;
  phone: string | null;
  email: string | null;
  mapEmbedUrl: string | null;
  workingHours: string | null;
  workingHoursEn: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  socialLinks: ContactSocial[];
}

export interface ContactSectionInput {
  address?: string | null;
  addressEn?: string | null;
  phone?: string | null;
  email?: string | null;
  mapEmbedUrl?: string | null;
  workingHours?: string | null;
  workingHoursEn?: string | null;
  isActive?: boolean;
  socialLinks?: ContactSocialInput[];
}

// 导航栏配置
export interface NavbarItem {
  id: string;
  navbarId: string;
  label: string;
  labelEn: string;
  link: string;
  order: number;
  isActive: boolean;
}

export interface NavbarItemInput {
  id?: string;
  label: string;
  labelEn: string;
  link: string;
  order?: number;
  isActive?: boolean;
}

// 导航栏社交媒体链接
export interface NavbarSocial {
  id: string;
  navbarId: string;
  platform: string;
  url: string;
  icon: string | null;
  order: number;
}

export interface NavbarSocialInput {
  id?: string;
  platform: string;
  url: string;
  icon?: string | null;
  order?: number;
}

export interface NavbarConfig {
  id: string;
  logoUrl: string | null;
  logoAlt: string | null;
  logoAltEn: string | null;
  loginText: string | null;
  loginTextEn: string | null;
  loginLink: string | null;
  registerText: string | null;
  registerTextEn: string | null;
  registerLink: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  menuItems: NavbarItem[];
  socialLinks: NavbarSocial[];
}

export interface NavbarConfigInput {
  logoUrl?: string | null;
  logoAlt?: string | null;
  logoAltEn?: string | null;
  loginText?: string | null;
  loginTextEn?: string | null;
  loginLink?: string | null;
  registerText?: string | null;
  registerTextEn?: string | null;
  registerLink?: string | null;
  isActive?: boolean;
  menuItems?: NavbarItemInput[];
  socialLinks?: NavbarSocialInput[];
}

// 页脚配置
export interface FooterLink {
  id: string;
  sectionId: string;
  label: string;
  labelEn: string;
  url: string;
  order: number;
}

export interface FooterLinkInput {
  id?: string;
  label: string;
  labelEn: string;
  url: string;
  order?: number;
}

export interface FooterSection {
  id: string;
  footerId: string;
  title: string;
  titleEn: string;
  order: number;
  links: FooterLink[];
}

export interface FooterSectionInput {
  id?: string;
  title: string;
  titleEn: string;
  order?: number;
  links?: FooterLinkInput[];
}

export interface FooterSocial {
  id: string;
  footerId: string;
  platform: string;
  url: string;
  icon: string | null;
  order: number;
}

export interface FooterSocialInput {
  id?: string;
  platform: string;
  url: string;
  icon?: string | null;
  order?: number;
}

export interface FooterConfig {
  id: string;
  copyrightText: string | null;
  copyrightTextEn: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  sections: FooterSection[];
  socialLinks: FooterSocial[];
}

export interface FooterConfigInput {
  copyrightText?: string | null;
  copyrightTextEn?: string | null;
  isActive?: boolean;
  sections?: FooterSectionInput[];
  socialLinks?: FooterSocialInput[];
}

// 重排序请求
export interface ReorderItem {
  id: string;
  order: number;
}

// API响应类型
export interface HomepageApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

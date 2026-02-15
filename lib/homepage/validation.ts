import { z } from 'zod';

// URL验证函数
export function validateVideoUrl(url: string): boolean {
  if (!url) return false;
  
  // YouTube URLs
  const youtubePatterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
  ];
  
  // Vimeo URLs
  const vimeoPatterns = [
    /^https?:\/\/(www\.)?vimeo\.com\/\d+/,
    /^https?:\/\/player\.vimeo\.com\/video\/\d+/,
  ];
  
  // Bilibili URLs
  const bilibiliPatterns = [
    /^https?:\/\/(www\.)?bilibili\.com\/video\/[\w]+/,
    /^https?:\/\/player\.bilibili\.com\/player\.html/,
  ];
  
  // Direct video file URLs
  const videoFilePattern = /^https?:\/\/.+\.(mp4|webm|ogg|mov)(\?.*)?$/i;
  
  const allPatterns = [
    ...youtubePatterns,
    ...vimeoPatterns,
    ...bilibiliPatterns,
    videoFilePattern,
  ];
  
  return allPatterns.some(pattern => pattern.test(url));
}

// Hero区块验证
export const heroSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  titleEn: z.string().min(1, '英文标题不能为空'),
  subtitle: z.string().min(1, '副标题不能为空'),
  subtitleEn: z.string().min(1, '英文副标题不能为空'),
  backgroundImage: z.string().url('请输入有效的图片URL').nullable().optional(),
  ctaText: z.string().min(1, '按钮文字不能为空'),
  ctaTextEn: z.string().min(1, '英文按钮文字不能为空'),
  ctaLink: z.string().min(1, '按钮链接不能为空'),
  ctaSecondaryText: z.string().nullable().optional(),
  ctaSecondaryTextEn: z.string().nullable().optional(),
  ctaSecondaryLink: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});


// 关于我们 - 统计数据验证
export const aboutStatSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, '标签不能为空'),
  labelEn: z.string().min(1, '英文标签不能为空'),
  value: z.string().min(1, '数值不能为空'),
  icon: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
});

// 关于我们 - 特色列表验证
export const aboutFeatureSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, '标题不能为空'),
  titleEn: z.string().min(1, '英文标题不能为空'),
  description: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
});

// 关于我们区块验证
export const aboutSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  titleEn: z.string().min(1, '英文标题不能为空'),
  description: z.string().min(1, '描述不能为空'),
  descriptionEn: z.string().min(1, '英文描述不能为空'),
  image: z.string().url('请输入有效的图片URL').nullable().optional(),
  isActive: z.boolean().optional(),
  stats: z.array(aboutStatSchema).optional(),
  features: z.array(aboutFeatureSchema).optional(),
});

// 视频介绍区块验证
export const videoSchema = z.object({
  videoUrl: z.string().min(1, '视频URL不能为空').refine(validateVideoUrl, {
    message: '请输入有效的视频URL（支持YouTube、Vimeo、Bilibili或直接视频链接）',
  }),
  title: z.string().min(1, '标题不能为空'),
  titleEn: z.string().min(1, '英文标题不能为空'),
  description: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  thumbnail: z.string().url('请输入有效的缩略图URL').nullable().optional(),
  isActive: z.boolean().optional(),
});

// 客户评价验证
export const testimonialSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  nameEn: z.string().nullable().optional(),
  avatar: z.string().url('请输入有效的头像URL').nullable().optional(),
  company: z.string().nullable().optional(),
  companyEn: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  positionEn: z.string().nullable().optional(),
  content: z.string().min(1, '评价内容不能为空'),
  contentEn: z.string().min(1, '英文评价内容不能为空'),
  rating: z.number().int().min(1).max(5).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// CTA区块验证
export const ctaSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  titleEn: z.string().min(1, '英文标题不能为空'),
  description: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  primaryBtnText: z.string().min(1, '主按钮文字不能为空'),
  primaryBtnTextEn: z.string().min(1, '英文主按钮文字不能为空'),
  primaryBtnLink: z.string().min(1, '主按钮链接不能为空'),
  primaryBtnVariant: z.enum(['primary', 'secondary', 'outline']).optional(),
  secondaryBtnText: z.string().nullable().optional(),
  secondaryBtnTextEn: z.string().nullable().optional(),
  secondaryBtnLink: z.string().nullable().optional(),
  secondaryBtnVariant: z.enum(['primary', 'secondary', 'outline']).nullable().optional(),
  isActive: z.boolean().optional(),
});

// 联系方式 - 社交媒体验证
export const contactSocialSchema = z.object({
  id: z.string().optional(),
  platform: z.string().min(1, '平台不能为空'),
  url: z.string().url('请输入有效的URL'),
  icon: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
});

// 联系方式区块验证
export const contactSchema = z.object({
  address: z.string().nullable().optional(),
  addressEn: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email('请输入有效的邮箱地址').nullable().optional(),
  mapEmbedUrl: z.string().url('请输入有效的地图URL').nullable().optional(),
  workingHours: z.string().nullable().optional(),
  workingHoursEn: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  socialLinks: z.array(contactSocialSchema).optional(),
});

// 导航栏 - 菜单项验证
export const navbarItemSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, '菜单文字不能为空'),
  labelEn: z.string().min(1, '英文菜单文字不能为空'),
  link: z.string().min(1, '链接不能为空'),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// 导航栏 - 社交媒体验证
export const navbarSocialSchema = z.object({
  id: z.string().optional(),
  platform: z.string().min(1, '平台不能为空'),
  url: z.string().url('请输入有效的URL'),
  icon: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
});

// 导航栏配置验证
export const navbarSchema = z.object({
  logoUrl: z.string().url('请输入有效的Logo URL').nullable().optional(),
  logoAlt: z.string().nullable().optional(),
  logoAltEn: z.string().nullable().optional(),
  loginText: z.string().nullable().optional(),
  loginTextEn: z.string().nullable().optional(),
  loginLink: z.string().nullable().optional(),
  registerText: z.string().nullable().optional(),
  registerTextEn: z.string().nullable().optional(),
  registerLink: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  menuItems: z.array(navbarItemSchema).optional(),
  socialLinks: z.array(navbarSocialSchema).optional(),
});

// 页脚 - 链接验证
export const footerLinkSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, '链接文字不能为空'),
  labelEn: z.string().min(1, '英文链接文字不能为空'),
  url: z.string().min(1, 'URL不能为空'),
  order: z.number().int().min(0).optional(),
});

// 页脚 - 链接分组验证
export const footerSectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, '分组标题不能为空'),
  titleEn: z.string().min(1, '英文分组标题不能为空'),
  order: z.number().int().min(0).optional(),
  links: z.array(footerLinkSchema).optional(),
});

// 页脚 - 社交媒体验证
export const footerSocialSchema = z.object({
  id: z.string().optional(),
  platform: z.string().min(1, '平台不能为空'),
  url: z.string().url('请输入有效的URL'),
  icon: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
});

// 页脚配置验证
export const footerSchema = z.object({
  copyrightText: z.string().nullable().optional(),
  copyrightTextEn: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  sections: z.array(footerSectionSchema).optional(),
  socialLinks: z.array(footerSocialSchema).optional(),
});

// 重排序验证
export const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    order: z.number().int().min(0),
  })),
});

// 验证错误处理
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
}

// 类型导出
export type HeroInput = z.infer<typeof heroSchema>;
export type AboutInput = z.infer<typeof aboutSchema>;
export type VideoInput = z.infer<typeof videoSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type CTAInput = z.infer<typeof ctaSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type NavbarInput = z.infer<typeof navbarSchema>;
export type FooterInput = z.infer<typeof footerSchema>;

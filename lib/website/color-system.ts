/**
 * 官网系统统一颜色系统 - 重新设计版本
 * 与现有官网主题对齐：深蓝色 (#1E3A5F) + 橙色 (#FF6B35)
 * 提供6种可选颜色风格
 */

// ============================================
// 颜色风格定义
// ============================================

// 1. 官网默认风格 (深蓝 + 橙色) - 与现有网站主题对齐
export const websiteDefaultStyle = {
  primary: {
    50: '#f0f5fb',
    100: '#e1ebf7',
    200: '#c3d7ef',
    300: '#a5c3e7',
    400: '#87afdf',
    500: '#699bd7',
    600: '#4b87cf',
    700: '#3d6fb5',
    800: '#2f579b',
    900: '#1E3A5F', // 深蓝品牌色
  },

  secondary: {
    50: '#f3f6fb',
    100: '#e7edf7',
    200: '#cfdaef',
    300: '#b7c7e7',
    400: '#9fb4df',
    500: '#87a1d7',
    600: '#6f8ecf',
    700: '#577bc7',
    800: '#3f68bf',
    900: '#2D5A8C',
  },

  accent: {
    50: '#fff7ed',
    100: '#ffeddb',
    200: '#ffdbb7',
    300: '#ffc993',
    400: '#ffb76f',
    500: '#ffa54b',
    600: '#ff9327',
    700: '#ff8103',
    800: '#e67000',
    900: '#FF6B35', // 橙色品牌色
  },

  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  background: {
    light: '#ffffff',
    dark: '#f9fafb',
    darker: '#f3f4f6',
  },

  text: {
    primary: '#1E3A5F',
    secondary: '#525252',
    tertiary: '#a3a3a3',
    light: '#ffffff',
  },

  border: {
    light: '#e5e5e5',
    medium: '#d4d4d4',
    dark: '#a3a3a3',
  },
};

// 2. 深蓝增强风格 - 更深的蓝色系
export const deepBlueStyle = {
  primary: {
    50: '#e8f0f9',
    100: '#d1e1f3',
    200: '#a3c3e7',
    300: '#75a5db',
    400: '#4787cf',
    500: '#1E3A5F', // 深蓝品牌色
    600: '#1a3250',
    700: '#162a41',
    800: '#122232',
    900: '#0e1a23',
  },

  secondary: {
    50: '#f0f5fb',
    100: '#e1ebf7',
    200: '#c3d7ef',
    300: '#a5c3e7',
    400: '#87afdf',
    500: '#699bd7',
    600: '#4b87cf',
    700: '#3d6fb5',
    800: '#2f579b',
    900: '#2D5A8C',
  },

  accent: {
    50: '#fff7ed',
    100: '#ffeddb',
    200: '#ffdbb7',
    300: '#ffc993',
    400: '#ffb76f',
    500: '#ffa54b',
    600: '#ff9327',
    700: '#ff8103',
    800: '#e67000',
    900: '#FF6B35',
  },

  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  background: {
    light: '#ffffff',
    dark: '#f9fafb',
    darker: '#f3f4f6',
  },

  text: {
    primary: '#0e1a23',
    secondary: '#525252',
    tertiary: '#a3a3a3',
    light: '#ffffff',
  },

  border: {
    light: '#e5e5e5',
    medium: '#d4d4d4',
    dark: '#a3a3a3',
  },
};

// 3. 蓝色活力风格 - 亮蓝 + 橙色
export const brightBlueStyle = {
  primary: {
    50: '#ecf9ff',
    100: '#cff2ff',
    200: '#a5e8ff',
    300: '#75deff',
    400: '#4dd9ff',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },

  secondary: {
    50: '#f0f5fb',
    100: '#e1ebf7',
    200: '#c3d7ef',
    300: '#a5c3e7',
    400: '#87afdf',
    500: '#699bd7',
    600: '#4b87cf',
    700: '#3d6fb5',
    800: '#2f579b',
    900: '#1E3A5F',
  },

  accent: {
    50: '#fff7ed',
    100: '#ffeddb',
    200: '#ffdbb7',
    300: '#ffc993',
    400: '#ffb76f',
    500: '#ffa54b',
    600: '#ff9327',
    700: '#ff8103',
    800: '#e67000',
    900: '#FF6B35',
  },

  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  background: {
    light: '#ffffff',
    dark: '#f9fafb',
    darker: '#f3f4f6',
  },

  text: {
    primary: '#164e63',
    secondary: '#525252',
    tertiary: '#a3a3a3',
    light: '#ffffff',
  },

  border: {
    light: '#e5e5e5',
    medium: '#d4d4d4',
    dark: '#a3a3a3',
  },
};

// 4. 绿色清新风格 - 绿色 + 橙色
export const freshGreenStyle = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  secondary: {
    50: '#f0f5fb',
    100: '#e1ebf7',
    200: '#c3d7ef',
    300: '#a5c3e7',
    400: '#87afdf',
    500: '#699bd7',
    600: '#4b87cf',
    700: '#3d6fb5',
    800: '#2f579b',
    900: '#1E3A5F',
  },

  accent: {
    50: '#fff7ed',
    100: '#ffeddb',
    200: '#ffdbb7',
    300: '#ffc993',
    400: '#ffb76f',
    500: '#ffa54b',
    600: '#ff9327',
    700: '#ff8103',
    800: '#e67000',
    900: '#FF6B35',
  },

  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  background: {
    light: '#ffffff',
    dark: '#f9fafb',
    darker: '#f3f4f6',
  },

  text: {
    primary: '#14532d',
    secondary: '#525252',
    tertiary: '#a3a3a3',
    light: '#ffffff',
  },

  border: {
    light: '#e5e5e5',
    medium: '#d4d4d4',
    dark: '#a3a3a3',
  },
};

// 5. 紫色优雅风格 - 紫色 + 橙色
export const elegantPurpleStyle = {
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  secondary: {
    50: '#f0f5fb',
    100: '#e1ebf7',
    200: '#c3d7ef',
    300: '#a5c3e7',
    400: '#87afdf',
    500: '#699bd7',
    600: '#4b87cf',
    700: '#3d6fb5',
    800: '#2f579b',
    900: '#1E3A5F',
  },

  accent: {
    50: '#fff7ed',
    100: '#ffeddb',
    200: '#ffdbb7',
    300: '#ffc993',
    400: '#ffb76f',
    500: '#ffa54b',
    600: '#ff9327',
    700: '#ff8103',
    800: '#e67000',
    900: '#FF6B35',
  },

  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  background: {
    light: '#ffffff',
    dark: '#f9fafb',
    darker: '#f3f4f6',
  },

  text: {
    primary: '#581c87',
    secondary: '#525252',
    tertiary: '#a3a3a3',
    light: '#ffffff',
  },

  border: {
    light: '#e5e5e5',
    medium: '#d4d4d4',
    dark: '#a3a3a3',
  },
};

// 6. 红色热烈风格 - 红色 + 橙色
export const vibrantRedStyle = {
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  secondary: {
    50: '#f0f5fb',
    100: '#e1ebf7',
    200: '#c3d7ef',
    300: '#a5c3e7',
    400: '#87afdf',
    500: '#699bd7',
    600: '#4b87cf',
    700: '#3d6fb5',
    800: '#2f579b',
    900: '#1E3A5F',
  },

  accent: {
    50: '#fff7ed',
    100: '#ffeddb',
    200: '#ffdbb7',
    300: '#ffc993',
    400: '#ffb76f',
    500: '#ffa54b',
    600: '#ff9327',
    700: '#ff8103',
    800: '#e67000',
    900: '#FF6B35',
  },

  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  background: {
    light: '#ffffff',
    dark: '#f9fafb',
    darker: '#f3f4f6',
  },

  text: {
    primary: '#7f1d1d',
    secondary: '#525252',
    tertiary: '#a3a3a3',
    light: '#ffffff',
  },

  border: {
    light: '#e5e5e5',
    medium: '#d4d4d4',
    dark: '#a3a3a3',
  },
};

// 7. 青色科技风格 - 青色 + 橙色
export const techCyanStyle = {
  primary: {
    50: '#ecf9ff',
    100: '#cff2ff',
    200: '#a5e8ff',
    300: '#75deff',
    400: '#4dd9ff',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },

  secondary: {
    50: '#f0f5fb',
    100: '#e1ebf7',
    200: '#c3d7ef',
    300: '#a5c3e7',
    400: '#87afdf',
    500: '#699bd7',
    600: '#4b87cf',
    700: '#3d6fb5',
    800: '#2f579b',
    900: '#1E3A5F',
  },

  accent: {
    50: '#fff7ed',
    100: '#ffeddb',
    200: '#ffdbb7',
    300: '#ffc993',
    400: '#ffb76f',
    500: '#ffa54b',
    600: '#ff9327',
    700: '#ff8103',
    800: '#e67000',
    900: '#FF6B35',
  },

  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  background: {
    light: '#ffffff',
    dark: '#f9fafb',
    darker: '#f3f4f6',
  },

  text: {
    primary: '#164e63',
    secondary: '#525252',
    tertiary: '#a3a3a3',
    light: '#ffffff',
  },

  border: {
    light: '#e5e5e5',
    medium: '#d4d4d4',
    dark: '#a3a3a3',
  },
};

// 8. 黑白极简风格（浅色） - Black & White Light
export const bwLightStyle = {
  primary: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#4b5563',
    600: '#374151',
    700: '#1f2937',
    800: '#111827',
    900: '#020617',
  },
  secondary: {
    50: '#ffffff',
    100: '#f9fafb',
    200: '#f3f4f6',
    300: '#e5e7eb',
    400: '#d1d5db',
    500: '#9ca3af',
    600: '#6b7280',
    700: '#4b5563',
    800: '#374151',
    900: '#111827',
  },
  accent: {
    50: '#ffffff',
    100: '#f9fafb',
    200: '#f3f4f6',
    300: '#e5e7eb',
    400: '#d1d5db',
    500: '#9ca3af',
    600: '#6b7280',
    700: '#4b5563',
    800: '#374151',
    900: '#111827',
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  success: '#16a34a',
  warning: '#ea580c',
  error: '#b91c1c',
  info: '#2563eb',
  background: {
    light: '#ffffff',
    dark: '#f9fafb',
    darker: '#f3f4f6',
  },
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    tertiary: '#9ca3af',
    light: '#ffffff',
  },
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
  },
};

// 9. 黑白极简风格（深色） - Black & White Dark
export const bwDarkStyle = {
  primary: {
    50: '#111827',
    100: '#1f2937',
    200: '#374151',
    300: '#4b5563',
    400: '#6b7280',
    500: '#9ca3af',
    600: '#d1d5db',
    700: '#e5e7eb',
    800: '#f3f4f6',
    900: '#f9fafb',
  },
  secondary: {
    50: '#020617',
    100: '#030712',
    200: '#020617',
    300: '#030712',
    400: '#020617',
    500: '#111827',
    600: '#1f2937',
    700: '#374151',
    800: '#4b5563',
    900: '#6b7280',
  },
  accent: {
    50: '#020617',
    100: '#030712',
    200: '#020617',
    300: '#030712',
    400: '#020617',
    500: '#111827',
    600: '#1f2937',
    700: '#374151',
    800: '#4b5563',
    900: '#6b7280',
  },
  neutral: {
    50: '#020617',
    100: '#030712',
    200: '#020617',
    300: '#030712',
    400: '#020617',
    500: '#111827',
    600: '#1f2937',
    700: '#374151',
    800: '#4b5563',
    900: '#6b7280',
  },
  success: '#22c55e',
  warning: '#f97316',
  error: '#ef4444',
  info: '#3b82f6',
  background: {
    light: '#020617',
    dark: '#020617',
    darker: '#020617',
  },
  text: {
    primary: '#e5e7eb',
    secondary: '#9ca3af',
    tertiary: '#6b7280',
    light: '#ffffff',
  },
  border: {
    light: '#111827',
    medium: '#1f2937',
    dark: '#374151',
  },
};

// 颜色风格映射
export const colorStyles = {
  'website-default': websiteDefaultStyle,
  'deep-blue': deepBlueStyle,
  'bright-blue': brightBlueStyle,
  'fresh-green': freshGreenStyle,
  'elegant-purple': elegantPurpleStyle,
  'vibrant-red': vibrantRedStyle,
  'tech-cyan': techCyanStyle,
  'bw-light': bwLightStyle,
  'bw-dark': bwDarkStyle,
};

// 默认使用官网默认风格（与现有网站主题对齐）
export const colorPalette = websiteDefaultStyle;

// 获取当前颜色风格的组件颜色映射
export const getComponentColors = (palette: typeof colorPalette) => ({
  // 按钮颜色
  button: {
    primary: {
      bg: palette.primary[500],
      text: palette.text.light,
      hover: palette.primary[600],
      active: palette.primary[700],
      disabled: palette.neutral[300],
    },
    secondary: {
      bg: palette.secondary[500],
      text: palette.text.light,
      hover: palette.secondary[600],
      active: palette.secondary[700],
      disabled: palette.neutral[300],
    },
    outline: {
      bg: 'transparent',
      text: palette.primary[500],
      border: palette.primary[500],
      hover: palette.primary[50],
      disabled: palette.neutral[300],
    },
    ghost: {
      bg: 'transparent',
      text: palette.text.primary,
      hover: palette.neutral[100],
      disabled: palette.neutral[300],
    },
  },

  // 卡片颜色
  card: {
    bg: palette.background.light,
    border: palette.border.light,
    shadow: 'rgba(0, 0, 0, 0.08)',
    hover: palette.primary[50],
    hoverBorder: palette.primary[200],
  },

  // 输入框颜色
  input: {
    bg: palette.background.light,
    border: palette.border.light,
    text: palette.text.primary,
    placeholder: palette.text.tertiary,
    focus: palette.primary[500],
    focusBorder: palette.primary[300],
    error: palette.error,
    success: palette.success,
  },

  // 标签颜色
  badge: {
    primary: {
      bg: palette.primary[100],
      text: palette.primary[700],
    },
    secondary: {
      bg: palette.secondary[100],
      text: palette.secondary[700],
    },
    success: {
      bg: '#d1fae5',
      text: '#065f46',
    },
    warning: {
      bg: '#fef3c7',
      text: '#92400e',
    },
    error: {
      bg: '#fee2e2',
      text: '#991b1b',
    },
  },

  // 导航颜色
  navigation: {
    bg: palette.background.light,
    text: palette.text.primary,
    active: palette.primary[500],
    hover: palette.primary[50],
    border: palette.border.light,
  },

  // 页脚颜色
  footer: {
    bg: palette.neutral[900],
    text: palette.text.light,
    link: palette.primary[300],
    linkHover: palette.primary[200],
    border: palette.neutral[800],
  },

  // 英雄区域颜色
  hero: {
    bg: palette.primary[900],
    text: palette.text.light,
    accent: palette.secondary[500],
  },

  // 服务卡片颜色
  serviceCard: {
    bg: palette.background.light,
    border: palette.border.light,
    icon: palette.primary[500],
    title: palette.text.primary,
    description: palette.text.secondary,
    hover: palette.primary[50],
  },

  // 案例展示颜色
  caseShowcase: {
    bg: palette.background.light,
    overlay: 'rgba(0, 0, 0, 0.7)',
    text: palette.text.light,
    tag: palette.secondary[500],
  },

  // 推荐语颜色
  testimonial: {
    bg: palette.background.dark,
    border: palette.border.light,
    text: palette.text.primary,
    author: palette.text.secondary,
    rating: palette.accent[500],
  },

  // 团队成员颜色
  teamMember: {
    bg: palette.background.light,
    border: palette.border.light,
    name: palette.text.primary,
    role: palette.text.secondary,
    hover: palette.primary[50],
  },

  // 博客颜色
  blog: {
    bg: palette.background.light,
    border: palette.border.light,
    title: palette.text.primary,
    excerpt: palette.text.secondary,
    date: palette.text.tertiary,
    tag: palette.primary[100],
    tagText: palette.primary[700],
    hover: palette.primary[50],
  },

  // 表单颜色
  form: {
    label: palette.text.primary,
    required: palette.error,
    helper: palette.text.tertiary,
    error: palette.error,
    success: palette.success,
  },

  // 分割线颜色
  divider: palette.border.light,

  // 加载状态颜色
  loading: palette.primary[500],

  // 骨架屏颜色
  skeleton: {
    bg: palette.neutral[200],
    shimmer: palette.neutral[100],
  },
});

// 默认组件颜色
export const componentColors = getComponentColors(colorPalette);

// 深色模式颜色
export const darkModeColors = {
  primary: {
    50: '#1a2347',
    100: '#2d3a7a',
    200: '#3d4fb8',
    300: '#4a63e8',
    400: '#5b7cff',
    500: '#7c9aff',
    600: '#a4bfff',
    700: '#c7d9ff',
    800: '#e0e9ff',
    900: '#f0f4ff',
  },

  background: {
    light: '#0f1419',
    dark: '#1a1f2e',
    darker: '#252d3d',
  },

  text: {
    primary: '#f0f4ff',
    secondary: '#a3a3a3',
    tertiary: '#737373',
    light: '#ffffff',
  },

  border: {
    light: '#2d3a7a',
    medium: '#3d4fb8',
    dark: '#4a63e8',
  },

  card: {
    bg: '#1a1f2e',
    border: '#2d3a7a',
    shadow: 'rgba(0, 0, 0, 0.3)',
    hover: '#252d3d',
    hoverBorder: '#3d4fb8',
  },
};

// 渐变色
export const getGradients = (palette: typeof colorPalette) => ({
  primary: `linear-gradient(135deg, ${palette.primary[500]} 0%, ${palette.secondary[500]} 100%)`,
  secondary: `linear-gradient(135deg, ${palette.secondary[500]} 0%, ${palette.accent[500]} 100%)`,
  accent: `linear-gradient(135deg, ${palette.accent[500]} 0%, ${palette.primary[500]} 100%)`,
  subtle: `linear-gradient(135deg, ${palette.primary[50]} 0%, ${palette.secondary[50]} 100%)`,
  dark: `linear-gradient(135deg, ${palette.primary[900]} 0%, ${palette.primary[800]} 100%)`,
});

export const gradients = getGradients(colorPalette);

// 阴影
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
};

// 导出所有颜色
export default {
  colorPalette,
  colorStyles,
  componentColors,
  darkModeColors,
  gradients,
  shadows,
  getComponentColors,
  getGradients,
};

/**
 * 官网统一颜色系统
 * 创意之旅官网 - 现代简洁风格，主色紫色 (#7c3aed)
 * 确保整个官网系统颜色风格一致
 */

// ============================================
// 官网统一颜色配置
// ============================================

export const websiteColors = {
  // 主色调 - 紫色系 (Violet)
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed', // 主色品牌色
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  // 次色调 - 靛蓝紫系
  secondary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },

  // 强调色 - 紫粉系 (CTA/高亮)
  accent: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },

  // 中性色
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

  // 状态色
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // 背景色
  background: {
    light: '#ffffff',
    dark: '#f9fafb',
    darker: '#f3f4f6',
  },

  // 文本色
  text: {
    primary: '#4c1d95',
    secondary: '#525252',
    tertiary: '#a3a3a3',
    light: '#ffffff',
  },

  // 边框色
  border: {
    light: '#e5e5e5',
    medium: '#d4d4d4',
    dark: '#a3a3a3',
  },
};

// ============================================
// 渐变色配置
// ============================================

export const gradients = {
  primary: `linear-gradient(135deg, ${websiteColors.primary[900]} 0%, ${websiteColors.accent[900]} 100%)`,
  secondary: `linear-gradient(135deg, ${websiteColors.secondary[900]} 0%, ${websiteColors.accent[500]} 100%)`,
  accent: `linear-gradient(135deg, ${websiteColors.accent[900]} 0%, ${websiteColors.primary[900]} 100%)`,
  subtle: `linear-gradient(135deg, ${websiteColors.primary[50]} 0%, ${websiteColors.accent[50]} 100%)`,
  dark: `linear-gradient(135deg, ${websiteColors.primary[900]} 0%, ${websiteColors.primary[800]} 100%)`,
};

// ============================================
// 阴影配置
// ============================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(124, 58, 237, 0.05)',
  md: '0 4px 6px -1px rgba(124, 58, 237, 0.1)',
  lg: '0 10px 15px -3px rgba(124, 58, 237, 0.1)',
  xl: '0 20px 25px -5px rgba(124, 58, 237, 0.1)',
  '2xl': '0 25px 50px -12px rgba(124, 58, 237, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(124, 58, 237, 0.05)',
};

// ============================================
// 组件颜色映射
// ============================================

export const componentColors = {
  // 按钮
  button: {
    primary: {
      bg: websiteColors.primary[500],
      text: websiteColors.text.light,
      hover: websiteColors.primary[600],
      active: websiteColors.primary[700],
    },
    secondary: {
      bg: websiteColors.secondary[500],
      text: websiteColors.text.light,
      hover: websiteColors.secondary[600],
      active: websiteColors.secondary[700],
    },
    accent: {
      bg: websiteColors.accent[500],
      text: websiteColors.text.light,
      hover: websiteColors.accent[600],
      active: websiteColors.accent[700],
    },
    outline: {
      bg: 'transparent',
      text: websiteColors.primary[500],
      border: websiteColors.primary[500],
      hover: websiteColors.primary[50],
    },
  },

  // 卡片
  card: {
    bg: websiteColors.background.light,
    border: websiteColors.border.light,
    hover: {
      bg: websiteColors.primary[50],
      border: websiteColors.primary[200],
    },
  },

  // 导航
  navigation: {
    bg: websiteColors.background.light,
    text: websiteColors.text.primary,
    active: websiteColors.primary[500],
    hover: websiteColors.primary[50],
  },

  // 英雄区域
  hero: {
    bg: gradients.primary,
    text: websiteColors.text.light,
  },

  // 页脚
  footer: {
    bg: websiteColors.primary[900],
    text: websiteColors.text.light,
    link: websiteColors.primary[300],
  },
};

// ============================================
// CSS 变量生成函数
// ============================================

export function generateCSSVariables(): Record<string, string> {
  const variables: Record<string, string> = {};

  // 主色调
  Object.entries(websiteColors.primary).forEach(([key, value]) => {
    variables[`--color-primary-${key}`] = value;
  });

  // 次色调
  Object.entries(websiteColors.secondary).forEach(([key, value]) => {
    variables[`--color-secondary-${key}`] = value;
  });

  // 强调色
  Object.entries(websiteColors.accent).forEach(([key, value]) => {
    variables[`--color-accent-${key}`] = value;
  });

  // 中性色
  Object.entries(websiteColors.neutral).forEach(([key, value]) => {
    variables[`--color-neutral-${key}`] = value;
  });

  // 状态色
  variables['--color-success'] = websiteColors.success;
  variables['--color-warning'] = websiteColors.warning;
  variables['--color-error'] = websiteColors.error;
  variables['--color-info'] = websiteColors.info;

  // 背景色
  variables['--color-bg-light'] = websiteColors.background.light;
  variables['--color-bg-dark'] = websiteColors.background.dark;
  variables['--color-bg-darker'] = websiteColors.background.darker;

  // 文本色
  variables['--color-text-primary'] = websiteColors.text.primary;
  variables['--color-text-secondary'] = websiteColors.text.secondary;
  variables['--color-text-tertiary'] = websiteColors.text.tertiary;
  variables['--color-text-light'] = websiteColors.text.light;

  // 边框色
  variables['--color-border-light'] = websiteColors.border.light;
  variables['--color-border-medium'] = websiteColors.border.medium;
  variables['--color-border-dark'] = websiteColors.border.dark;

  // 渐变色
  variables['--gradient-primary'] = gradients.primary;
  variables['--gradient-secondary'] = gradients.secondary;
  variables['--gradient-accent'] = gradients.accent;
  variables['--gradient-subtle'] = gradients.subtle;
  variables['--gradient-dark'] = gradients.dark;

  // 阴影
  variables['--shadow-sm'] = shadows.sm;
  variables['--shadow-md'] = shadows.md;
  variables['--shadow-lg'] = shadows.lg;
  variables['--shadow-xl'] = shadows.xl;
  variables['--shadow-2xl'] = shadows['2xl'];
  variables['--shadow-inner'] = shadows.inner;

  return variables;
}

// ============================================
// 应用颜色到 DOM
// ============================================

export function applyWebsiteColors() {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const variables = generateCSSVariables();

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// ============================================
// 导出默认配置
// ============================================

export default {
  colors: websiteColors,
  gradients,
  shadows,
  componentColors,
  generateCSSVariables,
  applyWebsiteColors,
};

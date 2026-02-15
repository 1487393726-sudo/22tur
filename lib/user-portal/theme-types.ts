/**
 * Theme Types for User Portal System
 * Defines theme modes, colors, and utilities
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  colors: {
    light: ColorScheme;
    dark: ColorScheme;
  };
}

export interface ColorScheme {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: {
    light: string;
    default: string;
    dark: string;
  };
}

export const LIGHT_COLORS: ColorScheme = {
  primary: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },
  secondary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBEF63',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
  },
  text: {
    primary: '#0F766E',
    secondary: '#0D9488',
    tertiary: '#5EEAD4',
    inverse: '#FFFFFF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F0FDFA',
    tertiary: '#CCFBF1',
  },
  border: {
    light: '#CCFBF1',
    default: '#99F6E4',
    dark: '#5EEAD4',
  },
};

export const DARK_COLORS: ColorScheme = {
  primary: {
    50: '#134E4A',
    100: '#115E59',
    200: '#0F766E',
    300: '#0D9488',
    400: '#14B8A6',
    500: '#2DD4BF',
    600: '#5EEAD4',
    700: '#99F6E4',
    800: '#CCFBF1',
    900: '#F0FDFA',
  },
  secondary: {
    50: '#15803D',
    100: '#16A34A',
    200: '#22C55E',
    300: '#4ADE80',
    400: '#86EFAC',
    500: '#BBEF63',
    600: '#DCFCE7',
    700: '#F0FDF4',
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
  },
  text: {
    primary: '#F0FDFA',
    secondary: '#5EEAD4',
    tertiary: '#2DD4BF',
    inverse: '#0F766E',
  },
  background: {
    primary: '#134E4A',
    secondary: '#115E59',
    tertiary: '#0F766E',
  },
  border: {
    light: '#0F766E',
    default: '#0D9488',
    dark: '#14B8A6',
  },
};

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: 'system',
  colors: {
    light: LIGHT_COLORS,
    dark: DARK_COLORS,
  },
};

/**
 * Get the effective theme mode (resolves 'system' to actual mode)
 */
export function getEffectiveThemeMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

/**
 * Get color scheme for a theme mode
 */
export function getColorScheme(mode: ThemeMode): ColorScheme {
  const effectiveMode = getEffectiveThemeMode(mode);
  return effectiveMode === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

/**
 * Apply theme to document
 */
export function applyTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;

  const effectiveMode = getEffectiveThemeMode(mode);
  const htmlElement = document.documentElement;

  // Remove existing theme attributes
  htmlElement.removeAttribute('data-theme');
  htmlElement.classList.remove('dark', 'light');

  // Apply new theme
  htmlElement.setAttribute('data-theme', effectiveMode);
  htmlElement.classList.add(effectiveMode);

  // Update CSS variables
  const colorScheme = getColorScheme(mode);
  const root = document.documentElement.style;

  // Primary colors
  Object.entries(colorScheme.primary).forEach(([key, value]) => {
    root.setProperty(`--color-primary-${key}`, value);
  });

  // Secondary colors
  Object.entries(colorScheme.secondary).forEach(([key, value]) => {
    root.setProperty(`--color-secondary-${key}`, value);
  });

  // Semantic colors
  Object.entries(colorScheme.semantic).forEach(([key, value]) => {
    root.setProperty(`--color-${key}`, value);
  });

  // Text colors
  Object.entries(colorScheme.text).forEach(([key, value]) => {
    root.setProperty(`--color-text-${key}`, value);
  });

  // Background colors
  Object.entries(colorScheme.background).forEach(([key, value]) => {
    root.setProperty(`--color-bg-${key}`, value);
  });

  // Border colors
  Object.entries(colorScheme.border).forEach(([key, value]) => {
    root.setProperty(`--color-border-${key}`, value);
  });
}

/**
 * Get stored theme preference from localStorage
 */
export function getStoredTheme(): ThemeMode | null {
  if (typeof localStorage === 'undefined') return null;
  const stored = localStorage.getItem('user-portal-theme');
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return null;
}

/**
 * Save theme preference to localStorage
 */
export function saveTheme(mode: ThemeMode): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('user-portal-theme', mode);
}

/**
 * Listen for system theme changes
 */
export function listenToSystemThemeChanges(callback: (mode: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };

  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}

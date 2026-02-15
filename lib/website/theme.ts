/**
 * Theme System Utilities
 * Utilities for managing theme switching and persistence
 */

import { getContrastRatio, meetsWCAGAA } from './utils';

export type Theme = 'light' | 'dark';

/**
 * Theme colors configuration
 */
export const themeColors = {
  light: {
    primary: '#1E3A5F',
    secondary: '#2D5A8C',
    accent: '#FF6B35',
    background: '#FFFFFF',
    text: '#1F2937',
    border: '#E5E7EB',
  },
  dark: {
    primary: '#87CEEB',
    secondary: '#B0E0E6',
    accent: '#FF8C42',
    background: '#1F2937',
    text: '#F3F4F6',
    border: '#374151',
  },
};

/**
 * Get current theme from localStorage
 */
export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('theme');
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Save theme to localStorage
 */
export function saveTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // localStorage not available
  }
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return mediaQuery.matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Get effective theme (stored > system > default)
 */
export function getEffectiveTheme(): Theme {
  const stored = getStoredTheme();
  if (stored) return stored;
  
  return getSystemTheme();
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
  
  // Apply CSS variables
  const colors = themeColors[theme];
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
}

/**
 * Toggle theme
 */
export function toggleTheme(): Theme {
  const current = getEffectiveTheme();
  const next = current === 'light' ? 'dark' : 'light';
  
  saveTheme(next);
  applyTheme(next);
  
  return next;
}

/**
 * Set theme explicitly
 */
export function setTheme(theme: Theme): void {
  saveTheme(theme);
  applyTheme(theme);
}

/**
 * Check if dark mode is enabled
 */
export function isDarkMode(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

/**
 * Get contrast ratio for theme colors
 */
export function getThemeContrast(theme: Theme, foreground: keyof typeof themeColors.light, background: keyof typeof themeColors.light): number {
  const colors = themeColors[theme];
  return getContrastRatio(colors[foreground], colors[background]);
}

/**
 * Validate theme contrast compliance
 */
export function validateThemeContrast(theme: Theme): boolean {
  const colors = themeColors[theme];
  
  // Check text on background
  const textBgContrast = getContrastRatio(colors.text, colors.background);
  
  // Check primary on background
  const primaryBgContrast = getContrastRatio(colors.primary, colors.background);
  
  // Check secondary on background
  const secondaryBgContrast = getContrastRatio(colors.secondary, colors.background);
  
  return (
    meetsWCAGAA(textBgContrast) &&
    meetsWCAGAA(primaryBgContrast) &&
    meetsWCAGAA(secondaryBgContrast)
  );
}

/**
 * Initialize theme on page load
 */
export function initializeTheme(): void {
  if (typeof window === 'undefined') return;
  
  const theme = getEffectiveTheme();
  applyTheme(theme);
}

/**
 * Listen for system theme changes
 */
export function listenToSystemThemeChanges(callback: (theme: Theme) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const theme = e.matches ? 'dark' : 'light';
      
      // Only apply if no stored preference
      if (!getStoredTheme()) {
        applyTheme(theme);
        callback(theme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  } catch {
    return () => {};
  }
}

/**
 * Get theme colors
 */
export function getThemeColors(theme: Theme) {
  return themeColors[theme];
}

/**
 * Persist theme preference round trip
 * Validates that theme persists across page reloads
 */
export function validateThemePersistence(theme: Theme): boolean {
  saveTheme(theme);
  const retrieved = getStoredTheme();
  return retrieved === theme;
}

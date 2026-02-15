/**
 * useTheme Hook
 * Hook for managing theme state and switching
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getEffectiveTheme,
  setTheme,
  toggleTheme,
  isDarkMode,
  listenToSystemThemeChanges,
  type Theme,
} from '../theme';

interface UseThemeReturn {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

/**
 * useTheme hook
 * Provides theme state and theme switching functionality
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const effectiveTheme = getEffectiveTheme();
    setThemeState(effectiveTheme);
    setMounted(true);

    // Listen for system theme changes
    const unsubscribe = listenToSystemThemeChanges((newTheme) => {
      setThemeState(newTheme);
    });

    return unsubscribe;
  }, []);

  const handleToggleTheme = useCallback(() => {
    const newTheme = toggleTheme();
    setThemeState(newTheme);
  }, []);

  const handleSetTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    setThemeState(newTheme);
  }, []);

  // Return default light theme until mounted to avoid hydration mismatch
  if (!mounted) {
    return {
      theme: 'light',
      isDark: false,
      toggleTheme: handleToggleTheme,
      setTheme: handleSetTheme,
    };
  }

  return {
    theme,
    isDark: isDarkMode(),
    toggleTheme: handleToggleTheme,
    setTheme: handleSetTheme,
  };
}

/**
 * useDarkMode hook
 * Simplified hook for checking if dark mode is enabled
 */
export function useDarkMode(): boolean {
  const { isDark } = useTheme();
  return isDark;
}

/**
 * useThemeColors hook
 * Hook for getting current theme colors
 */
export function useThemeColors() {
  const { theme } = useTheme();
  
  const colors = theme === 'dark'
    ? {
        primary: '#87CEEB',
        secondary: '#B0E0E6',
        accent: '#FF8C42',
        background: '#1F2937',
        text: '#F3F4F6',
        border: '#374151',
      }
    : {
        primary: '#1E3A5F',
        secondary: '#2D5A8C',
        accent: '#FF6B35',
        background: '#FFFFFF',
        text: '#1F2937',
        border: '#E5E7EB',
      };

  return colors;
}

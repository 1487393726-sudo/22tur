'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'website' | 'enterprise-admin' | 'user-portal';
type Mode = 'light' | 'dark' | 'system';
type GradientTheme = 'blue-purple' | 'purple-pink';

interface ThemeContextType {
  theme: Theme;
  mode: Mode;
  gradientTheme: GradientTheme;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
  setGradientTheme: (gradientTheme: GradientTheme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'design-system-theme';
const MODE_STORAGE_KEY = 'design-system-mode';
const GRADIENT_THEME_STORAGE_KEY = 'gradient-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('website');
  const [mode, setModeState] = useState<Mode>('system');
  const [gradientTheme, setGradientThemeState] = useState<GradientTheme>('blue-purple');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY) as Mode | null;
    const savedGradientTheme = localStorage.getItem(GRADIENT_THEME_STORAGE_KEY) as GradientTheme | null;

    if (savedTheme) {
      setThemeState(savedTheme);
    }

    if (savedMode) {
      setModeState(savedMode);
    }

    if (savedGradientTheme) {
      setGradientThemeState(savedGradientTheme);
    }

    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const effectiveMode = savedMode || 'system';
    const shouldBeDark =
      effectiveMode === 'dark' || (effectiveMode === 'system' && prefersDark);

    setIsDark(shouldBeDark);
    applyTheme(savedTheme || 'website', shouldBeDark, savedGradientTheme || 'blue-purple');
    setMounted(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (mode === 'system') {
        setIsDark(e.matches);
        applyTheme(theme, e.matches, gradientTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, theme, gradientTheme]);

  const applyTheme = (newTheme: Theme, dark: boolean, newGradientTheme: GradientTheme) => {
    const html = document.documentElement;
    html.setAttribute('data-theme', newTheme);
    html.setAttribute('data-mode', dark ? 'dark' : 'light');
    html.setAttribute('data-gradient-theme', newGradientTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyTheme(newTheme, isDark, gradientTheme);
  };

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem(MODE_STORAGE_KEY, newMode);

    if (newMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      applyTheme(theme, prefersDark, gradientTheme);
    } else {
      const dark = newMode === 'dark';
      setIsDark(dark);
      applyTheme(theme, dark, gradientTheme);
    }
  };

  const setGradientTheme = (newGradientTheme: GradientTheme) => {
    setGradientThemeState(newGradientTheme);
    localStorage.setItem(GRADIENT_THEME_STORAGE_KEY, newGradientTheme);
    applyTheme(theme, isDark, newGradientTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, gradientTheme, setTheme, setMode, setGradientTheme, isDark }}>
      {mounted ? children : null}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

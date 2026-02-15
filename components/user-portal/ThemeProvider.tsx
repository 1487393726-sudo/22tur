'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ThemeMode,
  applyTheme,
  getStoredTheme,
  saveTheme,
  listenToSystemThemeChanges,
  getEffectiveThemeMode,
} from '@/lib/user-portal/theme-types';

interface ThemeContextType {
  mode: ThemeMode;
  effectiveMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'system',
}) => {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [effectiveMode, setEffectiveMode] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const storedMode = getStoredTheme();
    const initialMode = storedMode || defaultMode;
    setModeState(initialMode);
    applyTheme(initialMode);
    setEffectiveMode(getEffectiveThemeMode(initialMode));
    setMounted(true);
  }, [defaultMode]);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (mode !== 'system' || !mounted) return;

    const unsubscribe = listenToSystemThemeChanges((newMode) => {
      setEffectiveMode(newMode);
      applyTheme('system');
    });

    return unsubscribe;
  }, [mode, mounted]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    saveTheme(newMode);
    applyTheme(newMode);
    setEffectiveMode(getEffectiveThemeMode(newMode));
  };

  return (
    <ThemeContext.Provider value={{ mode, effectiveMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

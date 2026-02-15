/**
 * ThemeProvider Component
 * Provides theme context and initialization
 */

'use client';

import React, { useEffect } from 'react';
import { initializeTheme } from '@/lib/website/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider component
 * Initializes theme on mount and provides theme context
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize theme on mount
    initializeTheme();
  }, []);

  return <>{children}</>;
};

export default ThemeProvider;

/**
 * ThemeSwitcher Component
 * Button component for switching between light and dark themes
 */

'use client';

import React from 'react';
import { useTheme } from '@/lib/website/hooks/useTheme';

interface ThemeSwitcherProps {
  className?: string;
}

/**
 * ThemeSwitcher component
 * Provides a button to toggle between light and dark themes
 */
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      data-testid="theme-switcher"
    >
      {theme === 'light' ? (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          data-testid="moon-icon"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          data-testid="sun-icon"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l1.414 1.414a1 1 0 001.414-1.414l-1.414-1.414a1 1 0 00-1.414 1.414zm2.828-2.828l1.414-1.414a1 1 0 00-1.414-1.414l-1.414 1.414a1 1 0 001.414 1.414zM13 11a1 1 0 110 2h-2a1 1 0 110-2h2zm-6 0a1 1 0 110 2H5a1 1 0 110-2h2z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeSwitcher;

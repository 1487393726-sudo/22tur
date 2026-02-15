'use client';

import React, { useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { ThemeMode } from '@/lib/user-portal/theme-types';

interface ThemeSwitcherProps {
  /**
   * Display style: 'button' for icon button, 'dropdown' for dropdown menu
   */
  variant?: 'button' | 'dropdown';
  /**
   * Size of the switcher
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Show label text
   */
  showLabel?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'dropdown',
  size = 'md',
  showLabel = false,
}) => {
  const { mode, setMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes: Array<{ mode: ThemeMode; label: string; icon: React.ReactNode }> = [
    { mode: 'light', label: '浅色', icon: <Sun className="w-4 h-4" /> },
    { mode: 'dark', label: '深色', icon: <Moon className="w-4 h-4" /> },
    { mode: 'system', label: '跟随系统', icon: <Monitor className="w-4 h-4" /> },
  ];

  const currentTheme = themes.find((t) => t.mode === mode);

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base',
  };

  if (variant === 'button') {
    return (
      <button
        onClick={() => {
          const currentIndex = themes.findIndex((t) => t.mode === mode);
          const nextIndex = (currentIndex + 1) % themes.length;
          setMode(themes[nextIndex].mode);
        }}
        className={`${sizeClasses[size]} rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex items-center gap-2`}
        title={`切换主题: ${currentTheme?.label}`}
        aria-label={`切换主题: ${currentTheme?.label}`}
      >
        {currentTheme?.icon}
        {showLabel && <span>{currentTheme?.label}</span>}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${sizeClasses[size]} rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex items-center gap-2`}
        aria-label="打开主题菜单"
        aria-expanded={isOpen}
      >
        {currentTheme?.icon}
        {showLabel && <span>{currentTheme?.label}</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[var(--color-bg-primary)] rounded-lg shadow-lg border border-[var(--color-border-light)] py-2 z-50">
          {themes.map((theme) => (
            <button
              key={theme.mode}
              onClick={() => {
                setMode(theme.mode);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
                mode === theme.mode
                  ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-500)]'
                  : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
              }`}
              aria-label={`切换到${theme.label}主题`}
            >
              {theme.icon}
              <span>{theme.label}</span>
              {mode === theme.mode && (
                <span className="ml-auto text-[var(--color-primary-500)]">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

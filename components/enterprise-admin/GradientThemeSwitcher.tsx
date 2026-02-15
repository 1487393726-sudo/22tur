'use client';

import React from 'react';
import { useGradientTheme } from '@/lib/theme/use-gradient-theme';
import './GradientThemeSwitcher.css';

type GradientTheme = 'blue-purple' | 'purple-pink';

interface ThemeOption {
  id: GradientTheme;
  label: string;
  description: string;
  startColor: string;
  endColor: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'blue-purple',
    label: 'Blue-Purple',
    description: 'Professional and modern',
    startColor: '#2563eb',
    endColor: '#9333ea',
  },
  {
    id: 'purple-pink',
    label: 'Purple-Pink',
    description: 'Vibrant and creative',
    startColor: '#9333ea',
    endColor: '#db2777',
  },
];

/**
 * GradientThemeSwitcher Component
 *
 * Displays available gradient theme options and allows users to switch between them.
 * Shows visual preview of each theme and indicates the currently selected theme.
 *
 * Features:
 * - Displays all available gradient themes
 * - Shows visual gradient preview for each theme
 * - Indicates currently selected theme
 * - Allows clicking to switch themes
 * - Provides visual feedback for selected theme
 * - Accessible with proper ARIA labels and keyboard support
 *
 * @example
 * ```tsx
 * import { GradientThemeSwitcher } from '@/components/enterprise-admin/GradientThemeSwitcher';
 *
 * export default function AdminLayout() {
 *   return (
 *     <div>
 *       <GradientThemeSwitcher />
 *     </div>
 *   );
 * }
 * ```
 */
export function GradientThemeSwitcher() {
  const { gradientTheme, setGradientTheme } = useGradientTheme();

  const handleThemeChange = (themeId: GradientTheme) => {
    setGradientTheme(themeId);
  };

  return (
    <div className="gradient-theme-switcher" role="group" aria-label="Gradient theme selector">
      <div className="gradient-theme-switcher__header">
        <h3 className="gradient-theme-switcher__title">Theme</h3>
        <p className="gradient-theme-switcher__subtitle">Choose a gradient theme</p>
      </div>

      <div className="gradient-theme-switcher__options">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.id}
            className={`gradient-theme-switcher__option ${
              gradientTheme === option.id ? 'gradient-theme-switcher__option--active' : ''
            }`}
            onClick={() => handleThemeChange(option.id)}
            aria-pressed={gradientTheme === option.id}
            aria-label={`Select ${option.label} theme: ${option.description}`}
            title={option.description}
          >
            {/* Gradient preview */}
            <div
              className="gradient-theme-switcher__preview"
              style={{
                background: `linear-gradient(135deg, ${option.startColor}, ${option.endColor})`,
              }}
              aria-hidden="true"
            />

            {/* Theme info */}
            <div className="gradient-theme-switcher__info">
              <span className="gradient-theme-switcher__label">{option.label}</span>
              <span className="gradient-theme-switcher__description">{option.description}</span>
            </div>

            {/* Selection indicator */}
            {gradientTheme === option.id && (
              <div className="gradient-theme-switcher__checkmark" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default GradientThemeSwitcher;

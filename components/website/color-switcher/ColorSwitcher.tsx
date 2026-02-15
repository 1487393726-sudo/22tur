/**
 * Color Switcher Component
 * Allows users to switch between different color themes
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ColorStyle } from 'lib/website/color-switcher/types';
import { ALL_STYLES, getStyleById } from 'lib/website/color-switcher/palettes';
import { savePreference, loadPreference } from 'lib/website/color-switcher/persistence';
import { applyStyle, isTransitioning } from 'lib/website/color-switcher/style-applier';
import { detectSystemPreference, mapSystemPreferenceToStyleId } from 'lib/website/color-switcher/system-preference';
import styles from './ColorSwitcher.module.css';

interface ColorSwitcherProps {
  /**
   * Callback when style is changed
   */
  onStyleChange?: (styleId: string) => void;

  /**
   * Custom class name
   */
  className?: string;

  /**
   * Show labels for each style
   */
  showLabels?: boolean;

  /**
   * Orientation: horizontal or vertical
   */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Color Switcher Component
 */
export const ColorSwitcher: React.FC<ColorSwitcherProps> = ({
  onStyleChange,
  className,
  showLabels = true,
  orientation = 'horizontal',
}) => {
  const [currentStyleId, setCurrentStyleId] = useState<string>('light');
  const [availableStyles, setAvailableStyles] = useState<ColorStyle[]>(ALL_STYLES);
  const [isLoading, setIsLoading] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const switchInProgressRef = useRef(false);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = () => {
      // Try to load saved preference
      const savedPreference = loadPreference();
      if (savedPreference) {
        const style = getStyleById(savedPreference);
        if (style) {
          setCurrentStyleId(savedPreference);
          applyStyle(style);
          setIsLoading(false);
          return;
        }
      }

      // Fall back to system preference
      const systemPref = detectSystemPreference();
      const systemStyleId = mapSystemPreferenceToStyleId(systemPref);
      const style = getStyleById(systemStyleId);
      if (style) {
        setCurrentStyleId(systemStyleId);
        applyStyle(style);
      }

      setIsLoading(false);
    };

    initializeTheme();
  }, []);

  // Handle style switch
  const handleStyleSwitch = useCallback(
    async (styleId: string) => {
      // Prevent concurrent switches
      if (switchInProgressRef.current || isTransitioning()) {
        return;
      }

      switchInProgressRef.current = true;

      try {
        const style = getStyleById(styleId);
        if (!style) {
          return;
        }

        // Apply style
        applyStyle(style);
        setCurrentStyleId(styleId);

        // Save preference
        savePreference(styleId);

        // Call callback
        onStyleChange?.(styleId);

        // Wait for transition to complete
        await new Promise((resolve) => setTimeout(resolve, 350));
      } finally {
        switchInProgressRef.current = false;
      }
    },
    [onStyleChange]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const { key } = e;

      if (key === 'ArrowRight' || key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (focusedIndex + 1) % availableStyles.length;
        setFocusedIndex(nextIndex);
        const buttons = containerRef.current?.querySelectorAll('button');
        buttons?.[nextIndex]?.focus();
      } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
        e.preventDefault();
        const nextIndex = (focusedIndex - 1 + availableStyles.length) % availableStyles.length;
        setFocusedIndex(nextIndex);
        const buttons = containerRef.current?.querySelectorAll('button');
        buttons?.[nextIndex]?.focus();
      } else if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        const style = availableStyles[focusedIndex];
        handleStyleSwitch(style.id);
      }
    },
    [focusedIndex, availableStyles, handleStyleSwitch]
  );

  // Handle button focus
  const handleButtonFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.colorSwitcher} ${styles[orientation]} ${className || ''}`}
      role="group"
      aria-label="Color theme switcher"
      onKeyDown={handleKeyDown}
    >
      {availableStyles.map((style, index) => (
        <button
          key={style.id}
          className={`${styles.styleButton} ${currentStyleId === style.id ? styles.active : ''}`}
          onClick={() => handleStyleSwitch(style.id)}
          onFocus={() => handleButtonFocus(index)}
          aria-pressed={currentStyleId === style.id}
          aria-label={`Switch to ${style.label}`}
          title={style.label}
          type="button"
        >
          <span className={styles.colorPreview} style={{ backgroundColor: style.colors.primary }} />
          {showLabels && <span className={styles.label}>{style.label}</span>}
        </button>
      ))}
    </div>
  );
};

export default ColorSwitcher;

/**
 * Style application layer for applying color styles to the DOM
 */

import { ColorStyle, StyleApplier } from './types';

/**
 * CSS custom property prefix
 */
const CSS_VAR_PREFIX = '--color-';

/**
 * Default transition duration in milliseconds
 */
const DEFAULT_TRANSITION_DURATION = 300;

/**
 * Implementation of StyleApplier
 */
class StyleApplierImpl implements StyleApplier {
  private transitionDuration: number = DEFAULT_TRANSITION_DURATION;
  private isTransitioning: boolean = false;

  /**
   * Apply a color style to the document
   */
  applyStyle(style: ColorStyle): void {
    const root = document.documentElement;

    // Set transition duration
    root.style.setProperty('--transition-duration', `${this.transitionDuration}ms`);

    // Apply all color values as CSS custom properties
    Object.entries(style.colors).forEach(([key, value]) => {
      const cssVarName = `${CSS_VAR_PREFIX}${key}`;
      root.style.setProperty(cssVarName, value);
    });

    // Mark as transitioning
    this.isTransitioning = true;

    // Clear transitioning flag after transition completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.transitionDuration);
  }

  /**
   * Get computed color value
   */
  getComputedColor(colorKey: string): string {
    const cssVarName = `${CSS_VAR_PREFIX}${colorKey}`;
    const value = getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
    return value || '#000000';
  }

  /**
   * Set transition duration
   */
  setTransitionDuration(ms: number): void {
    this.transitionDuration = Math.max(0, Math.min(ms, 1000)); // Clamp between 0-1000ms
  }

  /**
   * Reset to default style
   */
  resetToDefault(): void {
    const root = document.documentElement;
    root.style.removeProperty('--transition-duration');

    // Remove all color custom properties
    const styles = root.style;
    for (let i = styles.length - 1; i >= 0; i--) {
      const propName = styles[i];
      if (propName.startsWith(CSS_VAR_PREFIX)) {
        root.style.removeProperty(propName);
      }
    }

    this.isTransitioning = false;
  }

  /**
   * Check if currently transitioning
   */
  isCurrentlyTransitioning(): boolean {
    return this.isTransitioning;
  }
}

/**
 * Singleton instance
 */
let applierInstance: StyleApplierImpl | null = null;

/**
 * Get the style applier instance
 */
export function getStyleApplier(): StyleApplier {
  if (!applierInstance) {
    applierInstance = new StyleApplierImpl();
  }
  return applierInstance;
}

/**
 * Apply a style to the document
 */
export function applyStyle(style: ColorStyle): void {
  getStyleApplier().applyStyle(style);
}

/**
 * Get computed color value
 */
export function getComputedColor(colorKey: string): string {
  return getStyleApplier().getComputedColor(colorKey);
}

/**
 * Set transition duration
 */
export function setTransitionDuration(ms: number): void {
  getStyleApplier().setTransitionDuration(ms);
}

/**
 * Reset to default
 */
export function resetToDefault(): void {
  getStyleApplier().resetToDefault();
}

/**
 * Check if currently transitioning
 */
export function isTransitioning(): boolean {
  return (applierInstance as any)?.isCurrentlyTransitioning?.() ?? false;
}

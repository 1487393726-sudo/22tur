/**
 * Color contrast analysis for accessibility compliance
 */

import { ColorStyle, ContrastInfo } from './types';

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula
 */
function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;

  // Convert to 0-1 range
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.0 formula
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine WCAG compliance level
 */
function getWcagLevel(ratio: number): 'AA' | 'AAA' | 'FAIL' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'FAIL';
}

/**
 * Check contrast ratio compliance
 */
export function checkContrastCompliance(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): ContrastInfo {
  const ratio = calculateContrastRatio(foreground, background);
  const minRatio = isLargeText ? 3 : 4.5;
  const isCompliant = ratio >= minRatio;
  const wcagLevel = getWcagLevel(ratio);

  return {
    ratio: Math.round(ratio * 100) / 100,
    isCompliant,
    wcagLevel,
  };
}

/**
 * Analyze all color pairs in a style for accessibility
 */
export function analyzeStyleContrast(style: ColorStyle): {
  pairs: Array<{
    foreground: string;
    background: string;
    ratio: number;
    compliant: boolean;
  }>;
  allCompliant: boolean;
} {
  const pairs: Array<{
    foreground: string;
    background: string;
    ratio: number;
    compliant: boolean;
  }> = [];

  // Check main text colors against backgrounds
  const textColors = [style.colors.text, style.colors.onBackground, style.colors.onSurface];
  const backgroundColors = [style.colors.background, style.colors.surface, style.colors.surfaceVariant];

  textColors.forEach((textColor) => {
    backgroundColors.forEach((bgColor) => {
      const contrast = checkContrastCompliance(textColor, bgColor);
      pairs.push({
        foreground: textColor,
        background: bgColor,
        ratio: contrast.ratio,
        compliant: contrast.isCompliant,
      });
    });
  });

  // Check primary color against backgrounds
  const primaryColors = [style.colors.primary, style.colors.secondary];
  primaryColors.forEach((primaryColor) => {
    backgroundColors.forEach((bgColor) => {
      const contrast = checkContrastCompliance(primaryColor, bgColor);
      pairs.push({
        foreground: primaryColor,
        background: bgColor,
        ratio: contrast.ratio,
        compliant: contrast.isCompliant,
      });
    });
  });

  const allCompliant = pairs.every((pair) => pair.compliant);

  return { pairs, allCompliant };
}

/**
 * Verify all styles meet accessibility requirements
 */
export function verifyAllStylesCompliance(styles: ColorStyle[]): {
  compliant: boolean;
  results: Array<{
    styleId: string;
    compliant: boolean;
    failedPairs: number;
  }>;
} {
  const results = styles.map((style) => {
    const analysis = analyzeStyleContrast(style);
    const failedPairs = analysis.pairs.filter((p) => !p.compliant).length;
    return {
      styleId: style.id,
      compliant: analysis.allCompliant,
      failedPairs,
    };
  });

  const compliant = results.every((r) => r.compliant);

  return { compliant, results };
}

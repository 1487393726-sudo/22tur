/**
 * Gradient Theme Configuration Types and Definitions
 * 
 * This module defines the types and interfaces for managing gradient themes
 * in the enterprise admin system. It supports multiple gradient themes with
 * separate configurations for light and dark modes.
 */

/**
 * Represents a single gradient color with hex and RGB values
 */
export interface GradientColor {
  /** Hex color value (e.g., "#2563eb") */
  start: string;
  /** Hex color value (e.g., "#9333ea") */
  end: string;
  /** RGB values for start color (e.g., "37, 99, 235") */
  startRgb: string;
  /** RGB values for end color (e.g., "147, 51, 234") */
  endRgb: string;
}

/**
 * Represents a complete gradient theme configuration for both light and dark modes
 */
export interface GradientThemeConfig {
  /** Light mode gradient colors */
  light: GradientColor;
  /** Dark mode gradient colors */
  dark: GradientColor;
}

/**
 * Represents the complete theme configuration with all available gradient themes
 */
export interface ThemeConfig {
  /** Map of gradient theme names to their configurations */
  gradientThemes: {
    [key: string]: GradientThemeConfig;
  };
}

/**
 * Type for gradient theme names
 */
export type GradientThemeName = 'blue-purple' | 'purple-pink';

/**
 * Default gradient theme configuration
 * 
 * This is the default configuration that will be used if the config file
 * fails to load or is not available.
 */
export const DEFAULT_GRADIENT_THEME_CONFIG: ThemeConfig = {
  gradientThemes: {
    'blue-purple': {
      light: {
        start: '#2563eb',
        end: '#9333ea',
        startRgb: '37, 99, 235',
        endRgb: '147, 51, 234',
      },
      dark: {
        start: '#60a5fa',
        end: '#c084fc',
        startRgb: '96, 165, 250',
        endRgb: '192, 132, 252',
      },
    },
    'purple-pink': {
      light: {
        start: '#9333ea',
        end: '#db2777',
        startRgb: '147, 51, 234',
        endRgb: '219, 39, 119',
      },
      dark: {
        start: '#c084fc',
        end: '#ec4899',
        startRgb: '192, 132, 252',
        endRgb: '236, 72, 153',
      },
    },
  },
};

/**
 * Default gradient theme name
 */
export const DEFAULT_GRADIENT_THEME: GradientThemeName = 'blue-purple';

/**
 * Validates if a gradient theme name is valid
 * @param themeName - The theme name to validate
 * @returns true if the theme name is valid, false otherwise
 */
export function isValidGradientThemeName(themeName: string): themeName is GradientThemeName {
  return themeName === 'blue-purple' || themeName === 'purple-pink';
}

/**
 * Gets a gradient theme configuration by name
 * @param themeName - The name of the gradient theme
 * @param config - The theme configuration object
 * @returns The gradient theme configuration, or undefined if not found
 */
export function getGradientThemeConfig(
  themeName: GradientThemeName,
  config: ThemeConfig = DEFAULT_GRADIENT_THEME_CONFIG
): GradientThemeConfig | undefined {
  return config.gradientThemes[themeName];
}

/**
 * Gets all available gradient theme names
 * @param config - The theme configuration object
 * @returns Array of available gradient theme names
 */
export function getAvailableGradientThemes(
  config: ThemeConfig = DEFAULT_GRADIENT_THEME_CONFIG
): string[] {
  return Object.keys(config.gradientThemes);
}

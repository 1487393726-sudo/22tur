/**
 * Gradient Theme Configuration Loader
 * 
 * This module provides functions to load and validate gradient theme configurations
 * from JSON files. It includes error handling and fallback mechanisms to ensure
 * the system always has a valid theme configuration.
 */

import {
  ThemeConfig,
  GradientThemeName,
  DEFAULT_GRADIENT_THEME_CONFIG,
  isValidGradientThemeName,
} from './gradient-config';

/**
 * Result type for configuration loading operations
 */
export interface LoadConfigResult {
  success: boolean;
  config: ThemeConfig;
  error?: string;
  source: 'file' | 'fallback';
}

/**
 * Validates the structure of a theme configuration object
 * @param config - The configuration object to validate
 * @returns true if the configuration is valid, false otherwise
 */
export function validateThemeConfig(config: unknown): config is ThemeConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const obj = config as Record<string, unknown>;

  // Check if gradientThemes exists and is an object
  if (!obj.gradientThemes || typeof obj.gradientThemes !== 'object') {
    return false;
  }

  const gradientThemes = obj.gradientThemes as Record<string, unknown>;

  // Validate each gradient theme
  for (const [themeName, themeConfig] of Object.entries(gradientThemes)) {
    if (!validateGradientThemeConfig(themeConfig)) {
      console.warn(`Invalid gradient theme configuration for theme: ${themeName}`);
      return false;
    }
  }

  return true;
}

/**
 * Validates a single gradient theme configuration
 * @param config - The gradient theme configuration to validate
 * @returns true if the configuration is valid, false otherwise
 */
export function validateGradientThemeConfig(config: unknown): boolean {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const obj = config as Record<string, unknown>;

  // Check if light and dark modes exist
  if (!obj.light || typeof obj.light !== 'object') {
    return false;
  }

  if (!obj.dark || typeof obj.dark !== 'object') {
    return false;
  }

  // Validate light mode
  if (!validateGradientColor(obj.light)) {
    return false;
  }

  // Validate dark mode
  if (!validateGradientColor(obj.dark)) {
    return false;
  }

  return true;
}

/**
 * Validates a gradient color object
 * @param color - The gradient color to validate
 * @returns true if the color is valid, false otherwise
 */
export function validateGradientColor(color: unknown): boolean {
  if (!color || typeof color !== 'object') {
    return false;
  }

  const obj = color as Record<string, unknown>;

  // Check required fields
  if (typeof obj.start !== 'string' || !isValidHexColor(obj.start)) {
    return false;
  }

  if (typeof obj.end !== 'string' || !isValidHexColor(obj.end)) {
    return false;
  }

  if (typeof obj.startRgb !== 'string' || !isValidRgbString(obj.startRgb)) {
    return false;
  }

  if (typeof obj.endRgb !== 'string' || !isValidRgbString(obj.endRgb)) {
    return false;
  }

  return true;
}

/**
 * Validates if a string is a valid hex color
 * @param color - The color string to validate
 * @returns true if the color is a valid hex color, false otherwise
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Validates if a string is a valid RGB string (e.g., "255, 0, 0")
 * @param rgb - The RGB string to validate
 * @returns true if the RGB string is valid, false otherwise
 */
export function isValidRgbString(rgb: string): boolean {
  const parts = rgb.split(',').map((p) => p.trim());
  if (parts.length !== 3) {
    return false;
  }

  return parts.every((part) => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255;
  });
}

/**
 * Loads the theme configuration from a JSON file
 * 
 * This function attempts to load the theme configuration from the specified URL.
 * If loading fails or the configuration is invalid, it returns the default configuration
 * and logs an error message.
 * 
 * @param configUrl - The URL to load the configuration from (default: '/theme-config.json')
 * @returns A promise that resolves to the loaded configuration or the default configuration
 */
export async function loadThemeConfig(
  configUrl: string = '/theme-config.json'
): Promise<LoadConfigResult> {
  try {
    // Attempt to fetch the configuration file
    const response = await fetch(configUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch theme config: ${response.status} ${response.statusText}`);
    }

    // Parse the JSON
    const config = await response.json();

    // Validate the configuration
    if (!validateThemeConfig(config)) {
      throw new Error('Invalid theme configuration structure');
    }

    return {
      success: true,
      config,
      source: 'file',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error loading theme configuration from ${configUrl}:`, errorMessage);

    // Return the default configuration as fallback
    return {
      success: false,
      config: DEFAULT_GRADIENT_THEME_CONFIG,
      error: errorMessage,
      source: 'fallback',
    };
  }
}

/**
 * Loads the theme configuration synchronously from a JSON file
 * 
 * This function is useful for server-side rendering where async operations
 * might not be available. It uses the default configuration as fallback.
 * 
 * Note: This function requires the configuration to be available at build time
 * or through a synchronous mechanism.
 * 
 * @returns The loaded configuration or the default configuration
 */
export function loadThemeConfigSync(): LoadConfigResult {
  // In a server-side context, we can't fetch files directly
  // This function returns the default configuration
  // In a real implementation, you might read from the file system
  return {
    success: true,
    config: DEFAULT_GRADIENT_THEME_CONFIG,
    source: 'fallback',
  };
}

/**
 * Gets a specific gradient theme from the configuration
 * @param themeName - The name of the gradient theme
 * @param config - The theme configuration (uses default if not provided)
 * @returns The gradient theme configuration, or undefined if not found
 */
export function getGradientTheme(
  themeName: string,
  config: ThemeConfig = DEFAULT_GRADIENT_THEME_CONFIG
) {
  // Check if the theme exists in the config
  if (!(themeName in config.gradientThemes)) {
    console.warn(`Invalid gradient theme name: ${themeName}`);
    return undefined;
  }

  return config.gradientThemes[themeName];
}

/**
 * Gets all available gradient theme names from the configuration
 * @param config - The theme configuration (uses default if not provided)
 * @returns Array of available gradient theme names
 */
export function getAvailableThemes(
  config: ThemeConfig = DEFAULT_GRADIENT_THEME_CONFIG
): string[] {
  return Object.keys(config.gradientThemes);
}

/**
 * Merges a loaded configuration with the default configuration
 * This ensures that any missing themes in the loaded config are filled in from the default
 * @param loadedConfig - The loaded configuration
 * @returns The merged configuration
 */
export function mergeWithDefaultConfig(loadedConfig: ThemeConfig): ThemeConfig {
  return {
    gradientThemes: {
      ...DEFAULT_GRADIENT_THEME_CONFIG.gradientThemes,
      ...loadedConfig.gradientThemes,
    },
  };
}

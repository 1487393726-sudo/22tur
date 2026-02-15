/**
 * Predefined color palettes for the Website Color Style Switcher
 */

import { ColorStyle } from './types';

/**
 * Light color style - default theme
 */
export const LIGHT_STYLE: ColorStyle = {
  id: 'light',
  name: 'Light',
  label: 'Light Mode',
  colors: {
    primary: '#0066CC',
    secondary: '#666666',
    background: '#FFFFFF',
    text: '#000000',
    border: '#CCCCCC',
    surface: '#F5F5F5',
    surfaceVariant: '#EEEEEE',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#000000',
    onSurface: '#000000',
    error: '#D32F2F',
    success: '#388E3C',
    warning: '#F57C00',
    info: '#1976D2',
  },
};

/**
 * Dark color style
 */
export const DARK_STYLE: ColorStyle = {
  id: 'dark',
  name: 'Dark',
  label: 'Dark Mode',
  colors: {
    primary: '#4D94FF',
    secondary: '#CCCCCC',
    background: '#1A1A1A',
    text: '#FFFFFF',
    border: '#333333',
    surface: '#2A2A2A',
    surfaceVariant: '#3A3A3A',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    error: '#FF6B6B',
    success: '#66BB6A',
    warning: '#FFA726',
    info: '#42A5F5',
  },
};

/**
 * High contrast color style for accessibility
 */
export const HIGH_CONTRAST_STYLE: ColorStyle = {
  id: 'high-contrast',
  name: 'High Contrast',
  label: 'High Contrast Mode',
  colors: {
    primary: '#FFFF00',
    secondary: '#FFFFFF',
    background: '#000000',
    text: '#FFFFFF',
    border: '#FFFFFF',
    surface: '#1A1A1A',
    surfaceVariant: '#333333',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    error: '#FF0000',
    success: '#00FF00',
    warning: '#FFFF00',
    info: '#00FFFF',
  },
};

/**
 * All available color styles
 */
export const ALL_STYLES: ColorStyle[] = [LIGHT_STYLE, DARK_STYLE, HIGH_CONTRAST_STYLE];

/**
 * Default style (Light)
 */
export const DEFAULT_STYLE = LIGHT_STYLE;

/**
 * Get a style by ID
 */
export function getStyleById(id: string): ColorStyle | undefined {
  return ALL_STYLES.find((style) => style.id === id);
}

/**
 * Get all available style IDs
 */
export function getAllStyleIds(): string[] {
  return ALL_STYLES.map((style) => style.id);
}

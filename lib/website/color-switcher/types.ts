/**
 * Core types for the Website Color Style Switcher
 */

/**
 * Represents a single color style with all required color values
 */
export interface ColorStyle {
  id: string;
  name: string;
  label: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
    [key: string]: string;
  };
}

/**
 * Represents the current theme state
 */
export interface ThemeState {
  currentStyle: ColorStyle;
  availableStyles: ColorStyle[];
  isTransitioning: boolean;
  userPreference: string | null;
}

/**
 * Interface for persistence layer implementations
 */
export interface PersistenceLayer {
  save(key: string, value: string): void;
  load(key: string): string | null;
  clear(key: string): void;
  isAvailable(): boolean;
}

/**
 * Interface for style application
 */
export interface StyleApplier {
  applyStyle(style: ColorStyle): void;
  getComputedColor(colorKey: string): string;
  setTransitionDuration(ms: number): void;
  resetToDefault(): void;
}

/**
 * Preference storage schema
 */
export interface PreferenceData {
  styleId: string;
  timestamp: number;
  version: number;
}

/**
 * Color contrast information
 */
export interface ContrastInfo {
  ratio: number;
  isCompliant: boolean;
  wcagLevel: 'AA' | 'AAA' | 'FAIL';
}

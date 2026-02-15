'use client';

import { useTheme } from './theme-provider';

type GradientTheme = 'blue-purple' | 'purple-pink';

interface UseGradientThemeReturn {
  /**
   * Current gradient theme
   */
  gradientTheme: GradientTheme;

  /**
   * Function to switch gradient themes
   */
  setGradientTheme: (theme: GradientTheme) => void;

  /**
   * Function to check if current theme matches a given theme
   */
  isGradientTheme: (theme: GradientTheme) => boolean;

  /**
   * Array of available gradient themes
   */
  availableThemes: GradientTheme[];
}

/**
 * Hook to access and manage gradient theme
 *
 * Provides a convenient interface for components to:
 * - Access the current gradient theme
 * - Switch between gradient themes
 * - Check if a specific theme is active
 * - Get list of available themes
 *
 * @throws Error if used outside ThemeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { gradientTheme, setGradientTheme, isGradientTheme, availableThemes } = useGradientTheme();
 *
 *   return (
 *     <div>
 *       <p>Current theme: {gradientTheme}</p>
 *       <button onClick={() => setGradientTheme('purple-pink')}>
 *         Switch to Purple-Pink
 *       </button>
 *       {isGradientTheme('blue-purple') && <p>Using Blue-Purple theme</p>}
 *       <p>Available themes: {availableThemes.join(', ')}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGradientTheme(): UseGradientThemeReturn {
  const { gradientTheme, setGradientTheme } = useTheme();

  const availableThemes: GradientTheme[] = ['blue-purple', 'purple-pink'];

  const isGradientTheme = (theme: GradientTheme): boolean => {
    return gradientTheme === theme;
  };

  return {
    gradientTheme,
    setGradientTheme,
    isGradientTheme,
    availableThemes,
  };
}

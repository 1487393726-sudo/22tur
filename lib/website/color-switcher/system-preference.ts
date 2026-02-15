/**
 * System preference detection for color schemes
 */

/**
 * Detect system color scheme preference
 * Returns 'dark' or 'light' based on system settings
 */
export function detectSystemPreference(): 'dark' | 'light' {
  if (typeof window === 'undefined') {
    return 'light';
  }

  // Check prefers-color-scheme media query
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  // Fallback to light
  return 'light';
}

/**
 * Map system preference to style ID
 */
export function mapSystemPreferenceToStyleId(preference: 'dark' | 'light'): string {
  return preference === 'dark' ? 'dark' : 'light';
}

/**
 * Listen for system preference changes
 */
export function listenToSystemPreferenceChanges(
  callback: (preference: 'dark' | 'light') => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  if (!window.matchMedia) {
    return () => {};
  }

  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
    const preference = e.matches ? 'dark' : 'light';
    callback(preference);
  };

  // Modern browsers
  if (darkModeQuery.addEventListener) {
    darkModeQuery.addEventListener('change', handleChange);
    return () => darkModeQuery.removeEventListener('change', handleChange);
  }

  // Legacy browsers
  if (darkModeQuery.addListener) {
    darkModeQuery.addListener(handleChange);
    return () => darkModeQuery.removeListener(handleChange);
  }

  return () => {};
}

/**
 * Get system preference with fallback
 */
export function getSystemPreferenceStyleId(): string {
  const preference = detectSystemPreference();
  return mapSystemPreferenceToStyleId(preference);
}

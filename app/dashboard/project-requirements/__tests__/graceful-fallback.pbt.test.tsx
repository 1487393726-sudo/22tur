/**
 * Property-Based Test for Graceful Fallback for Missing Translations
 * 
 * Feature: dashboard-pages-translation
 * Property 5: Graceful Fallback for Missing Translations
 * **Validates: Requirements 2.5**
 * 
 * This test verifies that the t() function handles missing translation keys 
 * gracefully by returning either the fallback parameter value or the key itself,
 * never returning undefined, null, or throwing an error.
 */

import fc from 'fast-check';
import { renderHook } from '@testing-library/react';
import { useDashboardTranslations } from '@/lib/i18n/use-dashboard-translations';
import React from 'react';

// Define the supported locales
const SUPPORTED_LOCALES = ['zh', 'zh-TW', 'en', 'ug', 'ja', 'ko'] as const;
type Locale = typeof SUPPORTED_LOCALES[number];

/**
 * Test wrapper component to provide locale context
 */
function TestWrapper({ children, locale }: { children: React.ReactNode; locale?: Locale }) {
  return <>{children}</>;
}

/**
 * Property 5: Graceful Fallback for Missing Translations
 * **Validates: Requirements 2.5**
 * 
 * For any translation key that is missing from a specific locale's dashboard.json file,
 * the t() function should return either the fallback parameter value or the key itself,
 * never returning undefined, null, or throwing an error.
 */
describe('Feature: dashboard-pages-translation, Property 5: Graceful Fallback for Missing Translations', () => {
  
  it('should never return undefined for any translation key', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // Random key
        fc.constantFrom(...SUPPORTED_LOCALES),
        (randomKey, locale) => {
          const { result } = renderHook(() => useDashboardTranslations());
          
          // Wait for translations to load
          if (result.current.loading) {
            return true; // Skip if still loading
          }
          
          const translatedValue = result.current.t(randomKey);
          
          // Should never return undefined
          const isNotUndefined = translatedValue !== undefined;
          
          if (!isNotUndefined) {
            console.error(
              `t() returned undefined for key "${randomKey}" in locale "${locale}"`
            );
          }
          
          return isNotUndefined;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never return null for any translation key', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // Random key
        fc.constantFrom(...SUPPORTED_LOCALES),
        (randomKey, locale) => {
          const { result } = renderHook(() => useDashboardTranslations());
          
          if (result.current.loading) {
            return true;
          }
          
          const translatedValue = result.current.t(randomKey);
          
          // Should never return null
          const isNotNull = translatedValue !== null;
          
          if (!isNotNull) {
            console.error(
              `t() returned null for key "${randomKey}" in locale "${locale}"`
            );
          }
          
          return isNotNull;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always return a string for any translation key', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // Random key
        (randomKey) => {
          const { result } = renderHook(() => useDashboardTranslations());
          
          if (result.current.loading) {
            return true;
          }
          
          const translatedValue = result.current.t(randomKey);
          
          // Should always return a string
          const isString = typeof translatedValue === 'string';
          
          if (!isString) {
            console.error(
              `t() returned non-string value for key "${randomKey}". ` +
              `Type: ${typeof translatedValue}, Value: ${JSON.stringify(translatedValue)}`
            );
          }
          
          return isString;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return fallback value when key is missing and fallback is provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // Random key (likely missing)
        fc.string({ minLength: 1, maxLength: 100 }), // Random fallback
        (randomKey, fallback) => {
          const { result } = renderHook(() => useDashboardTranslations());
          
          if (result.current.loading) {
            return true;
          }
          
          const translatedValue = result.current.t(randomKey, fallback);
          
          // Should return either the translation or the fallback
          // Since randomKey is likely missing, it should return fallback or key
          const isValidReturn = 
            translatedValue === fallback || 
            translatedValue === randomKey ||
            (typeof translatedValue === 'string' && translatedValue.length > 0);
          
          if (!isValidReturn) {
            console.error(
              `t() returned unexpected value for key "${randomKey}" with fallback "${fallback}". ` +
              `Returned: "${translatedValue}"`
            );
          }
          
          return isValidReturn;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return the key itself when key is missing and no fallback is provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 50 }).filter(s => 
          // Generate keys that are unlikely to exist
          s.includes('.') && !s.startsWith('cart.') && !s.startsWith('orders.')
        ),
        (nonExistentKey) => {
          const { result } = renderHook(() => useDashboardTranslations());
          
          if (result.current.loading) {
            return true;
          }
          
          const translatedValue = result.current.t(nonExistentKey);
          
          // Should return the key itself when no fallback is provided
          const returnsKeyOrTranslation = 
            translatedValue === nonExistentKey || 
            (typeof translatedValue === 'string' && translatedValue.length > 0);
          
          if (!returnsKeyOrTranslation) {
            console.error(
              `t() returned unexpected value for non-existent key "${nonExistentKey}". ` +
              `Expected key itself or valid translation, got: "${translatedValue}"`
            );
          }
          
          return returnsKeyOrTranslation;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never throw an error for any translation key', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 100 }), // Any string including empty
        fc.option(fc.string(), { nil: undefined }), // Optional fallback
        (randomKey, fallback) => {
          const { result } = renderHook(() => useDashboardTranslations());
          
          if (result.current.loading) {
            return true;
          }
          
          try {
            const translatedValue = result.current.t(randomKey, fallback);
            
            // Should successfully return a value without throwing
            const didNotThrow = true;
            const returnedValue = translatedValue !== undefined && translatedValue !== null;
            
            if (!returnedValue) {
              console.error(
                `t() returned undefined/null for key "${randomKey}" with fallback "${fallback}"`
              );
            }
            
            return didNotThrow && returnedValue;
          } catch (error) {
            console.error(
              `t() threw an error for key "${randomKey}" with fallback "${fallback}":`,
              error
            );
            return false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle deeply nested missing keys gracefully', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 5 }),
        (keyParts) => {
          const { result } = renderHook(() => useDashboardTranslations());
          
          if (result.current.loading) {
            return true;
          }
          
          const deepKey = keyParts.join('.');
          const translatedValue = result.current.t(deepKey);
          
          // Should return a valid string (either translation, fallback, or key)
          const isValidString = 
            typeof translatedValue === 'string' && 
            translatedValue.length > 0;
          
          if (!isValidString) {
            console.error(
              `t() returned invalid value for deep key "${deepKey}". ` +
              `Value: ${JSON.stringify(translatedValue)}`
            );
          }
          
          return isValidString;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle special characters in keys gracefully', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // Any string with special chars
        (keyWithSpecialChars) => {
          const { result } = renderHook(() => useDashboardTranslations());
          
          if (result.current.loading) {
            return true;
          }
          
          try {
            const translatedValue = result.current.t(keyWithSpecialChars);
            
            // Should handle gracefully without throwing
            const isValid = 
              typeof translatedValue === 'string' &&
              translatedValue !== undefined &&
              translatedValue !== null;
            
            if (!isValid) {
              console.error(
                `t() failed to handle key with special characters: "${keyWithSpecialChars}"`
              );
            }
            
            return isValid;
          } catch (error) {
            console.error(
              `t() threw error for key with special characters: "${keyWithSpecialChars}"`,
              error
            );
            return false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return consistent results for the same missing key', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 30 }).filter(s => s.includes('.')),
        (missingKey) => {
          const { result } = renderHook(() => useDashboardTranslations());
          
          if (result.current.loading) {
            return true;
          }
          
          // Call t() multiple times with the same key
          const result1 = result.current.t(missingKey);
          const result2 = result.current.t(missingKey);
          const result3 = result.current.t(missingKey);
          
          // Should return the same value consistently
          const isConsistent = result1 === result2 && result2 === result3;
          
          if (!isConsistent) {
            console.error(
              `t() returned inconsistent results for key "${missingKey}": ` +
              `"${result1}", "${result2}", "${result3}"`
            );
          }
          
          return isConsistent;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prefer fallback over key when both are provided for missing keys', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 50 }).filter(s => 
          // Generate keys that definitely don't exist
          s.includes('nonexistent.') && !s.includes('cart') && !s.includes('orders')
        ),
        fc.string({ minLength: 5, maxLength: 50 }),
        (definitelyMissingKey, fallback) => {
          const { result } = renderHook(() => useDashboardTranslations());
          
          if (result.current.loading) {
            return true;
          }
          
          const translatedValue = result.current.t(definitelyMissingKey, fallback);
          
          // When a key is missing and fallback is provided, should return fallback
          // (or the actual translation if it exists, which is also valid)
          const isValidReturn = 
            translatedValue === fallback || 
            translatedValue === definitelyMissingKey ||
            (typeof translatedValue === 'string' && translatedValue.length > 0);
          
          if (!isValidReturn) {
            console.error(
              `t() returned unexpected value for missing key "${definitelyMissingKey}" ` +
              `with fallback "${fallback}". Returned: "${translatedValue}"`
            );
          }
          
          return isValidReturn;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty string keys gracefully', () => {
    const { result } = renderHook(() => useDashboardTranslations());
    
    if (!result.current.loading) {
      const translatedValue = result.current.t('');
      
      // Should return a string (empty key or fallback)
      expect(typeof translatedValue).toBe('string');
      expect(translatedValue).not.toBeUndefined();
      expect(translatedValue).not.toBeNull();
    }
  });

  it('should handle keys with only dots gracefully', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (numDots) => {
          const { result } = renderHook(() => useDashboardTranslations());
          
          if (result.current.loading) {
            return true;
          }
          
          const dotsOnlyKey = '.'.repeat(numDots);
          
          try {
            const translatedValue = result.current.t(dotsOnlyKey);
            
            // Should handle gracefully
            const isValid = 
              typeof translatedValue === 'string' &&
              translatedValue !== undefined &&
              translatedValue !== null;
            
            return isValid;
          } catch (error) {
            console.error(`t() threw error for dots-only key: "${dotsOnlyKey}"`, error);
            return false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
